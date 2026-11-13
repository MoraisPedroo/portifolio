"use client";

import { useNow } from "@/lib/useNow";
import { PRINT_MS, useDemo } from "@/store/useDemo";

const NODES = [
  { title: "Seu sistema web", sub: "envia o comando", from: 0, to: 0.3 },
  { title: "DP Printer", sub: "porta local no PC", from: 0.15, to: 1 },
  { title: "Impressora", sub: "USB ou rede", from: 0.4, to: 0.85 },
];

/** Caminho do comando de impressão, aceso conforme a simulação avança. */
export function ArchitectureFlow() {
  const start = useDemo((s) => s.printStart);
  const busy = start !== null;
  const now = useNow(busy);
  const p = busy ? Math.min(1, (now - start) / PRINT_MS) : null;
  const on = (from: number, to: number) => p !== null && p > from && p < to;

  return (
    <figure className="rounded-3xl border border-rule-dark p-5 sm:p-7">
      <figcaption className="text-[15px] font-medium text-fog">Como a etiqueta chega à impressora</figcaption>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {NODES.map((node, i) => (
          <div key={node.title} className="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:items-center">
            <div
              className={`flex-1 rounded-2xl border px-4 py-3.5 transition-colors duration-300 ${
                on(node.from, node.to) ? "border-dp bg-dp/10" : "border-rule-dark bg-graphite"
              }`}
            >
              <div className="font-semibold text-white">{node.title}</div>
              <div className="text-sm text-fog">{node.sub}</div>
            </div>
            {i < NODES.length - 1 && (
              <div className="relative mx-auto h-6 w-px bg-rule-dark sm:h-px sm:w-8" aria-hidden>
                {on(i === 0 ? 0 : 0.25, i === 0 ? 0.3 : 0.6) && (
                  <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-dp shadow-[0_0_12px_#10b981]" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex sm:justify-center">
        <div
          className={`w-full rounded-2xl border border-dashed px-4 py-3 text-sm transition-colors duration-300 sm:w-auto ${
            on(0.6, 1) ? "border-dp text-white" : "border-rule-dark text-fog"
          }`}
        >
          Firebase guarda a auditoria: quem imprimiu, em qual estação e quando
        </div>
      </div>
    </figure>
  );
}
