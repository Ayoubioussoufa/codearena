/** Two replicas, one cable. Choose what happens when the cable is cut. */
export type Side = "A" | "B";
export type Mode = "CP" | "AP";
export interface CapState {
  mode: Mode;
  cut: boolean;
  value: Record<Side, string>;
  /** Order of the last write on each side, to settle conflicts. */
  clock: Record<Side, number>;
  /** Wrote while the cable was cut. */
  dirty: Record<Side, boolean>;
  writes: number;
  log: { text: string; tone: "ok" | "bad" | "info" }[];
  seen: { refused: boolean; disagree: boolean; lost: boolean };
}
export type CapAction =
  | { type: "mode"; mode: Mode }
  | { type: "cut" }
  | { type: "heal" }
  | { type: "write"; side: Side }
  | { type: "read"; side: Side }
  | { type: "reset" };

export const CAP_START: CapState = {
  mode: "CP",
  cut: false,
  value: { A: "v0", B: "v0" },
  clock: { A: 0, B: 0 },
  dirty: { A: false, B: false },
  writes: 0,
  log: [],
  seen: { refused: false, disagree: false, lost: false },
};
const other = (s: Side): Side => (s === "A" ? "B" : "A");

export function capReducer(s: CapState, a: CapAction): CapState {
  const say = (next: CapState, text: string, tone: "ok" | "bad" | "info" = "info"): CapState => ({ ...next, log: [{ text, tone }, ...next.log].slice(0, 5) });
  switch (a.type) {
    case "reset":
      return { ...CAP_START, seen: s.seen, mode: s.mode };
    case "mode":
      return say({ ...CAP_START, seen: s.seen, mode: a.mode }, `New system, in ${a.mode} mode. Both sides hold v0.`);
    case "cut":
      return s.cut ? s : say({ ...s, cut: true }, "✂ The cable is cut. A and B can't hear each other.");
    case "write": {
      if (s.cut && s.mode === "CP" && a.side === "B") {
        return say({ ...s, seen: { ...s.seen, refused: true } }, "B refuses the write: it can't reach the majority.", "bad");
      }
      const n = s.writes + 1;
      const v = `v${n}`;
      const base: CapState = { ...s, writes: n, value: { ...s.value, [a.side]: v }, clock: { ...s.clock, [a.side]: n } };
      if (!s.cut) {
        return say({ ...base, value: { A: v, B: v }, clock: { A: n, B: n } }, `${a.side} writes ${v}, and copies it to ${other(a.side)}.`, "ok");
      }
      const dirty = { ...s.dirty, [a.side]: true };
      const disagree = base.value.A !== base.value.B && s.mode === "AP";
      return say(
        { ...base, dirty, seen: { ...s.seen, disagree: s.seen.disagree || disagree } },
        s.mode === "AP" ? `${a.side} accepts ${v}, alone. ${other(a.side)} still says ${s.value[other(a.side)]}.` : `A accepts ${v}: it holds the majority.`,
        s.mode === "AP" ? "bad" : "ok",
      );
    }
    case "read": {
      if (s.cut && s.mode === "CP" && a.side === "B") {
        return say({ ...s, seen: { ...s.seen, refused: true } }, "B refuses the read: its copy might be old.", "bad");
      }
      const disagree = s.value.A !== s.value.B;
      return say(
        { ...s, seen: { ...s.seen, disagree: s.seen.disagree || (disagree && s.mode === "AP") } },
        `${a.side} answers ${s.value[a.side]}${disagree && s.mode === "AP" ? `, while ${other(a.side)} would answer ${s.value[other(a.side)]}` : ""}.`,
        disagree && s.mode === "AP" ? "bad" : "ok",
      );
    }
    case "heal": {
      if (!s.cut) return s;
      const winner: Side = s.clock.A >= s.clock.B ? "A" : "B";
      const v = s.value[winner];
      const n = s.clock[winner];
      const lost = s.dirty.A && s.dirty.B;
      const next: CapState = {
        ...s,
        cut: false,
        value: { A: v, B: v },
        clock: { A: n, B: n },
        dirty: { A: false, B: false },
        seen: { ...s.seen, lost: s.seen.lost || lost },
      };
      return lost
        ? say(next, `Reconnected. Last write wins: ${v} stays, and ${s.value[other(winner)]} from ${other(winner)} is gone.`, "bad")
        : say(next, `Reconnected. Both sides agree on ${v}.`, "ok");
    }
  }
}

export const capWon = (s: CapState) => s.seen.refused && s.seen.disagree && s.seen.lost;
