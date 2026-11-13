import { backCover, company, credencial, dpprinter, estoquento } from "@/content/site";
import { G, PH, PW } from "@/lib/surface";
import { useBook } from "@/store/useBook";
import { useDemo } from "@/store/useDemo";
import { C, LEFT, RIGHT, chip, darkPage, folio, kicker, lightPage, openLink } from "./common";

/** Centro do crachá 3D sobre a página direita, em coordenadas lógicas. */
export const BADGE_CENTER = { x: 306, y: 350 };

function field(g: G, key: "name" | "role", label: string, x: number, y: number, w: number) {
  const demo = useDemo.getState();
  const focused = demo.focus === key;
  g.text(label, x, y, { font: "mono", size: 9, weight: 600, color: C.soft, tracking: 1 });
  const hovered = g.hit("field-" + key, x, y + 16, w, 40, () => useDemo.getState().setFocus(key));
  g.rr(x, y + 16, w, 40, 10, "#0B0E15", focused ? C.em : hovered ? C.dim : C.darkLine, focused ? 1.6 : 1);
  const value = demo[key];
  const text = { size: 14.5, weight: 600 };
  g.text(value || "Digite aqui", x + 14, y + 28, { ...text, color: value ? "#FFFFFF" : C.dim });
  if (focused) {
    g.animate();
    if (Math.floor(g.now / 500) % 2 === 0) {
      const cx = x + 15 + (value ? g.measure(value, text) : 0);
      g.rect(cx, y + 26, 1.6, 20, C.em);
    }
  } else {
    g.text("editar", x + w - 14, y + 31, { font: "mono", size: 9, weight: 500, color: hovered ? C.em : C.dim, align: "right" });
  }
}

export function paintCredencialLeft(g: G) {
  darkPage(g);
  const demo = useDemo.getState();
  const x = LEFT.x;
  const w = LEFT.w;

  kicker(g, "03 — " + credencial.name, x, 44);
  let y = 66;
  y += g.text(credencial.title, x, y, { size: 30, weight: 700, color: "#FFFFFF", maxWidth: 480, lineHeight: 36, tracking: -1 });
  y += 10;
  g.text(credencial.copy, x, y, { size: 13, weight: 400, color: C.soft, maxWidth: w, lineHeight: 20 });

  // Formulário que alimenta o crachá 3D da página ao lado.
  const fy = 222;
  g.rr(x, fy, w, 308, 14, C.darkCard, C.darkLine);
  kicker(g, "Personalize o crachá ao lado", x + 18, fy + 18, C.em);
  field(g, "name", "NOME NO CRACHÁ", x + 18, fy + 46, w - 36);
  field(g, "role", "CARGO / SETOR", x + 18, fy + 116, w - 36);

  g.text("NÍVEL DE ACESSO", x + 18, fy + 186, { font: "mono", size: 9, weight: 600, color: C.soft, tracking: 1 });
  let cx = x + 18;
  credencial.access.forEach((label, i) => {
    cx += chip(g, "access-" + i, label, cx, fy + 202, demo.access === i, () => useDemo.getState().setAccess(i), true) + 8;
  });
  g.text("ACABAMENTO", x + 18, fy + 246, { font: "mono", size: 9, weight: 600, color: C.soft, tracking: 1 });
  cx = x + 18;
  credencial.finishes.forEach((label, i) => {
    cx += chip(g, "finish-" + i, label, cx, fy + 262, demo.finish === i, () => useDemo.getState().setFinish(i), true) + 8;
  });

  const by = 546;
  const cw = (w - 12) / 2;
  credencial.features.forEach((feature, i) => {
    const bx = x + (i % 2) * (cw + 12);
    const byy = by + Math.floor(i / 2) * 102;
    g.rr(bx, byy, cw, 90, 12, C.darkCard, C.darkLine);
    g.text("0" + (i + 1), bx + 16, byy + 15, { font: "mono", size: 10, weight: 600, color: C.em });
    g.text(feature.title, bx + 40, byy + 13, { size: 13.5, weight: 700, color: "#FFFFFF" });
    g.text(feature.text, bx + 16, byy + 40, { size: 11, weight: 400, color: C.soft, maxWidth: cw - 30, lineHeight: 15.5, maxLines: 3 });
  });

  folio(g, "left", "Credencial Studio — Editor", "08", true);
}

export function paintCredencialRight(g: G) {
  lightPage(g);
  const demo = useDemo.getState();
  const x = RIGHT.x;
  const w = RIGHT.w;
  const { ctx } = g;

  const spot = ctx.createRadialGradient(BADGE_CENTER.x, BADGE_CENTER.y, 30, BADGE_CENTER.x, BADGE_CENTER.y, 380);
  spot.addColorStop(0, "#FFFFFF");
  spot.addColorStop(1, "#E8EDF3");
  g.rect(0, 0, PW, PH, spot);
  for (const r of [170, 232, 294]) {
    ctx.beginPath();
    ctx.arc(BADGE_CENTER.x, BADGE_CENTER.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(148,163,184,0.28)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  kicker(g, "Prévia 3D · cartão PVC CR80", x, 44, C.emDark);
  const finish = credencial.finishes[demo.finish].toUpperCase();
  const fw = g.measure(finish, { font: "mono", size: 9, weight: 600, tracking: 0.6 }) + 32;
  g.pill(finish, x + w - fw, 37, { bg: "#FFFFFF", border: C.line, fg: C.ink, dot: C.em, size: 9 });

  const bw = 190;
  const bx = BADGE_CENTER.x - bw / 2;
  const hovered = g.hit("flip", bx, 656, bw, 46, () => useDemo.getState().flip());
  g.rr(bx, 656, bw, 46, 23, hovered ? C.ink : "#111827", null);
  g.text(demo.flipped ? "↺  Ver a frente" : "↻  Virar o crachá", BADGE_CENTER.x, 671, { size: 13.5, weight: 700, color: "#FFFFFF", align: "center" });
  g.text("Mova o mouse para inclinar o cartão e ver o acabamento reagir à luz.", BADGE_CENTER.x, 718, { size: 12, weight: 500, color: C.mute, align: "center", maxWidth: 380, lineHeight: 17 });

  folio(g, "right", "Credencial Studio — Prévia", "09", false);
}

export function paintBackCover(g: G) {
  darkPage(g, C.stage);
  const x = LEFT.x;
  const w = LEFT.w;
  const { ctx } = g;
  const glow = ctx.createRadialGradient(120, 160, 10, 120, 160, 420);
  glow.addColorStop(0, "rgba(16,185,129,0.16)");
  glow.addColorStop(1, "rgba(16,185,129,0)");
  g.rect(0, 0, PW, PH, glow);

  g.pill(backCover.kicker.toUpperCase(), x, 40, { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.35)", fg: "#A7F3D0", dot: C.em, size: 9.5 });
  let y = 92;
  y += g.text(backCover.title, x, y, { size: 44, weight: 800, color: "#FFFFFF", maxWidth: 480, lineHeight: 50, tracking: -1.8 });
  y += 16;
  y += g.text(backCover.copy, x, y, { size: 15, weight: 400, color: C.pale, maxWidth: 480, lineHeight: 24 });

  // CTA principal.
  y += 26;
  const primary = g.hit("cta-whatsapp", x, y, w, 62, () => openLink(company.whatsapp));
  ctx.save();
  ctx.shadowColor = "rgba(16,185,129,0.5)";
  ctx.shadowBlur = primary ? 30 : 16;
  g.rr(x, y, w, 62, 14, primary ? "#34D399" : C.em, null);
  ctx.restore();
  g.text("Falar com um consultor", x + 22, y + 13, { size: 18, weight: 800, color: "#04130D", tracking: -0.4 });
  g.text("WHATSAPP COMERCIAL", x + 22, y + 40, { font: "mono", size: 8.5, weight: 600, color: "#065F46", tracking: 1 });
  g.text("→", x + w - 24, y + 17, { size: 24, weight: 700, color: "#04130D", align: "right" });

  // Links dos produtos.
  y += 76;
  const cw = (w - 12) / 2;
  const links = [
    { id: "cta-dpprinter", name: dpprinter.name, label: dpprinter.urlLabel, url: dpprinter.url },
    { id: "cta-estoquento", name: estoquento.name, label: estoquento.urlLabel, url: estoquento.url },
  ];
  links.forEach((link, i) => {
    const lx = x + i * (cw + 12);
    const hovered = g.hit(link.id, lx, y, cw, 84, () => openLink(link.url));
    g.rr(lx, y, cw, 84, 14, hovered ? "#161B28" : C.darkCard, hovered ? C.em : C.darkLine);
    g.text("ACESSAR", lx + 18, y + 16, { font: "mono", size: 8.5, weight: 600, color: C.soft, tracking: 1 });
    g.text(link.name, lx + 18, y + 31, { size: 18, weight: 700, color: "#FFFFFF", tracking: -0.4 });
    g.text(link.label + "  ↗", lx + 18, y + 59, { font: "mono", size: 10, weight: 500, color: hovered ? "#6EE7B7" : C.soft });
  });

  y += 96;
  const demoHover = g.hit("cta-credencial", x, y, w, 58, () => openLink(company.whatsapp));
  g.rr(x, y, w, 58, 14, demoHover ? "#161B28" : C.darkCard, demoHover ? C.em : C.darkLine);
  g.text(credencial.name, x + 18, y + 12, { size: 15, weight: 700, color: "#FFFFFF", tracking: -0.3 });
  g.text("Solicitar uma demonstração", x + 18, y + 33, { size: 11.5, weight: 500, color: C.soft });
  g.text("↗", x + w - 20, y + 18, { size: 18, weight: 600, color: demoHover ? "#6EE7B7" : C.soft, align: "right" });

  g.line(x, 690, x + w, 690, C.darkLine);
  const meta = { font: "mono" as const, size: 9, weight: 500, color: C.dim, tracking: 0.8 };
  g.text(`© ${company.founded} ${company.legalName}`, x, 706, meta);
  g.text(`CNPJ ${company.cnpj}  ·  ${company.location.toUpperCase()}`, x, 724, meta);
  g.text("TODOS OS DIREITOS RESERVADOS", x, 742, meta);

  const back = g.hit("restart", x + w - 118, 716, 118, 34, () => useBook.getState().setPage(0));
  g.rr(x + w - 118, 716, 118, 34, 17, back ? C.em : "rgba(16,185,129,0.12)", C.em);
  g.text("←  REABRIR", x + w - 59, 727, { font: "mono", size: 10.5, weight: 700, color: back ? "#04130D" : "#A7F3D0", align: "center", tracking: 1 });
}

/* ---------- Faces do crachá (textura do cartão PVC) ---------- */

export const CARD_W = 270;
export const CARD_H = 428;
const ACCESS_COLORS = ["#10B981", "#F59E0B", "#EF4444"];

function barcode(g: G, x: number, y: number, w: number, h: number, color: string) {
  let cx = x;
  let i = 0;
  while (cx < x + w - 4) {
    const bw = [2, 1, 3, 1, 2, 1, 1, 3][i % 8];
    g.rect(cx, y, bw, h, color);
    cx += bw + [1, 2, 1, 3, 1][i % 5];
    i++;
  }
}

export function paintCardFront(g: G) {
  const demo = useDemo.getState();
  const { ctx } = g;
  g.rect(0, 0, CARD_W, CARD_H, "#FFFFFF");
  g.rect(0, 0, CARD_W, 124, C.dark);
  const band = ctx.createLinearGradient(0, 0, CARD_W, 124);
  band.addColorStop(0, "rgba(16,185,129,0.35)");
  band.addColorStop(1, "rgba(16,185,129,0)");
  g.rect(0, 0, CARD_W, 124, band);
  g.rr(CARD_W / 2 - 22, 12, 44, 9, 4.5, "#020617", null);
  g.dot(22, 46, 4, C.em, 8);
  g.text("DP SYSTEMS", 34, 40, { font: "mono", size: 11, weight: 700, color: "#FFFFFF", tracking: 1.6 });
  g.text("CREDENCIAL", CARD_W - 18, 41, { font: "mono", size: 8.5, weight: 500, color: "#A7F3D0", tracking: 1.2, align: "right" });

  // Foto (silhueta).
  const cx = CARD_W / 2;
  const cy = 132;
  g.dot(cx, cy, 58, "#FFFFFF");
  g.dot(cx, cy, 53, "#E2E8F0");
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 53, 0, Math.PI * 2);
  ctx.clip();
  g.dot(cx, cy - 12, 19, "#94A3B8");
  g.dot(cx, cy + 52, 38, "#94A3B8");
  ctx.restore();

  const name = demo.name.trim() || "Seu nome";
  let size = 23;
  while (size > 13 && g.measure(name, { size, weight: 800, tracking: -0.5 }) > CARD_W - 36) size -= 1;
  g.text(name, cx, 208, { size, weight: 800, color: C.ink, align: "center", tracking: -0.5 });
  g.text(demo.role.trim() || "Seu cargo", cx, 240, { size: 11.5, weight: 500, color: C.mute, align: "center", maxWidth: CARD_W - 40, maxLines: 1 });

  const access = credencial.access[demo.access].toUpperCase();
  const color = ACCESS_COLORS[demo.access];
  const aw = g.measure(access, { font: "mono", size: 9, weight: 700, tracking: 1 }) + 34;
  g.rr(cx - aw / 2, 268, aw, 24, 12, color + "1F", color);
  g.dot(cx - aw / 2 + 13, 280, 3.5, color);
  g.text(access, cx - aw / 2 + 23, 275, { font: "mono", size: 9, weight: 700, color: C.ink, tracking: 1 });

  g.line(24, 316, CARD_W - 24, 316, C.line);
  barcode(g, 30, 334, CARD_W - 60, 40, C.ink);
  g.text("ID 0001 · 2026", cx, 388, { font: "mono", size: 9.5, weight: 600, color: C.mute, align: "center", tracking: 1.4 });
}

export function paintCardBack(g: G) {
  const { ctx } = g;
  g.rect(0, 0, CARD_W, CARD_H, "#F1F5F9");
  g.rect(0, 34, CARD_W, 52, "#0B0E15");

  // Chip de contato.
  const chipGradient = ctx.createLinearGradient(28, 120, 82, 162);
  chipGradient.addColorStop(0, "#FDE68A");
  chipGradient.addColorStop(1, "#B45309");
  g.rr(28, 120, 54, 42, 7, chipGradient, "#92400E");
  g.line(28, 141, 82, 141, "#92400E");
  g.line(46, 120, 46, 162, "#92400E");
  g.line(64, 120, 64, 162, "#92400E");

  g.text("CARTÃO DE IDENTIFICAÇÃO", 100, 126, { font: "mono", size: 8.5, weight: 700, color: C.ink, tracking: 1 });
  g.text("Uso pessoal e intransferível.", 100, 144, { size: 10.5, weight: 500, color: C.mute });

  g.text("Em caso de perda, comunique imediatamente a administração da sua unidade.", 28, 196, { size: 11, weight: 500, color: C.mute, maxWidth: CARD_W - 56, lineHeight: 16 });

  g.rr(28, 262, CARD_W - 56, 62, 8, "#FFFFFF", C.line);
  barcode(g, 40, 274, CARD_W - 80, 38, C.ink);

  g.line(28, 352, CARD_W - 28, 352, C.line);
  g.text("EMITIDO COM", CARD_W / 2, 368, { font: "mono", size: 8, weight: 500, color: C.soft, align: "center", tracking: 1.2 });
  g.text("Credencial Studio", CARD_W / 2, 382, { size: 14, weight: 800, color: C.ink, align: "center", tracking: -0.3 });
  g.text("DP SYSTEMS", CARD_W / 2, 404, { font: "mono", size: 8, weight: 600, color: C.emDark, align: "center", tracking: 1.6 });
}
