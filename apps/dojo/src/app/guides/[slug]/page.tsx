/**
 * Guide reader: rendered markdown + sticky TOC + drill call-to-action.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllGuides, getGuide } from "@/lib/content";
import { TOPICS } from "@/lib/engine/registry";
import { MarkdownView } from "@/components/MarkdownView";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  return { title: guide ? guide.title : "Guide not found" };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const topic = TOPICS.find((t) => t.docSlug === guide.slug);
  // Reference sub-pages (js-array, java-map, …) get a crumb back to their language index.
  const parent = guide.parent ? getGuide(guide.parent) : null;
  // …and the index itself lists its siblings, so you can hop between topics without going back.
  const siblings = guide.parent
    ? getAllGuides().filter((g) => g.parent === guide.parent && g.slug !== guide.slug)
    : getAllGuides().filter((g) => g.parent === guide.slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/guides" className="text-cyan-700 hover:underline dark:text-cyan-400">
          ← All guides
        </Link>
        {parent && (
          <>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <Link
              href={`/guides/${parent.slug}`}
              className="text-cyan-700 hover:underline dark:text-cyan-400"
            >
              {parent.title.split("—")[0]?.trim()}
            </Link>
          </>
        )}
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="text-slate-400">~{guide.minutes} min read</span>
        {topic && (
          <Link
            href={`/practice/${topic.id}`}
            className="ml-auto rounded-lg bg-cyan-600 px-4 py-1.5 font-semibold text-white transition-colors hover:bg-cyan-500"
          >
            {topic.icon} Drill this guide
          </Link>
        )}
      </div>

      <div className="flex gap-10">
        <article className="min-w-0 flex-1">
          <MarkdownView markdown={guide.markdown} guideSlug={guide.slug} />

          {siblings.length > 0 && (
            <nav className="mt-10 rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {guide.parent ? "More in this reference" : "In this reference"}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/guides/${s.slug}`}
                      className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm transition-colors hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/50 dark:hover:text-cyan-400"
                    >
                      {s.title.split("—")[0]?.trim()}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {topic && (
            <div className="mt-10 rounded-xl border border-cyan-200 bg-cyan-50/60 p-5 text-sm dark:border-cyan-500/30 dark:bg-cyan-500/5">
              <p className="font-semibold text-cyan-800 dark:text-cyan-300">
                Done reading? Make it stick.
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                The {topic.title} drill set has {topic.generators.length} exercise
                types generated fresh each attempt — with corrections and the why.
              </p>
              <Link
                href={`/practice/${topic.id}`}
                className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-cyan-500"
              >
                Start the drills →
              </Link>
            </div>
          )}
        </article>

        {/* TOC */}
        {guide.toc.length > 2 && (
          <nav className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 flex max-h-[calc(100vh-7rem)] flex-col">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                On this page
              </p>
              <ul className="toc-scroll flex min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain border-l border-slate-200 pl-3 pr-2 text-xs dark:border-slate-800">
                {guide.toc.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className="block leading-5 text-slate-500 transition-colors hover:text-cyan-700 dark:text-slate-400 dark:hover:text-cyan-400"
                    >
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
