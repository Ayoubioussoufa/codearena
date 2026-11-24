/** Which stations are stamped (localStorage), kept apart from course progress. */
"use client";

import { useSyncExternalStore } from "react";
import type { SimId } from "./catalog";

const KEY = "dojo-sims-v1";
const EVENT = "dojo-sims-changed";

/** Station id → the ISO date it was first cleared. */
export type Stamps = Partial<Record<SimId, string>>;

const EMPTY: Stamps = {};
let cacheRaw: string | null = null;
let cacheValue: Stamps = EMPTY;

function read(): Stamps {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cacheValue;
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cacheValue = raw === null ? EMPTY : (JSON.parse(raw) as Stamps);
    } catch {
      cacheValue = EMPTY;
    }
  }
  return cacheValue;
}

function write(next: Stamps) {
  cacheValue = next;
  try {
    const raw = JSON.stringify(next);
    localStorage.setItem(KEY, raw);
    cacheRaw = raw;
  } catch {
    // Storage blocked: stamps last until the page is closed.
  }
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

export function useStamps(): Stamps {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function stamp(id: SimId) {
  const prev = read();
  if (prev[id]) return;
  write({ ...prev, [id]: new Date().toISOString().slice(0, 10) });
}

export function clearStamps(ids: readonly SimId[]) {
  const next = { ...read() };
  for (const id of ids) delete next[id];
  write(next);
}
