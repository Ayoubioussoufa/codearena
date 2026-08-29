/**
 * Teacher page — interactive Claude-powered lessons grounded in the guides.
 */
import type { Metadata } from "next";
import { getAllGuides } from "@/lib/content";
import { TeacherChat, type TeacherGuide } from "@/components/TeacherChat";

export const metadata: Metadata = {
  title: "Teacher",
  description:
    "Learn interactively — a Claude-powered teacher that knows every Dojo guide, quizzes you, and reviews your exercises.",
};

export default function TeacherPage() {
  const guides: TeacherGuide[] = getAllGuides().map(({ slug, title, source }) => ({
    slug,
    title,
    source,
  }));
  return <TeacherChat guides={guides} />;
}
