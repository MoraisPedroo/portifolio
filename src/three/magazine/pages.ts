import { company, credencial, dpprinter, estoquento } from "@/content/site";
import { G, PH, PW, Painter } from "@/lib/surface";
import { IMAGES, drawCover, getImage } from "../images";

/**
 * Páginas da revista da abertura. Ela aparece pequena, então a tipografia
 * é grande e cada página diz uma coisa só. Cabeçalho corrido, número de
 * página e sombra na dobra dão o acabamento de revista impressa.
 */

const INK = "#0E1116";
const PAPER = "#F6F4EF";
const FOG = "#A3ADBB";
const SLATE = "#4A5463";
const ISSUE = "Edição 01 — Novembro 2026";

type Side = "left" | "right";

function logo(g: G, x: number, y: number, size: number) {
  const image = getImage(IMAGES.logo);
  if (image) g.ctx.drawImage(image, x, y, size, size);
}

/** Sombra da lombada: escurece a borda da página que fica no meio da revista. */
function gutter(g: G, side: Side, strength = 0.32) {
  const x0 = side === "left" ? PW : 0;
  const x1 = side === "left" ? PW - 90 : 90;
  const shade = g.ctx.createLinearGradient(x0, 0, x1, 0);
  shade.addColorStop(0, `rgba(0,0,0,${strength})`);
  shade.addColorStop(0.35, `rgba(0,0,0,${strength * 0.35})`);
  shade.addColorStop(1, "rgba(0,0,0,0)");
  g.rect(0, 0, PW, PH, shade);
}

/** Cabeçalho corrido e número da página, como numa revista impressa. */
function chrome(g: G, side: Side, page: number, section: string, dark: boolean) {
  const color = dark ? FOG : SLATE;
  const outer = side === "left" ? 48 : PW - 48;
  const align = side;
  g.text(side === "left" ? "DP Systems" : section, outer, 40, { size: 18, weight: 700, color, align });
  g.text(String(page).padStart(2, "0"), outer, PH - 56, { font: "mono", size: 20, weight: 600, color, align });
  g.line(48, 72, PW - 48, 72, dark ? "rgba(255,255,255,0.14)" : "rgba(14,17,22,0.14)");
}

function barcode(g: G, x: number, y: number, w: number, h: number, color: string) {
  let cx = x;
  let i = 0;
  while (cx < x + w - 3) {
    const bw = [3, 1, 2, 1, 3, 2, 1, 1, 2][i % 9];
    g.rect(cx, y, bw, h, color);
    cx += bw + [2, 1, 2, 3, 1][i % 5];
    i++;
  }
}

const paintCover: Painter = (g) => {
  g.rect(0, 0, PW, PH, INK);
  const photo = getImage(IMAGES.dpprinter);
  if (photo) drawCover(g.ctx, photo, 0, 0, PW, PH);
  // Escurece em cima (logotipo) e embaixo (chamadas).
  const top = g.ctx.createLinearGradient(0, 0, 0, 330);
  top.addColorStop(0, "rgba(14,17,22,0.92)");
  top.addColorStop(1, "rgba(14,17,22,0)");
  g.rect(0, 0, PW, 330, top);
  const bottom = g.ctx.createLinearGradient(0, PH * 0.42, 0, PH);
  bottom.addColorStop(0, "rgba(14,17,22,0)");
  bottom.addColorStop(0.55, "rgba(14,17,22,0.82)");
  bottom.addColorStop(1, "rgba(14,17,22,0.96)");
  g.rect(0, PH * 0.42, PW, PH * 0.58, bottom);

  // Logotipo da revista, ocupando a largura como um título de banca.
  let size = 120;
  while (size > 60 && g.measure("DP SYSTEMS", { size, weight: 850, stretch: "expanded", tracking: -4 }) > PW - 70) size -= 2;
  g.text("DP SYSTEMS", 34, 34, { size, weight: 850, color: "#FFFFFF", stretch: "expanded", tracking: -4 });
  g.rect(36, 40 + size, PW - 72, 3, "#10B981");
  g.text(ISSUE, 36, 56 + size, { size: 20, weight: 600, color: "#E6EAF0" });
  g.text("Engenharia sob medida", PW - 36, 56 + size, { size: 20, weight: 600, color: "#E6EAF0", align: "right" });

  g.text("Software que liga o seu sistema ao mundo físico", 40, 440, {
    size: 40,
    weight: 800,
    color: "#FFFFFF",
    stretch: "semi-expanded",
    tracking: -1.2,
    maxWidth: 470,
    lineHeight: 44,
  });

  const lines = [
    { name: dpprinter.name, text: "etiquetas sem driver", color: "#10B981" },
    { name: estoquento.name, text: "o armazém em 3D", color: "#F26A1B" },
    { name: credencial.name, text: "crachás em PVC", color: "#9B7BFF" },
  ];
  lines.forEach((line, i) => {
    const y = 590 + i * 38;
    g.rect(40, y + 4, 6, 24, line.color);
    g.text(line.name, 58, y, { size: 24, weight: 800, color: "#FFFFFF" });
    const nameW = g.measure(line.name, { size: 24, weight: 800 });
    g.text(line.text, 66 + nameW, y + 1, { size: 22, weight: 500, color: "#C9D0DA" });
  });

  // Código de barras de banca.
  g.rr(PW - 150, PH - 96, 112, 70, 6, "#FFFFFF", null);
  barcode(g, PW - 141, PH - 88, 94, 40, INK);
  g.text("Nº 01", PW - 94, PH - 44, { font: "mono", size: 13, weight: 700, color: INK, align: "center" });
};

type Product = {
  name: string;
  line: string;
  points: string[];
  accent: string;
  dark: boolean;
  page: number;
};

function productPage(product: Product): Painter {
  return (g) => {
    const fg = product.dark ? "#FFFFFF" : INK;
    const soft = product.dark ? FOG : SLATE;
    g.rect(0, 0, PW, PH, product.dark ? INK : PAPER);

    chrome(g, "left", product.page, "", product.dark);
    g.rect(48, 112, 64, 8, product.accent);
    g.text(`Produto ${(product.page - 2) / 2 + 1} de 3`, 48, 140, { size: 22, weight: 600, color: soft });

    // Diminui o título até a palavra mais longa caber na página.
    let size = 76;
    const longest = product.name.split(" ").sort((a, b) => b.length - a.length)[0];
    while (size > 44 && g.measure(longest, { size, weight: 800, stretch: "expanded", tracking: -2.5 }) > 480) size -= 2;
    let y = 186;
    y += g.text(product.name, 48, y, { size, weight: 800, color: fg, stretch: "expanded", tracking: -2.5, lineHeight: size + 4, maxWidth: 500 });
    y += 24;
    y += g.text(product.line, 48, y, { size: 30, weight: 500, color: soft, maxWidth: 470, lineHeight: 40 });
    y += 40;
    g.line(48, y, PW - 90, y, product.dark ? "rgba(255,255,255,0.14)" : "rgba(14,17,22,0.14)");
    y += 30;
    product.points.forEach((point) => {
      g.rr(48, y + 10, 16, 16, 4, product.accent, null);
      y += g.text(point, 84, y, { size: 27, weight: 600, color: fg, maxWidth: 440, lineHeight: 36 }) + 20;
    });
    gutter(g, "left", product.dark ? 0.5 : 0.22);
  };
}

function photoPage(src: string, caption: string, accent: string, page: number, section: string): Painter {
  return (g) => {
    g.rect(0, 0, PW, PH, INK);
    const image = getImage(src);
    if (image) drawCover(g.ctx, image, 0, 0, PW, PH);
    const top = g.ctx.createLinearGradient(0, 0, 0, 120);
    top.addColorStop(0, "rgba(14,17,22,0.75)");
    top.addColorStop(1, "rgba(14,17,22,0)");
    g.rect(0, 0, PW, 120, top);
    const shade = g.ctx.createLinearGradient(0, PH * 0.55, 0, PH);
    shade.addColorStop(0, "rgba(14,17,22,0)");
    shade.addColorStop(1, "rgba(14,17,22,0.92)");
    g.rect(0, 0, PW, PH, shade);
    g.text(section, PW - 48, 40, { size: 18, weight: 700, color: "#E6EAF0", align: "right" });
    g.rect(48, PH - 170, 6, 64, accent);
    g.text(caption, 68, PH - 172, { size: 27, weight: 600, color: "#FFFFFF", maxWidth: 460, lineHeight: 34 });
    g.text("Imagem ilustrativa", 48, PH - 56, { size: 17, weight: 500, color: FOG });
    g.text(String(page).padStart(2, "0"), PW - 48, PH - 56, { font: "mono", size: 20, weight: 600, color: "#E6EAF0", align: "right" });
    gutter(g, "right", 0.55);
  };
}

const paintBack: Painter = (g) => {
  g.rect(0, 0, PW, PH, INK);
  const glow = g.ctx.createRadialGradient(140, 160, 10, 140, 160, 520);
  glow.addColorStop(0, "rgba(16,185,129,0.22)");
  glow.addColorStop(1, "rgba(16,185,129,0)");
  g.rect(0, 0, PW, PH, glow);
  logo(g, 48, 60, 84);
  g.text("Vamos conversar?", 48, 230, { size: 76, weight: 800, color: "#FFFFFF", stretch: "expanded", tracking: -2.5, lineHeight: 80, maxWidth: 500 });
  g.text("Engenharia de software sob medida, em São Paulo.", 48, 420, { size: 30, weight: 500, color: FOG, maxWidth: 460, lineHeight: 40 });
  g.rr(48, 540, 330, 72, 36, "#10B981", null);
  g.text("Falar no WhatsApp", 213, 562, { size: 26, weight: 700, color: INK, align: "center" });
  g.text(`CNPJ ${company.cnpj}`, 48, PH - 60, { font: "mono", size: 18, weight: 500, color: FOG });
  g.rr(PW - 156, PH - 112, 120, 80, 6, "#FFFFFF", null);
  barcode(g, PW - 146, PH - 102, 100, 46, INK);
  g.text("Nº 01", PW - 96, PH - 52, { font: "mono", size: 14, weight: 700, color: INK, align: "center" });
};

/** Frente e verso de cada folha, da capa à contracapa. */
export const MAGAZINE_PAGES: Painter[] = [
  paintCover,
  productPage({
    name: dpprinter.name,
    line: "Etiquetas direto do navegador, sem driver e sem fila.",
    points: ["USB nativa e rede", "Auditoria de cada impressão", "Atualiza sozinho"],
    accent: "#10B981",
    dark: true,
    page: 2,
  }),
  photoPage(IMAGES.dpprinter, "Do sistema web direto para a impressora térmica.", "#10B981", 3, "DP Printer"),
  productPage({
    name: estoquento.name,
    line: "O estoque inteiro em um painel, com o armazém em 3D.",
    points: ["Entrada e prateleira", "Postagem e rastreio", "9 integrações"],
    accent: "#F26A1B",
    dark: false,
    page: 4,
  }),
  photoPage(IMAGES.warehouse, "Cada corredor e cada caixa, acompanhados em tempo real.", "#F26A1B", 5, "EstoqueNTO"),
  productPage({
    name: credencial.name,
    line: "Crachás corporativos, do layout à impressora.",
    points: ["Editor de crachás", "Formato CR80", "Impressoras PVC"],
    accent: "#9B7BFF",
    dark: true,
    page: 6,
  }),
  photoPage(IMAGES.credencial, "Cartão PVC impresso direto do desktop.", "#9B7BFF", 7, "Credencial Studio"),
  paintBack,
];
