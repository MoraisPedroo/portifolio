import type { Metadata } from "next";
import Link from "next/link";
import { HomeCover } from "@/components/home/HomeCover";
import { H2, INNER, LEAD, PAGE } from "@/components/Section";
import { SiteFooter } from "@/components/SiteFooter";
import { company, practices, products, steps } from "@/content/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const ACCENT: Record<string, string> = { dpprinter: "bg-prt", estoquento: "bg-nto", credencial: "bg-cred" };

export default function Home() {
  return (
    <main>
      {/* Primeira tela: o que fazemos e a prova logo abaixo dos botões */}
      <section className={`${PAGE} bg-paper pt-16 lg:h-[100svh] lg:min-h-[600px]`}>
        <div className={`${INNER} grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] [&>*]:min-w-0`}>
          <div>
            <p className="text-[15px] font-medium text-slate">{company.kicker}</p>
            <h1 className="editorial mt-[clamp(0.75rem,2.4vh,1.5rem)] max-w-[14ch] text-[clamp(2.5rem,min(4.2vw,7.6vh),3.9rem)] leading-[1.06] text-ink">
              {company.manifesto}
            </h1>
            <p className={`${LEAD} mt-[clamp(0.9rem,2.6vh,1.5rem)] max-w-[34rem] text-slate`}>{company.lead}</p>
            <div className="mt-[clamp(1.25rem,3.5vh,2.25rem)] flex flex-wrap gap-3">
              <Link href="/projetos" className="rounded-full bg-ink px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-graphite-2">
                Abrir projetos em produção
              </Link>
              <Link
                href="/contato"
                className="rounded-full border border-rule bg-stock px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink"
              >
                Falar com a engenharia
              </Link>
            </div>
            <ul className="mt-[clamp(1.25rem,3.5vh,2.25rem)] flex flex-wrap gap-x-5 gap-y-2 border-t border-rule pt-[clamp(0.9rem,2.4vh,1.25rem)]" aria-label="Em números">
              {company.proof.map((item, i) => (
                <li key={item} className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <span className={`size-1.5 rounded-full ${i === 0 ? "bg-prt" : "bg-dp"}`} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="h-full min-h-0 lg:py-4">
            <HomeCover />
          </div>
        </div>
      </section>

      {/* O que já está em produção */}
      <section aria-labelledby="como-title" className={`${PAGE} bg-ink text-white`}>
        <div className={`${INNER} flex flex-col justify-center`}>
          <h2 id="como-title" className={`${H2} max-w-3xl`}>
            Da arquitetura ao deploy, ao lado de quem opera.
          </h2>
          <p className={`${LEAD} mt-[clamp(0.75rem,2vh,1.25rem)] max-w-2xl text-[#D1D5DB]`}>
            Começamos pelo gargalo real da sua equipe, não por uma lista de frameworks. Quatro frentes que já mantemos rodando em produção:
          </p>
          <ul className="mt-[clamp(1.25rem,4vh,2.75rem)] grid gap-px overflow-hidden rounded-3xl border border-[#272E38] bg-[#272E38] sm:grid-cols-2">
            {practices.map((practice) => (
              <li key={practice.title} className="group bg-ink p-[clamp(1.1rem,3vh,1.9rem)] transition-colors hover:bg-[#13171D]">
                <h3 className="editorial text-[clamp(1.3rem,2.5vh,1.7rem)]">{practice.title}</h3>
                <p className="mt-2 text-[clamp(0.95rem,1.95vh,1.05rem)] leading-relaxed text-[#D1D5DB]">{practice.text}</p>
                <p className="mt-3 font-mono text-[13px] text-brass/90 short:hidden">{practice.shift}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Índice da revista e como trabalhamos */}
      <section aria-labelledby="indice-title" className={`${PAGE} bg-paper`}>
        <div className={`${INNER} grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center`}>
          <div>
            <h2 id="indice-title" className={H2}>
              Nesta edição
            </h2>
            <ul className="mt-[clamp(1rem,3vh,2rem)] divide-y divide-rule border-y border-rule">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/projetos?p=${product.page}`}
                    className="group grid gap-x-6 gap-y-1 py-[clamp(0.9rem,2.4vh,1.5rem)] sm:grid-cols-[12rem_1fr_auto] sm:items-baseline"
                  >
                    <span className="flex items-center gap-2.5 text-lg font-bold">
                      <span className={`size-3 rounded-sm ${ACCENT[product.id]}`} />
                      {product.name}
                    </span>
                    <span className="editorial text-[clamp(1.1rem,2.3vh,1.4rem)] text-ink">{product.line}</span>
                    <span className="text-sm font-semibold text-slate transition-transform group-hover:translate-x-1 group-hover:text-ink">
                      Abrir caso →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside aria-labelledby="passos-title">
            <h3 id="passos-title" className="text-sm font-bold uppercase tracking-[0.08em] text-slate">
              Como trabalhamos
            </h3>
            <ol className="mt-4 space-y-[clamp(0.9rem,2.4vh,1.4rem)]">
              {steps.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2.25rem_1fr] gap-3">
                  <span className="grid size-9 place-items-center rounded-full border border-rule bg-stock font-mono text-sm font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{step.title}</p>
                    <p className="mt-0.5 text-[15px] leading-relaxed text-slate">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/contato"
              className="mt-[clamp(1.25rem,3.5vh,2rem)] inline-flex rounded-full bg-dp px-5 py-3 text-[15px] font-bold text-ink transition-colors hover:bg-emerald-400"
            >
              Começar pela conversa técnica
            </Link>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
