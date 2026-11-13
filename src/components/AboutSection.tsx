import { company } from "@/content/site";

export function AboutSection() {
  const data = [
    { label: "Razão social", value: company.legalName },
    { label: "CNPJ", value: company.cnpj, mono: true },
    { label: "Localização", value: company.location },
    { label: "Fundação", value: company.founded },
    { label: "Situação", value: company.status },
    { label: "Administração", value: company.directors.join(" e ") },
  ];

  return (
    <section id="sobre" aria-labelledby="sobre-title" className="bg-paper py-24 md:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 id="sobre-title" className="display-tight text-[clamp(2.1rem,4.4vw,3.6rem)]">
            {company.mission}
          </h2>
          <p className="mt-5 text-xl font-medium text-dp-deep">{company.missionSub}</p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">{company.editorial}</p>
          <p className="mt-8 font-semibold">{company.directors.join(" e ")}</p>
          <p className="text-[15px] text-slate">Administração da DP Systems</p>
        </div>
        <dl className="self-start rounded-3xl border border-rule bg-stock">
          {data.map((row, i) => (
            <div key={row.label} className={`flex flex-col gap-1 px-6 py-4 sm:flex-row sm:justify-between sm:gap-6 ${i > 0 ? "border-t border-rule" : ""}`}>
              <dt className="text-[15px] text-slate">{row.label}</dt>
              <dd className={`font-semibold sm:text-right ${row.mono ? "font-mono text-[15px]" : ""}`}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
