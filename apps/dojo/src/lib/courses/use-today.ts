"use client";

import { useSyncExternalStore } from "react";
import { localISO } from "./schedule";

const noop = () => () => {};

/**
 * Today's local date on the client; null during SSR and the first paint, so
 * the server render never guesses the visitor's date (no hydration mismatch).
 */
export function useToday(): string | null {
  return useSyncExternalStore(noop, () => localISO(), () => null);
}
