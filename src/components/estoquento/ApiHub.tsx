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
    <div className="flex min-h-0 flex-col rounded-3xl border border-rule bg-stock p-4 sm:p-5 lg:h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">{estoquento.hubTitle}</h3>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-slate">
            <span className="size-2 rounded-full bg-dp" />
            {estoquento.hubStatus}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate">Tempo médio</div>
          <div className="tabular font-mono text-xl font-semibold">{estoquento.hubAverage} ms</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => useDemo.getState().pingAll()}
        disabled={running}
        className="mt-[clamp(0.6rem,1.6vh,1rem)] w-full rounded-2xl bg-ink px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-graphite-2 disabled:bg-slate"
      >
        {running ? "Testando as integrações..." : "Testar todas as integrações"}
      </button>

      <ul className="mt-2 divide-y divide-rule lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
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
                title={integration.text}
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-lg px-2 py-[clamp(0.3rem,0.95vh,0.6rem)] text-left transition-colors hover:bg-paper ${
                  selected === i ? "bg-paper" : ""
                }`}
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold"
                  style={{ background: integration.color + "1f", color: integration.color }}
                  aria-hidden
                >
                  {integration.glyph}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-tight">{integration.name}</span>
                  <span className="block truncate text-[13px] text-slate short:hidden">{integration.text}</span>
                </span>
                <span className={`tabular shrink-0 font-mono text-[13px] font-semibold ${active ? "text-nto-deep" : latencyTone(integration.ms)}`}>
                  {ping?.done ? "✓ " : ""}
                  {active ? Math.round(elapsed) : integration.ms} ms
                </span>
                {active && (
                  <span className="absolute bottom-0 left-0 h-0.5 bg-nto" style={{ width: `${(elapsed / integration.ms) * 100}%` }} aria-hidden />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-2 rounded-xl bg-ink px-3.5 py-2.5 text-white">
        <div className="text-[13px] text-fog">Chamada simulada: {item.name}</div>
        <div className="mt-0.5 break-all font-mono text-[13px] text-orange-300">{item.endpoint}</div>
      </div>
    </div>
  );
}
