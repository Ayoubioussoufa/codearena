/**
 * Coding track route — thin server shell around the client session.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { CODING_TRACKS, getTrack } from "@/lib/engine/coding";
import { CodingSession } from "@/components/CodingSession";

interface CodingTrackProps {
  params: Promise<{ track: string }>;
}

export function generateStaticParams() {
  return CODING_TRACKS.map((t) => ({ track: t.id }));
}

export async function generateMetadata({ params }: CodingTrackProps) {
  const { track } = await params;
  const found = getTrack(track);
  return { title: found ? `${found.title} — Coding` : "Track not found" };
}

export default async function CodingTrackPage({ params }: CodingTrackProps) {
  const { track } = await params;
  if (!getTrack(track)) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-4 text-sm">
        <Link href="/coding" className="text-cyan-700 hover:underline dark:text-cyan-400">
          ← All tracks
        </Link>
      </div>
      <CodingSession trackId={track} />
    </div>
  );
}
