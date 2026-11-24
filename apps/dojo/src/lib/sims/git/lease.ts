/** You rebased feature. Meanwhile, a teammate pushed to it. Now you push. */
export interface LeaseState {
  /** What's on GitHub's feature. */
  remote: readonly string[];
  /** Your note of it: what origin/feature says. */
  note: readonly string[];
  local: readonly string[];
  teammate: boolean;
  log: string;
  tone: "ok" | "bad" | "info";
  seen: { lost: boolean; saved: boolean; fooled: boolean; named: boolean };
}
export type LeaseAction = "teammate" | "fetch" | "force" | "lease" | "named" | "again" | "reset";
const OLD = ["A", "X", "Y"], MINE = ["A", "B", "X'", "Y'"];
export const LEASE_START: LeaseState = { remote: OLD, note: OLD, local: MINE, teammate: false, log: "You rebased feature onto main, so your push must replace what's on GitHub.", tone: "info", seen: { lost: false, saved: false, fooled: false, named: false } };
const same = (a: readonly string[], b: readonly string[]) => a.join() === b.join();

export function leaseReducer(s: LeaseState, a: LeaseAction): LeaseState {
  const pushed = (log: string, seen: Partial<LeaseState["seen"]>, tone: "ok" | "bad"): LeaseState => ({ ...s, remote: MINE, note: MINE, log, tone, seen: { ...s.seen, ...seen } });
  const destroys = s.remote.includes("Sara");
  const over = same(s.remote, MINE);
  switch (a) {
    case "reset":
      return LEASE_START;
    case "again":
      return { ...LEASE_START, seen: s.seen, log: "A new evening: you rebased feature again." };
    case "teammate":
      return s.teammate || over ? s : { ...s, teammate: true, remote: [...s.remote, "Sara"], log: "Sara pushed one commit to feature. Nothing told you.", tone: "info" };
    case "fetch":
      return { ...s, note: s.remote, log: "Your editor ran git fetch in the background. Your note of origin/feature is fresh, and you haven't looked at it.", tone: "info" };
    case "force":
      if (over) return { ...s, log: "Everything up-to-date.", tone: "info" };
      return destroys ? pushed("--force replaced everything. Sara's commit isn't on GitHub any more.", { lost: true }, "bad") : pushed("Replaced. You were lucky: nobody else had pushed.", {}, "ok");
    case "lease":
      if (over) return { ...s, log: "Everything up-to-date.", tone: "info" };
      if (!same(s.remote, s.note)) return { ...s, log: "! [rejected] feature (stale info). The remote isn't what your note says, so nothing was touched.", tone: "ok", seen: { ...s.seen, saved: s.seen.saved || destroys } };
      return destroys ? pushed("The lease compared GitHub with your note, and the note had Sara's commit. It let you through.", { fooled: true }, "bad") : pushed("Replaced, after checking that nothing had changed.", {}, "ok");
    case "named":
      if (over) return { ...s, log: "Everything up-to-date.", tone: "info" };
      if (!same(s.remote, OLD)) return { ...s, log: "! [rejected] feature (stale info). You said the remote should be at Y, and it isn't. A fetch can't change what you typed.", tone: "ok", seen: { ...s.seen, named: s.seen.named || (destroys && same(s.note, s.remote)) } };
      return pushed("Replaced: the remote was exactly where you said.", {}, "ok");
  }
}
export const leaseWon = (s: LeaseState) => s.seen.lost && s.seen.saved && s.seen.fooled && s.seen.named;
