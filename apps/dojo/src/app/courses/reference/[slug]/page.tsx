/**
 * Reference pages (cheat sheets): compressed, printable, kept open while working.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReferencePage, getReferencePages } from "@/lib/courses/content";
import { LessonBody } from "@/components/courses/LessonBody";

interface ReferencePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getReferencePages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ReferencePageProps) {
  const page = getReferencePage((await params).slug);
  return { title: page ? page.title : "Reference not found" };
}

export default async function ReferencePage({ params }: ReferencePageProps) {
  const page = getReferencePage((await params).slug);
  if (!page) notFound();
  return (
    <main className="course-main">
      <nav className="crumbs">
        <Link href="/courses">Courses</Link>
        <span>›</span>
        <span>Reference</span>
        <span style={{ marginLeft: "auto" }} />
        <Link href="/courses/glossary">Glossary</Link>
      </nav>
      <LessonBody slug={`reference-${page.slug}`} html={page.html} />
    </main>
  );
}
