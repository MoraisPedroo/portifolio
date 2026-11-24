"use client";

import { useNow } from "@/lib/useNow";
import { PRINT_MS, useDemo } from "@/store/useDemo";

const NODES = [
  { title: "Sistema do laboratório", sub: "POST /write · 127.0.0.1:9100", from: 0, to: 0.3 },
  { title: "DP Printer", sub: "servidor local na bandeja", from: 0.15, to: 1 },
  { title: "Impressora", sub: "USB Raw, TCP/IP ou driver", from: 0.4, to: 0.85 },
];

/** Caminho do comando de impressão, aceso conforme a simulação avança. */
export function ArchitectureFlow() {
  const start = useDemo((s) => s.printStart);
  const busy = start !== null;
  const now = useNow(busy);
  const p = busy ? Math.min(1, (now - start) / PRINT_MS) : null;
  const on = (from: number, to: number) => p !== null && p > from && p < to;

  return (
    <figure>
      <figcaption className="text-sm font-medium text-fog">Como a etiqueta chega à impressora</figcaption>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        {NODES.map((node, i) => (
          <div key={node.title} className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center">
            <div
              className={`flex-1 rounded-xl border px-3 py-2.5 transition-colors duration-300 ${
                on(node.from, node.to) ? "border-prt bg-prt/10" : "border-rule-dark bg-graphite"
              }`}
            >
              <div className="text-[15px] font-semibold leading-tight text-white">{node.title}</div>
              <div className="text-[13px] text-fog">{node.sub}</div>
            </div>
            {i < NODES.length - 1 && (
              <div className="relative mx-auto h-4 w-px bg-rule-dark sm:h-px sm:w-4" aria-hidden>
                {on(i === 0 ? 0 : 0.25, i === 0 ? 0.3 : 0.6) && (
                  <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-prt shadow-[0_0_12px_#22d3ee]" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        className={`mt-2 rounded-xl border border-dashed px-3 py-2 text-[13px] short:hidden transition-colors duration-300 ${
          on(0.6, 1) ? "border-prt text-white" : "border-rule-dark text-fog"
        }`}
      >
        Firebase registra em {"inventario/{lc}/{serial}"}: laboratório, impressora, estação, usuário e contador
      </div>
    </figure>
  );
}
