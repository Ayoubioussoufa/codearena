/**
 * Interactive practice session. Three exercise kinds (choice / input / code),
 * three modes:
 *   - single topic  — drills that topic's generators (bag order)
 *   - "mixed"       — every generator from every topic (bag order)
 *   - "review"      — ONLY items that are due for spaced repetition, played as
 *                     an ordered queue (most overdue first) that drains to a
 *                     completion screen
 *
 * Bag order = a weighted shuffle without replacement: no repeats until every
 * type has been seen, unseen/struggling ones drawn earlier. Code exercises
 * grade via static checks and/or by running your function in a sandboxed
 * worker against test cases.
 */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CodeCheckResult, Exercise, TopicId } from "@/lib/engine/types";
import type { TopicBridge } from "@/lib/bridge";
import { Rng, freshSeed } from "@/lib/engine/rng";
import { ALL_GENERATORS, getTopic, type PoolEntry } from "@/lib/engine/registry";
import {
  weightedBagOrder,
  recordAnswer,
  useProgress,
  accuracy,
  dueList,
  today,
  type GenStats,
} from "@/lib/progress";
import { MasteryBar, RichText } from "./ui";
import { CodeBlock } from "./CodeBlock";
import { CodePracticeEditor } from "./CodePracticeEditor";
import { BuildBridgePanel } from "./BuildBridgePanel";

type Phase = "idle" | "answering" | "checking" | "feedback" | "done";

export const MIXED_ID = "mixed";
export const REVIEW_ID = "review";

interface SessionMeta {
  title: string;
  icon: string;
  blurb: string;
  docHref: string;
  docLabel: string;
}

export function PracticeSession({
  topicId,
  bridge,
}: {
  topicId: string;
  bridge?: TopicBridge;
}) {
  const progress = useProgress();
  const [phase, setPhase] = useState<Phase>("idle");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [codeValue, setCodeValue] = useState("");
  // Design-prompt state: scratch notes, the ticked rubric points, and the
  // countdown anchor. `designRecorded` guards the self-grade so continuing
  // records it exactly once. `nowTick` just forces a re-render each second.
  const [designNotes, setDesignNotes] = useState("");
  const [rubricTicks, setRubricTicks] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [, setNowTick] = useState(0);
  const designRecorded = useRef(false);
  const [checkResults, setCheckResults] = useState<CodeCheckResult[]>([]);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [session, setSession] = useState({ answered: 0, correct: 0 });
  const [lastGenId, setLastGenId] = useState<string | null>(null);
  const bagRef = useRef<string[]>([]);
  const [reviewQueue, setReviewQueue] = useState<PoolEntry[] | null>(null);
  const [reviewTotal, setReviewTotal] = useState(0);

  // Design prompts run a live countdown while you're answering — a soft budget
  // (it keeps ticking into overtime), so the timer never blocks you.
  useEffect(() => {
    if (exercise?.kind !== "design" || phase !== "answering") return;
    const id = setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [exercise, phase]);

  const isMixed = topicId === MIXED_ID;
  const isReview = topicId === REVIEW_ID;
  const topic = isMixed || isReview ? undefined : getTopic(topicId);

  const meta: SessionMeta | null = isReview
    ? {
        title: "Spaced review",
        icon: "🧠",
        blurb:
          "Only the items you're due to see again, most overdue first — the spacing effect, applied to your own weak spots.",
        docHref: "/guides/phase-3-rating-mastery-math",
        docLabel: "The FSRS guide behind this",
      }
    : isMixed
      ? {
          title: "Mixed review",
          icon: "🔀",
          blurb:
            "Questions from every topic in one stream, leaning toward the areas you miss most.",
          docHref: "/guides",
          docLabel: "Browse all guides",
        }
      : topic
        ? {
            title: topic.title,
            icon: topic.icon,
            blurb: topic.blurb,
            docHref: `/guides/${topic.docSlug}`,
            docLabel: topic.docTitle,
          }
        : null;

  const pool: PoolEntry[] =
    isMixed || isReview
      ? ALL_GENERATORS
      : (topic?.generators ?? []).map((generator) => ({
          generator,
          topicId: topic!.id as TopicId,
        }));

  if (!meta || pool.length === 0) return null; // unknown topics 404 server-side

  function genStatsFor(entry: PoolEntry): GenStats | undefined {
    return progress.topics[entry.topicId]?.generators[entry.generator.id];
  }

  const dueNow = isReview ? dueList(progress, today()).length : 0;

  const headerAttempts = isMixed || isReview
    ? progress.totalAttempts
    : (progress.topics[topic!.id]?.attempts ?? 0);
  const headerCorrect = isMixed || isReview
    ? progress.totalCorrect
    : (progress.topics[topic!.id]?.correct ?? 0);

  const headerSubtitle = isReview
    ? `${phase === "idle" ? dueNow : reviewTotal} due · most overdue first`
    : `${pool.length} exercise types · no repeats until you've seen them all`;

  function drawBagId(): string | null {
    if (bagRef.current.length === 0) {
      const statsById = new Map(pool.map((e) => [e.generator.id, genStatsFor(e)]));
      const bag = weightedBagOrder(
        pool.map((e) => e.generator.id),
        (id) => statsById.get(id),
        Math.random,
      );
      if (bag.length > 1 && bag[0] === lastGenId) {
        bag.push(bag.shift() as string);
      }
      bagRef.current = bag;
    }
    return bagRef.current.shift() ?? null;
  }

  function nextExercise() {
    let entry: PoolEntry | undefined;
    if (isReview) {
      let queue = reviewQueue;
      if (queue === null) {
        const byId = new Map(pool.map((e) => [e.generator.id, e]));
        queue = dueList(progress, today())
          .map((d) => byId.get(d.genId))
          .filter((e): e is PoolEntry => e !== undefined);
        setReviewTotal(queue.length);
      }
      if (queue.length === 0) {
        setReviewQueue([]);
        setPhase("done");
        return;
      }
      entry = queue[0];
      setReviewQueue(queue.slice(1));
    } else {
      const genId = drawBagId();
      entry = pool.find((e) => e.generator.id === genId);
    }
    if (!entry) return;
    const ex = entry.generator.generate(new Rng(freshSeed()));
    setExercise(ex);
    setLastGenId(entry.generator.id);
    setSelected(null);
    setInputValue("");
    setCodeValue(ex.kind === "code" ? ex.starter : "");
    setDesignNotes("");
    setRubricTicks([]);
    setStartedAt(ex.kind === "design" ? Date.now() : null);
    designRecorded.current = false;
    setCheckResults([]);
    setPhase("answering");
  }

  /** Self-graded design prompts record on continue, not on reveal. */
  function advance() {
    if (exercise?.kind === "design" && !designRecorded.current) {
      const owner = pool.find((e) => e.generator.id === exercise.genId);
      if (owner) {
        const passed =
          exercise.rubric.length > 0 &&
          rubricTicks.length / exercise.rubric.length >= 0.6;
        setSession((s) => ({
          answered: s.answered + 1,
          correct: s.correct + (passed ? 1 : 0),
        }));
        recordAnswer(owner.topicId, exercise.genId, passed);
        designRecorded.current = true;
      }
    }
    nextExercise();
  }

  async function check() {
    if (!exercise || phase !== "answering") return;
    const owner = pool.find((e) => e.generator.id === exercise.genId);
    if (!owner) return;

    // Design prompts are self-graded: revealing the reference doesn't score.
    // You tick the rubric in feedback, and it's recorded when you continue.
    if (exercise.kind === "design") {
      setPhase("feedback");
      return;
    }

    let correct: boolean;
    if (exercise.kind === "choice") {
      correct = selected === exercise.correctIndex;
    } else if (exercise.kind === "input") {
      correct = exercise.accept(inputValue);
    } else if (exercise.kind === "code") {
      setPhase("checking");
      const graded = await exercise.grade(codeValue);
      setCheckResults(graded.results);
      correct = graded.passed;
    } else {
      // Practice topics never contain multi-file exercises.
      correct = false;
    }

    setWasCorrect(correct);
    setSession((s) => ({ answered: s.answered + 1, correct: s.correct + (correct ? 1 : 0) }));
    recordAnswer(owner.topicId, exercise.genId, correct);
    setPhase("feedback");
  }

  const canCheck =
    exercise !== null &&
    phase === "answering" &&
    (exercise.kind === "choice"
      ? selected !== null
      : exercise.kind === "input"
        ? inputValue.trim().length > 0
        : exercise.kind === "design"
          ? true
          : codeValue.trim().length > 0);

  // Design self-grade: fraction of rubric points ticked; pass at ≥ 60%.
  const designScore =
    exercise?.kind === "design" && exercise.rubric.length > 0
      ? rubricTicks.length / exercise.rubric.length
      : 0;
  const designPassed = designScore >= 0.6;

  function toggleRubric(i: number) {
    setRubricTicks((ticks) =>
      ticks.includes(i) ? ticks.filter((t) => t !== i) : [...ticks, i],
    );
  }

  /** mm:ss remaining against the design's budget (negative → overtime). */
  function timeLeft(minutes: number): { label: string; over: boolean } {
    const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
    const remaining = minutes * 60 - elapsed;
    const over = remaining < 0;
    const abs = Math.abs(remaining);
    const mm = String(Math.floor(abs / 60)).padStart(2, "0");
    const ss = String(abs % 60).padStart(2, "0");
    return { label: `${over ? "+" : ""}${mm}:${ss}`, over };
  }

  const ownerTopicId = (id: string) =>
    pool.find((e) => e.generator.id === id)?.topicId ?? "";

  return (
    <div className="flex flex-col gap-6">
      {/* Session header */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <h1 className="font-semibold">{meta.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{headerSubtitle}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-6 text-sm">
          {session.answered > 0 && (
            <p className="text-slate-500 dark:text-slate-400">
              Session:{" "}
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {session.correct}/{session.answered}
              </span>
            </p>
          )}
          <div className="w-36">
            <MasteryBar
              accuracy={accuracy(headerAttempts, headerCorrect)}
              attempts={headerAttempts}
            />
          </div>
        </div>
      </div>

      {/* Review complete */}
      {phase === "done" && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 px-6 py-16 text-center dark:border-emerald-500/30 dark:bg-emerald-500/5">
          <span className="text-4xl">🎉</span>
          <h2 className="text-lg font-semibold">Review complete</h2>
          <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
            You cleared all {reviewTotal} due {reviewTotal === 1 ? "item" : "items"} —{" "}
            {session.correct} right out of {session.answered}. Items you missed are due
            again soon; the rest step further out. Come back tomorrow.
          </p>
          <div className="flex gap-3">
            <Link
              href="/practice"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              All topics
            </Link>
            <Link
              href="/practice/mixed"
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
            >
              Keep going — mixed
            </Link>
          </div>
        </div>
      )}

      {/* Idle state */}
      {phase === "idle" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          {isReview && dueNow === 0 ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <span className="text-3xl">✅</span>
              <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
                Nothing is due for review right now — you&apos;re caught up. New items
                become due a day after you first learn them; come back tomorrow, or
                practice a topic to add more to the schedule.
              </p>
              <Link
                href="/practice"
                className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
              >
                Practice a topic
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
                {meta.blurb}{" "}
                {isReview
                  ? `${dueNow} ${dueNow === 1 ? "item is" : "items are"} waiting.`
                  : "Quiz questions regenerate with fresh numbers; ✍️ code exercises are written in the editor and checked like a judge."}
              </p>
              <button
                type="button"
                onClick={nextExercise}
                className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
              >
                {isReview ? `Start review (${dueNow})` : "Start practicing"}
              </button>
              <Link
                href={meta.docHref}
                className="text-xs text-cyan-700 hover:underline dark:text-cyan-400"
              >
                {isReview || isMixed
                  ? meta.docLabel
                  : `Read the guide first: ${meta.docLabel}`}
              </Link>
            </div>
          )}

          {/* Per-exercise-type breakdown (single-topic only) */}
          {!isMixed && !isReview && (
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Exercise types in this set
              </p>
              <ul className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                {pool.map((entry) => {
                  const s = genStatsFor(entry);
                  const acc = accuracy(s?.attempts ?? 0, s?.correct ?? 0);
                  const isCode = entry.generator.id.includes("-code");
                  return (
                    <li
                      key={entry.generator.id}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <span className="text-slate-600 dark:text-slate-400">
                        {isCode && <span title="code-writing exercise">✍️ </span>}
                        {entry.generator.title}
                      </span>
                      <span
                        className={`shrink-0 font-mono text-xs ${
                          acc === null
                            ? "text-slate-400"
                            : acc >= 80
                              ? "text-emerald-600 dark:text-emerald-400"
                              : acc >= 50
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {acc === null ? "new" : `${acc}% · ${s?.attempts}×`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Build bridge (single-topic only) */}
          {!isMixed && !isReview && bridge && <BuildBridgePanel bridge={bridge} />}
        </div>
      )}

      {/* Question card */}
      {exercise && (phase === "answering" || phase === "checking" || phase === "feedback") && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          {(isMixed || isReview) && (
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-cyan-700 dark:text-cyan-400">
              {getTopic(ownerTopicId(exercise.genId))?.title}
            </p>
          )}
          <p className="whitespace-pre-wrap text-sm leading-7">
            <RichText text={exercise.prompt} />
          </p>

          {exercise.kind !== "code" && exercise.code && (
            <CodeBlock
              code={exercise.code}
              language={exercise.codeLang ?? "text"}
              className="mt-4"
            />
          )}

          {/* Answer area */}
          {exercise.kind === "choice" ? (
            <div className="mt-5 flex flex-col gap-2">
              {exercise.options.map((option, i) => {
                const isSelected = selected === i;
                const isCorrect = i === exercise.correctIndex;
                const inFeedback = phase === "feedback";
                const feedbackClass = inFeedback
                  ? isCorrect
                    ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10"
                    : isSelected
                      ? "border-rose-400 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-500/10"
                      : "border-slate-200 opacity-60 dark:border-slate-700"
                  : isSelected
                    ? "border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500 dark:border-cyan-400 dark:bg-cyan-500/10 dark:ring-cyan-400"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/50";
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={inFeedback}
                    onClick={() => setSelected(i)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${feedbackClass}`}
                  >
                    <span className="mr-2 font-mono text-xs text-slate-400">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <RichText text={option} />
                    {inFeedback && isCorrect && (
                      <span className="ml-2 text-emerald-600 dark:text-emerald-400">✓</span>
                    )}
                    {inFeedback && isSelected && !isCorrect && (
                      <span className="ml-2 text-rose-600 dark:text-rose-400">✗</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : exercise.kind === "input" ? (
            <div className="mt-5">
              <input
                type="text"
                value={inputValue}
                disabled={phase === "feedback"}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canCheck) void check();
                }}
                placeholder={exercise.placeholder}
                autoFocus
                className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
              />
              {phase === "feedback" && (
                <p className="mt-2 text-sm">
                  {wasCorrect ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ✓ Correct — <RichText text={exercise.answer} />
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400">
                      ✗ Your answer: <code className="font-mono">{inputValue}</code> · correct:{" "}
                      <RichText text={exercise.answer} />
                    </span>
                  )}
                </p>
              )}
            </div>
          ) : exercise.kind === "code" ? (
            <div className="mt-5 flex flex-col gap-3">
              <CodePracticeEditor
                value={codeValue}
                language={exercise.language}
                onChange={setCodeValue}
                disabled={phase !== "answering"}
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={phase !== "answering"}
                  onClick={() => setCodeValue(exercise.starter)}
                  className="text-xs text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50 dark:hover:text-slate-300"
                >
                  ↺ Reset to starter
                </button>
                <p className="text-xs text-slate-400">
                  Tab indents · checked like a judge on submit
                </p>
              </div>

              {checkResults.length > 0 && (
                <ul className="flex flex-col gap-1.5 rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                  {checkResults.map((result) => (
                    <li key={result.label} className="flex items-start gap-2 text-xs">
                      <span className={result.passed ? "text-emerald-500" : "text-rose-500"}>
                        {result.passed ? "✓" : "✗"}
                      </span>
                      <span className="flex-1 text-slate-600 dark:text-slate-300">
                        <RichText text={result.label} />
                        {result.detail && (
                          <span className="ml-1 font-mono text-slate-400">
                            — {result.detail}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : exercise.kind === "design" ? (
            <div className="mt-5 flex flex-col gap-4">
              {/* Requirements to pin down before drawing */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Requirements &amp; constraints — pin these down first
                </p>
                <ul className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {exercise.constraints.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="text-cyan-500">•</span>
                      <span className="flex-1">
                        <RichText text={c} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Countdown + scratchpad (answering only) */}
              {phase !== "feedback" &&
                (() => {
                  const t = timeLeft(exercise.minutes);
                  return (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-lg border px-3 py-1.5 font-mono text-sm tabular-nums ${
                            t.over
                              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
                              : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          ⏱ {t.label}
                          {t.over && <span className="ml-1 text-xs">overtime</span>}
                        </span>
                        <p className="text-xs text-slate-400">
                          {exercise.minutes}-min whiteboard budget · run the framework out loud
                        </p>
                      </div>
                      <textarea
                        value={designNotes}
                        onChange={(e) => setDesignNotes(e.target.value)}
                        placeholder="Scratchpad (not graded): requirements → estimation → API/data → happy-path diagram → name the bottleneck → apply one tool → what breaks next? → trade-offs…"
                        rows={10}
                        autoFocus
                        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm leading-6 outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950"
                      />
                    </>
                  );
                })()}

              {/* Worked reference + self-grade (feedback only) */}
              {phase === "feedback" && (
                <>
                  <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Worked reference design
                    </p>
                    <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                      <RichText text={exercise.solution} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Self-grade — tick every point you actually covered
                      </p>
                      <span
                        className={`font-mono text-xs font-semibold ${
                          designPassed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {rubricTicks.length}/{exercise.rubric.length} ·{" "}
                        {designPassed ? "pass" : "re-drill"}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {exercise.rubric.map((item, i) => {
                        const ticked = rubricTicks.includes(i);
                        return (
                          <li key={item.point}>
                            <button
                              type="button"
                              onClick={() => toggleRubric(i)}
                              className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                                ticked
                                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                                  ticked
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-slate-300 dark:border-slate-600"
                                }`}
                                aria-hidden
                              >
                                {ticked ? "✓" : ""}
                              </span>
                              <span className="flex-1">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {item.point}
                                </span>
                                <span className="mt-0.5 block text-xs leading-6 text-slate-500 dark:text-slate-400">
                                  <RichText text={item.detail} />
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            {phase === "feedback" ? (
              <button
                type="button"
                onClick={advance}
                autoFocus
                className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
              >
                {isReview
                  ? reviewQueue && reviewQueue.length > 0
                    ? `${exercise.kind === "design" ? "Record & next" : "Next"} (${reviewQueue.length} left) →`
                    : `${exercise.kind === "design" ? "Record & finish" : "Finish"} review →`
                  : exercise.kind === "design"
                    ? "Record & next →"
                    : "Next question →"}
              </button>
            ) : (
              <button
                type="button"
                disabled={!canCheck}
                onClick={() => void check()}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {phase === "checking" && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {phase === "checking"
                  ? "Judging…"
                  : exercise.kind === "code"
                    ? "Submit code"
                    : exercise.kind === "design"
                      ? "Reveal model answer →"
                      : "Check"}
              </button>
            )}
          </div>

          {/* Feedback: the why (+ model solution for code) */}
          {phase === "feedback" && (
            <div
              className={`mt-5 rounded-lg border p-4 ${
                (exercise.kind === "design" ? designPassed : wasCorrect)
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                  : exercise.kind === "design"
                    ? "border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/5"
                    : "border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/5"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {exercise.kind === "design"
                  ? "How to grade yourself"
                  : wasCorrect
                    ? "Why this is right"
                    : "What went wrong — and why"}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
                <RichText text={exercise.explanation} />
              </p>
              {exercise.kind === "code" && (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Model solution
                  </p>
                  <CodeBlock code={exercise.solution} language={exercise.language} />
                </div>
              )}
              <Link
                href={`/guides/${exercise.docRef.slug}`}
                className="mt-3 inline-block text-xs font-medium text-cyan-700 hover:underline dark:text-cyan-400"
              >
                📖 Read more: {exercise.docRef.label}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
