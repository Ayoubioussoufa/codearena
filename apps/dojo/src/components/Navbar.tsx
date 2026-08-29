/**
 * Dojo navbar — sticky, responsive, active links, mobile menu.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme";

const NAV_LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/practice", label: "Practice" },
  { href: "/coding", label: "Coding" },
  { href: "/dsa", label: "DSA" },
  { href: "/build", label: "Build" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function linkClass(href: string) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return active
      ? "text-slate-900 dark:text-slate-50 font-semibold"
      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-600 text-sm">
            🥋
          </span>
          Code<span className="text-cyan-600 dark:text-cyan-400">Arena</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            dojo
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`transition-colors ${linkClass(link.href)}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="http://localhost:3000"
            className="hidden rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 md:block dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            title="The app you're building"
          >
            ↗ CodeArena app
          </a>
          <ThemeToggle />

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden dark:border-slate-800 dark:text-slate-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${linkClass(link.href)}`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="http://localhost:3000"
              className="rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              ↗ CodeArena app
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
