import { backCover, company, credencial, dpprinter, estoquento } from "@/content/site";

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">{children}</p>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="rounded-2xl border border-slate-800 bg-[#131722] p-5">
      <h3 className="text-[15px] font-bold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{children}</p>
    </li>
  );
}

const linkClass =
  "inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 font-mono text-xs text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300";

/** Mesmo conteúdo da revista, em HTML semântico. */
export function ReadingMode() {
  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-14 text-slate-300">
      <header>
        <Kicker>DP Systems · Engenharia on-demand · Edição 2026</Kicker>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          {company.name}
          <span className="mt-2 block text-2xl font-medium tracking-tight text-slate-300 sm:text-3xl">{company.tagline}</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">{company.positioning}</p>
      </header>

      <section className="mt-16 border-t border-slate-800 pt-12">
        <Kicker>Editorial</Kicker>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">{company.mission}</h2>
        <p className="mt-3 text-lg font-semibold text-emerald-400">{company.missionSub}</p>
        <p className="mt-5 leading-relaxed">{company.editorial}</p>
        <p className="mt-5 font-semibold text-white">{company.directors.join(" & ")}</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">Administração</p>
      </section>

      <section className="mt-16 border-t border-slate-800 pt-12">
        <Kicker>01 · {dpprinter.name} · {dpprinter.version}</Kicker>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">{dpprinter.title}</h2>
        <p className="mt-4 leading-relaxed">{dpprinter.copy}</p>
        <p className="mt-3 leading-relaxed">{dpprinter.copy2}</p>
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {dpprinter.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">{stat.label}</dt>
              <dd className="text-2xl font-bold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {dpprinter.features.map((feature) => (
            <Card key={feature.title} title={feature.title}>
              {feature.text}
            </Card>
          ))}
        </ul>
        <p className="mt-6">
          <a className={linkClass} href={dpprinter.url} target="_blank" rel="noopener noreferrer">
            {dpprinter.urlLabel} ↗
          </a>
        </p>
      </section>

      <section className="mt-16 border-t border-slate-800 pt-12">
        <Kicker>02 · {estoquento.name}</Kicker>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">{estoquento.title}</h2>
        <p className="mt-4 leading-relaxed">{estoquento.copy}</p>
        <h3 className="mt-8 text-lg font-bold text-white">{estoquento.hubTitle}</h3>
        <p className="mt-1 text-sm text-slate-400">
          <span className="mr-2 inline-block size-2 rounded-full bg-emerald-500" />
          {estoquento.hubStatus} · tempo médio de resposta de {estoquento.hubAverage} ms
        </p>
        <ul className="mt-5 divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-[#131722]">
          {estoquento.integrations.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span>
                <span className="block text-sm font-bold text-white">{item.name}</span>
                <span className="block text-sm text-slate-400">{item.text}</span>
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-emerald-400">{item.ms} ms</span>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <a className={linkClass} href={estoquento.url} target="_blank" rel="noopener noreferrer">
            {estoquento.urlLabel} ↗
          </a>
        </p>
      </section>

      <section className="mt-16 border-t border-slate-800 pt-12">
        <Kicker>03 · {credencial.name}</Kicker>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">{credencial.title}</h2>
        <p className="mt-4 leading-relaxed">{credencial.copy}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {credencial.features.map((feature) => (
            <Card key={feature.title} title={feature.title}>
              {feature.text}
            </Card>
          ))}
        </ul>
      </section>

      <section className="mt-16 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8">
        <Kicker>{backCover.kicker}</Kicker>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{backCover.title}</h2>
        <p className="mt-4 max-w-xl leading-relaxed">{backCover.copy}</p>
        <a
          href={company.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-[#04130D] transition hover:bg-emerald-400"
        >
          Falar com um consultor →
        </a>
      </section>

      <footer className="mt-14 border-t border-slate-800 pt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-slate-500">
        <p>© {company.founded} {company.legalName}</p>
        <p>CNPJ {company.cnpj} · {company.location}</p>
      </footer>
    </article>
  );
}
