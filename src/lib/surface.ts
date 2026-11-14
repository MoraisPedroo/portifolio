import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from "three";

/** Tamanho lógico de uma página. Todo painter desenha nessas coordenadas. */
export const PW = 600;
export const PH = 800;

export type Fonts = { display: string; mono: string };

export type Hit = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  onClick: () => void;
};

export type TextOpts = {
  size?: number;
  weight?: number;
  color?: string;
  font?: "display" | "mono";
  align?: CanvasTextAlign;
  maxWidth?: number;
  lineHeight?: number;
  tracking?: number;
  maxLines?: number;
  /** Largura da fonte (ex.: "expanded"), para os títulos no estilo do site. */
  stretch?: "normal" | "semi-expanded" | "expanded";
};

type Tracked = CanvasRenderingContext2D & { letterSpacing?: string; fontStretch?: string };

/** Pequeno kit de desenho imediato sobre canvas 2D, com regiões clicáveis. */
export class G {
  hits: Hit[] = [];
  animating = false;

  constructor(
    public ctx: CanvasRenderingContext2D,
    public fonts: Fonts,
    public hover: string | null,
    public now: number,
  ) {}

  /** Pede mais um quadro: usado enquanto uma animação está em andamento. */
  animate() {
    this.animating = true;
  }

  private setFont(o: TextOpts) {
    const family = o.font === "mono" ? this.fonts.mono : this.fonts.display;
    this.ctx.font = `${o.weight ?? 500} ${o.size ?? 14}px ${family}`;
    (this.ctx as Tracked).fontStretch = o.stretch ?? "normal";
    (this.ctx as Tracked).letterSpacing = `${o.tracking ?? 0}px`;
  }

  measure(str: string, o: TextOpts = {}) {
    this.setFont(o);
    return this.ctx.measureText(str).width;
  }

  private wrap(str: string, maxWidth: number) {
    const lines: string[] = [];
    for (const paragraph of str.split("\n")) {
      let line = "";
      for (const word of paragraph.split(" ")) {
        const candidate = line ? line + " " + word : word;
        if (line && this.ctx.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  /** Desenha texto a partir do topo em `y`. Devolve a altura ocupada. */
  text(str: string, x: number, y: number, o: TextOpts = {}) {
    const size = o.size ?? 14;
    const lineHeight = o.lineHeight ?? Math.round(size * 1.35);
    this.setFont(o);
    this.ctx.fillStyle = o.color ?? "#fff";
    this.ctx.textAlign = o.align ?? "left";
    this.ctx.textBaseline = "top";
    let lines = o.maxWidth ? this.wrap(str, o.maxWidth) : str.split("\n");
    if (o.maxLines && lines.length > o.maxLines) {
      lines = lines.slice(0, o.maxLines);
      lines[lines.length - 1] = lines[lines.length - 1].replace(/.{2}$/, "…");
    }
    lines.forEach((line, i) => this.ctx.fillText(line, x, y + i * lineHeight));
    return lines.length * lineHeight;
  }

  rect(x: number, y: number, w: number, h: number, fill: string | CanvasGradient) {
    this.ctx.fillStyle = fill;
    this.ctx.fillRect(x, y, w, h);
  }

  /** Retângulo arredondado com preenchimento e/ou borda. */
  rr(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill?: string | CanvasGradient | null,
    stroke?: string | null,
    lineWidth = 1,
  ) {
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }
    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth = 1, dash?: number[]) {
    this.ctx.beginPath();
    this.ctx.setLineDash(dash ?? []);
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  dot(x: number, y: number, r: number, color: string, glow = 0) {
    if (glow > 0) {
      this.ctx.save();
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = glow;
    }
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    if (glow > 0) this.ctx.restore();
  }

  /** Registra uma região clicável e informa se o ponteiro está sobre ela. */
  hit(id: string, x: number, y: number, w: number, h: number, onClick: () => void) {
    this.hits.push({ id, x, y, w, h, onClick });
    return this.hover === id;
  }

  /** Etiqueta em cápsula; devolve a largura desenhada. */
  pill(
    label: string,
    x: number,
    y: number,
    o: { bg?: string; fg?: string; border?: string; size?: number; dot?: string; h?: number; font?: "display" | "mono"; weight?: number } = {},
  ) {
    const size = o.size ?? 10;
    const h = o.h ?? size + 12;
    const text: TextOpts = { size, weight: o.weight ?? 600, font: o.font ?? "mono", tracking: 0.6 };
    const dotSpace = o.dot ? 12 : 0;
    const w = this.measure(label, text) + 20 + dotSpace;
    this.rr(x, y, w, h, h / 2, o.bg ?? null, o.border ?? null);
    if (o.dot) this.dot(x + 12, y + h / 2, 3, o.dot, 6);
    this.text(label, x + 10 + dotSpace, y + (h - size) / 2 - 0.5, { ...text, color: o.fg ?? "#fff" });
    return w;
  }
}

export type Painter = (g: G) => void;

/** Um canvas 2D que vira textura de uma face de página, com hit-testing. */
export class PageSurface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: CanvasTexture;
  hits: Hit[] = [];
  hover: string | null = null;
  dirty = true;
  animating = false;

  constructor(
    public painter: Painter,
    public fonts: Fonts,
    public scale: number,
    public width = PW,
    public height = PH,
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = Math.round(width * scale);
    this.canvas.height = Math.round(height * scale);
    this.ctx = this.canvas.getContext("2d")!;
    this.texture = new CanvasTexture(this.canvas);
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.texture.generateMipmaps = true;
    this.texture.minFilter = LinearMipmapLinearFilter;
  }

  paint(now: number) {
    const { ctx, scale } = this;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    const g = new G(ctx, this.fonts, this.hover, now);
    this.painter(g);
    this.hits = g.hits;
    this.animating = g.animating;
    this.dirty = false;
    this.texture.needsUpdate = true;
  }

  hitAt(x: number, y: number) {
    for (let i = this.hits.length - 1; i >= 0; i--) {
      const h = this.hits[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
    }
    return null;
  }

  setHover(id: string | null) {
    if (id === this.hover) return;
    this.hover = id;
    this.dirty = true;
  }

  dispose() {
    this.texture.dispose();
  }
}
