/**
 * src/components/Navbar.tsx — sticky responsive nav with active links + mobile menu
 * TODOs: none — fully implemented scaffold.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar } from "./Avatar";

const NAV_LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/contests", label: "Contests" },
  { href: "/leaderboard", label: "Leaderboard" },
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
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 font-sans text-xs font-black text-white">
            {"</>"}
          </span>
          Code<span className="text-blue-600 dark:text-blue-400">Arena</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`transition-colors ${linkClass(link.href)}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 md:block dark:text-slate-400 dark:hover:text-slate-100"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="hidden rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 md:block"
          >
            Get started
          </Link>
          <Link
            href="/profile"
            aria-label="Your profile"
            title="Your profile"
            className="hidden rounded-full transition-opacity hover:opacity-80 md:block"
          >
            <Avatar name="Amani B." size="sm" />
          </Link>

          {/* Mobile hamburger */}
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

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-1">
            {[...NAV_LINKS, { href: "/profile", label: "Profile" }, { href: "/settings", label: "Settings" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${linkClass(link.href)}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
