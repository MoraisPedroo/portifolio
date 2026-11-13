import { company, credencial, dpprinter, estoquento } from "@/content/site";
import { G, PH, PW } from "@/lib/surface";

import { useBook } from "@/store/useBook";
import { C, LEFT, RIGHT, darkPage, folio, kicker, lightPage } from "./common";

/** Losango isométrico usado na ilustração da capa. */
function diamond(g: G, cx: number, cy: number, rx: number, ry: number, fill: string | CanvasGradient | null, stroke: string) {
  const { ctx } = g;
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.lineTo(cx + rx, cy);
  ctx.lineTo(cx, cy + ry);
  ctx.lineTo(cx - rx, cy);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

export function paintCover(g: G) {
  darkPage(g, C.stage);
  const { ctx } = g;
  const x = RIGHT.x;

  const glow = ctx.createRadialGradient(330, 250, 10, 330, 250, 330);
  glow.addColorStop(0, "rgba(16,185,129,0.20)");
  glow.addColorStop(1, "rgba(16,185,129,0)");
  g.rect(0, 0, PW, PH, glow);

  g.pill("DP SYSTEMS // ENGENHARIA ON-DEMAND", x, 40, { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.35)", fg: "#A7F3D0", dot: C.em, size: 9.5 });
  kicker(g, "Edição 2026", x + RIGHT.w, 46, C.soft, "right");

  // Três camadas: hardware, middleware e plataformas.
  const cx = 322;
  const layers = [
    { y: 330, label: "01  HARDWARE", stroke: "rgba(148,163,184,0.45)" },
    { y: 268, label: "02  MIDDLEWARE", stroke: "rgba(148,163,184,0.7)" },
    { y: 206, label: "03  PLATAFORMAS", stroke: C.em },
  ];
  layers.forEach((layer, i) => {
    const top = i === layers.length - 1;
    let fill: string | CanvasGradient | null = "rgba(13,15,23,0.78)";
    if (top) {
      const gradient = ctx.createLinearGradient(cx - 150, layer.y, cx + 150, layer.y);
      gradient.addColorStop(0, "rgba(16,185,129,0.30)");
      gradient.addColorStop(1, "rgba(16,185,129,0.06)");
      fill = gradient;
    }
    diamond(g, cx, layer.y, 150, 72, fill, layer.stroke);
    g.line(cx + 150, layer.y, cx + 172, layer.y, layer.stroke);
    g.text(layer.label, cx + 178, layer.y - 5, { font: "mono", size: 9, weight: 600, color: top ? "#A7F3D0" : C.soft, tracking: 1.2 });
  });
  for (const dx of [-150, 0, 150]) {
    g.line(cx + dx, 206 + (dx === 0 ? 72 : 0), cx + dx, 330 + (dx === 0 ? 72 : 0), "rgba(148,163,184,0.28)", 1, [3, 5]);
  }
  g.dot(cx, 206, 5, C.em, 18);

  g.text(company.name, x, 448, { size: 72, weight: 800, color: "#FFFFFF", tracking: -3 });
  g.text(company.tagline, x + 3, 534, { size: 26, weight: 500, color: C.pale, tracking: -0.6 });
  g.text(company.positioning, x + 3, 588, { size: 14.5, weight: 500, color: C.soft, maxWidth: 400, lineHeight: 22 });

  g.line(x, 690, x + RIGHT.w, 690, C.darkLine);
  const meta = { font: "mono" as const, size: 9, weight: 500, color: C.dim, tracking: 0.8 };
  g.text(company.legalName, x, 706, meta);
  g.text(`CNPJ ${company.cnpj}  ·  ${company.location.toUpperCase()}`, x, 724, meta);
  g.text(`DIREÇÃO  ${company.directors.join(" & ").toUpperCase()}`, x, 742, meta);

  const hovered = g.hit("open", x + RIGHT.w - 96, 716, 96, 34, () => useBook.getState().next());
  g.rr(x + RIGHT.w - 96, 716, 96, 34, 17, hovered ? C.em : "rgba(16,185,129,0.12)", C.em);
  g.text("ABRIR  →", x + RIGHT.w - 48, 727, { font: "mono", size: 10.5, weight: 700, color: hovered ? "#04130D" : "#A7F3D0", align: "center", tracking: 1 });
}

export function paintEditorial(g: G) {
  darkPage(g);
  const x = LEFT.x;
  kicker(g, "Editorial · Carta da direção", x, 44);

  let y = 86;
  y += g.text(company.mission, x, y, { size: 40, weight: 700, color: "#FFFFFF", maxWidth: 500, lineHeight: 46, tracking: -1.4 });
  y += 18;
  y += g.text(company.missionSub, x, y, { size: 18, weight: 600, color: C.em, maxWidth: 480, lineHeight: 26, tracking: -0.3 });
  y += 26;
  g.line(x, y, x + 56, y, C.em, 2);
  y += 24;
  y += g.text(company.editorial, x, y, { size: 14.5, weight: 400, color: C.pale, maxWidth: 480, lineHeight: 23 });
  y += 28;
  g.text(company.directors.join("  &  "), x, y, { size: 16, weight: 700, color: "#FFFFFF", tracking: -0.2 });
  g.text("ADMINISTRAÇÃO · DP SYSTEMS", x, y + 26, { font: "mono", size: 9.5, weight: 500, color: C.soft, tracking: 1.2 });

  // Dados corporativos.
  const top = 584;
  g.rr(x, top, LEFT.w, 150, 14, C.darkCard, C.darkLine);
  const cells = [
    { label: "FUNDAÇÃO", value: company.founded },
    { label: "STATUS", value: company.status, dot: true },
    { label: "CNPJ", value: company.cnpj },
    { label: "LOCALIZAÇÃO", value: company.location },
  ];
  cells.forEach((cell, i) => {
    const cx = x + 22 + (i % 2) * (LEFT.w / 2);
    const cy = top + 22 + Math.floor(i / 2) * 64;
    g.text(cell.label, cx, cy, { font: "mono", size: 9, weight: 500, color: C.soft, tracking: 1.2 });
    if (cell.dot) g.dot(cx + 5, cy + 30, 4, C.em, 10);
    g.text(cell.value, cx + (cell.dot ? 18 : 0), cy + 19, { size: 16, weight: 600, color: "#FFFFFF", font: i === 2 ? "mono" : "display" });
  });
  g.line(x + LEFT.w / 2, top + 18, x + LEFT.w / 2, top + 132, C.darkLine);
  g.line(x + 18, top + 75, x + LEFT.w - 18, top + 75, C.darkLine);

  folio(g, "left", "DP Systems — Editorial", "02", true);
}

export function paintIndex(g: G) {
  lightPage(g);
  const x = RIGHT.x;
  kicker(g, "Nesta edição", x, 44, C.emDark);
  g.text("Três produtos em operação.", x, 70, { size: 34, weight: 700, color: C.ink, maxWidth: 420, lineHeight: 40, tracking: -1.2 });

  const items = [
    { num: "01", name: dpprinter.name, text: "Middleware que liga o sistema web direto à impressora térmica, com auditoria de cada etiqueta.", page: 2 },
    { num: "02", name: estoquento.name, text: "Gestão de estoque com armazém 3D e um hub de integrações operando em tempo real.", page: 3 },
    { num: "03", name: credencial.name, text: "Criação, diagramação e emissão rápida de crachás para impressoras de cartão PVC.", page: 4 },
  ];
  items.forEach((item, i) => {
    const y = 178 + i * 132;
    const hovered = g.hit("index-" + item.num, x, y, RIGHT.w, 118, () => useBook.getState().setPage(item.page));
    g.rr(x, y, RIGHT.w, 118, 16, hovered ? C.white : "rgba(255,255,255,0.6)", hovered ? C.em : C.line, hovered ? 1.5 : 1);
    g.text(item.num, x + 22, y + 24, { font: "mono", size: 30, weight: 700, color: hovered ? C.em : C.pale, tracking: -1 });
    g.text(item.name, x + 96, y + 22, { size: 22, weight: 700, color: C.ink, tracking: -0.5 });
    g.text(item.text, x + 96, y + 56, { size: 13, weight: 500, color: C.mute, maxWidth: 350, lineHeight: 19 });
    g.text("→", x + RIGHT.w - 24, y + 24, { size: 20, weight: 600, color: hovered ? C.em : C.soft, align: "right" });
  });

  const y = 178 + 3 * 132;
  const hovered = g.hit("index-contact", x, y, RIGHT.w, 62, () => useBook.getState().setPage(5));
  g.rr(x, y, RIGHT.w, 62, 16, hovered ? C.ink : "#111827", null);
  g.dot(x + 28, y + 31, 4, C.em, 10);
  g.text("Fale com a engenharia", x + 46, y + 21, { size: 16, weight: 700, color: "#FFFFFF", tracking: -0.2 });
  g.text("CONTATO  →", x + RIGHT.w - 22, y + 25, { font: "mono", size: 10, weight: 600, color: "#A7F3D0", align: "right", tracking: 1.2 });

  folio(g, "right", "DP Systems — Sumário", "03", false);
}
