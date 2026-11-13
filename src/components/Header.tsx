import { company, nav } from "@/content/site";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#inicio" aria-label="DP Systems, voltar ao início">
          <Logo />
        </a>
        <nav aria-label="Seções" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="rounded-full px-3.5 py-2 text-[15px] font-medium text-fog transition-colors hover:bg-white/8 hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={company.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white px-4 py-2 text-[15px] font-semibold text-ink transition-colors hover:bg-dp"
        >
          <span className="sm:hidden">Contato</span>
          <span className="hidden sm:inline">Falar com a engenharia</span>
        </a>
      </div>
    </header>
  );
}
