/**
 * Local progress store (localStorage) with a useSyncExternalStore hook.
 * Tracks per-topic and per-generator accuracy (feeds adaptive selection),
 * a calendar-day practice streak, and per-item spaced-repetition scheduling
 * (an FSRS-lite stability ladder — the dojo practising what Phase 3 preaches).
 */
"use client";

import { useSyncExternalStore } from "react";
import type { TopicId } from "./engine/types";

const KEY = "dojo-progress-v1";
const EVENT = "dojo-progress-changed";

export interface GenStats {
  attempts: number;
  correct: number;
  /** FSRS-lite stability in days (0 = relearning). Absent = never scheduled. */
  stability?: number;
  /** ISO day (yyyy-mm-dd) this item next becomes due for review. */
  due?: string;
  /** ISO day it was last reviewed. */
  last?: string;
}

export interface TopicStats {
  attempts: number;
  correct: number;
  generators: Record<string, GenStats>;
}

export interface Progress {
  topics: Partial<Record<TopicId, TopicStats>>;
  totalAttempts: number;
  totalCorrect: number;
  streak: { current: number; best: number; lastDate: string | null };
}

export const EMPTY_PROGRESS: Progress = {
  topics: {},
  totalAttempts: 0,
  totalCorrect: 0,
  streak: { current: 0, best: 0, lastDate: null },
};

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + Math.round(days));
  return d.toISOString().slice(0, 10);
}

/* ── spaced repetition (FSRS-lite) ──
   A correct review multiplies the stability (days-until-due) by EASE, so the
   interval ladder is 1 → 2.2 → 4.8 → 10.6 → 23 → 51 → 112 (capped). A miss
   resets stability to 0 (due immediately) so the item resurfaces right away.
   Reviewing when it's already due is what grows retention — same idea the
   Phase 3 FSRS guide teaches. */

const REVIEW_EASE = 2.2;
const MAX_STABILITY_DAYS = 120;

export interface Schedule {
  stability: number;
  due: string;
  last: string;
}

export function scheduleAfter(
  prevStability: number,
  correct: boolean,
  todayISO: string,
): Schedule {
  if (!correct) {
    return { stability: 0, due: todayISO, last: todayISO };
  }
  const stability =
    prevStability < 1
      ? 1
      : Math.min(MAX_STABILITY_DAYS, Math.round(prevStability * REVIEW_EASE));
  return { stability, due: addDays(todayISO, stability), last: todayISO };
}

/**
 * A seen item is "due" once it's been scheduled and its due date has arrived.
 * An attempted-but-unscheduled item (no `due` — e.g. after resetReviews()) is
 * NOT due: unscheduled means "not in the review queue", mirroring attempts===0.
 */
export function isDue(stats: GenStats, todayISO: string): boolean {
  if (stats.attempts === 0) return false;
  if (stats.due === undefined) return false;
  return stats.due <= todayISO;
}

export interface DueEntry {
  topicId: TopicId;
  genId: string;
  /** Negative = overdue by N days, 0 = due today. */
  overdueDays: number;
}

function daysBetween(fromISO: string, toISO: string): number {
  const from = Date.parse(fromISO + "T00:00:00Z");
  const to = Date.parse(toISO + "T00:00:00Z");
  return Math.round((to - from) / 86_400_000);
}

/** Every seen-and-due item across all topics, most overdue first. */
export function dueList(progress: Progress, todayISO: string): DueEntry[] {
  const entries: DueEntry[] = [];
  for (const topicId of Object.keys(progress.topics) as TopicId[]) {
    const topic = progress.topics[topicId];
    if (!topic) continue;
    for (const [genId, stats] of Object.entries(topic.generators)) {
      if (!isDue(stats, todayISO)) continue;
      const due = stats.due ?? todayISO;
      entries.push({ topicId, genId, overdueDays: daysBetween(todayISO, due) });
    }
  }
  return entries.sort((a, b) => a.overdueDays - b.overdueDays);
}

/* ── store plumbing ── */

let cacheRaw: string | null = null;
let cacheValue: Progress = EMPTY_PROGRESS;

function read(): Progress {
  const raw = localStorage.getItem(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    if (raw === null) {
      cacheValue = EMPTY_PROGRESS;
    } else {
      try {
        cacheValue = JSON.parse(raw) as Progress;
      } catch {
        cacheValue = EMPTY_PROGRESS;
      }
    }
  }
  return cacheValue;
}

function write(progress: Progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getServerSnapshot(): Progress {
  return EMPTY_PROGRESS;
}

/** Live progress; EMPTY_PROGRESS during SSR/first paint. */
export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, getServerSnapshot);
}

/* ── mutations ── */

export function recordAnswer(topicId: TopicId, genId: string, correct: boolean) {
  const prev = read();
  const topic: TopicStats = prev.topics[topicId] ?? {
    attempts: 0,
    correct: 0,
    generators: {},
  };
  const gen: GenStats = topic.generators[genId] ?? { attempts: 0, correct: 0 };

  const t = today();
  const schedule = scheduleAfter(gen.stability ?? 0, correct, t);

  const nextTopic: TopicStats = {
    attempts: topic.attempts + 1,
    correct: topic.correct + (correct ? 1 : 0),
    generators: {
      ...topic.generators,
      [genId]: {
        attempts: gen.attempts + 1,
        correct: gen.correct + (correct ? 1 : 0),
        stability: schedule.stability,
        due: schedule.due,
        last: schedule.last,
      },
    },
  };

  let streak = prev.streak;
  if (streak.lastDate !== t) {
    const current = streak.lastDate === yesterday() ? streak.current + 1 : 1;
    streak = { current, best: Math.max(streak.best, current), lastDate: t };
  }

  write({
    topics: { ...prev.topics, [topicId]: nextTopic },
    totalAttempts: prev.totalAttempts + 1,
    totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
    streak,
  });
}

export function resetProgress() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Reset ONLY the spaced-repetition schedule: strip every item's stability/due/
 * last so the due queue empties, while keeping attempts/correct (mastery bars,
 * accuracy) and the streak untouched. Items get rescheduled the next time you
 * answer them.
 */
export function resetReviews() {
  const prev = read();
  const topics: Progress["topics"] = {};
  for (const [topicId, topic] of Object.entries(prev.topics)) {
    if (!topic) continue;
    const generators: Record<string, GenStats> = {};
    for (const [genId, gen] of Object.entries(topic.generators)) {
      // Keep the counts; drop the scheduling fields (stability/due/last).
      generators[genId] = { attempts: gen.attempts, correct: gen.correct };
    }
    topics[topicId as TopicId] = {
      attempts: topic.attempts,
      correct: topic.correct,
      generators,
    };
  }
  write({ ...prev, topics });
}

/* ── derived helpers (pure) ── */

export function accuracy(attempts: number, correct: number): number | null {
  return attempts === 0 ? null : Math.round((correct / attempts) * 100);
}

/** Unseen generators score 2.5; often-missed ones up to 3.5; mastered ones 1. */
export function generatorWeight(stats: GenStats | undefined): number {
  if (!stats || stats.attempts === 0) return 2.5;
  const wrongRate = (stats.attempts - stats.correct) / stats.attempts;
  return 1 + 2.5 * wrongRate;
}

/**
 * Adaptive "bag" order: a weighted shuffle WITHOUT replacement. Every
 * generator appears exactly once per cycle (no repeats until the whole pool
 * has been drawn), with unseen/struggling ones tending toward the front.
 */
export function weightedBagOrder(
  generatorIds: string[],
  statsFor: (id: string) => GenStats | undefined,
  random: () => number,
): string[] {
  const items = generatorIds.map((id) => ({ id, w: generatorWeight(statsFor(id)) }));
  const order: string[] = [];
  while (items.length > 0) {
    const total = items.reduce((sum, item) => sum + item.w, 0);
    let roll = random() * total;
    let picked = items.length - 1;
    for (let i = 0; i < items.length; i++) {
      roll -= (items[i] as { w: number }).w;
      if (roll <= 0) {
        picked = i;
        break;
      }
    }
    order.push((items[picked] as { id: string }).id);
    items.splice(picked, 1);
  }
  return order;
}
