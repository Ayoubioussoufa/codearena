/**
 * DSA progress store (localStorage, separate from concept progress). Tracks
 * per-problem solved state, attempt count, and your last submitted code so the
 * editor restores your draft.
 */
"use client";

import { useSyncExternalStore } from "react";

const KEY = "dojo-dsa-v1";
const EVENT = "dojo-dsa-changed";

export interface ProblemProgress {
  solved: boolean;
  attempts: number;
  code?: string;
}

export interface DsaProgress {
  problems: Record<string, ProblemProgress>;
}

export const EMPTY_DSA: DsaProgress = { problems: {} };

let cacheRaw: string | null = null;
let cacheValue: DsaProgress = EMPTY_DSA;

function read(): DsaProgress {
  const raw = localStorage.getItem(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    if (raw === null) {
      cacheValue = EMPTY_DSA;
    } else {
      try {
        cacheValue = JSON.parse(raw) as DsaProgress;
      } catch {
        cacheValue = EMPTY_DSA;
      }
    }
  }
  return cacheValue;
}

function write(next: DsaProgress) {
  localStorage.setItem(KEY, JSON.stringify(next));
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

function getServerSnapshot(): DsaProgress {
  return EMPTY_DSA;
}

export function useDsaProgress(): DsaProgress {
  return useSyncExternalStore(subscribe, read, getServerSnapshot);
}

/** Record a run/submit: bumps attempts, latches solved, saves the draft. */
export function recordDsaAttempt(slug: string, solved: boolean, code: string) {
  const prev = read();
  const p = prev.problems[slug] ?? { solved: false, attempts: 0 };
  write({
    problems: {
      ...prev.problems,
      [slug]: {
        solved: p.solved || solved,
        attempts: p.attempts + 1,
        code,
      },
    },
  });
}

export function resetDsaProgress() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function solvedCount(progress: DsaProgress, slugs: string[]): number {
  return slugs.reduce((n, s) => n + (progress.problems[s]?.solved ? 1 : 0), 0);
}
