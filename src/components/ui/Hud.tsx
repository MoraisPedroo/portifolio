"use client";

import { LAST_PAGE, sections } from "@/content/site";
import { useBook } from "@/store/useBook";

const stop = (event: React.SyntheticEvent) => event.stopPropagation();

function Arrow({ direction, disabled, onClick }: { direction: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Página anterior" : "Próxima página"}
      className="grid size-9 shrink-0 place-items-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent"
    >
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={direction === "prev" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"} />
      </svg>
    </button>
  );
}

export function Hud() {
  const page = useBook((s) => s.page);
  const half = useBook((s) => s.half);
  const single = useBook((s) => s.single);
  const zoom = useBook((s) => s.zoom);
  const fps = useBook((s) => s.fps);
  const { next, prev, setPage, toggleZoom, setReading } = useBook.getState();

  const open = page > 0 && page < LAST_PAGE;
  const atStart = page === 0;
  const atEnd = page === LAST_PAGE && (!single || !open || half === "right");
  const progress = Math.round((page / LAST_PAGE) * 100);

  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5"
      onPointerDown={stop}
      onPointerUp={stop}
    >
      <header className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setPage(0)}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-white/10 bg-[#12131A]/80 py-1.5 pl-1.5 pr-4 backdrop-blur-md transition hover:border-white/25"
        >
          <span className="grid size-7 place-items-center rounded-full bg-emerald-500 text-[11px] font-extrabold tracking-tight text-[#04130D]">DP</span>
          <span className="text-sm font-semibold tracking-tight text-white">DP Systems</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 sm:inline">Edição 2026</span>
        </button>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleZoom}
            aria-pressed={zoom}
            title="Zoom (tecla Z)"
            className={`rounded-full border px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition ${
              zoom
                ? "border-emerald-400 bg-emerald-500 text-[#04130D]"
                : "border-white/10 bg-[#12131A]/80 text-slate-200 hover:border-white/25"
            }`}
          >
            {zoom ? "Sair do zoom" : "Zoom"}
          </button>
          <button
            type="button"
            onClick={() => setReading(true)}
            className="rounded-full border border-white/10 bg-[#12131A]/80 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:border-white/25"
          >
            Versão em texto
          </button>
        </div>
      </header>

      <footer className="flex flex-col items-center gap-2">
        {(zoom || (single && open)) && (
          <p className="rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-300 backdrop-blur">
            {!zoom
              ? "Toque em Zoom para ampliar a leitura"
              : single
                ? "Arraste para mover a vista"
                : "Mova o mouse para percorrer a página"}
          </p>
        )}
        <nav
          aria-label="Seções da revista"
          className="pointer-events-auto flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-[#12131A]/80 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-md"
        >
          <Arrow direction="prev" disabled={atStart} onClick={prev} />
          <ul className="hidden items-center gap-0.5 md:flex">
            {sections.map((section, index) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => setPage(index)}
                  aria-current={page === index ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                    page === index ? "bg-white text-slate-900" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
          <span className="px-3 text-xs font-semibold text-white md:hidden">{sections[page].label}</span>
          <Arrow direction="next" disabled={atEnd} onClick={next} />
          <span className="ml-1 hidden items-center gap-3 border-l border-white/10 pl-4 pr-3 font-mono text-[10px] tabular-nums text-slate-400 lg:flex">
            <span>
              <span className={`mr-1.5 inline-block size-1.5 rounded-full ${fps >= 50 ? "bg-emerald-500" : "bg-amber-500"}`} />
              {fps} FPS
            </span>
            <span>{String(progress).padStart(3, "0")}%</span>
          </span>
        </nav>
      </footer>
    </div>
  );
}
