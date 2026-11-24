import type { Metadata } from "next";
import Link from "next/link";
import { HomeCover } from "@/components/home/HomeCover";
import { INNER, LEAD } from "@/components/Section";
import { company, products } from "@/content/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const ACCENT: Record<string, string> = { dpprinter: "bg-prt", estoquento: "bg-nto", credencial: "bg-cred" };

export default function Home() {
  return (
    <main>
      {/* Uma tela só: o que fazemos, os botões, a prova e os três produtos. */}
      <section className="bg-paper pt-16 lg:h-[100svh] lg:min-h-[600px]">
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
            <nav aria-label="Produtos" className="mt-[clamp(0.75rem,2vh,1.1rem)] flex flex-wrap gap-2">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/projetos?p=${product.page}`}
                  className="group inline-flex min-h-9 items-center gap-2 rounded-full border border-rule bg-stock px-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
                >
                  <span className={`size-2 rounded-sm ${ACCENT[product.id]}`} aria-hidden />
                  {product.name}
                  <span className="text-slate transition-transform group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="h-full min-h-0 lg:py-4">
            <HomeCover />
          </div>
        </div>
      </section>

    </main>
  );
}
