"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { nav } from "@/content/site";
import { armPageSound } from "@/lib/pageSound";
import { useMagazine } from "@/store/useMagazine";
import { Logo } from "./Logo";

function SoundButton() {
  const muted = useMagazine((s) => s.muted);
  return (
    <button
      type="button"
      onClick={() => useMagazine.getState().toggleMuted()}
      aria-pressed={!muted}
      aria-label={muted ? "Ligar o som de virar página" : "Desligar o som de virar página"}
      title={muted ? "Som desligado" : "Som ligado"}
      className="grid size-9 place-items-center rounded-full border border-white/15 text-fog transition-colors hover:border-white/40 hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        {muted ? <path d="m22 9-6 6m0-6 6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />}
      </svg>
    </button>
  );
}

export function Header() {
  const pathname = usePathname();

  useEffect(() => {
    useMagazine.getState().hydrate();
    armPageSound();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" aria-label="DP Systems, apresentação">
          <Logo compact />
        </Link>
        <nav aria-label="Abas">
          <ul className="flex items-center gap-0.5 rounded-full border border-white/10 p-1">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:text-[15px] ${
                      active ? "bg-white text-ink" : "text-fog hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden w-[172px] justify-end sm:flex">{pathname.startsWith("/projetos") ? <SoundButton /> : null}</div>
      </div>
    </header>
  );
}
