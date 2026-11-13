import { estoquento } from "@/content/site";
import { AISLE_NAMES, aisleStats } from "@/content/warehouse";
import { G } from "@/lib/surface";
import { useDemo } from "@/store/useDemo";
import { C, LEFT, RIGHT, chip, darkPage, folio, kicker, lightPage } from "./common";

/** Janela onde o armazém 3D flutua, em coordenadas lógicas da página. */
export const WAREHOUSE_WINDOW = { x: LEFT.x, y: 76, w: LEFT.w, h: 320 };

export function paintEstoqueLeft(g: G) {
  darkPage(g);
  const demo = useDemo.getState();
  const x = LEFT.x;
  const w = LEFT.w;

  g.text("Estoque", x, 36, { size: 21, weight: 800, color: "#FFFFFF", tracking: -0.6 });
  g.text("NTO", x + g.measure("Estoque", { size: 21, weight: 800, tracking: -0.6 }), 36, { size: 21, weight: 800, color: C.orange, tracking: -0.6 });
  kicker(g, "02 — Plataforma logística", x + w, 44, C.em, "right");

  // Palco do armazém 3D (o modelo real flutua à frente da página).
  const win = WAREHOUSE_WINDOW;
  const stage = g.ctx.createRadialGradient(win.x + win.w / 2, win.y + win.h * 0.6, 20, win.x + win.w / 2, win.y + win.h * 0.6, win.w * 0.7);
  stage.addColorStop(0, "#141a28");
  stage.addColorStop(1, "#090B11");
  g.rr(win.x, win.y, win.w, win.h, 14, stage, C.darkLine);
  kicker(g, "Armazém 3D · interativo", win.x + 16, win.y + 14, C.soft);
  const legend = [
    { label: "Normal", color: "#E2E8F0" },
    { label: "Recente", color: C.em },
    { label: "Acabando", color: C.amber },
  ];
  let lx = win.x + 16;
  legend.forEach((item) => {
    g.dot(lx + 4, win.y + win.h - 20, 4, item.color);
    g.text(item.label, lx + 14, win.y + win.h - 26, { size: 10.5, weight: 500, color: C.soft });
    lx += g.measure(item.label, { size: 10.5, weight: 500 }) + 30;
  });
  g.text("passe o mouse ou toque nas prateleiras", win.x + win.w - 16, win.y + win.h - 26, { font: "mono", size: 8.5, weight: 500, color: C.dim, align: "right" });

  let y = 420;
  y += g.text(estoquento.title, x, y, { size: 26, weight: 700, color: "#FFFFFF", maxWidth: 500, lineHeight: 32, tracking: -0.8 });
  y += 8;
  g.text(estoquento.copy, x, y, { size: 13, weight: 400, color: C.soft, maxWidth: w, lineHeight: 20 });

  // Resumo do corredor em foco.
  const focus = demo.hoverAisle ?? demo.aisle;
  const stats = aisleStats(focus);
  const cards = [
    { label: "INVENTÁRIO", value: stats.total, unit: "itens", color: "#FFFFFF" },
    { label: "DIVERSIDADE", value: stats.models, unit: "modelos", color: "#FFFFFF" },
    { label: "RECENTES", value: stats.recent, unit: "entradas", color: C.em },
    { label: "ACABANDO", value: stats.critical, unit: "alertas", color: C.amber },
  ];
  const cy = 578;
  const cw = (w - 30) / 4;
  cards.forEach((card, i) => {
    const cx = x + i * (cw + 10);
    g.rr(cx, cy, cw, 92, 12, C.darkCard, C.darkLine);
    g.text(card.label, cx + 12, cy + 13, { font: "mono", size: 8.2, weight: 600, color: C.soft, tracking: 0.8 });
    g.text(String(card.value), cx + 12, cy + 30, { size: 30, weight: 700, color: card.color, tracking: -1 });
    g.text(card.unit, cx + 12, cy + 68, { size: 10.5, weight: 500, color: C.dim });
  });

  // Seletor de corredor (também funciona no toque).
  const sy = 690;
  g.text("CORREDOR", x, sy + 9, { font: "mono", size: 9, weight: 600, color: C.soft, tracking: 1 });
  let sx = x + 82;
  sx += chip(g, "aisle-all", "Todos", sx, sy, focus === null, () => useDemo.setState({ aisle: null }), true) + 8;
  AISLE_NAMES.forEach((name, i) => {
    sx += chip(g, "aisle-" + i, name, sx, sy, focus === i, () => useDemo.getState().toggleAisle(i), true) + 8;
  });

  folio(g, "left", "EstoqueNTO — Armazém", "06", true);
}

function latencyColor(ms: number) {
  return ms < 500 ? C.emDark : ms < 1000 ? "#B45309" : C.mute;
}

/** Série pseudoaleatória estável em torno da latência do serviço. */
function sparkline(g: G, x: number, y: number, w: number, h: number, seed: number, color: string) {
  const { ctx } = g;
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const noise = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    const value = 0.25 + 0.5 * (noise - Math.floor(noise));
    const px = x + (i / 23) * w;
    const py = y + h - value * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";
  ctx.stroke();
}

export function paintEstoqueRight(g: G) {
  lightPage(g);
  const demo = useDemo.getState();
  const x = RIGHT.x;
  const w = RIGHT.w;
  const list = estoquento.integrations;

  kicker(g, "Hub de integrações", x, 40, C.emDark);
  g.text(estoquento.hubTitle, x, 58, { size: 28, weight: 700, color: C.ink, tracking: -0.9 });

  // Status global.
  const hy = 100;
  g.rr(x, hy, w, 62, 14, C.white, C.line);
  g.dot(x + 22, hy + 24, 5, C.em, 10);
  g.text(estoquento.hubStatus, x + 36, hy + 14, { size: 13.5, weight: 700, color: C.ink, tracking: -0.2 });
  g.text(`${list.length} INTEGRAÇÕES EM DESTAQUE`, x + 36, hy + 37, { font: "mono", size: 8.5, weight: 500, color: C.mute, tracking: 0.8 });
  g.text("TEMPO MÉDIO", x + 300, hy + 13, { font: "mono", size: 8.5, weight: 500, color: C.mute, tracking: 0.8 });
  g.text(`${estoquento.hubAverage} ms`, x + 300, hy + 28, { font: "mono", size: 19, weight: 700, color: C.ink, tracking: -0.5 });
  const running = Object.values(demo.pings).some((p) => !p.done);
  const allHover = g.hit("ping-all", x + w - 116, hy + 12, 104, 38, () => useDemo.getState().pingAll());
  g.rr(x + w - 116, hy + 12, 104, 38, 10, running ? "#A7F3D0" : allHover ? C.emDark : C.em, null);
  g.text(running ? "Testando…" : "Testar todas", x + w - 64, hy + 23, { size: 12.5, weight: 700, color: running ? "#065F46" : "#FFFFFF", align: "center" });

  // Lista de serviços.
  const top = 174;
  list.forEach((item, i) => {
    const y = top + i * 56;
    const ping = demo.pings[i];
    const active = ping !== undefined && !ping.done;
    const elapsed = active ? Math.min(item.ms, g.now - ping.start) : 0;
    if (active) g.animate();
    const selected = demo.selected === i;
    const hovered = g.hit("api-" + i, x, y, w, 50, () => useDemo.getState().ping(i));
    g.rr(x, y, w, 50, 12, C.white, hovered || selected ? C.em : C.line, selected ? 1.5 : 1);

    g.rr(x + 10, y + 10, 30, 30, 8, item.color + "22", null);
    g.text(item.glyph, x + 25, y + 18, { size: 12, weight: 800, color: item.color, align: "center", tracking: -0.3 });
    g.text(item.name, x + 52, y + 9, { size: 13, weight: 700, color: C.ink, tracking: -0.2 });
    g.text(item.text, x + 52, y + 28, { size: 10.5, weight: 500, color: C.mute, maxWidth: 330, maxLines: 1 });

    const label = active ? `${Math.round(elapsed)} ms` : `${item.ms} ms`;
    const done = ping?.done;
    const bw = 74;
    g.rr(x + w - bw - 28, y + 13, bw, 24, 12, done ? "#ECFDF5" : "#F1F5F9", done ? "#A7F3D0" : null);
    g.text((done ? "✓ " : "") + label, x + w - 28 - bw / 2, y + 19, { font: "mono", size: 10.5, weight: 600, color: active ? C.amber : latencyColor(item.ms), align: "center" });
    g.dot(x + w - 14, y + 25, 4, active ? C.amber : C.em, active ? 8 : 0);

    if (active) {
      g.ctx.save();
      g.ctx.beginPath();
      g.ctx.roundRect(x, y, w, 50, 12);
      g.ctx.clip();
      g.rect(x, y + 47, w * (elapsed / item.ms), 3, C.em);
      g.ctx.restore();
    }
  });

  // Inspetor do serviço selecionado.
  const item = list[demo.selected];
  const iy = top + list.length * 56 + 4;
  g.rr(x, iy, w, 76, 14, C.dark, null);
  g.text("INSPETOR · " + item.name.toUpperCase(), x + 16, iy + 13, { font: "mono", size: 8.5, weight: 600, color: C.soft, tracking: 0.8 });
  g.text(item.endpoint, x + 16, iy + 31, { font: "mono", size: 11, weight: 500, color: "#6EE7B7" });
  g.text("clique numa integração para simular a chamada", x + 16, iy + 53, { size: 10.5, weight: 500, color: C.dim });
  sparkline(g, x + w - 150, iy + 16, 132, 34, demo.selected + 1, C.em);
  g.text(`${item.ms} ms`, x + w - 18, iy + 54, { font: "mono", size: 10, weight: 600, color: C.pale, align: "right" });

  folio(g, "right", "EstoqueNTO — Integrações", "07", false);
}
