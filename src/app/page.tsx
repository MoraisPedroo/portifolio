import Link from "next/link";
import { HomeCover } from "@/components/home/HomeCover";
import { Logo } from "@/components/Logo";
import { H2, INNER, LEAD, PAGE } from "@/components/Section";
import { company, practices, products } from "@/content/site";

const ACCENT: Record<string, string> = { dpprinter: "bg-prt", estoquento: "bg-nto", credencial: "bg-cred" };

export default function Home() {
  const fiscal = [
    { label: "Razão social", value: company.legalName },
    { label: "CNPJ", value: company.cnpj, mono: true },
    { label: "Sede", value: company.location },
    { label: "Sócios", value: company.partners.map((p) => p.fullName).join(" e ") },
  ];

  return (
    <main>
      {/* Manifesto */}
      <section className={`${PAGE} bg-paper pt-16 lg:h-[100svh] lg:min-h-[600px]`}>
        <div className={`${INNER} grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] [&>*]:min-w-0`}>
          <div>
            <p className="text-[15px] font-medium text-slate">Engenharia de software sob medida, em São Paulo</p>
            <h1 className="editorial mt-[clamp(0.75rem,2.4vh,1.5rem)] text-[clamp(2.6rem,min(5.4vw,9vh),5.2rem)] text-ink">
              {company.manifesto}
            </h1>
            <p className="editorial mt-[clamp(0.75rem,2vh,1.25rem)] text-[clamp(1.25rem,min(2.2vw,3.6vh),1.9rem)] italic text-dp-deep">
              {company.manifestoSub}
            </p>
            <p className={`${LEAD} mt-[clamp(1rem,3vh,1.75rem)] max-w-[36rem] text-slate`}>{company.lead}</p>
            <div className="mt-[clamp(1.25rem,3.5vh,2.25rem)] flex flex-wrap gap-3">
              <Link href="/projetos" className="rounded-full bg-ink px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-graphite-2">
                Abrir a revista de projetos
              </Link>
              <Link
                href="/contato"
                className="rounded-full border border-rule bg-stock px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink"
              >
                Falar com a engenharia
              </Link>
            </div>
          </div>
          <div className="h-full min-h-0 lg:py-4">
            <HomeCover />
          </div>
        </div>
      </section>

      {/* Engenharia on-demand */}
      <section aria-labelledby="como-title" className={`${PAGE} bg-ink text-white`}>
        <div className={`${INNER} flex flex-col justify-center`}>
          <h2 id="como-title" className={`${H2} max-w-3xl`}>
            Da arquitetura ao deploy, ao lado de quem opera.
          </h2>
          <p className={`${LEAD} mt-[clamp(0.75rem,2vh,1.25rem)] max-w-2xl text-fog`}>
            Cada projeto começa no problema da operação, não numa lista de tecnologias. Estes são os quatro tipos de trabalho que mais
            fazemos, cada um já rodando em produção.
          </p>
          <ul className="mt-[clamp(1.5rem,4.5vh,3rem)] grid gap-px overflow-hidden rounded-3xl border border-rule-dark bg-rule-dark sm:grid-cols-2">
            {practices.map((practice) => (
              <li key={practice.title} className="bg-ink p-[clamp(1.25rem,3.2vh,2rem)]">
                <h3 className="editorial text-[clamp(1.35rem,2.6vh,1.75rem)]">{practice.title}</h3>
                <p className="mt-2 text-[clamp(0.95rem,2vh,1.05rem)] leading-relaxed text-fog">{practice.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Índice dos projetos e dados da empresa */}
      <section aria-labelledby="indice-title" className={`${PAGE} bg-paper`}>
        <div className={`${INNER} grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center`}>
          <div>
            <h2 id="indice-title" className={H2}>
              Nesta edição
            </h2>
            <ul className="mt-[clamp(1rem,3vh,2rem)] divide-y divide-rule border-y border-rule">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/projetos?p=${product.page}`}
                    className="group grid gap-x-6 gap-y-1 py-[clamp(0.9rem,2.4vh,1.5rem)] sm:grid-cols-[13rem_1fr_auto] sm:items-baseline"
                  >
                    <span className="flex items-center gap-2.5 text-lg font-bold">
                      <span className={`size-3 rounded-sm ${ACCENT[product.id]}`} />
                      {product.name}
                    </span>
                    <span className="editorial text-[clamp(1.15rem,2.4vh,1.5rem)] text-ink">{product.title}</span>
                    <span className="text-sm font-semibold text-slate underline decoration-rule underline-offset-4 group-hover:decoration-ink">
                      Abrir na revista
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside aria-label="Dados da empresa" className="flex flex-col gap-6">
            <dl className="rounded-3xl border border-rule bg-stock">
              {fiscal.map((row, i) => (
                <div key={row.label} className={`px-6 py-[clamp(0.6rem,1.8vh,1rem)] ${i > 0 ? "border-t border-rule" : ""}`}>
                  <dt className="text-sm text-slate">{row.label}</dt>
                  <dd className={`mt-0.5 font-semibold ${row.mono ? "font-mono text-[15px]" : ""}`}>{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center justify-between gap-4">
              <Logo tone="dark" />
              <Link href="/contato" className="rounded-full bg-dp px-5 py-2.5 text-[15px] font-bold text-ink transition-colors hover:bg-emerald-400">
                Contato
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
