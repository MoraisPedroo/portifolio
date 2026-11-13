import { estoquento } from "@/content/site";
import { ApiHub } from "./ApiHub";
import { WarehousePanel } from "./WarehousePanel";

export function EstoqueSection() {
  return (
    <section id="estoquento" aria-labelledby="estoquento-title" className="bg-paper pt-10 pb-24 md:pt-14 md:pb-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="flex items-center gap-3">
          <span className="size-3 rounded-sm bg-nto" />
          <span className="text-lg font-bold">
            Estoque<span className="text-nto-deep">NTO</span>
          </span>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 id="estoquento-title" className="display-tight text-[clamp(1.9rem,min(4.4vw,7.5vh),3.6rem)]">
            {estoquento.title}
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-slate">{estoquento.copy}</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start [&>*]:min-w-0">
          {/* Fica visível enquanto a lista rola: a integração testada acende o corredor. */}
          <div className="lg:sticky lg:top-24">
            <WarehousePanel />
          </div>
          <ApiHub />
        </div>

        <a
          href={estoquento.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex rounded-full border border-ink px-5 py-2.5 text-[15px] font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          Abrir o EstoqueNTO em {estoquento.urlLabel}
        </a>
      </div>
    </section>
  );
}
