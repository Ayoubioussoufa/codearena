/**
 * Local "done" store for the /build map (localStorage + useSyncExternalStore).
 * Lets you check tasks off by hand so the map shows what you've finished —
 * separate from the live TODO scan, which only shrinks once a marker is
 * actually deleted from the code. Keys are content-based (file + skill + note)
 * so a checkmark survives line-number shifts as you edit code above it.
 */
"use client";

import { useSyncExternalStore } from "react";

const KEY = "dojo-build-done-v1";
const EVENT = "dojo-build-done-changed";

/** Map of task-key → true. Absent/false means not done. */
export type DoneMap = Record<string, boolean>;

const EMPTY: DoneMap = {};

/** Stable id for a task, independent of its current line number. */
export function taskKey(parts: { file?: string; skill: string; note?: string }): string {
  return [parts.file ?? "", parts.skill, parts.note ?? ""].join("::");
}

/* ── store plumbing (mirrors progress.ts) ── */

let cacheRaw: string | null = null;
let cacheValue: DoneMap = EMPTY;

function read(): DoneMap {
  const raw = localStorage.getItem(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    if (raw === null) {
      cacheValue = EMPTY;
    } else {
      try {
        cacheValue = JSON.parse(raw) as DoneMap;
      } catch {
        cacheValue = EMPTY;
      }
    }
  }
  return cacheValue;
}

function write(map: DoneMap) {
  localStorage.setItem(KEY, JSON.stringify(map));
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

function getServerSnapshot(): DoneMap {
  return EMPTY;
}

/** Live done-map; empty during SSR/first paint. */
export function useBuildDone(): DoneMap {
  return useSyncExternalStore(subscribe, read, getServerSnapshot);
}

/** Flip a task between done and not-done. */
export function toggleBuildDone(key: string) {
  const prev = read();
  const next = { ...prev };
  if (next[key]) delete next[key];
  else next[key] = true;
  write(next);
}
