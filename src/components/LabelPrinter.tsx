"use client";

import { useEffect, useState } from "react";
import { Barcode } from "./Barcode";

const LABELS = [
  {
    id: "dpprinter",
    product: "DP Printer",
    line: "Etiqueta impressa direto do navegador, sem driver.",
    code: "LC 0101",
    meta: "USB nativa",
    accent: "bg-dp",
  },
  {
    id: "estoquento",
    product: "EstoqueNTO",
    line: "Estoque, postagem e rastreio em um só painel.",
    code: "NTO 0042",
    meta: "9 integrações",
    accent: "bg-nto",
  },
  {
    id: "credencial",
    product: "Credencial Studio",
    line: "Crachás corporativos prontos para o cartão PVC.",
    code: "CR80",
    meta: "Holográfico",
    accent: "bg-cred",
  },
];

const CYCLE_MS = 5200;

/**
 * Abertura do site: uma impressora térmica que imprime, em sequência,
 * a etiqueta de cada produto. Clicar numa aba imprime aquela etiqueta.
 */
export function LabelPrinter() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const label = LABELS[index];

  useEffect(() => {
    // Com movimento reduzido, a etiqueta só muda quando a pessoa escolhe.
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % LABELS.length), CYCLE_MS);
    return () => clearTimeout(timer);
  }, [index, paused]);

  return (
    <div className="relative mx-auto w-full max-w-[460px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Corpo da impressora */}
      <div className="relative z-10 rounded-[28px] bg-ink px-6 pb-5 pt-6 shadow-[0_30px_60px_-30px_rgb(14_17_22/0.6)]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Impressora térmica</span>
          <span className="flex items-center gap-2 text-sm text-fog">
            <span className="size-2 rounded-full bg-dp" style={{ animation: "pulse-ring 1.6s ease-out infinite" }} />
            Imprimindo
          </span>
        </div>
        <div className="mt-6 h-3 rounded-full bg-black/70 shadow-[inset_0_2px_4px_rgb(0_0_0/0.8)]" />
      </div>

      {/* Etiqueta saindo da fenda */}
      <div className="relative -mt-4 overflow-hidden px-8 pt-4">
        <article
          key={label.id + index}
          className="label-feed relative rounded-b-xl bg-stock px-6 pb-6 pt-7 text-ink shadow-[0_18px_40px_-20px_rgb(14_17_22/0.45)]"
          aria-live="polite"
        >
          <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,transparent_0_6px,var(--color-rule)_6px_8px)]" />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className={`size-2.5 rounded-sm ${label.accent}`} />
              DP Systems
            </span>
            <span className="font-mono text-sm text-slate">{label.code}</span>
          </div>
          <p className="display-tight mt-5 text-[2rem] sm:text-[2.3rem]">{label.product}</p>
          <p className="mt-2 text-base text-slate">{label.line}</p>
          <Barcode className="mt-6 h-14 w-full text-ink" bars={44} />
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-xs text-slate">{label.meta}</span>
            <a href={`#${label.id}`} className="text-sm font-semibold underline decoration-rule underline-offset-4 hover:decoration-ink">
              Ver o produto
            </a>
          </div>
        </article>
      </div>

      <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Escolher a etiqueta">
        {LABELS.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
              i === index ? "border-ink bg-ink text-white" : "border-rule bg-stock text-slate hover:border-slate"
            }`}
          >
            <span className={`size-2 rounded-sm ${item.accent}`} />
            {item.product}
          </button>
        ))}
      </div>
    </div>
  );
}
