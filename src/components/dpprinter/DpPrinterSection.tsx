import { dpprinter } from "@/content/site";
import { Brand, H2, INNER, LEAD, PAGE } from "../Section";
import { ArchitectureFlow } from "./ArchitectureFlow";
import { PrintSimulator } from "./PrintSimulator";

export function DpPrinterSection() {
  return (
    <section id="dpprinter" aria-labelledby="dpprinter-title" className={`${PAGE} bg-ink text-white`}>
      <div className={`${INNER} grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14 [&>*]:min-w-0`}>
        <div>
          <Brand
            color="bg-dp"
            extra={<span className="rounded-full border border-rule-dark px-3 py-1 text-sm text-fog">{dpprinter.version}</span>}
          >
            {dpprinter.name}
          </Brand>
          <h2 id="dpprinter-title" className={`${H2} mt-[clamp(0.75rem,2.4vh,1.5rem)]`}>
            {dpprinter.title}
          </h2>
          <p className={`${LEAD} mt-[clamp(0.75rem,2.2vh,1.25rem)] max-w-xl text-fog`}>{dpprinter.copy}</p>

          <dl className="mt-[clamp(1rem,3vh,1.75rem)] grid grid-cols-3 gap-4 border-t border-rule-dark pt-[clamp(0.75rem,2vh,1.25rem)]">
            {dpprinter.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="display-tight block text-[clamp(1.5rem,3.6vh,2.1rem)] text-white">{stat.value}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-fog">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-[clamp(1rem,3vh,1.75rem)]">
            <ArchitectureFlow />
          </div>

          <a
            href={dpprinter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[clamp(1rem,3vh,1.75rem)] inline-flex rounded-full border border-dp px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-dp hover:text-ink"
          >
            Conhecer em {dpprinter.urlLabel}
          </a>
        </div>

        <PrintSimulator />
      </div>
    </section>
  );
}
