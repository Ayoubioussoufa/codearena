/**
 * Practice session route — thin server shell around the client session.
 * Accepts every registered topic id plus the special "mixed" and "review"
 * modes. For a real topic it also scans apps/web for the TODO gaps that topic
 * prepares you to build, and hands them to the session (serializable data).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS, getTopic } from "@/lib/engine/registry";
import { bridgeForTopic } from "@/lib/bridge";
import type { TopicId } from "@/lib/engine/types";
import { PracticeSession } from "@/components/PracticeSession";

interface PracticeTopicProps {
  params: Promise<{ topic: string }>;
}

const SPECIAL: Record<string, string> = {
  mixed: "Mixed review",
  review: "Spaced review",
};

export function generateStaticParams() {
  return [
    ...TOPICS.map((t) => ({ topic: t.id })),
    { topic: "mixed" },
    { topic: "review" },
  ];
}

export async function generateMetadata({ params }: PracticeTopicProps) {
  const { topic } = await params;
  if (SPECIAL[topic]) return { title: SPECIAL[topic] };
  const found = getTopic(topic);
  return { title: found ? `${found.title} drills` : "Topic not found" };
}

export default async function PracticeTopicPage({ params }: PracticeTopicProps) {
  const { topic } = await params;
  const isSpecial = topic in SPECIAL;
  if (!isSpecial && !getTopic(topic)) notFound();

  const bridge = isSpecial ? undefined : bridgeForTopic(topic as TopicId);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-4 text-sm">
        <Link href="/practice" className="text-cyan-700 hover:underline dark:text-cyan-400">
          ← All topics
        </Link>
      </div>
      {/* `bridge` is omitted rather than passed as undefined: under
          exactOptionalPropertyTypes an optional prop won't accept undefined. */}
      <PracticeSession topicId={topic} {...(bridge ? { bridge } : {})} />
    </div>
  );
}
