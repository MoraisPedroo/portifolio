import { company, contact, credencial, dpprinter, estoquento } from "@/content/site";
import { Logo } from "./Logo";

export function ContactSection() {
  const links = [
    { name: dpprinter.name, text: dpprinter.urlLabel, href: dpprinter.url, accent: "bg-dp" },
    { name: estoquento.name, text: estoquento.urlLabel, href: estoquento.url, accent: "bg-nto" },
    { name: credencial.name, text: "Pedir uma demonstração", href: company.whatsapp, accent: "bg-cred" },
  ];

  return (
    <footer id="contato" className="bg-ink text-white">
      <div className="mx-auto max-w-[1240px] px-5 pb-12 pt-16 md:px-8 md:pt-24">
        <h2 className="display max-w-4xl text-[clamp(2.2rem,min(5.6vw,9vh),4.6rem)]">{contact.title}</h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-fog">{contact.copy}</p>
        <a
          href={company.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-dp px-8 py-4 text-lg font-bold text-ink transition-colors hover:bg-emerald-400 sm:w-auto"
        >
          Conversar pelo WhatsApp
        </a>

        <ul className="mt-16 grid gap-3 sm:grid-cols-3">
          {links.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col rounded-2xl border border-rule-dark px-5 py-4 transition-colors hover:border-fog"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className={`size-2.5 rounded-sm ${link.accent}`} />
                  {link.name}
                </span>
                <span className="mt-1 text-[15px] text-fog">{link.text}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-20 flex flex-col gap-6 border-t border-rule-dark pt-8 text-sm text-fog md:flex-row md:items-end md:justify-between">
          <Logo />
          <div className="md:text-right">
            <p>
              © {company.founded} {company.legalName}
            </p>
            <p>
              CNPJ <span className="font-mono">{company.cnpj}</span>, {company.location}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
