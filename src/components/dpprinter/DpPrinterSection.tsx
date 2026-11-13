import Image from "next/image";
import { dpprinter } from "@/content/site";
import { ArchitectureFlow } from "./ArchitectureFlow";
import { PrintSimulator } from "./PrintSimulator";

export function DpPrinterSection({ photo }: { photo?: { src: string; alt: string } }) {
  return (
    <section id="dpprinter" aria-labelledby="dpprinter-title" className="bg-ink text-white pt-10 pb-24 md:pt-14 md:pb-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="size-3 rounded-sm bg-dp" />
          <span className="text-lg font-bold">{dpprinter.name}</span>
          <span className="rounded-full border border-rule-dark px-3 py-1 text-sm text-fog">{dpprinter.version}</span>
        </div>

        <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16 [&>*]:min-w-0">
          <div>
            <h2 id="dpprinter-title" className="display-tight text-[clamp(1.9rem,min(4.4vw,7.5vh),3.6rem)]">
              {dpprinter.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fog">{dpprinter.copy}</p>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-rule-dark pt-6">
              {dpprinter.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="display-tight block text-3xl text-white sm:text-4xl">{stat.value}</span>
                    <span className="mt-1 block text-sm text-fog">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>

            {photo && (
              <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl bg-graphite">
                <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <PrintSimulator />
          </div>
        </div>

        <div className="mt-12">
          <ArchitectureFlow />
        </div>

        <ul className="mt-16 grid gap-x-10 gap-y-8 border-t border-rule-dark pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {dpprinter.features.map((feature) => (
            <li key={feature.title}>
              <h3 className="font-bold text-white">{feature.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-fog">{feature.text}</p>
            </li>
          ))}
        </ul>

        <p className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px] text-fog">
          <a
            href={dpprinter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-dp px-5 py-2.5 font-semibold text-white transition-colors hover:bg-dp hover:text-ink"
          >
            Conhecer o DP Printer em {dpprinter.urlLabel}
          </a>
          {dpprinter.requirements}
        </p>
      </div>
    </section>
  );
}
