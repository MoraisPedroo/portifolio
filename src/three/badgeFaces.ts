import { credencialDemo } from "@/content/site";
import type { G } from "@/lib/surface";
import { useDemo } from "@/store/useDemo";
import { IMAGES, getImage } from "./images";

/** Proporção do cartão CR80 (54 × 85,6 mm), em pixels lógicos. */
export const CARD_W = 270;
export const CARD_H = 428;

const INK = "#0F172A";
const SLATE = "#475569";
const RULE = "#CBD5E1";

function barcode(g: G, x: number, y: number, w: number, h: number) {
  let cx = x;
  let i = 0;
  while (cx < x + w - 4) {
    const bw = [2, 1, 3, 1, 2, 1, 1, 3][i % 8];
    g.rect(cx, y, bw, h, INK);
    cx += bw + [1, 2, 1, 3, 1][i % 5];
    i++;
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/**
 * Frente no estilo dos modelos do Credencial Studio: foto, nome e função sobre
 * uma faixa inferior cuja cor muda com a função (Aprendiz, Terceiro, Visitante).
 */
export function paintCardFront(g: G) {
  const demo = useDemo.getState();
  const fn = credencialDemo.functions[demo.fn];
  const { ctx } = g;
  g.rect(0, 0, CARD_W, CARD_H, "#FFFFFF");

  // Topo com a marca da empresa emissora.
  const logo = getImage(IMAGES.logo);
  if (logo) ctx.drawImage(logo, 20, 22, 28, 28);
  g.text("DP Systems", 56, 26, { size: 15, weight: 750, color: INK, tracking: -0.2 });
  g.text("Credencial", CARD_W - 20, 29, { size: 11, weight: 600, color: SLATE, align: "right" });

  // Foto (monograma no lugar da foto real).
  const px = 55;
  const py = 70;
  const pw = 160;
  const ph = 180;
  const photo = ctx.createLinearGradient(px, py, px + pw, py + ph);
  photo.addColorStop(0, "#E2E8F0");
  photo.addColorStop(1, "#CBD5E1");
  g.rr(px, py, pw, ph, 10, photo, null);
  g.text(initials(demo.name), CARD_W / 2, py + ph / 2 - 30, { size: 56, weight: 760, color: "#64748B", align: "center", tracking: -2 });

  // Faixa inferior com nome e função em branco.
  const bandY = 280;
  ctx.beginPath();
  ctx.moveTo(0, bandY + 18);
  ctx.quadraticCurveTo(CARD_W / 2, bandY - 14, CARD_W, bandY + 18);
  ctx.lineTo(CARD_W, CARD_H);
  ctx.lineTo(0, CARD_H);
  ctx.closePath();
  ctx.fillStyle = fn.band;
  ctx.fill();

  const name = demo.name.trim() || (fn.fixed ? "" : "Seu nome");
  let size = 25;
  while (size > 13 && g.measure(name, { size, weight: 780, tracking: -0.5 }) > CARD_W - 32) size -= 1;
  if (name) g.text(name, CARD_W / 2, 318, { size, weight: 780, color: "#FFFFFF", align: "center", tracking: -0.5 });
  const role = fn.fixed ? fn.label : demo.role.trim() || "Sua função";
  g.text(role, CARD_W / 2, name ? 352 : 336, { size: 13, weight: 600, color: "#FFFFFFE6", align: "center", maxWidth: CARD_W - 36, maxLines: 1 });
}

/**
 * Verso com caixas de texto em preto puro, como o Credencial Studio desenha
 * para a impressora. Terceiro e Visitante não mostram a data de admissão.
 */
export function paintCardBack(g: G) {
  const demo = useDemo.getState();
  const fn = credencialDemo.functions[demo.fn];
  const sample = credencialDemo.sample;
  g.rect(0, 0, CARD_W, CARD_H, "#FFFFFF");
  g.text("DPSystems", CARD_W - 18, 18, { size: 11, weight: 700, color: INK, align: "right" });

  const box = (label: string, value: string, x: number, y: number, w: number, center = false) => {
    g.rr(x, y, w, 58, 6, null, INK, 1.6);
    g.text(label, x + 10, y + 8, { size: 10.5, weight: 700, color: INK });
    g.text(value, center ? x + w / 2 : x + 10, y + 28, { size: 18, weight: 750, color: INK, align: center ? "center" : "left" });
  };

  const firstName = demo.name.trim().split(/\s+/)[0] || sample.nameBack;
  box("Nome", fn.fixed && !demo.name.trim() ? fn.label : firstName, 20, 54, CARD_W - 40);
  if (fn.fixed && fn.label !== "Aprendiz") {
    box("Crachá nº", sample.badge, 20, 128, CARD_W - 40, true);
  } else {
    box("Crachá nº", sample.badge, 20, 128, 108);
    box("Admissão", sample.admission, 138, 128, CARD_W - 158);
  }

  g.line(20, 214, CARD_W - 20, 214, RULE);
  g.text("Uso pessoal e intransferível. Em caso de perda, avise a administração da unidade.", 20, 228, {
    size: 11,
    weight: 500,
    color: SLATE,
    maxWidth: CARD_W - 40,
    lineHeight: 15,
  });
  g.rr(20, 296, CARD_W - 40, 66, 6, "#FFFFFF", RULE);
  barcode(g, 32, 308, CARD_W - 64, 42);
  g.text(sample.badge, CARD_W / 2, 374, { font: "mono", size: 12, weight: 700, color: INK, align: "center", tracking: 2 });
  g.text("Impresso com o Credencial Studio", CARD_W / 2, 398, { size: 10, weight: 600, color: SLATE, align: "center" });
}
