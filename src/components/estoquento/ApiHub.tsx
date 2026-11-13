"use client";

import { estoquento } from "@/content/site";
import { useNow } from "@/lib/useNow";
import { useDemo } from "@/store/useDemo";

function latencyTone(ms: number) {
  return ms < 500 ? "text-dp-deep" : ms < 1000 ? "text-nto-deep" : "text-slate";
}

export function ApiHub() {
  const pings = useDemo((s) => s.pings);
  const selected = useDemo((s) => s.selected);
  const running = Object.values(pings).some((p) => !p.done);
  const now = useNow(running);
  const item = estoquento.integrations[selected];

  return (
    <div className="rounded-3xl border border-rule bg-stock p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">{estoquento.hubTitle}</h3>
          <p className="mt-1 flex items-center gap-2 text-[15px] text-slate">
            <span className="size-2 rounded-full bg-dp" />
            {estoquento.hubStatus}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate">Tempo médio</div>
          <div className="tabular font-mono text-2xl font-semibold">{estoquento.hubAverage} ms</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => useDemo.getState().pingAll()}
        disabled={running}
        className="mt-5 w-full rounded-2xl bg-ink px-5 py-3.5 text-base font-semibold text-white transition-colors hover:bg-graphite-2 disabled:bg-slate"
      >
        {running ? "Testando as integrações..." : "Testar todas as integrações"}
      </button>

      <ul className="mt-5 divide-y divide-rule">
        {estoquento.integrations.map((integration, i) => {
          const ping = pings[i];
          const active = ping !== undefined && !ping.done;
          const elapsed = active ? Math.min(integration.ms, Math.max(0, now - ping.start)) : 0;
          return (
            <li key={integration.name}>
              <button
                type="button"
                onClick={() => useDemo.getState().ping(i)}
                aria-pressed={selected === i}
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-2 py-3 text-left transition-colors hover:bg-paper ${
                  selected === i ? "bg-paper" : ""
                }`}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-[13px] font-extrabold"
                  style={{ background: integration.color + "1f", color: integration.color }}
                  aria-hidden
                >
                  {integration.glyph}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{integration.name}</span>
                  <span className="block truncate text-sm text-slate">{integration.text}</span>
                </span>
                <span className={`tabular shrink-0 font-mono text-sm font-semibold ${active ? "text-nto-deep" : latencyTone(integration.ms)}`}>
                  {ping?.done ? "✓ " : ""}
                  {active ? Math.round(elapsed) : integration.ms} ms
                </span>
                {active && (
                  <span
                    className="absolute bottom-0 left-0 h-0.5 bg-nto"
                    style={{ width: `${(elapsed / integration.ms) * 100}%` }}
                    aria-hidden
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-2xl bg-ink px-4 py-3.5 text-white">
        <div className="text-sm text-fog">Chamada simulada: {item.name}</div>
        <div className="mt-1 break-all font-mono text-[13px] text-orange-300">{item.endpoint}</div>
        <div className="mt-1.5 text-sm text-fog">Clique numa integração para testar. O corredor ligado a ela acende no armazém.</div>
      </div>
    </div>
  );
}
