import { company } from "@/content/site";
import { LabelPrinter } from "./LabelPrinter";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-paper pb-20 pt-28 md:pb-28 md:pt-36">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.12fr_0.88fr]">
        <div>
          <p className="mb-6 text-[15px] font-medium text-slate">DP Systems, engenharia de software em São Paulo</p>
          <h1 className="display text-[clamp(2.5rem,min(6.4vw,10vh),5.4rem)] text-ink">{company.headline}</h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-slate md:text-xl">{company.intro}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#dpprinter"
              className="rounded-full bg-ink px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-graphite-2"
            >
              Conhecer os produtos
            </a>
            <a
              href={company.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-rule bg-stock px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink"
            >
              Falar com a engenharia
            </a>
          </div>
        </div>
        <LabelPrinter />
      </div>
    </section>
  );
}
