"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { nav } from "@/content/site";
import { armPageSound } from "@/lib/pageSound";
import { useMagazine } from "@/store/useMagazine";
import { Logo } from "./Logo";

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
        <div className="hidden w-[172px] sm:block" aria-hidden />
      </div>
    </header>
  );
}
