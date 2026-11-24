"use client";
import { useReducer, useState } from "react";
import { at } from "@/lib/sims/engines";
import { COMMITS, RANGE, TESTS, culprit, found, test } from "@/lib/sims/git/bisect";
import { DANGER, UNDO } from "@/lib/sims/git/decks";
import { GRAPH, ancestors, git, type GraphState } from "@/lib/sims/git/graph";
import { LEASE_START, leaseReducer, leaseWon } from "@/lib/sims/git/lease";
import { PLACES, placesStuck, run, short } from "@/lib/sims/git/places";
import { RESCUE, RESCUE_PASS } from "@/lib/sims/git/rescue";
import { conflictTrace, syncTrace } from "@/lib/sims/git/traces";
import { Canvas } from "../Canvas";
import { CardStation, CaseStation, Exhibit, LevelTabs, TraceStation } from "../engines";
import { SimFrame } from "../SimFrame";
import { Btn, Check, Say, Stat } from "../ui";

/** The two letters as git colours them: staged green, unstaged red. */
function Letters({ code }: { code: string }) {
  const blank = <span className="text-slate-400">·</span>;
  const red = "text-rose-700 dark:text-rose-400";
  const [left, right] = [code.charAt(0), code.charAt(1)];
  return (
    <>
      {left === " " ? blank : <span className={left === "?" ? red : "text-emerald-700 dark:text-emerald-400"}>{left}</span>}
      {right === " " ? blank : <span className={red}>{right}</span>}
    </>
  );
}

const NO_LEVEL = { name: "", goal: "", commands: [], win: "" } as const;

export function Places() {
  const [level, setLevel] = useState(0);
  const [s, setS] = useState(() => at(PLACES, 0).start);
  const [solved, setSolved] = useState<readonly boolean[]>(PLACES.map(() => false));
  const l = PLACES[level];
  const won = l?.won(s) ?? false;
  const stuck = l ? placesStuck(l, s) : false;

  function open(i: number) {
    const next = PLACES[i];
    if (!next) return;
    setLevel(i);
    setS(next.start);
  }
  function type(command: string) {
    if (!l) return;
    const next = run(s, command);
    setS(next);
    if (l.won(next)) setSolved(solved.map((x, i) => x || i === level));
  }
  const version = (v: number) => (v === 0 ? "·" : `v${v}`);
  return (
    <SimFrame
      id="places"
      won={solved.every(Boolean)}
      onReset={() => {
        open(0);
        setSolved(PLACES.map(() => false));
      }}
    >
      <LevelTabs names={PLACES.map((x) => x.name)} solved={solved} level={level} onOpen={open} />
      <p className="text-sm">{(l ?? NO_LEVEL).goal}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-72 text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
              {["status", "file", "on disk", "index", "last commit"].map((h) => (
                <th key={h} scope="col" className="px-2 py-1 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {s.files.map((x) => (
              <tr key={x.name} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-2 py-1.5 font-semibold">{short(x).trim() === "" ? <span className="font-normal text-slate-500 dark:text-slate-400">clean</span> : <Letters code={short(x)} />}</td>
                <td className="px-2 py-1.5">{x.name}</td>
                <td className={`px-2 py-1.5 ${x.work !== x.index ? "text-rose-700 dark:text-rose-400" : ""}`}>{version(x.work)}</td>
                <td className={`px-2 py-1.5 ${x.index !== x.head ? "text-emerald-700 dark:text-emerald-400" : ""}`}>{version(x.index)}</td>
                <td className="px-2 py-1.5">{version(x.head)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Left letter: staged. Right letter: not staged. A dot stands for the space git prints.</p>
      <p className="font-mono text-sm text-slate-600 dark:text-slate-400">
        ## main...origin/main{s.ahead > 0 ? ` [ahead ${s.ahead}]` : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {(l ?? NO_LEVEL).commands.map((c) => (
          <Btn key={c} onClick={() => type(c)} disabled={won || stuck}>
            <span className="font-mono">{c}</span>
          </Btn>
        ))}
        <Btn onClick={() => open(level)}>Restart this level</Btn>
        {won && level < PLACES.length - 1 && (
          <Btn kind="main" onClick={() => open(level + 1)}>
            Next level →
          </Btn>
        )}
      </div>
      <Say tone={won ? "ok" : stuck ? "bad" : "plain"}>{won ? (l ?? NO_LEVEL).win : s.log === "" ? "Nothing has happened yet." : `${s.log}.${stuck ? " Git never had a copy. Restart this level." : ""}`}</Say>
    </SimFrame>
  );
}

function History({ s }: { s: GraphState }) {
  const tips = Object.values(s.branches);
  const alive = new Set(tips.flatMap((t) => ancestors(s, t)));
  const width = Math.max(300, 70 * s.commits.length + 10);
  const x = (i: number) => 40 + i * ((width - 80) / Math.max(1, s.commits.length - 1));
  return (
    <Canvas
      id="git-graph"
      width={width}
      height={170}
      label="The commit graph"
      edges={s.commits.flatMap((c) => c.parents.map((p) => ({ from: c.id, to: p, arrow: true })))}
      nodes={s.commits.map((c, i) => {
        const labels = Object.entries(s.branches).filter(([, t]) => t === c.id).map(([b]) => (b === s.head ? `${b}*` : b));
        return { id: c.id, x: x(i), y: c.lane === 0 ? 45 : 115, label: c.id, note: labels.length > 0 ? labels.join(" ") : undefined, tone: !alive.has(c.id) ? ("ghost" as const) : labels.length > 0 ? ("next" as const) : ("open" as const) };
      })}
    />
  );
}

export function Graph() {
  const [level, setLevel] = useState(0);
  const [s, setS] = useState<GraphState>(() => at(GRAPH, 0).start);
  const [solved, setSolved] = useState<readonly boolean[]>(GRAPH.map(() => false));
  const l = GRAPH[level];
  const won = l?.won(s) ?? false;

  function open(i: number) {
    const next = GRAPH[i];
    if (!next) return;
    setLevel(i);
    setS(next.start);
  }
  function type(command: string) {
    if (!l) return;
    const next = git(s, command);
    setS(next);
    if (l.won(next)) setSolved(solved.map((x, i) => x || i === level));
  }
  return (
    <SimFrame
      id="graph"
      won={solved.every(Boolean)}
      onReset={() => {
        open(0);
        setSolved(GRAPH.map(() => false));
      }}
    >
      <LevelTabs names={GRAPH.map((x) => x.name)} solved={solved} level={level} onOpen={open} />
      <p className="text-sm">{(l ?? NO_LEVEL).goal}</p>
      <History s={s} />
      <p className="text-sm text-slate-600 dark:text-slate-400">
        You&apos;re on <strong className="font-mono">{s.head}</strong>. Arrows point to the parent. Everyone has pulled {s.shared.join(" and ")}.
      </p>
      <div className="flex flex-wrap gap-2">
        {(l ?? NO_LEVEL).commands.map((c) => (
          <Btn key={c} onClick={() => type(c)} disabled={won || s.commits.length > 12}>
            <span className="font-mono">{c}</span>
          </Btn>
        ))}
        <Btn onClick={() => open(level)}>Restart this level</Btn>
        {won && level < GRAPH.length - 1 && (
          <Btn kind="main" onClick={() => open(level + 1)}>
            Next level →
          </Btn>
        )}
      </div>
      <Say tone={won ? "ok" : s.broke ? "bad" : "plain"}>{won ? (l ?? NO_LEVEL).win : s.log === "" ? "Type a command." : s.log}</Say>
    </SimFrame>
  );
}

export function Conflict() {
  return (
    <TraceStation id="conflict" trace={conflictTrace}>
      {(s) => (
        <>
          <p className="text-sm">{s.story}</p>
          <Exhibit>{s.kept === null ? `<<<<<<< ${s.topLabel}\n${s.top}\n=======\n${s.bottom}\n>>>>>>> ${s.bottomLabel}` : [s.kept !== "bottom" && s.top, s.kept !== "top" && s.bottom].filter(Boolean).join("\n")}</Exhibit>
        </>
      )}
    </TraceStation>
  );
}

export const Undo = () => <CardStation id="undo" deck={UNDO} />;
export const Danger = () => <CardStation id="danger" deck={DANGER} />;

export function Lease() {
  const [s, send] = useReducer(leaseReducer, LEASE_START);
  return (
    <SimFrame id="lease" won={leaseWon(s)} onReset={() => send("reset")}>
      <div className="grid gap-2 sm:grid-cols-3">
        {([["GitHub's feature", s.remote], ["Your note: origin/feature", s.note], ["Your feature", s.local]] as const).map(([name, commits]) => (
          <div key={name} className="rounded-lg border-2 border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">{name}</p>
            <p className="font-mono text-sm font-semibold">
              {commits.map((c) => (
                <span key={c} className={c === "Sara" ? "text-amber-700 dark:text-amber-400" : ""}>
                  {c}{" "}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => send("teammate")}>Sara pushes a commit</Btn>
        <Btn onClick={() => send("fetch")}>The editor fetches</Btn>
      </div>
      <div className="flex flex-wrap gap-2">
        {([["force", "git push --force"], ["lease", "git push --force-with-lease"], ["named", "git push --force-with-lease=feature:Y"]] as const).map(([id, label]) => (
          <Btn key={id} kind="danger" onClick={() => send(id)}>
            <span className="break-all font-mono">{label}</span>
          </Btn>
        ))}
        <Btn onClick={() => send("again")}>Another evening</Btn>
      </div>
      <Say tone={s.tone === "info" ? "plain" : s.tone}>{s.log}</Say>
      <ul className="flex flex-col gap-1">
        <Check done={s.seen.lost}>--force lost Sara&apos;s commit</Check>
        <Check done={s.seen.saved}>The lease refused, and saved it</Check>
        <Check done={s.seen.fooled}>A background fetch fooled the lease</Check>
        <Check done={s.seen.named}>With the hash named, even that fetch couldn&apos;t</Check>
      </ul>
    </SimFrame>
  );
}

export function Bisect() {
  const [seed, setSeed] = useState(7);
  const [range, setRange] = useState(RANGE);
  const [tests, setTests] = useState<readonly number[]>([]);
  const [wins, setWins] = useState(0);
  const over = found(range);

  function pick(i: number) {
    if (over || i <= range.good || i >= range.bad) return;
    const next = test(range, i, seed);
    setRange(next);
    setTests([...tests, i]);
    if (found(next) && tests.length + 1 <= TESTS) setWins(wins + 1);
  }
  function again() {
    setSeed(seed + 1);
    setRange(RANGE);
    setTests([]);
  }
  return (
    <SimFrame
      id="bisect"
      won={wins >= 2}
      onReset={() => {
        setSeed(7);
        setRange(RANGE);
        setTests([]);
        setWins(0);
      }}
    >
      <p className="text-sm">{COMMITS} commits, oldest first. The first works and the last is broken. Click a commit to test it.</p>
      <div className="grid grid-cols-8 gap-1 sm:grid-cols-[repeat(16,minmax(0,1fr))]">
        {Array.from({ length: COMMITS }, (_, i) => {
          const good = i <= range.good, bad = i >= range.bad, tested = tests.includes(i) || i === 0 || i === COMMITS - 1;
          return (
            <button
              key={i}
              type="button"
              disabled={over || good || bad}
              onClick={() => pick(i)}
              aria-label={`Commit ${i}${good ? ", good" : bad ? ", bad" : ""}`}
              className={`grid aspect-square place-items-center rounded font-mono text-xs ${over && i === range.bad ? "bg-rose-700 text-white ring-2 ring-rose-900 dark:ring-rose-300" : good ? (tested ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300") : bad ? (tested ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300") : "border border-slate-300 bg-white hover:border-cyan-600 dark:border-slate-700 dark:bg-slate-900"}`}
            >
              {i}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Tests used" value={`${tests.length} of ${TESTS}`} tone={tests.length > TESTS ? "bad" : "plain"} />
        <Stat label="Suspects left" value={String(range.bad - range.good)} />
        <Stat label="Found in time" value={`${Math.min(wins, 2)} of 2`} tone={wins >= 2 ? "ok" : "plain"} />
      </div>
      <Say tone={over ? (tests.length <= TESTS ? "ok" : "warn") : "plain"}>{over ? `Commit ${culprit(seed)} broke it. ${tests.length <= TESTS ? `${tests.length} tests.` : `${tests.length} tests is too many: halve the suspects each time.`}` : "Which commit do you test?"}</Say>
      {over && (
        <div>
          <Btn kind="main" onClick={again}>
            Another bug →
          </Btn>
        </div>
      )}
    </SimFrame>
  );
}

export function Sync() {
  return (
    <TraceStation id="sync" trace={syncTrace}>
      {(s) => (
        <div className="grid gap-2 sm:grid-cols-3">
          {([["main on GitHub", s.github], ["origin/main, your note", s.note], ["your main", s.local]] as const).map(([name, n]) => (
            <div key={name} className={`rounded-lg border-2 px-3 py-2 ${n < s.github ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40" : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"}`}>
              <p className="text-xs text-slate-500 dark:text-slate-400">{name}</p>
              <p className="font-mono text-sm font-semibold">commit {n}</p>
            </div>
          ))}
          <p className="text-sm sm:col-span-3">
            You&apos;re on <strong className="font-mono">{s.onMain ? "main" : "feature"}</strong>. The branch feature: {s.branch === "local+remote" ? "here and on GitHub" : s.branch === "remote" ? "on GitHub only" : "gone"}. The PR: {s.merged ? "merged" : "open"}.
          </p>
        </div>
      )}
    </TraceStation>
  );
}

export function Rescue() {
  return <CaseStation id="rescue" cases={RESCUE} pass={RESCUE_PASS} noun="Call" ask="What do you type?" endings={{ perfect: "Nothing was lost that could be found.", won: "The team sleeps better with you around.", lost: `You need ${RESCUE_PASS}. Reread the lessons of the red ones, press Reset, and take the calls again.` }} />;
}
