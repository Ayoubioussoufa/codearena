/**
 * Coding tracks — the "build it from scratch" section (/coding).
 *
 * Unlike Practice (which mixes quiz + code and is graded like a quiz), a track
 * is an ORDERED ladder of write-the-code tasks whose difficulty strictly
 * ascends across five levels. You start at level 1; clearing every task in a
 * level (passing it at least once) unlocks the next. Because each track holds
 * many hand-authored tasks, the ladder is meant to be climbed a little each
 * morning — the more days you practise, the harder the tasks you're served.
 *
 * Progress is tracked per track under its own TopicId (coding-*), kept separate
 * from the conceptual quiz topics so the two never pollute each other.
 */
import type { Generator, TopicId } from "./types";
import type { GenStats } from "../progress";

import { reactHooksTrack } from "./coding/react-hooks";
import { nextjsTrack } from "./coding/nextjs";
import { javascriptTrack } from "./coding/javascript";
import { typescriptTrack } from "./coding/typescript";
import { tailwindTrack } from "./coding/tailwind";
import { javaTrack } from "./coding/java";
import { springBootTrack } from "./coding/spring-boot";
import { nestjsTrack } from "./coding/nestjs";
import { systemDesignCodingTrack } from "./coding/system-design";
import { testingTrack } from "./coding/testing";
import { pythonTrack } from "./coding/python";

/** 1..5 — the difficulty rung a task sits on. */
export type Level = 1 | 2 | 3 | 4 | 5;

export const LEVELS: { n: Level; name: string; blurb: string }[] = [
  { n: 1, name: "Warm-up", blurb: "Syntax and the smallest working shape." },
  { n: 2, name: "Core", blurb: "The everyday patterns you reach for daily." },
  { n: 3, name: "Applied", blurb: "Realistic pieces wired together." },
  { n: 4, name: "Advanced", blurb: "Edge cases, correctness and the sharp traps." },
  { n: 5, name: "Expert", blurb: "The stuff that separates fluent from functional." },
];

export interface CodingExercise {
  level: Level;
  gen: Generator;
}

export interface CodingTrack {
  /** Route slug under /coding/… AND the progress TopicId (must match). */
  id: TopicId;
  title: string;
  icon: string;
  /** Short language/stack label, e.g. "TypeScript · React". */
  stack: string;
  blurb: string;
  /** Ordered by ascending difficulty. */
  exercises: CodingExercise[];
}

export const CODING_TRACKS: CodingTrack[] = [
  javascriptTrack,
  typescriptTrack,
  reactHooksTrack,
  nextjsTrack,
  tailwindTrack,
  testingTrack,
  pythonTrack,
  javaTrack,
  springBootTrack,
  nestjsTrack,
  systemDesignCodingTrack,
];

export function getTrack(id: string): CodingTrack | undefined {
  return CODING_TRACKS.find((t) => t.id === id);
}

export function maxLevel(track: CodingTrack): Level {
  return track.exercises.reduce<Level>((m, e) => (e.level > m ? e.level : m), 1);
}

/**
 * How far the learner has climbed. A level counts as "cleared" once every task
 * on it has been passed at least once; `unlocked` is the first not-yet-cleared
 * level (what you're currently working through), capped at the track's top.
 */
export function trackProgress(
  track: CodingTrack,
  statsFor: (genId: string) => GenStats | undefined,
): { cleared: number; unlocked: Level; passed: number; total: number } {
  const top = maxLevel(track);
  const passedIds = new Set(
    track.exercises
      .filter((e) => (statsFor(e.gen.id)?.correct ?? 0) > 0)
      .map((e) => e.gen.id),
  );

  let cleared = 0;
  for (let lvl = 1 as Level; lvl <= top; lvl = (lvl + 1) as Level) {
    const inLevel = track.exercises.filter((e) => e.level === lvl);
    if (inLevel.length > 0 && inLevel.every((e) => passedIds.has(e.gen.id))) {
      cleared = lvl;
    } else {
      break;
    }
  }

  const unlocked = Math.min(top, cleared + 1) as Level;
  return { cleared, unlocked, passed: passedIds.size, total: track.exercises.length };
}
