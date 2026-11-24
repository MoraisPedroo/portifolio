"use client";

import { View } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { magazineStates, products } from "@/content/site";
import { MAG_LAST, useMagazine } from "@/store/useMagazine";
import { MagazineScene } from "@/three/magazine/MagazineScene";
import { DemoDialog } from "./DemoDialog";
import { DynamicBackground } from "./DynamicBackground";
import { ProjectHUD } from "./ProjectHUD";

/** A revista abre 5 s depois de aparecer e vira uma página a cada 10 s. */
const OPEN_MS = 5000;
const TURN_MS = 10000;

const DOT: Record<string, string> = {
  dpprinter: "bg-prt",
  estoquento: "bg-nto",
  credencial: "bg-cred",
  institutional: "bg-brass",
};

type ProductId = (typeof products)[number]["id"];

/** Barra que enche até a próxima virada (Web Animations, para não depender do CSS). */
function TimerBar({ duration }: { duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const animation = ref.current?.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration,
      easing: "linear",
      fill: "both",
    });
    return () => animation?.cancel();
  }, [duration]);
  return <span ref={ref} aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-white/80" />;
}

function Arrow({ dir, onClick, label }: { dir: "prev" | "next"; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-ink/70 text-white backdrop-blur transition-colors hover:border-white/50"
    >
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={dir === "prev" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"} />
      </svg>
    </button>
  );
}

export function ProjectsStage() {
  const page = useMagazine((s) => s.page);
  const touchedAt = useMagazine((s) => s.touchedAt);
  const playing = useMagazine((s) => s.playing);
  const muted = useMagazine((s) => s.muted);
  const [demo, setDemo] = useState<ProductId | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const state = magazineStates[page];

  // ?p=2 abre direto numa página (links do índice da Apresentação).
  useEffect(() => {
    const p = Number(new URLSearchParams(window.location.search).get("p"));
    if (Number.isInteger(p) && p > 0 && p <= MAG_LAST) useMagazine.getState().setPage(p);
  }, []);

  // Mantém a página no endereço, para compartilhar o link.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (page === 0) url.searchParams.delete("p");
    else url.searchParams.set("p", String(page));
    window.history.replaceState(window.history.state, "", url);
  }, [page]);

  // Virada automática: abre em 5 s e vira a cada 10 s até a pessoa assumir o controle
  // (clique, seta, deslizar) ou apertar pausa. Para também com a demonstração aberta.
  const wait = page === 0 ? OPEN_MS : TURN_MS;
  const running = playing && !demo;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => useMagazine.getState().autoNext(), wait);
    return () => clearTimeout(timer);
  }, [page, touchedAt, running, wait]);

  // Teclado: setas, Home, 0–4 e M para o som.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (demo || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const store = useMagazine.getState();
      if (e.key === "ArrowRight" || e.key === "PageDown") store.next();
      else if (e.key === "ArrowLeft" || e.key === "PageUp") store.prev();
      else if (e.key === "Home") store.setPage(0);
      else if (e.key === "End") store.setPage(MAG_LAST);
      else if (/^[0-4]$/.test(e.key)) store.setPage(Number(e.key));
      else if (e.key.toLowerCase() === "m") store.toggleMuted();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demo]);

  return (
    <main className="relative min-h-[100svh] text-white">
      <DynamicBackground active={state.background} />

      <section
        aria-label="Revista de projetos"
        className="relative mx-auto grid max-w-[1400px] gap-5 px-4 pb-8 pt-20 sm:px-6 md:px-8 lg:h-[100svh] lg:min-h-[600px] lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)] lg:items-center lg:gap-8 lg:pb-5 [&>*]:min-w-0"
      >
        <div className="flex min-h-0 flex-col lg:h-full">
          <div
            className="min-h-0 lg:flex-1"
            onTouchStart={(e) => {
              touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              const start = touch.current;
              touch.current = null;
              if (!start) return;
              const dx = e.changedTouches[0].clientX - start.x;
              const dy = e.changedTouches[0].clientY - start.y;
              if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
              if (dx < 0) useMagazine.getState().next();
              else useMagazine.getState().prev();
            }}
          >
            <View className="h-[min(46svh,400px)] min-h-[300px] w-full touch-pan-y sm:h-[min(56svh,520px)] lg:h-full lg:min-h-0">
              <MagazineScene />
            </View>
          </div>

          {/* Paginação */}
          <nav aria-label="Páginas da revista" className="relative z-30 mt-3 flex items-center justify-center gap-2">
            <Arrow dir="prev" label="Página anterior" onClick={() => useMagazine.getState().prev()} />
            <ol className="flex min-w-0 gap-1 overflow-x-auto rounded-full border border-white/12 bg-ink/70 p-1 backdrop-blur [scrollbar-width:none]">
              {magazineStates.map((item) => {
                const active = item.page === page;
                return (
                  <li key={item.page} className="shrink-0">
                    <button
                      type="button"
                      aria-current={active ? "page" : undefined}
                      onClick={() => useMagazine.getState().setPage(item.page)}
                      className={`relative flex min-h-9 items-center gap-2 overflow-hidden rounded-full px-3 text-sm font-medium transition-colors ${
                        active ? "bg-white/12 text-white" : "text-fog hover:text-white"
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${DOT[item.background]}`} aria-hidden />
                      <span className={active ? "" : "max-md:sr-only"}>{item.label}</span>
                      {active && running && <TimerBar key={`${page}-${touchedAt}`} duration={wait} />}
                    </button>
                  </li>
                );
              })}
            </ol>
            <Arrow dir="next" label="Próxima página" onClick={() => useMagazine.getState().next()} />
          </nav>
          <div className="relative z-30 mt-2 flex flex-wrap items-center justify-center gap-2 text-[13px]">
            <button
              type="button"
              onClick={() => useMagazine.getState().togglePlaying()}
              aria-pressed={playing}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/20 bg-ink/70 px-3 font-medium text-white backdrop-blur transition-colors hover:border-white/50"
            >
              <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
                {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M4 2.5v11l9-5.5z" />}
              </svg>
              {playing ? "Pausar virada automática" : "Virar sozinha"}
            </button>
            <button
              type="button"
              onClick={() => useMagazine.getState().toggleMuted()}
              aria-pressed={!muted}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/20 bg-ink/70 px-3 font-medium text-white backdrop-blur transition-colors hover:border-white/50"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                {muted ? <path d="m22 9-6 6m0-6 6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />}
              </svg>
              Som: {muted ? "mudo" : "ligado"} <kbd className="font-mono text-fog">(M)</kbd>
            </button>
            <span className="hidden text-fog/80 xl:inline short:hidden">Clique na folha ou use ← →</span>
          </div>
        </div>

        <aside className="relative z-30 lg:max-h-full lg:overflow-y-auto">
          <ProjectHUD page={page} onDemo={() => setDemo(products.find((p) => p.page === page)?.id ?? null)} />
        </aside>
      </section>

      <DemoDialog id={demo} onClose={() => setDemo(null)} />
    </main>
  );
}
