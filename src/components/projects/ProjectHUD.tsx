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
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-5 text-[15px] font-semibold transition-colors";
const PRIMARY = `${BUTTON} bg-white text-ink hover:bg-brass`;
const SECONDARY = `${BUTTON} border border-white/20 hover:border-white/50`;
const TITLE = "editorial mt-2 text-[clamp(1.5rem,3.4vh,2.05rem)] leading-[1.12]";
const BODY = "mt-3 text-[clamp(0.93rem,1.9vh,1rem)] leading-[1.6] text-[#D1D5DB]";

function Badge({ dot, text, children }: { dot: string; text: string; children: React.ReactNode }) {
  return (
    <p className={`flex items-center gap-2 text-sm font-semibold ${text}`}>
      <span className={`size-2 rounded-full ${dot}`} />
      {children}
    </p>
  );
}

/** Painel em HTML que acompanha a página aberta: é aqui que ficam o texto e os botões. */
export function ProjectHUD({ page, onDemo }: { page: number; onDemo: () => void }) {
  const product = products.find((p) => p.page === page);

  return (
    <div
      key={page}
      className="hud-in rounded-3xl border border-white/12 bg-[rgba(19,23,29,0.9)] p-5 text-white shadow-2xl shadow-black/40 backdrop-blur-[18px] sm:p-6 short:p-4"
      aria-live="polite"
    >
      {product ? (
        <>
          <Badge dot={ACCENT[product.id].dot} text={ACCENT[product.id].text}>
            {product.badge}
          </Badge>
          <h2 className="mt-3 text-[13px] font-bold uppercase tracking-[0.1em] text-fog">{product.name}</h2>
          <p className={TITLE}>{product.title}</p>
          <p className={BODY}>{product.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5 short:hidden" aria-label="Tecnologia e integrações">
            {product.tags.map((tag) => (
              <li key={tag} className={`rounded-full border ${ACCENT[product.id].ring} px-2.5 py-1 font-mono text-[12px] text-[#DDE3EA]`}>
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2 short:mt-4">
            <button type="button" onClick={onDemo} className={PRIMARY}>
              {product.demoLabel}
            </button>
            {product.url ? (
              <a href={product.url} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
                {product.urlLabel}
                <span aria-hidden>↗</span>
              </a>
            ) : (
              <Link href={`/contato?assunto=${product.subject}`} className={SECONDARY}>
                {product.demoFooter.action}
              </Link>
            )}
          </div>
        </>
      ) : page === 0 ? (
        <>
          <Badge dot="bg-brass" text="text-brass">
            {cover.badge}
          </Badge>
          <p className={TITLE}>{cover.title}</p>
          <p className={BODY}>{cover.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => useMagazine.getState().setPage(1)} className={PRIMARY}>
              {cover.action}
            </button>
          </div>
        </>
      ) : (
        <>
          <Badge dot="bg-brass" text="text-brass">
            {backCover.badge}
          </Badge>
          <p className={TITLE}>{backCover.title}</p>
          <p className={BODY}>{backCover.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/contato" className={`${BUTTON} bg-dp text-ink hover:bg-emerald-400`}>
              Falar com a engenharia
            </Link>
            <button type="button" onClick={() => useMagazine.getState().setPage(0)} className={SECONDARY}>
              Voltar para a capa
            </button>
          </div>
        </>
      )}
    </div>
  );
}
