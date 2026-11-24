"use client";
import { useMemo, useState } from "react";
import { KEY_COUNT, RING_GOAL, RING_START, hash, imbalance, keyName, moved, owners, points, type Strategy } from "@/lib/sims/ring";
import { SimFrame } from "./SimFrame";
import { Btn, Check, Say, Segmented, Stat } from "./ui";

const COLOURS = ["#0f766e", "#b45309", "#7c3aed", "#be123c", "#1d4ed8", "#4d7c0f"];
const NAMES = ["A", "B", "C", "D", "E", "F"];
const colour = (n: string) => COLOURS[NAMES.indexOf(n)] ?? "#64748b";
const DOTS = 150;
const spot = (h: number, r: number) => {
  const a = (h / 2 ** 32) * Math.PI * 2 - Math.PI / 2;
  return { x: Number((150 + Math.cos(a) * r).toFixed(2)), y: Number((150 + Math.sin(a) * r).toFixed(2)) };
};

export default function Ring() {
  const [strategy, setStrategy] = useState<Strategy>("modulo");
  const [nodes, setNodes] = useState<readonly string[]>(RING_START);
  const [last, setLast] = useState<{ moved: number; added: boolean } | null>(null);
  const [sawModulo, setSawModulo] = useState(false);
  const [even, setEven] = useState(false);
  const assigned = useMemo(() => owners(strategy, nodes), [strategy, nodes]);
  const balance = imbalance(assigned, nodes);

  function change(next: readonly string[], added: boolean) {
    const after = owners(strategy, next);
    const m = moved(assigned, after);
    setNodes(next);
    setLast({ moved: m, added });
    if (strategy === "modulo" && m > RING_GOAL.modulo) setSawModulo(true);
    if (added && m <= RING_GOAL.moved && imbalance(after, next) <= RING_GOAL.imbalance) setEven(true);
  }
  function pick(s: Strategy) {
    setStrategy(s);
    setNodes(RING_START);
    setLast(null);
  }
  const nextName = NAMES.find((n) => !nodes.includes(n));
  return (
    <SimFrame
      id="ring"
      won={sawModulo && even}
      onReset={() => {
        pick("modulo");
        setSawModulo(false);
        setEven(false);
      }}
    >
      <Segmented
        label="Which server holds a key?"
        value={strategy}
        options={[
          { value: "modulo", label: "hash % N" },
          { value: "ring", label: "Ring, one point each" },
          { value: "vnodes", label: "Ring, 100 virtual nodes" },
        ]}
        onChange={pick}
      />
      <div className="grid items-center gap-5 md:grid-cols-[18rem_1fr]">
        <svg viewBox="0 0 300 300" role="img" aria-label={`${KEY_COUNT} keys spread over ${nodes.length} servers`} className="mx-auto h-auto w-full max-w-72">
          {strategy !== "modulo" && <circle cx={150} cy={150} r={128} fill="none" strokeWidth={1.5} className="stroke-slate-300 dark:stroke-slate-700" />}
          {Array.from({ length: DOTS }, (_, i) => {
            const p = spot(hash(keyName(i)), 112);
            return <circle key={i} cx={p.x} cy={p.y} r={4} fill={colour(assigned[i] ?? "")} className="transition-[fill] duration-500" />;
          })}
          {strategy !== "modulo" &&
            points(strategy, nodes).map((q) => {
              const p = spot(q.at, 128);
              return <circle key={`${q.node}${q.at}`} cx={p.x} cy={p.y} r={strategy === "vnodes" ? 2.5 : 9} fill={colour(q.node)} stroke="white" strokeWidth={strategy === "vnodes" ? 0 : 2} />;
            })}
          <text x={150} y={156} textAnchor="middle" className="fill-slate-600 text-[15px] dark:fill-slate-300">
            {nodes.length} servers
          </text>
        </svg>
        <div className="flex flex-col gap-3">
          {nodes.map((n) => {
            const share = assigned.filter((o) => o === n).length / KEY_COUNT;
            return (
              <div key={n} className="grid grid-cols-[1.5rem_1fr_3.5rem] items-center gap-2 text-sm">
                <strong style={{ color: colour(n) }}>{n}</strong>
                <span className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, share * 160)}%`, background: colour(n) }} />
                </span>
                <span className="text-right font-mono">{(share * 100).toFixed(0)}%</span>
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <Btn kind="main" onClick={() => nextName && change([...nodes, nextName], true)} disabled={!nextName}>
              Add a server
            </Btn>
            <Btn kind="danger" onClick={() => change(nodes.slice(0, -1), false)} disabled={nodes.length <= 2}>
              Kill the last one
            </Btn>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Keys that just moved" value={last ? `${(last.moved * 100).toFixed(0)}%` : "no change yet"} tone={!last ? "plain" : last.moved > RING_GOAL.modulo ? "bad" : last.moved <= RING_GOAL.moved ? "ok" : "warn"} />
        <Stat label="Fullest server vs the average" value={`${balance.toFixed(2)}×`} tone={balance <= RING_GOAL.imbalance ? "ok" : "warn"} />
      </div>
      <ul className="flex flex-col gap-1">
        <Check done={sawModulo}>Watched hash % N move more than {RING_GOAL.modulo * 100}% of the keys</Check>
        <Check done={even}>
          Added a server moving {RING_GOAL.moved * 100}% or less, with shares within {RING_GOAL.imbalance}×
        </Check>
      </ul>
      <Say tone={last && strategy === "modulo" ? "bad" : even ? "ok" : "plain"}>
        {!last
          ? "Add a server and watch how many dots change colour. Each one is a cache miss."
          : strategy === "modulo"
            ? `${Math.round(last.moved * KEY_COUNT)} keys changed home, so ${Math.round(last.moved * KEY_COUNT)} reads go to the database at once.`
            : strategy === "ring"
              ? "Only the neighbours moved. But with one point each, the slices of the ring are luck: look at the shares."
              : "Only the new server's share moved, and a hundred small slices each make the shares even."}
      </Say>
    </SimFrame>
  );
}
