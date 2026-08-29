/**
 * DSA solve view route.
 */
import { notFound } from "next/navigation";
import { DSA_CATEGORIES, getProblem } from "@/lib/dsa/registry";
import { DsaSolver } from "@/components/DsaSolver";

interface ProblemProps {
  params: Promise<{ category: string; problem: string }>;
}

export function generateStaticParams() {
  return DSA_CATEGORIES.flatMap((c) =>
    c.problems.map((p) => ({ category: c.id, problem: p.slug })),
  );
}

export async function generateMetadata({ params }: ProblemProps) {
  const { category, problem } = await params;
  const found = getProblem(category, problem);
  return { title: found ? found.problem.title : "Problem not found" };
}

export default async function DsaProblemPage({ params }: ProblemProps) {
  const { category, problem } = await params;
  const found = getProblem(category, problem);
  if (!found) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <DsaSolver
        problem={found.problem}
        categoryTitle={found.category.title}
        categoryId={found.category.id}
      />
    </div>
  );
}
