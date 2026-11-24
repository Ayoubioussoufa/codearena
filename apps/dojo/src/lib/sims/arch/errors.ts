/** An error travels outward: adapter, service, filter. What does each one do? */
import { at, type Trace, type TraceMove } from "../engines";

const ADAPTER: readonly TraceMove[] = [
  { id: "translate", label: "Catch it, throw my own error" },
  { id: "null", label: "Return null: there's no such row" },
  { id: "pass", label: "Let it through" },
  { id: "swallow", label: "Log it and carry on" },
];
const SERVICE: readonly TraceMove[] = [
  { id: "pass", label: "Let it through" },
  { id: "notfound", label: "Throw NotFound: this use case needs it" },
  { id: "domain", label: "Throw the domain error" },
  { id: "swallow", label: "Catch everything, return undefined" },
];
const STATUS: readonly TraceMove[] = ["200", "404", "409", "500", "503"].map((id) => ({ id, label: id }));

interface Case {
  name: string;
  story: string;
  adapter: string;
  service: string;
  status: string;
  note: string;
}
const CASES: readonly Case[] = [
  { name: "1. A taken email", story: "The database refuses the insert: P2002, unique constraint on email.", adapter: "translate", service: "pass", status: "409", note: "P2002 never left the adapter, and the client got an answer it can act on." },
  { name: "2. No such slug", story: "The query runs fine and finds nothing.", adapter: "null", service: "notfound", status: "404", note: "\"No row\" is an answer. Whether that's a problem is for the use case to say." },
  { name: "3. The database is down", story: "connect ECONNREFUSED 127.0.0.1:5432. Your app has a DatabaseUnavailable error for this.", adapter: "translate", service: "pass", status: "503", note: "Not the client's fault, not a bug in your code, and worth trying again later." },
  { name: "4. Too late", story: "The database is fine, so the adapter returned the contest. But it has already started, and the rule says nobody can join now.", adapter: "ok", service: "domain", status: "409", note: "A rule of the business, thrown by the code that knows the rule." },
  { name: "5. A bug", story: "TypeError: Cannot read properties of undefined (reading 'map'), in the adapter's own code.", adapter: "pass", service: "pass", status: "500", note: "Logged with its stack, and fixed on Monday. A caught bug is a hidden bug." },
];
export interface ErrorState {
  story: string;
  adapter: string;
  service: string;
  answer: string;
  note: string;
  /** 0 adapter, 1 service, 2 filter, 3 done. */
  layer: number;
}
export const LAYERS = ["adapters/", "application/", "the filter"] as const;

export const errorTrace: Trace<ErrorState> = {
  levels: CASES.map((c) => c.name),
  start(level) {
    const c = at(CASES, level);
    return { story: c.story, adapter: c.adapter, service: c.service, answer: c.status, note: c.note, layer: c.adapter === "ok" ? 1 : 0 };
  },
  moves: (s) => (s.layer === 0 ? ADAPTER : s.layer === 1 ? SERVICE : s.layer === 2 ? STATUS : []),
  correct: (s) => (s.layer === 0 ? [s.adapter] : s.layer === 1 ? [s.service] : s.layer === 2 ? [s.answer] : []),
  apply: (s) => ({ ...s, layer: s.layer + 1 }),
  why(s, move) {
    if (move === "swallow") return "Then nobody ever knows, and the caller thinks it worked.";
    if (s.layer === 0) {
      if (move === "translate") return s.adapter === "null" ? "Nothing failed: the query answered. An empty answer has a simpler word." : "You'd hide a bug behind a name that sounds planned.";
      if (move === "null") return "null means \"looked, and not there\". That isn't what happened.";
      return s.adapter === "null" ? "There's no error to let through." : "Then the vendor's vocabulary reaches your use case.";
    }
    if (s.layer === 1) {
      if (move === "pass") return s.service === "notfound" ? "A null is on its way to the controller, and this action can't go on without the row." : "Nobody has refused yet, and the rule says someone must.";
      if (move === "notfound") return "Something was found, or something broke. \"Not found\" would be a lie.";
      return "No business rule was broken here.";
    }
    if (move === "200") return "Nothing went well.";
    if (move === "500") return "500 means it's a bug in our code. This one was expected.";
    if (s.answer === "500") return "That status promises we know what happened. We don't.";
    return "Whose move is it now: the client's, to change something? Ours? Or later, to try again?";
  },
  say: (s) => (s.layer < 3 ? `The error is in ${at(LAYERS, s.layer)}.${s.layer === 2 ? " Which status?" : " What do you do with it?"}` : `${s.answer}. ${s.note}`),
  done: (s) => s.layer >= 3,
};
