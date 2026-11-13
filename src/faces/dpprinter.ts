import { dpprinter } from "@/content/site";
import { G } from "@/lib/surface";
import { PRINT_MS, useDemo } from "@/store/useDemo";
import { C, LEFT, RIGHT, chip, darkPage, folio, kicker, lightPage } from "./common";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);

/** Progresso 0..1 da impressão em andamento, ou null se parado. */
function printProgress(g: G) {
  const start = useDemo.getState().printStart;
  if (start === null) return null;
  g.animate();
  return clamp01((g.now - start) / PRINT_MS);
}

function node(g: G, cx: number, cy: number, title: string, sub: string, active: boolean) {
  const w = 118;
  const h = 46;
  g.ctx.save();
  if (active) {
    g.ctx.shadowColor = C.em;
    g.ctx.shadowBlur = 18;
  }
  g.rr(cx - w / 2, cy - h / 2, w, h, 10, "#111623", active ? C.em : C.darkLine, active ? 1.6 : 1);
  g.ctx.restore();
  g.text(title, cx, cy - 15, { size: 11.5, weight: 700, color: "#FFFFFF", align: "center" });
  g.text(sub, cx, cy + 3, { font: "mono", size: 8.5, weight: 500, color: active ? "#A7F3D0" : C.soft, align: "center", tracking: 0.4 });
}

/** Diagrama vivo: aplicação web -> porta local -> impressora, com auditoria na nuvem. */
function diagram(g: G, x: number, y: number, w: number, h: number) {
  const p = printProgress(g);
  g.rr(x, y, w, h, 14, "#090B11", C.darkLine);
  kicker(g, "Arquitetura · sem spooler", x + 16, y + 14, C.soft);

  const ay = y + 138;
  const a = { x: x + 76, y: ay };
  const b = { x: x + w / 2, y: ay };
  const c = { x: x + w - 76, y: ay };
  const d = { x: x + w / 2, y: y + 58 };

  const wire = "rgba(148,163,184,0.35)";
  g.line(a.x + 59, a.y, b.x - 59, b.y, wire, 1.4, [4, 4]);
  g.line(b.x + 59, b.y, c.x - 59, c.y, wire, 1.4, [4, 4]);
  g.line(b.x, b.y - 23, d.x, d.y + 23, wire, 1.4, [4, 4]);
  g.text("HTTP LOCAL", (a.x + b.x) / 2, ay - 18, { font: "mono", size: 8, weight: 500, color: C.dim, align: "center", tracking: 0.8 });
  g.text("USB RAW", (b.x + c.x) / 2, ay - 18, { font: "mono", size: 8, weight: 500, color: C.dim, align: "center", tracking: 0.8 });
  g.text("TELEMETRIA", b.x + 10, (b.y + d.y) / 2 - 5, { font: "mono", size: 8, weight: 500, color: C.dim, tracking: 0.8 });

  node(g, a.x, a.y, "Aplicação web", "COMANDO ZPL", p !== null && p < 0.3);
  node(g, b.x, b.y, "DPPrinter", "PORTA LOCAL", p !== null && p > 0.15);
  node(g, c.x, c.y, "Impressora", "TÉRMICA USB/REDE", p !== null && p > 0.4 && p < 0.85);
  node(g, d.x, d.y, "Firebase", "AUDITORIA", p !== null && p > 0.75);

  if (p !== null) {
    const pulse = (from: { x: number; y: number }, to: { x: number; y: number }, t: number) => {
      if (t <= 0 || t >= 1) return;
      const k = ease(t);
      for (let i = 0; i < 4; i++) {
        const tail = Math.max(0, k - i * 0.06);
        g.dot(from.x + (to.x - from.x) * tail, from.y + (to.y - from.y) * tail, 4 - i * 0.8, `rgba(16,185,129,${1 - i * 0.24})`, i === 0 ? 14 : 0);
      }
    };
    pulse({ x: a.x + 59, y: a.y }, { x: b.x - 59, y: b.y }, p / 0.25);
    pulse({ x: b.x + 59, y: b.y }, { x: c.x - 59, y: c.y }, (p - 0.25) / 0.3);
    pulse({ x: b.x, y: b.y - 23 }, { x: d.x, y: d.y + 23 }, (p - 0.6) / 0.3);
  }
}

export function paintPrinterLeft(g: G) {
  darkPage(g);
  const x = LEFT.x;
  const w1 = g.pill(dpprinter.version.toUpperCase(), x, 38, { bg: C.emSoft, border: "rgba(16,185,129,0.4)", fg: "#A7F3D0", dot: C.em, size: 9.5 });
  g.text(dpprinter.tags, x + w1 + 12, 44, { font: "mono", size: 9, weight: 500, color: C.soft, tracking: 0.4 });

  diagram(g, x, 76, LEFT.w, 196);

  kicker(g, "01 — " + dpprinter.kicker, x, 294);
  let y = 316;
  y += g.text(dpprinter.title, x, y, { size: 30, weight: 700, color: "#FFFFFF", maxWidth: 500, lineHeight: 36, tracking: -1 });
  y += 10;
  y += g.text(dpprinter.copy, x, y, { size: 13, weight: 400, color: C.soft, maxWidth: LEFT.w, lineHeight: 20 });

  y += 18;
  const sw = LEFT.w / 4;
  dpprinter.stats.forEach((stat, i) => {
    const sx = x + i * sw;
    if (i > 0) g.line(sx - 8, y + 4, sx - 8, y + 44, C.darkLine);
    g.text(stat.value, sx, y, { size: 21, weight: 700, color: i === 1 ? C.em : "#FFFFFF", tracking: -0.5 });
    g.text(stat.label.toUpperCase(), sx, y + 32, { font: "mono", size: 7.8, weight: 500, color: C.soft, tracking: 0.5 });
  });

  y += 66;
  const cw = (LEFT.w - 12) / 2;
  const ch = 92;
  dpprinter.features.slice(0, 4).forEach((feature, i) => {
    const fx = x + (i % 2) * (cw + 12);
    const fy = y + Math.floor(i / 2) * (ch + 12);
    g.rr(fx, fy, cw, ch, 12, C.darkCard, C.darkLine);
    g.dot(fx + 18, fy + 22, 3, C.em, 8);
    g.text(feature.title, fx + 30, fy + 14, { size: 13, weight: 700, color: "#FFFFFF" });
    g.text(feature.text, fx + 16, fy + 38, { size: 11, weight: 400, color: C.soft, maxWidth: cw - 30, lineHeight: 15.5, maxLines: 3 });
  });

  folio(g, "left", "DP Printer — Arquitetura", "04", true);
}

const JSON_COLORS = { key: "#94A3B8", string: "#6EE7B7", number: "#FBBF24", punct: "#475569" };

/** Escreve o JSON com realce simples de chaves, textos e números. */
function jsonBlock(g: G, json: string, x: number, y: number) {
  json.split("\n").forEach((line, row) => {
    const match = line.match(/^(\s*)("[^"]*")?(:\s*)?(.*)$/) ?? [];
    let cx = x;
    const put = (str: string | undefined, color: string) => {
      if (!str) return;
      g.text(str, cx, y + row * 16, { font: "mono", size: 10.5, weight: 500, color });
      cx += g.measure(str, { font: "mono", size: 10.5, weight: 500 });
    };
    put(match[1], JSON_COLORS.punct);
    if (match[3]) {
      put(match[2], JSON_COLORS.key);
      put(match[3], JSON_COLORS.punct);
      put(match[4], /^"/.test(match[4] ?? "") ? JSON_COLORS.string : JSON_COLORS.number);
    } else {
      put((match[2] ?? "") + (match[4] ?? ""), JSON_COLORS.punct);
    }
  });
}

export function paintPrinterRight(g: G) {
  lightPage(g);
  const demo = useDemo.getState();
  const p = printProgress(g);
  const x = RIGHT.x;
  const w = RIGHT.w;

  kicker(g, "Simulador interativo", x, 44, C.emDark);
  const listening = "PORTA LOCAL ESCUTANDO";
  const lw = g.measure(listening, { font: "mono", size: 9, weight: 600, tracking: 0.6 }) + 32;
  g.pill(listening, x + w - lw, 37, { bg: "#ECFDF5", border: "#A7F3D0", fg: C.emDark, dot: C.em, size: 9 });
  g.text("Telemetria em tempo real", x, 64, { size: 28, weight: 700, color: C.ink, tracking: -0.9 });
  g.text("Escolha o cenário e dispare uma impressão de teste. É uma simulação: nada sai do seu navegador.", x, 104, { size: 12.5, weight: 500, color: C.mute, maxWidth: w, lineHeight: 18 });

  const rows: { label: string; key: "lab" | "operator" | "station"; options: string[] }[] = [
    { label: "UNIDADE / LC", key: "lab", options: dpprinter.sim.labs },
    { label: "OPERADOR", key: "operator", options: dpprinter.sim.operators },
    { label: "ESTAÇÃO / PC", key: "station", options: dpprinter.sim.stations },
  ];
  rows.forEach((row, r) => {
    const y = 154 + r * 36;
    g.text(row.label, x, y + 9, { font: "mono", size: 9, weight: 600, color: C.mute, tracking: 1 });
    let cx = x + 104;
    row.options.forEach((option, i) => {
      cx += chip(g, `${row.key}-${i}`, option, cx, y, demo[row.key] === i, () => useDemo.getState().pick(row.key, i), false) + 8;
    });
  });

  // Botão principal.
  const by = 270;
  const busy = p !== null;
  const hovered = g.hit("print", x, by, 300, 50, () => useDemo.getState().print());
  g.ctx.save();
  if (!busy) {
    g.ctx.shadowColor = "rgba(16,185,129,0.45)";
    g.ctx.shadowBlur = hovered ? 22 : 12;
    g.ctx.shadowOffsetY = 4;
  }
  g.rr(x, by, 300, 50, 12, busy ? "#A7F3D0" : hovered ? C.emDark : C.em, null);
  g.ctx.restore();
  g.text(busy ? "Imprimindo…" : "Imprimir etiqueta de teste", x + 150, by + 16, { size: 15, weight: 700, color: busy ? "#065F46" : "#FFFFFF", align: "center", tracking: -0.2 });

  // Etapas do fluxo.
  const steps = ["Comando recebido na porta local", "Etiqueta enviada via USB Raw", "Auditoria gravada na nuvem"];
  steps.forEach((step, i) => {
    const sy = 334 + i * 20;
    const done = p !== null ? p > [0.2, 0.6, 0.95][i] : demo.printCount > 0;
    const active = p !== null && !done && p > [0, 0.2, 0.6][i];
    g.dot(x + 6, sy + 7, 4, done ? C.em : active ? C.amber : C.pale, active ? 8 : 0);
    g.text(step, x + 20, sy, { size: 11.5, weight: done || active ? 600 : 500, color: done ? C.ink : active ? C.ink : C.soft });
  });

  // Impressora e etiqueta saindo.
  const px = x + 322;
  const pw = w - 322;
  const emerge = p !== null ? ease((p - 0.2) / 0.45) : demo.printCount > 0 ? 1 : 0;
  if (emerge > 0) {
    const lh = 78 * emerge;
    g.ctx.save();
    g.ctx.shadowColor = "rgba(15,23,42,0.18)";
    g.ctx.shadowBlur = 10;
    g.ctx.shadowOffsetY = 4;
    g.rr(px + 16, by + 34, pw - 32, lh + 8, 4, "#FFFFFF", C.line);
    g.ctx.restore();
    g.ctx.save();
    g.ctx.beginPath();
    g.ctx.rect(px + 16, by + 42, pw - 32, lh);
    g.ctx.clip();
    const top = by + 42 + lh - 78;
    g.text(dpprinter.sim.labs[demo.lab], px + 26, top + 8, { font: "mono", size: 10, weight: 700, color: C.ink });
    for (let i = 0; i < 26; i++) {
      const bw = [1, 2, 1, 3, 1, 1, 2][i % 7];
      g.rect(px + 26 + i * 5, top + 26, bw, 30, C.ink);
    }
    g.text(dpprinter.sim.operators[demo.operator], px + 26, top + 60, { font: "mono", size: 8, weight: 500, color: C.mute });
    g.ctx.restore();
  }
  g.rr(px, by, pw, 42, 10, "#111827", null);
  g.rr(px + 12, by + 30, pw - 24, 5, 2.5, "#020617", null);
  g.dot(px + 18, by + 16, 3.5, busy ? C.em : "#334155", busy ? 10 : 0);
  g.text("IMPRESSORA TÉRMICA", px + 30, by + 11, { font: "mono", size: 8.5, weight: 600, color: C.pale, tracking: 0.8 });

  // Terminal de auditoria.
  const ty = 408;
  const th = 232;
  g.rr(x, ty, w, th, 14, C.dark, null);
  g.rr(x, ty, w, 34, 14, "#131722", null);
  g.rect(x, ty + 20, w, 14, "#131722");
  ["#F87171", "#FBBF24", "#34D399"].forEach((color, i) => g.dot(x + 18 + i * 14, ty + 17, 4, color));
  g.text("auditoria.json", x + 68, ty + 11, { font: "mono", size: 10.5, weight: 500, color: C.soft });
  const last = demo.events[0];
  if (last) {
    const copied = demo.copiedAt !== null;
    const label = copied ? "Copiado ✓" : "Copiar JSON";
    const cw = g.measure(label, { font: "mono", size: 9.5, weight: 600 }) + 20;
    const ch = g.hit("copy", x + w - cw - 10, ty + 6, cw, 22, () => useDemo.getState().copyJson());
    g.rr(x + w - cw - 10, ty + 6, cw, 22, 6, copied ? C.em : ch ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)", copied ? C.em : C.darkLine);
    g.text(label, x + w - cw, ty + 12, { font: "mono", size: 9.5, weight: 600, color: copied ? "#04130D" : C.pale });
  }
  if (p !== null && p < 0.62) {
    const blink = Math.floor(g.now / 300) % 2 === 0;
    g.text("// aguardando retorno da impressora" + (blink ? " ▍" : ""), x + 18, ty + 50, { font: "mono", size: 10.5, weight: 500, color: C.dim });
  } else if (p !== null) {
    g.text("// gravando auditoria…", x + 18, ty + 50, { font: "mono", size: 10.5, weight: 500, color: C.em });
  } else if (last) {
    jsonBlock(g, last.json, x + 18, ty + 48);
  } else {
    g.text("// o pacote de telemetria aparece aqui\n// depois da primeira impressão de teste", x + 18, ty + 50, { font: "mono", size: 10.5, weight: 500, color: C.dim, lineHeight: 17 });
  }

  // Histórico.
  kicker(g, "Últimos eventos", x, 656, C.mute);
  g.text(`${demo.printCount} nesta sessão`, x + w, 656, { font: "mono", size: 9.5, weight: 500, color: C.soft, align: "right" });
  if (demo.events.length === 0) {
    g.text("Nenhuma impressão ainda.", x, 680, { size: 12, weight: 500, color: C.soft });
  }
  demo.events.slice(0, 3).forEach((event, i) => {
    const ey = 676 + i * 26;
    g.dot(x + 5, ey + 9, 3.5, C.em);
    g.text(event.time, x + 18, ey + 3, { font: "mono", size: 10.5, weight: 500, color: C.mute });
    g.text(event.lab, x + 96, ey + 2, { size: 12, weight: 700, color: C.ink });
    g.text(event.operator, x + 176, ey + 2, { size: 12, weight: 500, color: C.mute });
    g.text(event.id, x + w, ey + 3, { font: "mono", size: 10, weight: 500, color: C.soft, align: "right" });
  });

  folio(g, "right", "DP Printer — Simulador", "05", false);
}
