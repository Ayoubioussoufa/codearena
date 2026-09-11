/**
 * src/app/layout.tsx — root layout: fonts, theme bootstrap, navbar/footer shell
 * TODOs: none — fully implemented scaffold.
 *
 * The inline <script> runs before first paint and applies the `.dark` class
 * from localStorage (falling back to the OS preference), so there is no
 * light-mode flash. suppressHydrationWarning on <html> is required because
 * that script mutates the class before React hydrates.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { QueryProvider } from "@/lib/query/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CodeArena",
    template: "%s · CodeArena",
  },
  description:
    "Competitive programming arena — solve problems, climb the leaderboard, sharpen your edge.",
};

const THEME_INIT_SCRIPT = `
try {
  var stored = localStorage.getItem("theme");
  var dark = stored === "dark" || (!stored && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
} catch (_) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <QueryProvider>
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
