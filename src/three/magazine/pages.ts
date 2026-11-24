import { company } from "@/content/site";
import { G, PH, PW, Painter } from "@/lib/surface";
import { IMAGES, drawCover, getImage } from "../images";

/**
 * Páginas da revista. Ela aparece pequena, então a tipografia é grande e cada
 * página diz uma coisa só. Os detalhes clicáveis ficam no painel ao lado.
 */

const INK = "#0B0D10";
const PAPER = "#F2F0EB";
const FOG = "#A3ADBB";
const SLATE = "#4A5463";
const ISSUE = "Edição 01 — 2026";

const ACCENT = { dp: "#22D3EE", nto: "#F26A1B", cred: "#3B82F6", brand: "#10B981" };

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
  const top = g.ctx.createLinearGradient(0, 0, 0, 330);
  top.addColorStop(0, "rgba(11,13,16,0.94)");
  top.addColorStop(1, "rgba(11,13,16,0)");
  g.rect(0, 0, PW, 330, top);
  const bottom = g.ctx.createLinearGradient(0, PH * 0.4, 0, PH);
  bottom.addColorStop(0, "rgba(11,13,16,0)");
  bottom.addColorStop(0.5, "rgba(11,13,16,0.84)");
  bottom.addColorStop(1, "rgba(11,13,16,0.97)");
  g.rect(0, PH * 0.4, PW, PH * 0.6, bottom);

  // Título de banca, ocupando a largura.
  let size = 120;
  while (size > 60 && g.measure("DP SYSTEMS", { size, weight: 850, stretch: "expanded", tracking: -4 }) > PW - 70) size -= 2;
  g.text("DP SYSTEMS", 34, 34, { size, weight: 850, color: "#FFFFFF", stretch: "expanded", tracking: -4 });
  g.rect(36, 40 + size, PW - 72, 3, "#E8C38A");
  g.text(ISSUE, 36, 56 + size, { size: 20, weight: 600, color: "#E6EAF0" });
  g.text("dpsystemsbrasil.com.br", PW - 36, 56 + size, { size: 20, weight: 600, color: "#E6EAF0", align: "right" });

  g.text("Portfólio de engenharia e produtos", 40, 430, {
    font: "editorial",
    size: 52,
    weight: 600,
    color: "#FFFFFF",
    maxWidth: 480,
    lineHeight: 54,
    tracking: -1,
  });

  const lines = [
    { name: "DP Printer", text: "etiquetas sem driver", color: ACCENT.dp },
    { name: "EstoqueNTO", text: "o parque em comodato", color: ACCENT.nto },
    { name: "Credencial Studio", text: "crachás CR80", color: ACCENT.cred },
  ];
  lines.forEach((line, i) => {
    const y = 590 + i * 38;
    g.rect(40, y + 4, 6, 24, line.color);
    g.text(line.name, 58, y, { size: 24, weight: 800, color: "#FFFFFF" });
    const nameW = g.measure(line.name, { size: 24, weight: 800 });
    g.text(line.text, 66 + nameW, y + 1, { size: 22, weight: 500, color: "#C9D0DA" });
  });

  g.rr(PW - 150, PH - 96, 112, 70, 6, "#FFFFFF", null);
  barcode(g, PW - 141, PH - 88, 94, 40, INK);
  g.text("Nº 01", PW - 94, PH - 44, { font: "mono", size: 13, weight: 700, color: INK, align: "center" });
};

type ProductPage = {
  name: string;
  kicker: string;
  /** Número-âncora grande, ou faixas coloridas quando o produto se explica melhor assim. */
  stat?: { value: string; label: string };
  chips?: { label: string; color: string }[];
  flow: string[];
  accent: string;
  /** Variante escura do acento, legível sobre o papel. */
  deep: string;
  page: number;
};

/**
 * Página esquerda de cada produto: papel claro, nome, um número que prova e o
 * caminho do produto em poucas etapas. O texto corrido fica no painel em HTML.
 */
function productPage(product: ProductPage): Painter {
  return (g) => {
    const rule = "rgba(11,13,16,0.14)";
    g.rect(0, 0, PW, PH, PAPER);
    g.text("DP Systems", 48, 40, { size: 18, weight: 700, color: SLATE });
    g.text(ISSUE, PW - 60, 40, { size: 16, weight: 600, color: SLATE, align: "right" });
    g.line(48, 72, PW - 60, 72, rule);
    g.rect(48, 104, 64, 8, product.accent);
    g.text(product.kicker, 48, 128, { size: 22, weight: 600, color: SLATE });

    let size = 80;
    const longest = product.name.split(" ").sort((a, b) => b.length - a.length)[0];
    while (size > 44 && g.measure(longest, { font: "editorial", size, weight: 600, tracking: -2 }) > 480) size -= 2;
    let y = 166;
    y += g.text(product.name, 46, y, { font: "editorial", size, weight: 600, color: INK, tracking: -2, lineHeight: size + 2, maxWidth: 500 });
    y += 22;

    if (product.stat) {
      g.text(product.stat.value, 44, y, { font: "editorial", size: 104, weight: 600, color: product.deep, tracking: -3 });
      g.text(product.stat.label, 48, y + 108, { size: 22, weight: 600, color: INK, maxWidth: 480, lineHeight: 28 });
      y += 156;
    }
    if (product.chips) {
      const w = 246;
      product.chips.forEach((chip, i) => {
        const x = 48 + (i % 2) * (w + 12);
        const cy = y + Math.floor(i / 2) * 56;
        g.rr(x, cy, w, 44, 10, chip.color, null);
        g.text(chip.label, x + w / 2, cy + 10, { size: 21, weight: 700, color: "#FFFFFF", align: "center" });
      });
      y += 2 * 56 + 14;
    }

    g.text("COMO FUNCIONA", 48, y, { font: "mono", size: 15, weight: 600, color: SLATE, tracking: 2 });
    y += 30;
    const box = 46;
    const gap = 16;
    product.flow.forEach((step, i) => {
      if (i > 0) g.line(72, y - gap, 72, y, product.deep, 2);
      g.rr(48, y, PW - 108, box, 10, "#FFFFFF", rule);
      g.dot(72, y + box / 2, 12, product.deep);
      g.text(String(i + 1), 72, y + box / 2 - 8, { font: "mono", size: 14, weight: 700, color: "#FFFFFF", align: "center" });
      g.text(step, 96, y + 11, { size: 21, weight: 600, color: INK, maxWidth: PW - 170 });
      y += box + gap;
    });

    g.text(String(product.page).padStart(2, "0"), 48, PH - 56, { font: "mono", size: 20, weight: 600, color: SLATE });
    gutter(g, "left", 0.22);
  };
}

function photoPage(src: string, caption: string, accent: string, page: number, section: string): Painter {
  return (g) => {
    g.rect(0, 0, PW, PH, INK);
    const image = getImage(src);
    if (image) drawCover(g.ctx, image, 0, 0, PW, PH);
    const top = g.ctx.createLinearGradient(0, 0, 0, 120);
    top.addColorStop(0, "rgba(11,13,16,0.75)");
    top.addColorStop(1, "rgba(11,13,16,0)");
    g.rect(0, 0, PW, 120, top);
    const shade = g.ctx.createLinearGradient(0, PH * 0.55, 0, PH);
    shade.addColorStop(0, "rgba(11,13,16,0)");
    shade.addColorStop(1, "rgba(11,13,16,0.93)");
    g.rect(0, 0, PW, PH, shade);
    g.text(section, PW - 48, 40, { size: 18, weight: 700, color: "#E6EAF0", align: "right" });
    g.rect(48, PH - 172, 6, 66, accent);
    g.text(caption, 68, PH - 174, { font: "editorial", size: 32, weight: 500, color: "#FFFFFF", maxWidth: 460, lineHeight: 36 });
    g.text(String(page).padStart(2, "0"), PW - 48, PH - 56, { font: "mono", size: 20, weight: 600, color: "#E6EAF0", align: "right" });
    gutter(g, "right", 0.55);
  };
}

const paintBack: Painter = (g) => {
  g.rect(0, 0, PW, PH, INK);
  const glow = g.ctx.createRadialGradient(140, 160, 10, 140, 160, 520);
  glow.addColorStop(0, "rgba(232,195,138,0.18)");
  glow.addColorStop(1, "rgba(232,195,138,0)");
  g.rect(0, 0, PW, PH, glow);
  logo(g, 48, 60, 84);
  g.text("DP Systems", 48, 176, { size: 30, weight: 800, color: "#FFFFFF", stretch: "expanded" });
  g.text("Engenharia de software sob medida", 48, 220, { font: "editorial", size: 34, weight: 500, color: "#E6EAF0", maxWidth: 480, lineHeight: 40 });
  g.rect(48, 330, 64, 4, "#E8C38A");
  g.text(ISSUE, 48, 356, { size: 20, weight: 600, color: FOG });
  g.text("dpsystemsbrasil.com.br", 48, 390, { font: "mono", size: 18, weight: 500, color: "#E8C38A" });
  g.text(company.legalName, 48, PH - 84, { font: "mono", size: 14, weight: 500, color: FOG });
  g.text(`CNPJ ${company.cnpj}`, 48, PH - 60, { font: "mono", size: 16, weight: 500, color: FOG });
  g.rr(PW - 150, PH - 96, 112, 70, 6, "#FFFFFF", null);
  barcode(g, PW - 141, PH - 88, 94, 40, INK);
  g.text("Nº 01", PW - 94, PH - 44, { font: "mono", size: 13, weight: 700, color: INK, align: "center" });
};

/** Frente e verso de cada folha, da capa à contracapa. */
export const MAGAZINE_PAGES: Painter[] = [
  paintCover,
  productPage({
    name: "DP Printer",
    kicker: "Middleware de impressão",
    stat: { value: "7.000+", label: "laboratórios no parque Hermes Pardini" },
    flow: ["Sistema web no navegador", "127.0.0.1:9100 · protocolo Browser Print", "USB Raw, TCP/IP ou driver", "Etiqueta na Zebra e registro no inventário"],
    accent: ACCENT.dp,
    deep: "#0E7490",
    page: 2,
  }),
  photoPage(IMAGES.dpprinter, "A etiqueta sai na hora, e a impressão fica registrada.", ACCENT.dp, 3, "DP Printer"),
  productPage({
    name: "EstoqueNTO",
    kicker: "Parque em comodato",
    stat: { value: "9", label: "integrações no mesmo fluxo de trabalho" },
    flow: ["Recebimento por patrimônio e série", "Prateleira em 2D ou na sala 3D", "Postagem ViPP e rastreio dos Correios", "Termo no DocuSign e aviso no WhatsApp"],
    accent: ACCENT.nto,
    deep: "#C2410C",
    page: 4,
  }),
  photoPage(IMAGES.warehouse, "Prateleira, envio e comodato no mesmo painel.", ACCENT.nto, 5, "EstoqueNTO"),
  productPage({
    name: "Credencial Studio",
    kicker: "Estúdio de crachás CR80",
    chips: [
      { label: "Colaborador", color: "#2563EB" },
      { label: "Aprendiz", color: "#4AAD42" },
      { label: "Terceiro", color: "#F78331" },
      { label: "Visitante", color: "#CA352D" },
    ],
    flow: ["Base do Access ou lote do Excel", "Foto achada pelo número do crachá", "Prévia de frente e verso", "Impressão na Zebra ZC300"],
    accent: ACCENT.cred,
    deep: "#1D4ED8",
    page: 6,
  }),
  photoPage(IMAGES.credencial, "Da planilha ao cartão impresso, sem retrabalho.", ACCENT.cred, 7, "Credencial Studio"),
  paintBack,
];
