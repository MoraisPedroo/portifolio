import Link from "next/link";
import { company, whatsappLink } from "@/content/site";
import { Logo } from "./Logo";

/** Rodapé institucional enxuto: dados fiscais saem do meio da página e ficam aqui. */
export function SiteFooter() {
  return (
    <footer className="snap-end border-t border-white/10 bg-ink text-fog">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-6 text-sm md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <p className="leading-relaxed md:text-center">
          {company.legalName} · CNPJ <span className="font-mono">{company.cnpj}</span> · {company.location}
        </p>
        <div className="flex gap-4">
          <a href={whatsappLink("Olá! Vim pelo site da DP Systems.")} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            WhatsApp
          </a>
          <Link href="/contato" className="hover:text-white">
            Contato
          </Link>
        </div>
      </div>
    </footer>
  );
}
