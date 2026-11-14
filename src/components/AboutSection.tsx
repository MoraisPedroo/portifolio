import { company } from "@/content/site";
import { H2, INNER, LEAD, PAGE } from "./Section";

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
    <section id="sobre" aria-labelledby="sobre-title" className={`${PAGE} bg-paper`}>
      <div className={`${INNER} grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center`}>
        <div>
          <h2 id="sobre-title" className={H2}>
            {company.mission}
          </h2>
          <p className="mt-[clamp(0.75rem,2vh,1.25rem)] text-xl font-medium text-dp-deep">{company.missionSub}</p>
          <p className={`${LEAD} mt-[clamp(0.75rem,2.4vh,1.5rem)] max-w-xl text-slate`}>{company.editorial}</p>
          <p className="mt-[clamp(1rem,3vh,2rem)] font-semibold">{company.directors.join(" e ")}</p>
          <p className="text-[15px] text-slate">Administração da DP Systems</p>
        </div>
        <dl className="rounded-3xl border border-rule bg-stock">
          {data.map((row, i) => (
            <div
              key={row.label}
              className={`flex flex-col gap-1 px-6 py-[clamp(0.6rem,1.8vh,1rem)] sm:flex-row sm:justify-between sm:gap-6 ${i > 0 ? "border-t border-rule" : ""}`}
            >
              <dt className="text-[15px] text-slate">{row.label}</dt>
              <dd className={`font-semibold sm:text-right ${row.mono ? "font-mono text-[15px]" : ""}`}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
