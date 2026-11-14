import { company, contact, credencial, dpprinter, estoquento } from "@/content/site";
import { Logo } from "./Logo";
import { INNER, PAGE } from "./Section";

export function ContactSection() {
  const links = [
    { name: dpprinter.name, text: dpprinter.urlLabel, href: dpprinter.url, accent: "bg-dp" },
    { name: estoquento.name, text: estoquento.urlLabel, href: estoquento.url, accent: "bg-nto" },
    { name: credencial.name, text: "Pedir uma demonstração", href: company.whatsapp, accent: "bg-cred" },
  ];

  return (
    <footer id="contato" className={`${PAGE} bg-ink text-white`}>
      <div className={`${INNER} flex flex-col justify-between gap-12`}>
        <div className="my-auto">
          <h2 className="display max-w-4xl text-[clamp(2.2rem,min(5.2vw,8.5vh),4.4rem)]">{contact.title}</h2>
          <p className="mt-[clamp(0.75rem,2.4vh,1.5rem)] max-w-xl text-[clamp(1rem,2.2vh,1.125rem)] leading-relaxed text-fog">
            {contact.copy}
          </p>
          <a
            href={company.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[clamp(1.25rem,3.5vh,2.25rem)] inline-flex w-full items-center justify-center rounded-full bg-dp px-8 py-4 text-lg font-bold text-ink transition-colors hover:bg-emerald-400 sm:w-auto"
          >
            Conversar pelo WhatsApp
          </a>

          <ul className="mt-[clamp(1.5rem,4.5vh,3rem)] grid gap-3 sm:grid-cols-3">
            {links.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-2xl border border-rule-dark px-5 py-3.5 transition-colors hover:border-fog"
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
        </div>

        <div className="flex flex-col gap-4 border-t border-rule-dark pt-5 text-sm text-fog md:flex-row md:items-end md:justify-between">
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
