"use client";

import { dpprinter } from "@/content/site";
import { useNow } from "@/lib/useNow";
import { PRINT_MS, useDemo } from "@/store/useDemo";
import { Barcode } from "../Barcode";

const ROWS = [
  { key: "lab", label: "Unidade", options: dpprinter.sim.labs },
  { key: "operator", label: "Operador", options: dpprinter.sim.operators },
  { key: "station", label: "Estação", options: dpprinter.sim.stations },
] as const;

const STEPS = [
  { text: "Comando recebido", at: 0.2 },
  { text: "Enviado pela USB", at: 0.6 },
  { text: "Auditoria gravada", at: 0.95 },
];

const ease = (v: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, v)), 3);

/** Colore chaves, textos e números do JSON de auditoria. */
function JsonView({ json }: { json: string }) {
  return (
    <>
      {json.split("\n").map((line, i) => {
        const m = line.match(/^(\s*)("[^"]*")(:\s*)(.*)$/);
        if (!m) return <div key={i} className="text-fog/60">{line}</div>;
        const isString = m[4].startsWith('"');
        return (
          <div key={i}>
            {m[1]}
            <span className="text-fog">{m[2]}</span>
            <span className="text-fog/60">{m[3]}</span>
            <span className={isString ? "text-emerald-300" : "text-amber-300"}>{m[4]}</span>
          </div>
        );
      })}
    </>
  );
}

export function PrintSimulator() {
  const demo = useDemo();
  const busy = demo.printStart !== null;
  const now = useNow(busy);
  const p = busy ? Math.min(1, (now - demo.printStart!) / PRINT_MS) : null;
  const last = demo.events[0];
  const emerge = p !== null ? ease((p - 0.2) / 0.45) : demo.printCount > 0 ? 1 : 0;

  return (
    <div className="rounded-3xl border border-rule-dark bg-graphite p-5 sm:p-6 lg:p-[clamp(1rem,2.6vh,1.5rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-white">Teste uma impressão</h3>
        <span className="flex items-center gap-2 text-sm text-fog">
          <span className="size-2 rounded-full bg-dp" />
          Simulação, nada sai do navegador
        </span>
      </div>

      <div className="mt-[clamp(0.75rem,2vh,1.25rem)] space-y-[clamp(0.4rem,1.2vh,0.75rem)]">
        {ROWS.map((row) => (
          <fieldset key={row.key} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <legend className="sr-only">{row.label}</legend>
            <span aria-hidden className="w-20 shrink-0 text-sm font-medium text-fog">
              {row.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {row.options.map((option, i) => {
                const active = demo[row.key] === i;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => demo.pick(row.key, i)}
                    className={`min-h-9 rounded-full border px-3 font-mono text-[13px] transition-colors ${
                      active ? "border-dp bg-dp text-ink" : "border-rule-dark text-white hover:border-fog"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-[clamp(0.75rem,2vh,1.25rem)] grid gap-4 sm:grid-cols-[1fr_170px] sm:items-start [&>*]:min-w-0">
        <div>
          <button
            type="button"
            onClick={demo.print}
            disabled={busy}
            className="w-full rounded-2xl bg-dp px-5 py-3.5 text-base font-bold text-ink transition-colors hover:bg-emerald-400 disabled:bg-dp/40"
          >
            {busy ? "Imprimindo..." : "Imprimir etiqueta de teste"}
          </button>
          <ol className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
            {STEPS.map((step, i) => {
              const done = p !== null ? p > step.at : demo.printCount > 0;
              const doing = p !== null && !done && p > (i === 0 ? 0 : STEPS[i - 1].at);
              return (
                <li key={step.text} className={`flex items-center gap-1.5 text-[13px] ${done || doing ? "text-white" : "text-fog/70"}`}>
                  <span className={`size-2 rounded-full ${done ? "bg-dp" : doing ? "bg-signal" : "bg-rule-dark"}`} />
                  {step.text}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Impressora e etiqueta */}
        <div aria-hidden className="hidden sm:block">
          <div className="relative z-10 rounded-xl bg-black px-3 pb-2 pt-2.5">
            <div className="flex items-center gap-2 text-xs text-fog">
              <span className={`size-1.5 rounded-full ${busy ? "bg-dp" : "bg-rule-dark"}`} />
              Térmica USB
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-graphite-2" />
          </div>
          <div className="-mt-1 h-[84px] overflow-hidden px-2.5">
            <div
              className="rounded-b-md bg-stock px-3 pb-2.5 pt-2 text-ink"
              style={{ transform: `translateY(${(emerge - 1) * 100}%)` }}
            >
              <div className="font-mono text-[11px] font-bold">{dpprinter.sim.labs[demo.lab]}</div>
              <Barcode className="mt-1 h-7 w-full text-ink" bars={26} />
              <div className="mt-1 truncate font-mono text-[10px] text-slate">{dpprinter.sim.operators[demo.operator]}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[clamp(0.75rem,2vh,1.25rem)] overflow-hidden rounded-2xl bg-ink">
        <div className="flex items-center justify-between gap-3 border-b border-rule-dark px-4 py-2">
          <span className="font-mono text-[13px] text-fog">auditoria.json</span>
          {last && (
            <button
              type="button"
              onClick={demo.copyJson}
              className="rounded-md border border-rule-dark px-2.5 py-1 text-[13px] text-white hover:border-fog"
            >
              {demo.copiedAt !== null ? "Copiado" : "Copiar JSON"}
            </button>
          )}
        </div>
        <pre className="h-[clamp(6rem,21vh,13rem)] overflow-auto px-4 py-2.5 font-mono text-[13px] leading-[1.45rem] text-fog">
          {busy ? (
            <span className="text-fog/70">aguardando retorno da impressora...</span>
          ) : last ? (
            <JsonView json={last.json} />
          ) : (
            <span className="whitespace-pre-wrap text-fog/70">
              O registro de auditoria aparece aqui depois da primeira impressão.
            </span>
          )}
        </pre>
      </div>
    </div>
  );
}
