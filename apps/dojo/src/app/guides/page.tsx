/**
 * Guides index: missed weeks, Dojo supplements + the repo's docs/ phase guides.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { getAllGuides } from "@/lib/content";
import { TOPICS } from "@/lib/engine/registry";

export const metadata: Metadata = { title: "Guides" };

export default function GuidesPage() {
  const guides = getAllGuides();
  const missed = guides.filter((g) => g.source === "missed");
  const supplements = guides.filter((g) => g.source === "supplement");
  const dsa = guides.filter((g) => g.source === "dsa");
  const phases = guides.filter((g) => g.source === "phase");
  // Only the per-language index pages — each links onward to its own topic files.
  const reference = guides.filter((g) => g.source === "reference" && !g.parent);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Guides</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The repo&apos;s <code className="font-mono">docs/</code> phase guides, Dojo supplements,
          and the per-language method references — rendered with diagrams, linked to their drill
          sets.
        </p>
      </header>

      <Section title="Missed knowledge (rebuild these yourself)" guides={missed} />
      <Section title="Concepts & supplements (frontend + system design)" guides={supplements} />
      <Section title="DSA & interviews" guides={dsa} />
      <Section title="Language method references" guides={reference} />
      <Section title="Phase guides (the build roadmap)" guides={phases} />
    </div>
  );
}

function Section({
  title,
  guides,
}: {
  title: string;
  guides: ReturnType<typeof getAllGuides>;
}) {
  if (guides.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((guide) => {
          const topic = TOPICS.find((t) => t.docSlug === guide.slug);
          return (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/50"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-6 group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
                  {guide.title}
                </h3>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {guide.source === "phase" ? "phase" : guide.source === "dsa" ? "dsa" : guide.source === "reference" ? "ref" : guide.source === "missed" ? "missed" : "dojo"}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {guide.intro}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                ~{guide.minutes} min read
                {topic && (
                  <span className="ml-2 text-cyan-700 dark:text-cyan-400">
                    · has a drill set ({topic.generators.length} exercise types)
                  </span>
                )}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
