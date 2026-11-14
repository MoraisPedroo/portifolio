"use client";

import { View } from "@react-three/drei";
import { useEffect, useState } from "react";
import { MAG_LAST, SPREADS, useMagazine } from "@/store/useMagazine";
import { MagazineScene } from "@/three/magazine/MagazineScene";

const AUTO_MS = 4500;

/** Revista 3D com os produtos: vira sozinha e responde a clique. */
export function HeroMagazine() {
  const page = useMagazine((s) => s.page);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (hover || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => useMagazine.getState().next(), page === 0 ? 2200 : AUTO_MS);
    return () => clearTimeout(timer);
  }, [page, hover]);

  const active = page === MAG_LAST ? 0 : page;

  return (
    <div className="flex h-full min-h-0 flex-col" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <View className="h-[380px] w-full touch-pan-y sm:h-[460px] lg:h-auto lg:min-h-0 lg:flex-1">
        <MagazineScene />
      </View>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => useMagazine.getState().prev()}
          aria-label="Página anterior da revista"
          className="grid size-10 place-items-center rounded-full border border-rule bg-stock text-ink transition-colors hover:border-ink"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
        {SPREADS.map((spread) => (
          <button
            key={spread.page}
            type="button"
            aria-pressed={active === spread.page}
            onClick={() => useMagazine.getState().setPage(spread.page)}
            className={`flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors ${
              active === spread.page ? "border-ink bg-ink text-white" : "border-rule bg-stock text-slate hover:border-slate"
            }`}
          >
            {spread.accent && <span className={`size-2 rounded-sm ${spread.accent}`} />}
            {spread.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => useMagazine.getState().next()}
          aria-label="Próxima página da revista"
          className="grid size-10 place-items-center rounded-full border border-rule bg-stock text-ink transition-colors hover:border-ink"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 3 5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
