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

  // Virada automática; reinicia a cada interação e pausa com a demonstração aberta.
  const wait = page === 0 ? OPEN_MS : TURN_MS;
  useEffect(() => {
    if (demo) return;
    const timer = setTimeout(() => useMagazine.getState().autoNext(), wait);
    return () => clearTimeout(timer);
  }, [page, touchedAt, demo, wait]);

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
                      {active && !demo && <TimerBar key={`${page}-${touchedAt}`} duration={wait} />}
                    </button>
                  </li>
                );
              })}
            </ol>
            <Arrow dir="next" label="Próxima página" onClick={() => useMagazine.getState().next()} />
          </nav>
          <p className="mt-2 hidden text-center text-[13px] text-fog/80 lg:block short:hidden">
            Clique na folha ou use ← → para virar. Tecla M liga e desliga o som.
          </p>
        </div>

        <aside className="relative z-30 lg:max-h-full lg:overflow-y-auto">
          <ProjectHUD page={page} onDemo={() => setDemo(products.find((p) => p.page === page)?.id ?? null)} />
        </aside>
      </section>

      <DemoDialog id={demo} onClose={() => setDemo(null)} />
    </main>
  );
}
