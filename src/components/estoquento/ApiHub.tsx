"use client";

import { estoquentoHub } from "@/content/site";
import { useNow } from "@/lib/useNow";
import { useDemo } from "@/store/useDemo";

function latencyTone(ms: number) {
  return ms < 500 ? "text-emerald-300" : ms < 1000 ? "text-orange-300" : "text-fog";
}

export function ApiHub() {
  const pings = useDemo((s) => s.pings);
  const selected = useDemo((s) => s.selected);
  const running = Object.values(pings).some((p) => !p.done);
  const now = useNow(running);
  const item = estoquentoHub.integrations[selected];

  return (
    <div className="flex min-h-0 flex-col rounded-3xl border border-white/12 bg-graphite p-4 text-white sm:p-5 lg:h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">{estoquentoHub.title}</h3>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-fog">
            <span className="size-2 rounded-full bg-dp" />
            {estoquentoHub.status}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-fog">Tempo médio (demonstração)</div>
          <div className="tabular font-mono text-xl font-semibold">{estoquentoHub.average} ms</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => useDemo.getState().pingAll()}
        disabled={running}
        className="mt-[clamp(0.6rem,1.6vh,1rem)] w-full rounded-2xl bg-white px-5 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-brass disabled:bg-white/40"
      >
        {running ? "Testando as integrações..." : "Testar todas as integrações"}
      </button>

      <ul className="mt-2 divide-y divide-white/10 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {estoquentoHub.integrations.map((integration, i) => {
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
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-lg px-2 py-[clamp(0.3rem,0.95vh,0.6rem)] text-left transition-colors hover:bg-white/5 ${
                  selected === i ? "bg-white/8" : ""
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
                  <span className="block truncate text-[13px] text-fog short:hidden">{integration.text}</span>
                </span>
                <span className={`tabular shrink-0 font-mono text-[13px] font-semibold ${active ? "text-orange-300" : latencyTone(integration.ms)}`}>
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

      <div className="mt-2 rounded-xl bg-black/40 px-3.5 py-2.5 text-white">
        <div className="text-[13px] text-fog">Chamada simulada: {item.name}</div>
        <div className="mt-0.5 break-all font-mono text-[13px] text-orange-300">{item.endpoint}</div>
      </div>
    </div>
  );
}
