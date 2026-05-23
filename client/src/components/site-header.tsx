"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Home, List, Menu, Plus, X } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/cards", label: "Визитки", icon: List }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="surface px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight transition hover:text-ink/75">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-mint text-ink">
            <CreditCard size={18} strokeWidth={2.5} />
          </span>
          Визитки
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-medium text-ink/70 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} isActive={pathname === item.href}>
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
          <Link href="/cards/new" className="btn-primary px-4 py-2">
            <Plus size={16} />
            Создать
          </Link>
        </nav>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-white/70 transition hover:border-ink/25 hover:bg-white focus:outline-none focus:ring-4 focus:ring-mint/20 md:hidden"
        >
          <span className="sr-only">Открыть меню</span>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen ? (
        <nav id="mobile-menu" className="mt-4 grid gap-2 text-sm font-semibold md:hidden">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} isActive={pathname === item.href} onClick={() => setIsOpen(false)}>
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
          <Link href="/cards/new" onClick={() => setIsOpen(false)} className="btn-primary">
            <Plus size={16} />
            Создать
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

function NavLink({
  children,
  href,
  isActive,
  onClick
}: {
  children: ReactNode;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 transition hover:bg-ink/[0.04] hover:text-ink focus:outline-none focus:ring-4 focus:ring-mint/20 ${
        isActive ? "bg-mint/15 text-ink ring-1 ring-mint/35" : ""
      }`}
    >
      {children}
    </Link>
  );
}
