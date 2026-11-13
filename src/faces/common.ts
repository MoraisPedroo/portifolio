import { G, PH, PW } from "@/lib/surface";
import { useBook } from "@/store/useBook";

export const C = {
  stage: "#090A0F",
  dark: "#0D0F17",
  darkCard: "#131722",
  darkLine: "#1E293B",
  light: "#F8FAFC",
  white: "#FFFFFF",
  line: "#E2E8F0",
  ink: "#0F172A",
  mute: "#64748B",
  soft: "#94A3B8",
  pale: "#CBD5E1",
  dim: "#475569",
  em: "#10B981",
  emDark: "#059669",
  emSoft: "rgba(16,185,129,0.14)",
  amber: "#F59E0B",
  orange: "#EA580C",
};

/** Margens: páginas esquerdas têm a lombada à direita e vice-versa. */
export const LEFT = { x: 38, w: 514 };
export const RIGHT = { x: 48, w: 514 };

export function darkPage(g: G, bg = C.dark) {
  g.rect(0, 0, PW, PH, bg);
  const { ctx } = g;
  ctx.save();
  ctx.strokeStyle = "rgba(30,41,59,0.32)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 40; x < PW; x += 40) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, PH);
  }
  for (let y = 40; y < PH; y += 40) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(PW, y + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

export function lightPage(g: G) {
  g.rect(0, 0, PW, PH, C.light);
}

export function kicker(g: G, label: string, x: number, y: number, color = C.em, align: CanvasTextAlign = "left") {
  g.text(label.toUpperCase(), x, y, { font: "mono", size: 10, weight: 600, color, tracking: 1.6, align });
}

/** Rodapé com número da página e seta para virar a folha na borda externa. */
export function folio(g: G, side: "left" | "right", label: string, num: string, dark: boolean) {
  const color = dark ? C.dim : C.soft;
  const y = PH - 26;
  const text = { font: "mono" as const, size: 9, weight: 500, color, tracking: 1.2 };
  if (side === "left") {
    g.text(num, LEFT.x, y, text);
    g.text(label.toUpperCase(), LEFT.x + LEFT.w, y, { ...text, align: "right" });
  } else {
    g.text(label.toUpperCase(), RIGHT.x, y, text);
    g.text(num, RIGHT.x + RIGHT.w, y, { ...text, align: "right" });
  }
  turnArrow(g, side, dark);
}

export function turnArrow(g: G, side: "left" | "right", dark: boolean) {
  const book = useBook.getState();
  const x = side === "left" ? 4 : PW - 30;
  const y = PH / 2 - 36;
  const hovered = g.hit("turn-" + side, x - 4, y - 20, 34, 112, side === "left" ? book.prev : book.next);
  const stroke = hovered ? C.em : dark ? "rgba(148,163,184,0.5)" : "rgba(100,116,139,0.55)";
  g.rr(x, y, 26, 72, 13, hovered ? C.emSoft : dark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)", stroke);
  const { ctx } = g;
  const cx = x + 13 + (side === "left" ? 2 : -2);
  const cy = y + 36;
  const d = side === "left" ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(cx - 3 * d, cy - 7);
  ctx.lineTo(cx + 4 * d, cy);
  ctx.lineTo(cx - 3 * d, cy + 7);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

/** Botão de escolha em cápsula; devolve a largura para encadear. */
export function chip(
  g: G,
  id: string,
  label: string,
  x: number,
  y: number,
  active: boolean,
  onClick: () => void,
  dark: boolean,
  h = 28,
) {
  const text = { size: 11.5, weight: 600 };
  const w = g.measure(label, text) + 24;
  const hovered = g.hit(id, x, y, w, h, onClick);
  const bg = active ? C.em : hovered ? (dark ? "rgba(255,255,255,0.08)" : "#FFFFFF") : dark ? "rgba(255,255,255,0.03)" : "#F1F5F9";
  const border = active ? C.em : hovered ? C.em : dark ? C.darkLine : C.line;
  g.rr(x, y, w, h, h / 2, bg, border);
  g.text(label, x + 12, y + (h - 11.5) / 2 - 1, { ...text, color: active ? "#04130D" : dark ? C.pale : C.ink });
  return w;
}

export function openLink(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
