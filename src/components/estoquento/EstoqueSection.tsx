import { estoquento } from "@/content/site";
import { Brand, H2, INNER, LEAD, PAGE } from "../Section";
import { ApiHub } from "./ApiHub";
import { WarehousePanel } from "./WarehousePanel";

export function EstoqueSection() {
  return (
    <section id="estoquento" aria-labelledby="estoquento-title" className={`${PAGE} bg-paper`}>
      <div className={`${INNER} grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:grid-rows-[minmax(0,1fr)] lg:gap-8 [&>*]:min-w-0`}>
        <div className="flex min-h-0 flex-col">
          <Brand
            color="bg-nto"
            extra={
              <a
                href={estoquento.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-medium text-nto-deep underline decoration-nto/40 underline-offset-4 hover:decoration-nto-deep"
              >
                {estoquento.urlLabel}
              </a>
            }
          >
            Estoque<span className="text-nto-deep">NTO</span>
          </Brand>
          <h2 id="estoquento-title" className={`${H2} mt-[clamp(0.6rem,2vh,1.25rem)]`}>
            {estoquento.title}
          </h2>
          <p className={`${LEAD} mt-[clamp(0.5rem,1.6vh,1rem)] max-w-2xl text-slate`}>{estoquento.copy}</p>
          <div className="mt-[clamp(0.75rem,2.4vh,1.5rem)] flex min-h-0 flex-1 flex-col">
            <WarehousePanel />
          </div>
        </div>
        <ApiHub />
      </div>
    </section>
  );
}
