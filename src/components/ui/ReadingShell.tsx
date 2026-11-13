"use client";

import { useBook } from "@/store/useBook";

/**
 * Envolve a versão em texto. Com a revista 3D ativa ela fica fora da tela,
 * mas continua no HTML para leitores de tela e buscadores.
 */
export function ReadingShell({ children }: { children: React.ReactNode }) {
  const reading = useBook((s) => s.reading);
  const webgl = useBook((s) => s.webgl);

  return (
    <div className={reading ? "min-h-dvh bg-[#090A0F]" : "sr-only"}>
      {reading && (
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#090A0F]/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-white">
              <span className="grid size-7 place-items-center rounded-full bg-emerald-500 text-[11px] font-extrabold text-[#04130D]">DP</span>
              DP Systems
            </span>
            {webgl ? (
              <button
                type="button"
                onClick={() => useBook.getState().setReading(false)}
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-[#04130D] transition hover:bg-emerald-400"
              >
                Abrir a revista 3D
              </button>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                3D indisponível neste navegador
              </span>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
