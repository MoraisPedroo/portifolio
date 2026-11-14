import { company, credencial, dpprinter, estoquento } from "@/content/site";
import { G, PH, PW, Painter } from "@/lib/surface";
import { IMAGES, drawCover, getImage } from "../images";

/**
 * Páginas da revista da abertura. Ela aparece pequena, então a tipografia
 * é grande e cada página diz uma coisa só.
 */

const INK = "#0E1116";
const PAPER = "#F3F5F7";
const FOG = "#A3ADBB";
const SLATE = "#4A5463";

function grid(g: G, color: string) {
  const { ctx } = g;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 50; x < PW; x += 50) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, PH);
  }
  for (let y = 50; y < PH; y += 50) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(PW, y + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

function logo(g: G, x: number, y: number, size: number) {
  const image = getImage(IMAGES.logo);
  if (image) g.ctx.drawImage(image, x, y, size, size);
}

function folio(g: G, text: string, dark: boolean, side: "left" | "right") {
  const x = side === "left" ? 48 : PW - 48;
  g.text(text, x, PH - 52, { size: 20, weight: 500, color: dark ? FOG : SLATE, align: side });
}

const paintCover: Painter = (g) => {
  g.rect(0, 0, PW, PH, INK);
  const glow = g.ctx.createRadialGradient(430, 200, 10, 430, 200, 420);
  glow.addColorStop(0, "rgba(16,185,129,0.28)");
  glow.addColorStop(1, "rgba(16,185,129,0)");
  g.rect(0, 0, PW, PH, glow);
  grid(g, "rgba(255,255,255,0.04)");

  logo(g, 56, 64, 96);
  g.text("Edição 2026", PW - 56, 92, { size: 22, weight: 500, color: FOG, align: "right" });

  g.text(company.name, 56, 300, { size: 92, weight: 800, color: "#FFFFFF", stretch: "expanded", tracking: -3, lineHeight: 92, maxWidth: 500 });
  g.text("Produtos que ligam sistemas web ao mundo físico.", 56, 512, { size: 28, weight: 500, color: FOG, maxWidth: 470, lineHeight: 36 });

  const items = [
    { name: dpprinter.name, color: "#10B981" },
    { name: estoquento.name, color: "#F26A1B" },
    { name: credencial.name, color: "#9B7BFF" },
  ];
  items.forEach((item, i) => {
    const y = 618 + i * 44;
    g.rr(56, y + 6, 18, 18, 4, item.color, null);
    g.text(item.name, 90, y, { size: 26, weight: 650, color: "#FFFFFF" });
  });
};

type Product = {
  name: string;
  line: string;
  points: string[];
  accent: string;
  dark: boolean;
  index: number;
};

function productPage(product: Product): Painter {
  return (g) => {
    const fg = product.dark ? "#FFFFFF" : INK;
    const soft = product.dark ? FOG : SLATE;
    g.rect(0, 0, PW, PH, product.dark ? INK : PAPER);
    grid(g, product.dark ? "rgba(255,255,255,0.035)" : "rgba(14,17,22,0.04)");
    g.rect(0, 0, PW, 14, product.accent);

    g.text(`Produto ${product.index} de 3`, 56, 72, { size: 22, weight: 600, color: soft });
    // Diminui o título até a palavra mais longa caber na página.
    let size = 74;
    const longest = product.name.split(" ").sort((a, b) => b.length - a.length)[0];
    while (size > 44 && g.measure(longest, { size, weight: 800, stretch: "expanded", tracking: -2.5 }) > 480) size -= 2;
    let y = 150;
    y += g.text(product.name, 56, y, { size, weight: 800, color: fg, stretch: "expanded", tracking: -2.5, lineHeight: size + 4, maxWidth: 500 });
    y += 26;
    y += g.text(product.line, 56, y, { size: 30, weight: 500, color: soft, maxWidth: 480, lineHeight: 40 });
    y += 46;
    product.points.forEach((point) => {
      g.rr(56, y + 10, 16, 16, 4, product.accent, null);
      y += g.text(point, 92, y, { size: 27, weight: 600, color: fg, maxWidth: 450, lineHeight: 36 }) + 18;
    });
    folio(g, "Clique para virar a página", product.dark, "left");
  };
}

function photoPage(src: string, caption: string, accent: string): Painter {
  return (g) => {
    g.rect(0, 0, PW, PH, INK);
    const image = getImage(src);
    if (image) {
      drawCover(g.ctx, image, 0, 0, PW, PH);
    } else {
      grid(g, "rgba(255,255,255,0.05)");
    }
    const shade = g.ctx.createLinearGradient(0, PH * 0.55, 0, PH);
    shade.addColorStop(0, "rgba(14,17,22,0)");
    shade.addColorStop(1, "rgba(14,17,22,0.92)");
    g.rect(0, 0, PW, PH, shade);
    g.rr(48, PH - 132, 16, 16, 4, accent, null);
    g.text(caption, 80, PH - 140, { size: 26, weight: 600, color: "#FFFFFF", maxWidth: 470, lineHeight: 34 });
    g.text("Imagem ilustrativa", PW - 48, PH - 52, { size: 18, weight: 500, color: FOG, align: "right" });
  };
}

const paintBack: Painter = (g) => {
  g.rect(0, 0, PW, PH, INK);
  grid(g, "rgba(255,255,255,0.04)");
  logo(g, 56, 64, 80);
  g.text("Vamos conversar?", 56, 250, { size: 76, weight: 800, color: "#FFFFFF", stretch: "expanded", tracking: -2.5, lineHeight: 80, maxWidth: 500 });
  g.text("Engenharia de software sob medida, em São Paulo.", 56, 440, { size: 30, weight: 500, color: FOG, maxWidth: 460, lineHeight: 40 });
  g.rr(56, 560, 330, 72, 36, "#10B981", null);
  g.text("Falar no WhatsApp", 221, 582, { size: 26, weight: 700, color: INK, align: "center" });
  g.text(`CNPJ ${company.cnpj}`, 56, PH - 60, { font: "mono", size: 18, weight: 500, color: FOG });
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
    index: 1,
  }),
  photoPage(IMAGES.dpprinter, "Do sistema web direto para a impressora térmica.", "#10B981"),
  productPage({
    name: estoquento.name,
    line: "O estoque inteiro em um painel, com o armazém em 3D.",
    points: ["Entrada e prateleira", "Postagem e rastreio", "9 integrações"],
    accent: "#F26A1B",
    dark: false,
    index: 2,
  }),
  photoPage(IMAGES.warehouse, "Cada corredor e cada caixa, acompanhados em tempo real.", "#F26A1B"),
  productPage({
    name: credencial.name,
    line: "Crachás corporativos, do layout à impressora.",
    points: ["Editor de crachás", "Formato CR80", "Impressoras PVC"],
    accent: "#9B7BFF",
    dark: true,
    index: 3,
  }),
  photoPage(IMAGES.credencial, "Cartão PVC impresso direto do desktop.", "#9B7BFF"),
  paintBack,
];
