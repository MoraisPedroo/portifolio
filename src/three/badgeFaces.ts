import { credencial } from "@/content/site";
import type { G } from "@/lib/surface";
import { useDemo } from "@/store/useDemo";

/** Proporção do cartão CR80 (54 × 85,6 mm), em pixels lógicos. */
export const CARD_W = 270;
export const CARD_H = 428;

const INK = "#0E1116";
const SLATE = "#4A5463";
const RULE = "#DDE2E8";
const ACCESS_COLORS = ["#047857", "#B45309", "#B91C1C"];

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
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function paintCardFront(g: G) {
  const demo = useDemo.getState();
  const { ctx } = g;
  g.rect(0, 0, CARD_W, CARD_H, "#FFFFFF");

  // Faixa superior com a marca.
  g.rect(0, 0, CARD_W, 118, INK);
  const band = ctx.createLinearGradient(0, 0, CARD_W, 118);
  band.addColorStop(0, "rgba(155,123,255,0.55)");
  band.addColorStop(0.6, "rgba(155,123,255,0.08)");
  band.addColorStop(1, "rgba(16,185,129,0.25)");
  g.rect(0, 0, CARD_W, 118, band);
  g.rr(CARD_W / 2 - 22, 12, 44, 9, 4.5, "#05070A", null);
  g.rr(20, 36, 26, 26, 6, "#10B981", null);
  g.text("DP", 33, 42, { size: 11, weight: 800, color: INK, align: "center" });
  g.text("DP Systems", 54, 40, { size: 15, weight: 750, color: "#FFFFFF", tracking: -0.2 });
  g.text("Credencial", 54, 58, { size: 10.5, weight: 500, color: "#C9BCFF" });

  // Monograma no lugar da foto.
  const cx = CARD_W / 2;
  const cy = 132;
  g.dot(cx, cy, 52, "#FFFFFF");
  const disc = ctx.createLinearGradient(cx - 48, cy - 48, cx + 48, cy + 48);
  disc.addColorStop(0, "#EDE7FF");
  disc.addColorStop(1, "#D9F7EC");
  g.dot(cx, cy, 47, "#E7EAF0");
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, 47, 0, Math.PI * 2);
  ctx.fill();
  g.text(initials(demo.name), cx, cy - 17, { size: 32, weight: 760, color: "#3B2A84", align: "center", tracking: -1 });

  const name = demo.name.trim() || "Seu nome";
  let size = 24;
  while (size > 13 && g.measure(name, { size, weight: 780, tracking: -0.6 }) > CARD_W - 32) size -= 1;
  g.text(name, cx, 200, { size, weight: 780, color: INK, align: "center", tracking: -0.6 });
  g.text(demo.role.trim() || "Seu cargo", cx, 234, { size: 12, weight: 500, color: SLATE, align: "center", maxWidth: CARD_W - 36, maxLines: 1 });

  const access = credencial.access[demo.access];
  const color = ACCESS_COLORS[demo.access];
  const aw = g.measure(access, { size: 11, weight: 650 }) + 34;
  g.rr(cx - aw / 2, 264, aw, 26, 13, color + "14", color);
  g.dot(cx - aw / 2 + 13, 277, 3.5, color);
  g.text(access, cx - aw / 2 + 23, 270, { size: 11, weight: 650, color: INK });

  g.line(22, 314, CARD_W - 22, 314, RULE);
  barcode(g, 30, 330, CARD_W - 60, 40);
  g.text("ID 0001  2026", cx, 380, { font: "mono", size: 10, weight: 600, color: SLATE, align: "center", tracking: 1.2 });
}

export function paintCardBack(g: G) {
  const { ctx } = g;
  g.rect(0, 0, CARD_W, CARD_H, "#F3F5F7");
  g.rect(0, 34, CARD_W, 50, "#0B0E14");

  const chip = ctx.createLinearGradient(26, 116, 80, 158);
  chip.addColorStop(0, "#FDE68A");
  chip.addColorStop(1, "#B45309");
  g.rr(26, 116, 54, 42, 7, chip, "#92400E");
  g.line(26, 137, 80, 137, "#92400E");
  g.line(44, 116, 44, 158, "#92400E");
  g.line(62, 116, 62, 158, "#92400E");

  g.text("Cartão de identificação", 96, 120, { size: 12, weight: 700, color: INK });
  g.text("Uso pessoal e intransferível.", 96, 139, { size: 10.5, weight: 500, color: SLATE });

  g.text("Em caso de perda, avise a administração da sua unidade.", 26, 190, {
    size: 11.5,
    weight: 500,
    color: SLATE,
    maxWidth: CARD_W - 52,
    lineHeight: 17,
  });

  g.rr(26, 256, CARD_W - 52, 64, 8, "#FFFFFF", RULE);
  barcode(g, 38, 268, CARD_W - 76, 40);

  g.line(26, 350, CARD_W - 26, 350, RULE);
  g.text("Emitido com Credencial Studio", CARD_W / 2, 366, { size: 11, weight: 600, color: SLATE, align: "center" });
  g.text("DP Systems", CARD_W / 2, 386, { size: 14, weight: 780, color: INK, align: "center", tracking: -0.3 });
}
