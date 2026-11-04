/**
 * "Say it in your own words": a box per written answer and per term, saved
 * in this browser as you type, plus one button that turns it all into the
 * `done NNNN` message you send your teacher in the terminal.
 */
"use client";

import { useState } from "react";
import { lessonProgress, setNote, useCourseProgress } from "@/lib/courses/progress";
import type { QuizQuestion } from "@/lib/courses/types";
import { lessonQuizLines } from "@/lib/guide-checks/message";

export function OwnWords({
  slug,
  number,
  terms,
  answers,
  quiz = [],
}: {
  slug: string;
  number: number;
  terms: string[];
  answers: { id: string; label: string }[];
  /** The lesson's quiz: your latest picks go into the message too. */
  quiz?: readonly QuizQuestion[];
}) {
  const progress = lessonProgress(useCourseProgress(), slug);
  const notes = progress.notes ?? {};
  const [copied, setCopied] = useState<"idle" | "copied" | "manual">("idle");
  const tag = String(number).padStart(4, "0");

  const filled = terms.filter((t) => (notes[`term:${t}`] ?? "").trim()).length;

  function message(): string {
    const lines = [`done ${tag}`, "", ...lessonQuizLines(quiz, progress)];
    for (const a of answers) {
      const v = (notes[`answer:${a.id}`] ?? "").trim();
      if (v) lines.push(`${a.label}:`, v, "");
    }
    lines.push("My definitions:");
    for (const t of terms) lines.push(`- ${t}: ${(notes[`term:${t}`] ?? "").trim() || "(not yet)"}`);
    return lines.join("\n");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message());
      setCopied("copied");
    } catch {
      setCopied("manual");
    }
  }

  return (
    <div className="words">
      {answers.map((a) => (
        <label key={a.id} className="words-row wide">
          <span className="words-term">{a.label}</span>
          <textarea
            rows={3}
            value={notes[`answer:${a.id}`] ?? ""}
            onChange={(e) => setNote(slug, `answer:${a.id}`, e.target.value)}
          />
        </label>
      ))}
      {terms.map((t) => (
        <label key={t} className="words-row">
          <span className="words-term">{t}</span>
          <textarea
            rows={2}
            placeholder="One sentence, from memory"
            value={notes[`term:${t}`] ?? ""}
            onChange={(e) => setNote(slug, `term:${t}`, e.target.value)}
          />
        </label>
      ))}
      <div className="quiz-foot">
        <span>
          {filled} of {terms.length} terms written · saved in this browser as you type
        </span>
        <button type="button" className="btn primary" onClick={copy}>
          Copy my <code>done {tag}</code> message
        </button>
        {copied === "copied" && <span>Copied: paste it in the terminal.</span>}
      </div>
      {copied === "manual" && (
        <pre className="words-message" aria-label="Your message, to copy by hand">
          {message()}
        </pre>
      )}
    </div>
  );
}

/** The glossary page's drafts: every definition you've typed in a lesson, not yet checked. */
export function GlossaryDrafts({ lessons }: { lessons: { slug: string; number: number; words: string[] }[] }) {
  const progress = useCourseProgress();
  const drafts = lessons.flatMap((l) => {
    const notes = lessonProgress(progress, l.slug).notes ?? {};
    return l.words
      .map((term) => ({ term, text: (notes[`term:${term}`] ?? "").trim(), lesson: l }))
      .filter((d) => d.text);
  });
  if (drafts.length === 0) return null;
  return (
    <section>
      <h2>Your drafts</h2>
      <p className="muted" style={{ fontSize: "1rem" }}>
        Definitions you&apos;ve written in lessons, saved in this browser. They move up into the
        glossary once your teacher has checked them.
      </p>
      <dl className="terms">
        {drafts.map((d) => (
          <div key={`${d.lesson.slug}:${d.term}`}>
            <dt>
              {d.term}{" "}
              <a href={`/courses/lessons/${d.lesson.slug}`} className="sans" style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                (lesson {d.lesson.number})
              </a>
            </dt>
            <dd>{d.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
