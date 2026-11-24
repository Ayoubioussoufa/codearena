/** The shapes shared by many stations: traces, decks of cards, and picks. */

/** "You are the algorithm": a state, the moves on offer, and the right ones. */
export interface TraceMove {
  id: string;
  label: string;
}
export interface Trace<S> {
  /** One name per level. */
  levels: readonly string[];
  start(level: number): S;
  moves(s: S): readonly TraceMove[];
  /** The moves the algorithm would make (ties allow several). Empty when done. */
  correct(s: S): readonly string[];
  apply(s: S, move: string): S;
  /** Why a wrong move is wrong. */
  why(s: S, move: string): string;
  /** Where we are, in a sentence. */
  say(s: S): string;
  done(s: S): boolean;
}

/** A deck: each card has one answer, from its own options or the deck's. */
export interface Card {
  text: string;
  answer: string;
  why: string;
  options?: readonly string[];
}
export interface Deck {
  ask: string;
  options: readonly string[];
  cards: readonly Card[];
  pass: number;
}

/** Pick exactly the right lines, level by level. */
export interface PickItem {
  id: string;
  label: string;
  /** Shown once the level is checked. */
  why: string;
}
export interface PickLevel {
  name: string;
  story: string;
  exhibit?: string;
  items: readonly PickItem[];
  right: readonly string[];
}

/** An item that must exist: a station's own data is never out of range. */
export function at<T>(xs: readonly T[], i: number): T {
  const x = xs[i];
  if (x === undefined) throw new Error(`no item ${i} of ${xs.length}`);
  return x;
}
export function swapped<T>(xs: readonly T[], i: number, j: number): T[] {
  const next = [...xs];
  [next[i], next[j]] = [at(xs, j), at(xs, i)];
  return next;
}
