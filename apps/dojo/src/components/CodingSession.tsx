/**
 * Coding session — plays one track as an ORDERED difficulty ladder.
 *
 * Every task is a write-the-code exercise, graded like a judge (static checks,
 * and real execution for JS/TS reducers). You're served the easiest task you
 * haven't passed yet; clearing every task on a level unlocks the next, so the
 * more you practise, the harder the tasks become. Progress is tracked under the
 * track's own coding-* TopicId, separate from the quiz topics.
 */
"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type {
  CodeCheckResult,
  CodeGradeResult,
  Exercise,
  MultiFileGradeResult,
} from "@/lib/engine/types";
import { Rng, freshSeed } from "@/lib/engine/rng";
import {
  getTrack,
  trackProgress,
  maxLevel,
  LEVELS,
  type CodingExercise,
} from "@/lib/engine/coding";
import { recordAnswer, useProgress, accuracy, type GenStats } from "@/lib/progress";
import { MasteryBar, RichText } from "./ui";
import { CodeBlock } from "./CodeBlock";
import { CodePracticeEditor } from "./CodePracticeEditor";
import { MultiFileEditor } from "./MultiFileEditor";
import { HintPanel } from "./HintPanel";

type Phase = "idle" | "answering" | "checking" | "feedback";

export function CodingSession({ trackId }: { trackId: string }) {
  const progress = useProgress();
  const track = getTrack(trackId);

  const [phase, setPhase] = useState<Phase>("idle");
  const [current, setCurrent] = useState<{ entry: CodingExercise; ex: Exercise } | null>(
    null,
  );
  const [codeValue, setCodeValue] = useState("");
  const [checkResults, setCheckResults] = useState<CodeCheckResult[]>([]);
  // Multi-file state: contents per file, the open tab, per-file debug results,
  // the whole-exercise result after submit, and which file is mid-debug.
  const [fileValues, setFileValues] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState("");
  const [fileResults, setFileResults] = useState<Record<string, CodeGradeResult>>({});
  const [multiResult, setMultiResult] = useState<MultiFileGradeResult | null>(null);
  const [debugging, setDebugging] = useState<string | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [session, setSession] = useState({ answered: 0, correct: 0 });
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const lastGenId = useRef<string | null>(null);
  const clearedBefore = useRef<number>(0);

  const statsFor = useMemo(
    () =>
      (genId: string): GenStats | undefined =>
        track ? progress.topics[track.id]?.generators[genId] : undefined,
    [progress, track],
  );

  if (!track) return null;

  const prog = trackProgress(track, statsFor);
  const top = maxLevel(track);
  const topicStats = progress.topics[track.id];
  const fullyCleared = prog.passed === prog.total;

  function pickNext(): CodingExercise | null {
    const t = track!;
    const p = trackProgress(t, statsFor);
    const candidates = t.exercises.filter((e) => e.level <= p.unlocked);
    const unpassed = candidates.filter((e) => (statsFor(e.gen.id)?.correct ?? 0) === 0);
    let pool = unpassed.length > 0 ? unpassed : candidates;
    if (pool.length > 1 && lastGenId.current) {
      const withoutRepeat = pool.filter((e) => e.gen.id !== lastGenId.current);
      if (withoutRepeat.length > 0) pool = withoutRepeat;
    }
    if (pool.length === 0) return null;
    // Easiest rung first, so difficulty strictly climbs as you clear tasks.
    const minLevel = Math.min(...pool.map((e) => e.level));
    const atMin = pool.filter((e) => e.level === minLevel);
    return atMin[Math.floor(Math.random() * atMin.length)] ?? null;
  }

  function nextExercise() {
    clearedBefore.current = trackProgress(track!, statsFor).cleared;
    setLevelUp(null);
    const entry = pickNext();
    if (!entry) return;
    const ex = entry.gen.generate(new Rng(freshSeed()));
    lastGenId.current = entry.gen.id;
    setCurrent({ entry, ex });
    setCodeValue(ex.kind === "code" ? ex.starter : "");
    if (ex.kind === "multi-file") {
      setFileValues(Object.fromEntries(ex.files.map((f) => [f.name, f.starter])));
      setActiveFile(ex.files[0]?.name ?? "");
    } else {
      setFileValues({});
      setActiveFile("");
    }
    setFileResults({});
    setMultiResult(null);
    setDebugging(null);
    setCheckResults([]);
    setPhase("answering");
  }

  /** Records a graded attempt and surfaces any level it just unlocked. */
  function recordPass(genId: string, passed: boolean) {
    setWasCorrect(passed);
    setSession((s) => ({
      answered: s.answered + 1,
      correct: s.correct + (passed ? 1 : 0),
    }));
    recordAnswer(track!.id, genId, passed);
    // A pass may have cleared a level — surface the unlock.
    if (passed) {
      const after = trackProgress(track!, (id) => {
        // Fold in the just-recorded pass so the check reflects it immediately.
        if (id === genId) {
          const prev = statsFor(id);
          return { attempts: (prev?.attempts ?? 0) + 1, correct: (prev?.correct ?? 0) + 1 };
        }
        return statsFor(id);
      });
      if (after.cleared > clearedBefore.current && after.cleared < top) {
        setLevelUp(after.cleared + 1);
      }
    }
    setPhase("feedback");
  }

  /** Submit — grades the whole exercise (single file, or every file together). */
  async function check() {
    if (!current || phase !== "answering") return;
    if (current.ex.kind === "code") {
      setPhase("checking");
      const graded = await current.ex.grade(codeValue);
      setCheckResults(graded.results);
      recordPass(current.ex.genId, graded.passed);
    } else if (current.ex.kind === "multi-file") {
      setPhase("checking");
      const graded = await current.ex.grade(fileValues);
      setMultiResult(graded);
      // Reflect each file's outcome on its tab dot.
      setFileResults(Object.fromEntries(graded.perFile.map((p) => [p.name, p.result])));
      recordPass(current.ex.genId, graded.passed);
    }
  }

  /** Debug a single file in isolation — the per-tab build/fix loop. */
  async function checkFile(name: string) {
    if (!current || current.ex.kind !== "multi-file" || phase !== "answering") return;
    setDebugging(name);
    const result = await current.ex.gradeFile(name, fileValues[name] ?? "");
    setFileResults((r) => ({ ...r, [name]: result }));
    setDebugging(null);
  }

  const canCheck =
    phase === "answering" &&
    (current?.ex.kind === "multi-file"
      ? current.ex.files.every((f) => (fileValues[f.name] ?? "").trim().length > 0)
      : codeValue.trim().length > 0);
  const fileStatus: Record<string, boolean | undefined> = Object.fromEntries(
    Object.entries(fileResults).map(([name, r]) => [name, r.passed]),
  );
  const activeFileResult: CodeGradeResult | undefined = fileResults[activeFile];
  const activeFileObj =
    current?.ex.kind === "multi-file"
      ? current.ex.files.find((f) => f.name === activeFile)
      : undefined;
  const submitLabel = current?.ex.kind === "multi-file" ? "Submit all files" : "Submit code";
  const levelName = (n: number) => LEVELS.find((l) => l.n === n)?.name ?? `Level ${n}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{track.icon}</span>
          <div>
            <h1 className="font-semibold">{track.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {track.stack} · {prog.passed}/{prog.total} tasks cleared
            </p>
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
              accuracy={accuracy(topicStats?.attempts ?? 0, topicStats?.correct ?? 0)}
              attempts={topicStats?.attempts ?? 0}
            />
          </div>
        </div>
      </div>

      {/* Level ladder */}
      <div className="flex flex-wrap gap-2">
        {LEVELS.filter((l) => l.n <= top).map((l) => {
          const state =
            l.n <= prog.cleared ? "cleared" : l.n === prog.unlocked ? "current" : "locked";
          const inLevel = track.exercises.filter((e) => e.level === l.n);
          const passedInLevel = inLevel.filter(
            (e) => (statsFor(e.gen.id)?.correct ?? 0) > 0,
          ).length;
          return (
            <div
              key={l.n}
              title={l.blurb}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                state === "cleared"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : state === "current"
                    ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300"
                    : "border-slate-200 text-slate-400 opacity-70 dark:border-slate-800"
              }`}
            >
              <span className="font-semibold">
                {state === "cleared" ? "✓ " : state === "locked" ? "🔒 " : ""}
                {l.n}. {l.name}
              </span>
              <span className="font-mono">
                {passedInLevel}/{inLevel.length}
              </span>
            </div>
          );
        })}
      </div>

      {/* Idle */}
      {phase === "idle" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
              {track.blurb} You&apos;ll be told exactly what to build; write it in the
              editor and it&apos;s checked like a judge. You&apos;re served the easiest task
              you haven&apos;t cleared yet — clear a whole level to unlock the next.
            </p>
            <button
              type="button"
              onClick={nextExercise}
              className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
            >
              {prog.passed === 0
                ? "Start building"
                : fullyCleared
                  ? "Keep practising"
                  : `Continue — ${levelName(prog.unlocked)}`}
            </button>
            {fullyCleared && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                🎉 You&apos;ve cleared every task in this track. Come back to keep them sharp.
              </p>
            )}
          </div>

          {/* Task list */}
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tasks in this track
            </p>
            <ul className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              {[...track.exercises]
                .sort((a, b) => a.level - b.level)
                .map((e) => {
                  const s = statsFor(e.gen.id);
                  const passed = (s?.correct ?? 0) > 0;
                  const locked = e.level > prog.unlocked;
                  return (
                    <li key={e.gen.id} className="flex items-baseline justify-between gap-3">
                      <span
                        className={
                          locked
                            ? "text-slate-400 dark:text-slate-600"
                            : "text-slate-600 dark:text-slate-400"
                        }
                      >
                        <span className="mr-1 font-mono text-xs text-slate-400">L{e.level}</span>
                        {locked && "🔒 "}
                        {e.gen.title}
                      </span>
                      <span
                        className={`shrink-0 font-mono text-xs ${
                          passed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        {passed ? "cleared" : locked ? "locked" : "todo"}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}

      {/* Task card */}
      {current && (phase === "answering" || phase === "checking" || phase === "feedback") && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-cyan-700 dark:text-cyan-400">
            <span className="rounded bg-cyan-100 px-1.5 py-0.5 dark:bg-cyan-500/15">
              Level {current.entry.level} · {levelName(current.entry.level)}
            </span>
            <span className="text-slate-400">{current.entry.gen.title}</span>
          </p>
          <p className="whitespace-pre-wrap text-sm leading-7">
            <RichText text={current.ex.prompt} />
          </p>

          {current.ex.kind === "code" && (
            <div className="mt-5 flex flex-col gap-3">
              <CodePracticeEditor
                value={codeValue}
                language={current.ex.language}
                onChange={setCodeValue}
                disabled={phase !== "answering"}
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={phase !== "answering"}
                  onClick={() =>
                    current.ex.kind === "code" && setCodeValue(current.ex.starter)
                  }
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
                          <span className="ml-1 font-mono text-slate-400">— {result.detail}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {phase !== "feedback" && (
                <HintPanel
                  key={current.ex.genId}
                  approach={current.ex.hint ?? current.ex.explanation}
                  answer={current.ex.solution}
                  answerLang={current.ex.language}
                />
              )}
            </div>
          )}

          {/* Multi-file workspace: tabs, per-file debug, submit all */}
          {current.ex.kind === "multi-file" && (
            <div className="mt-5 flex flex-col gap-3">
              <MultiFileEditor
                files={current.ex.files}
                values={fileValues}
                active={activeFile}
                onActiveChange={setActiveFile}
                onChange={(name, v) =>
                  setFileValues((cur) => ({ ...cur, [name]: v }))
                }
                disabled={phase !== "answering"}
                status={fileStatus}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={phase !== "answering" || debugging !== null}
                    onClick={() => void checkFile(activeFile)}
                    className="flex items-center gap-1.5 text-xs font-medium text-cyan-700 transition-colors hover:text-cyan-600 disabled:opacity-50 dark:text-cyan-400"
                  >
                    {debugging === activeFile ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-500/40 border-t-cyan-500" />
                    ) : (
                      <span aria-hidden>▶</span>
                    )}
                    Debug this file
                  </button>
                  <button
                    type="button"
                    disabled={phase !== "answering"}
                    onClick={() => {
                      if (current.ex.kind !== "multi-file") return;
                      const starter =
                        current.ex.files.find((f) => f.name === activeFile)?.starter ?? "";
                      setFileValues((cur) => ({ ...cur, [activeFile]: starter }));
                      setFileResults((r) => {
                        const next = { ...r };
                        delete next[activeFile];
                        return next;
                      });
                    }}
                    className="text-xs text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50 dark:hover:text-slate-300"
                  >
                    ↺ Reset file
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Debug each file · submit all when the feature is wired up
                </p>
              </div>

              {/* Active file's debug results */}
              {activeFileResult && activeFileResult.results.length > 0 && (
                <ul className="flex flex-col gap-1.5 rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                  <li className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {activeFile}
                  </li>
                  {activeFileResult.results.map((result) => (
                    <li key={result.label} className="flex items-start gap-2 text-xs">
                      <span className={result.passed ? "text-emerald-500" : "text-rose-500"}>
                        {result.passed ? "✓" : "✗"}
                      </span>
                      <span className="flex-1 text-slate-600 dark:text-slate-300">
                        <RichText text={result.label} />
                        {result.detail && (
                          <span className="ml-1 font-mono text-slate-400">— {result.detail}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Per-file hints for the open tab */}
              {phase !== "feedback" && activeFileObj && (
                <HintPanel
                  key={`${current.ex.genId}:${activeFileObj.name}`}
                  approach={activeFileObj.hint}
                  answer={activeFileObj.solution}
                  answerLang={activeFileObj.language}
                />
              )}

              {/* Cross-file wiring (populated on submit) */}
              {multiResult && multiResult.cross.length > 0 && (
                <ul className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <li className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Cross-file wiring
                  </li>
                  {multiResult.cross.map((result) => (
                    <li key={result.label} className="flex items-start gap-2 text-xs">
                      <span className={result.passed ? "text-emerald-500" : "text-rose-500"}>
                        {result.passed ? "✓" : "✗"}
                      </span>
                      <span className="flex-1 text-slate-600 dark:text-slate-300">
                        <RichText text={result.label} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            {phase === "feedback" ? (
              <button
                type="button"
                onClick={nextExercise}
                autoFocus
                className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
              >
                {fullyCleared ? "Practise another →" : "Next task →"}
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
                {phase === "checking" ? "Judging…" : submitLabel}
              </button>
            )}
          </div>

          {/* Level-up banner */}
          {phase === "feedback" && levelUp !== null && (
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                🔓 Level {levelUp} unlocked — {levelName(levelUp)}
              </p>
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">
                {LEVELS.find((l) => l.n === levelUp)?.blurb} The next tasks step up in
                difficulty.
              </p>
            </div>
          )}

          {/* Feedback: why + model solution */}
          {phase === "feedback" &&
            (current.ex.kind === "code" || current.ex.kind === "multi-file") && (
              <div
                className={`mt-5 rounded-lg border p-4 ${
                  wasCorrect
                    ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                    : "border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/5"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {wasCorrect ? "Nice — why it works" : "Not passing yet — here's why"}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
                  <RichText text={current.ex.explanation} />
                </p>
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Model solution
                  </p>
                  {current.ex.kind === "code" ? (
                    <CodeBlock code={current.ex.solution} language={current.ex.language} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {current.ex.files.map((file) => (
                        <div key={file.name}>
                          <p className="mb-1 font-mono text-[11px] text-slate-400">
                            {file.name}
                          </p>
                          <CodeBlock code={file.solution} language={file.language} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  href={`/guides/${current.ex.docRef.slug}`}
                  className="mt-3 inline-block text-xs font-medium text-cyan-700 hover:underline dark:text-cyan-400"
                >
                  📖 Read more: {current.ex.docRef.label}
                </Link>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
