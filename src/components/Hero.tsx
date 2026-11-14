import { company } from "@/content/site";
import { HeroMagazine } from "./HeroMagazine";

export function Hero() {
  return (
    <section id="inicio" className="snap-page bg-paper pt-16 lg:h-[100svh] lg:min-h-[600px]">
      <div className="mx-auto grid h-full max-w-[1240px] items-center gap-10 px-5 py-12 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-[clamp(1rem,4vh,3rem)] [&>*]:min-w-0">
        <div>
          <p className="text-[15px] font-medium text-slate">DP Systems, engenharia de software em São Paulo</p>
          <h1 className="display mt-[clamp(0.75rem,2.5vh,1.5rem)] text-[clamp(2.4rem,min(5.2vw,8.6vh),4.9rem)] text-ink">
            {company.headline}
          </h1>
          <p className="mt-[clamp(1rem,3vh,1.75rem)] max-w-[34rem] text-[clamp(1rem,2.3vh,1.25rem)] leading-relaxed text-slate">
            {company.intro}
          </p>
          <div className="mt-[clamp(1.25rem,3.5vh,2.25rem)] flex flex-wrap gap-3">
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
        <div className="h-full min-h-0">
          <HeroMagazine />
        </div>
      </div>
    </section>
  );
}
