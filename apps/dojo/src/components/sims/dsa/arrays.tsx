"use client";
import { bsearchTrace, dpTrace, hashingTrace, mid, nextgreaterTrace, pointersTrace, windowTrace } from "@/lib/sims/dsa/arrays";
import type { ReactNode } from "react";
import { Cells } from "../Canvas";
import { TraceStation } from "../engines";

const Row = ({ name, children }: { name: string; children: ReactNode }) => (
  <p className="text-sm">
    <span className="text-slate-500 dark:text-slate-400">{name}: </span>
    <span className="font-mono font-semibold">{children}</span>
  </p>
);

export function Hashing() {
  return (
    <TraceStation id="hashing" trace={hashingTrace}>
      {(s) => (
        <>
          <p className="text-sm">Two numbers that add up to <strong>{s.target}</strong>, in one pass.</p>
          <Cells label="The array" cells={s.nums.map((x, i) => ({ text: String(x), mark: i === s.i && s.answer === null ? "▲" : String(i), tone: Array.isArray(s.answer) && s.answer.includes(i) ? "hit" : i === s.i && s.answer === null ? "in" : i < s.i ? "off" : "plain" }))} />
          <Row name="The map">{s.seen.size === 0 ? "empty" : [...s.seen].map(([v, i]) => `${v} → ${i}`).join(", ")}</Row>
        </>
      )}
    </TraceStation>
  );
}

export function Pointers() {
  return (
    <TraceStation id="pointers" trace={pointersTrace}>
      {(s) => (
        <>
          <p className="text-sm">The array is sorted. Find two numbers that add up to <strong>{s.target}</strong>.</p>
          <Cells label="The sorted array" cells={s.nums.map((x, i) => ({ text: String(x), mark: i === s.l && i === s.r ? "L R" : i === s.l ? "L" : i === s.r ? "R" : "", tone: s.end === "found" && (i === s.l || i === s.r) ? "hit" : i < s.l || i > s.r ? "off" : i === s.l || i === s.r ? "in" : "plain" }))} />
        </>
      )}
    </TraceStation>
  );
}

export function WindowStation() {
  return (
    <TraceStation id="window" trace={windowTrace}>
      {(s) => (
        <>
          <p className="text-sm">The longest run of letters with no repeat.</p>
          <Cells label="The text" cells={[...s.text].map((ch, i) => ({ text: ch, mark: i === s.l && s.r > s.l ? "start" : i === s.r - 1 && s.r > s.l ? "end" : "", tone: i >= s.l && i < s.r ? "in" : "plain" }))} />
          <Row name="Best so far">{s.best === "" ? "none" : `${s.best} (${s.best.length})`}</Row>
        </>
      )}
    </TraceStation>
  );
}

export function NextGreater() {
  return (
    <TraceStation id="nextgreater" trace={nextgreaterTrace}>
      {(s) => (
        <>
          <p className="text-sm">For each number, find the first bigger one to its right. Keep the ones still waiting on a stack.</p>
          <Cells label="The array, with each answer found below" cells={s.nums.map((x, i) => ({ text: String(x), mark: s.answers[i] !== null ? `→ ${s.answers[i]}` : s.over ? "none" : i === s.i ? "▲" : "", tone: s.answers[i] !== null ? "hit" : s.stack.includes(i) ? "in" : "plain" }))} />
          <Row name="Waiting (top on the right)">{s.stack.length === 0 ? "empty" : s.stack.map((i) => s.nums[i]).join("  ")}</Row>
        </>
      )}
    </TraceStation>
  );
}

export function BSearch() {
  return (
    <TraceStation id="bsearch" trace={bsearchTrace}>
      {(s) => {
        const m = mid(s);
        return (
          <>
            <p className="text-sm">{s.story}</p>
            <Cells
              label="The range"
              cells={s.labels.map((x, i) => {
                const marks = [i === s.lo && "lo", i === m && s.lo !== s.hi && "mid", i === s.hi && "hi"].filter(Boolean).join(" ");
                return { text: x, mark: marks, tone: s.over && i === s.lo ? "hit" : i < s.lo || i > s.hi ? "off" : i === m && s.lo !== s.hi ? "in" : "plain" };
              })}
            />
          </>
        );
      }}
    </TraceStation>
  );
}

export function Dp() {
  return (
    <TraceStation id="dp" trace={dpTrace}>
      {(s) => {
        const at = s.table.length;
        return (
          <>
            <p className="text-sm">
              Coins: <strong>{s.coins.join(", ")}</strong>. Fill in the fewest coins for each amount.
            </p>
            <Cells
              label="Fewest coins for each amount"
              cells={Array.from({ length: s.amount + 1 }, (_, i) => {
                const v = s.table[i];
                return { text: v === undefined ? (i === at ? "?" : "") : v === null ? "✗" : String(v), mark: String(i), tone: i === at ? "in" : v === undefined ? "off" : i === s.amount ? "hit" : "plain" };
              })}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">✗ means impossible.</p>
          </>
        );
      }}
    </TraceStation>
  );
}
