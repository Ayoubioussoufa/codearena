/**
 * DSA category — problem list with difficulty filter + solved status.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { DSA_CATEGORIES, getCategory } from "@/lib/dsa/registry";
import { DsaProblemList } from "@/components/DsaProblemList";

interface CategoryProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return DSA_CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: CategoryProps) {
  const { category } = await params;
  const cat = getCategory(category);
  return { title: cat ? cat.title : "Category not found" };
}

export default async function DsaCategoryPage({ params }: CategoryProps) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const rows = cat.problems.map((p) => ({
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    blurb: p.blurb,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-4 text-sm">
        <Link href="/dsa" className="text-cyan-700 hover:underline dark:text-cyan-400">
          ← All patterns
        </Link>
      </div>
      <header className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
          <span>{cat.icon}</span>
          {cat.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{cat.blurb}</p>
        <Link
          href={`/guides/dsa-patterns#${cat.docAnchor}`}
          className="mt-2 inline-block text-xs text-cyan-700 hover:underline dark:text-cyan-400"
        >
          📖 Read the pattern guide
        </Link>
      </header>
      <DsaProblemList categoryId={cat.id} problems={rows} />
    </div>
  );
}
