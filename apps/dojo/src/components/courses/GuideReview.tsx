/**
 * The end-of-guide panel: define the key terms in your own words, then copy
 * every answer you gave in this guide (multiple choice, written answers,
 * definitions) as one self-contained message for an AI tutor to correct.
 */
"use client";

import { useState } from "react";
import type { GuideCheckSet } from "@/lib/guide-checks/types";
import { guideProgressSlug } from "@/lib/guide-checks";
import { guideReviewCounts, guideReviewMessage } from "@/lib/guide-checks/message";
import { lessonProgress, setNote, useCourseProgress } from "@/lib/courses/progress";
import { Inline } from "./Inline";

export function GuideReview({ slug, title, set }: { slug: string; title: string; set: GuideCheckSet }) {
  const store = guideProgressSlug(slug);
  const progress = lessonProgress(useCourseProgress(), store);
  const notes = progress.notes ?? {};
  const counts = guideReviewCounts(set, progress);
  const [copied, setCopied] = useState<"idle" | "copied" | "manual">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(guideReviewMessage(title, set, progress));
      setCopied("copied");
    } catch {
      setCopied("manual");
    }
  }

  return (
    <section id="get-corrected" className="course course-embed check review not-prose">
      <p className="check-label">Get corrected</p>
      <h2>Say it in your own words, then get corrected</h2>
      <p>
        One sentence per term, from memory. Then copy everything you answered in this guide and paste it
        to an AI tutor (or to your teacher in the terminal): the message carries every question, so it
        can correct you without seeing the guide.
      </p>
      <div className="words">
        {set.terms.map((t) => (
          <label key={t} className="words-row">
            <span className="words-term">{t}</span>
            <textarea
              rows={2}
              placeholder="One sentence, from memory"
              value={notes[`term:${t}`] ?? ""}
              onChange={(e) => setNote(store, `term:${t}`, e.target.value)}
            />
          </label>
        ))}
      </div>
      <div className="quiz-foot">
        <span>
          {counts.answered} of {counts.questions} questions · {counts.written} of {counts.explains} written
          answers · {counts.defined} of {counts.terms} terms
        </span>
        <button type="button" className="btn primary" onClick={copy}>
          Copy all my answers
        </button>
        {copied === "copied" && <span>Copied: paste it to your tutor.</span>}
      </div>
      {copied === "manual" && (
        <pre className="words-message" aria-label="Your message, to copy by hand">
          {guideReviewMessage(title, set, progress)}
        </pre>
      )}
      <p className="check-foot">
        <strong>Read alongside:</strong> <a href={set.source.href}>{set.source.label}</a>. <Inline text={set.source.note} />{" "}
        Stuck on anything, or a correction you don&apos;t buy? Ask your teacher in the terminal.
      </p>
    </section>
  );
}
