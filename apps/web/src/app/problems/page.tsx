"use client";
/**
 * src/app/problems/page.tsx — Problem list
 * TODOs: 1 — THE ENTIRE PAGE IS YOURS. Nothing here is scaffolded on purpose.
 * Skill target: (practice - React hooks) useState/useEffect for fetching,
 * filtering and sorting data.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NOTE: You asked me to build this one for you as a reference. I've left
 * "👉 REVIEW" comments on the ideas worth internalizing so next time you can
 * reach for them yourself. The shape to remember for ALL list UIs is:
 *
 *     raw data (state)  →  filter → filter → sort  →  render
 *                          └────────── derived, recomputed each render ──────┘
 *
 * You keep ONE piece of state per control (search / difficulty / tag / sort)
 * and never store the filtered result — you compute it. That's why the
 * controls "combine" for free and never reset each other.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useProblems } from "@/hooks/use-problems";
import type { Difficulty } from "@/lib/types";
import { DifficultyBadge } from "@/components/DifficultyBadge";

type DifficultyFilter = "All" | Difficulty;
type SortKey = "id" | "acceptance" | "title";

const DIFFICULTY_FILTERS: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard"];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "id", label: "Number" },
  { key: "acceptance", label: "Acceptance" },
  { key: "title", label: "Title (A–Z)" },
];

export default function ProblemsPage() {
  // 👉 REVIEW: this replaced useState + useEffect + an unmount guard. The
  // cache is shared, so navigating away and back is a HIT, not a refetch —
  // watch it happen in the Devtools panel. `data` is undefined while loading,
  // exactly like the old state, so the skeleton below is unchanged.
  const { data: problems, isError } = useProblems();

  // One state per control. They're independent, so they naturally combine.
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [tag, setTag] = useState<string | null>(null); // selected algorithm/topic
  const [sort, setSort] = useState<SortKey>("id");

  // 👉 REVIEW: no unmount guard needed any more. TanStack owns the request
  // lifecycle, so a response arriving after you navigate away updates the
  // cache rather than a dead component.

  // 👉 REVIEW: derive the topic list from the DATA, not a hardcoded array.
  // Add problems (or dojo categories) and these counts update themselves —
  // that's the "it can be expanded" requirement, for free. useMemo just
  // avoids recounting 350 problems on every keystroke.
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of problems ?? []) {
      for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [problems]);

  // 👉 REVIEW: the whole pipeline in one derived value. Note `.slice()` before
  // `.sort()` — sort mutates in place, and you must never mutate the array
  // held in state. Filtering first returns a fresh array, so the slice is
  // belt-and-suspenders / documents the intent.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (problems ?? [])
      .filter((p) => p.title.toLowerCase().includes(q)) // case-insensitive search
      .filter((p) => difficulty === "All" || p.difficulty === difficulty)
      .filter((p) => tag === null || p.tags.includes(tag))
      .slice() // copy so the sort below can't touch state
      .sort((a, b) => {
        if (sort === "acceptance") return b.acceptanceRate - a.acceptanceRate;
        if (sort === "title") return a.title.localeCompare(b.title);
        return a.id - b.id;
      });
  }, [problems, search, difficulty, tag, sort]);

  // With a cache there are now three states, not two: loading, failed, loaded.
  // The old code could not distinguish "still fetching" from "the request
  // died" — both left `problems` undefined forever.
  const loading = problems === undefined && !isError;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Problems</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {isError
            ? "Could not reach the API."
            : loading
              ? "Loading the problem set…"
              : `${problems?.length ?? 0} problems · ${visible.length} shown`}
        </p>
      </header>

      {/* Controls: search + difficulty + sort. Stacks on phones, row on sm+. */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problems…"
          aria-label="Search problems by title"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:max-w-xs"
        />

        {/* 👉 REVIEW: a segmented control. Each button just sets its own value —
            no e.currentTarget.value gymnastics needed when you map literals. */}
        <div className="flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700">
          {DIFFICULTY_FILTERS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                difficulty === d
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 sm:ml-auto">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Two-column layout: topic list + table. Sidebar drops below on phones. */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <TopicList
          topics={topics}
          selected={tag}
          onSelect={setTag}
          total={problems?.length ?? 0}
          loading={loading}
        />

        <div className="min-w-0 flex-1">
          {loading ? (
            <SkeletonRows />
          ) : visible.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No problems match your filters.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              {/* Header row — hidden on the smallest screens to save width. */}
              <div className="hidden grid-cols-[3rem_1fr_6rem_6rem] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 sm:grid">
                <span>#</span>
                <span>Title</span>
                <span className="text-right">Accept.</span>
                <span className="text-right">Level</span>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {visible.map((p) => (
                  <li key={p.slug}>
                    {/* 👉 REVIEW: the WHOLE row is the link (big tap target),
                        and the grid template keeps columns aligned across
                        rows — flex+gap wouldn't line up. */}
                    <Link
                      href={`/problems/${p.slug}`}
                      className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 sm:grid-cols-[3rem_1fr_6rem_6rem]"
                    >
                      <span className="font-mono text-xs text-slate-400">{p.id}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {p.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {p.tags.join(" · ")}
                        </span>
                      </span>
                      <span className="hidden text-right text-sm tabular-nums text-slate-500 dark:text-slate-400 sm:block">
                        {p.acceptanceRate}%
                      </span>
                      <span className="text-right">
                        <DifficultyBadge difficulty={p.difficulty} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Topic / algorithm list (LeetCode-style, counts derived from data) ──
   👉 REVIEW: a "controlled" child — it owns no state (except its own expand
   toggle). It takes the selected tag + an onSelect callback and reports
   clicks upward. The filter state lives in ONE place (the page); this just
   renders and notifies. */
function TopicList({
  topics,
  selected,
  onSelect,
  total,
  loading,
}: {
  topics: { name: string; count: number }[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
  total: number;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  // Collapses the whole panel on phones; on lg+ the sidebar is always open.
  const [open, setOpen] = useState(false);
  const COLLAPSED = 8;
  const shown = expanded ? topics : topics.slice(0, COLLAPSED);

  return (
    <aside className="w-full shrink-0 lg:w-64">
      {/* Heading doubles as a show/hide toggle below lg. The chevron and the
          onClick only matter on phones — on lg the panel below ignores `open`. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wide text-slate-500 lg:pointer-events-none"
      >
        Algorithms
        <span
          className={`transition-transform lg:hidden ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {loading ? (
        <p className="text-sm text-slate-400">Counting…</p>
      ) : (
        <div
          className={`${open ? "flex" : "hidden"} flex-wrap gap-2 lg:flex lg:flex-col lg:gap-1`}
        >
          <TopicChip
            label="All topics"
            count={total}
            active={selected === null}
            onClick={() => onSelect(null)}
          />
          {shown.map((t) => (
            <TopicChip
              key={t.name}
              label={t.name}
              count={t.count}
              active={selected === t.name}
              // Clicking the active topic again clears it — a nice toggle.
              onClick={() => onSelect(selected === t.name ? null : t.name)}
            />
          ))}
          {topics.length > COLLAPSED && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 self-start text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {expanded ? "Show less" : `Show ${topics.length - COLLAPSED} more`}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

function TopicChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      <span className="truncate">{label}</span>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums ${
          active
            ? "bg-blue-500/40 text-white"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* Loading skeleton — placeholder rows while the ~700 ms fetch is in flight. */
function SkeletonRows() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: 8 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-3 bg-white px-4 py-4 dark:bg-slate-950"
          >
            <span className="h-4 w-6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <span className="h-4 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <span className="h-5 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          </li>
        ))}
      </ul>
    </div>
  );
}
