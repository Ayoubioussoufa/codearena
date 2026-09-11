/**
 * src/app/problems/[slug]/page.tsx — Problem detail route (server component)
 * TODOs: none here — the practice gaps live in components/workspace/
 * (WorkspaceContext.tsx and EditorPanel.tsx).
 *
 * Note the Next 16 convention: `params` is a Promise and must be awaited.
 */
import { notFound } from "next/navigation";
import { getProblem } from "@/lib/server-api";
import { ProblemWorkspace } from "@/components/workspace/ProblemWorkspace";

interface ProblemPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProblemPageProps) {
  const { slug } = await params;
  const problem = await getProblem(slug);
  return { title: problem ? problem.title : "Problem not found" };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  const problem = await getProblem(slug);
  if (!problem) notFound();

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <ProblemWorkspace problem={problem} />
    </div>
  );
}
