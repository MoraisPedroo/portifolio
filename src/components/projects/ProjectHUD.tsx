"use client";

import Link from "next/link";
import { backCover, cover, products } from "@/content/site";
import { useMagazine } from "@/store/useMagazine";

const ACCENT: Record<string, { dot: string; text: string; ring: string }> = {
  dpprinter: { dot: "bg-prt", text: "text-prt", ring: "border-prt/40" },
  estoquento: { dot: "bg-nto", text: "text-nto", ring: "border-nto/40" },
  credencial: { dot: "bg-cred", text: "text-[#7FA8FF]", ring: "border-cred/50" },
};

const BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[15px] font-semibold transition-colors";

/** Painel legível e clicável que acompanha a página aberta da revista. */
export function ProjectHUD({ page, onDemo }: { page: number; onDemo: () => void }) {
  const product = products.find((p) => p.page === page);

  return (
    <div
      key={page}
      className="hud-in rounded-3xl border border-white/12 bg-[rgba(11,13,16,0.84)] p-5 text-white shadow-2xl short:p-4 shadow-black/40 backdrop-blur-[18px] sm:p-6"
      aria-live="polite"
    >
      {product ? (
        <>
          <p className={`flex items-center gap-2 text-sm font-semibold ${ACCENT[product.id].text}`}>
            <span className={`size-2 rounded-full ${ACCENT[product.id].dot}`} />
            {product.badge}
          </p>
          <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.08em] text-fog">{product.name}</h2>
          <p className="editorial mt-1 text-[clamp(1.5rem,3.4vh,2rem)]">{product.title}</p>
          <p className="mt-3 text-[clamp(0.92rem,1.9vh,1rem)] leading-relaxed text-[#C9D0DA]">{product.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5 short:hidden" aria-label="Integrações e tecnologia">
            {product.tags.map((tag) => (
              <li key={tag} className={`rounded-full border ${ACCENT[product.id].ring} px-2.5 py-1 font-mono text-[12px] text-[#DDE3EA]`}>
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2 short:mt-4">
            <button type="button" onClick={onDemo} className={`${BUTTON} bg-white text-ink hover:bg-brass`}>
              Ver demonstração
            </button>
            {product.url ? (
              <a href={product.url} target="_blank" rel="noopener noreferrer" className={`${BUTTON} border border-white/20 hover:border-white/50`}>
                Acessar {product.urlLabel}
              </a>
            ) : (
              <Link href={`/contato?assunto=${product.subject}`} className={`${BUTTON} border border-white/20 hover:border-white/50`}>
                Pedir demonstração
              </Link>
            )}
          </div>
        </>
      ) : page === 0 ? (
        <>
          <p className="flex items-center gap-2 text-sm font-semibold text-brass">
            <span className="size-2 rounded-full bg-brass" />
            {cover.badge}
          </p>
          <p className="editorial mt-3 text-[clamp(1.6rem,3.6vh,2.2rem)]">{cover.title}</p>
          <p className="mt-3 text-[clamp(0.92rem,1.9vh,1rem)] leading-relaxed text-[#C9D0DA]">{cover.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2 short:mt-4">
            <button type="button" onClick={() => useMagazine.getState().setPage(1)} className={`${BUTTON} bg-white text-ink hover:bg-brass`}>
              Abrir no DP Printer
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm font-semibold text-brass">
            <span className="size-2 rounded-full bg-brass" />
            {backCover.badge}
          </p>
          <p className="editorial mt-3 text-[clamp(1.6rem,3.6vh,2.2rem)]">{backCover.title}</p>
          <p className="mt-3 text-[clamp(0.92rem,1.9vh,1rem)] leading-relaxed text-[#C9D0DA]">{backCover.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2 short:mt-4">
            <Link href="/contato" className={`${BUTTON} bg-dp text-ink hover:bg-emerald-400`}>
              Falar com a engenharia
            </Link>
            <button type="button" onClick={() => useMagazine.getState().setPage(0)} className={`${BUTTON} border border-white/20 hover:border-white/50`}>
              Voltar para a capa
            </button>
          </div>
        </>
      )}
    </div>
  );
}
