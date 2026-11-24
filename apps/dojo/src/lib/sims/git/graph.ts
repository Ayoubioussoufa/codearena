/** A tiny commit graph: enough Git to merge, rebase, pick and revert. */
export interface Commit {
  id: string;
  parents: readonly string[];
  /** The change it carries, which a rebase or a cherry-pick copies. */
  change: string;
  lane: number;
}
export interface GraphState {
  commits: readonly Commit[];
  branches: Readonly<Record<string, string>>;
  head: string;
  /** Branches other people have pulled. */
  shared: readonly string[];
  log: string;
  /** A shared branch was rewritten. */
  broke: boolean;
}
export interface GraphLevel {
  name: string;
  goal: string;
  start: GraphState;
  commands: readonly string[];
  won(s: GraphState): boolean;
  win: string;
}

const find = (s: GraphState, id: string): Commit => s.commits.find((c) => c.id === id) ?? { id, parents: [], change: id, lane: 0 };
const tip = (s: GraphState, branch: string): Commit => find(s, s.branches[branch] ?? "");
export function ancestors(s: GraphState, id: string): string[] {
  const seen: string[] = [];
  const walk = (x: string) => {
    if (seen.includes(x)) return;
    seen.push(x);
    find(s, x).parents.forEach(walk);
  };
  walk(id);
  return seen;
}
/** The branch from newest to oldest, following first parents. */
export function line(s: GraphState, branch: string): Commit[] {
  const out: Commit[] = [];
  let c: Commit | undefined = tip(s, branch);
  while (c) {
    out.push(c);
    const p: string | undefined = c.parents[0];
    c = p === undefined ? undefined : find(s, p);
  }
  return out;
}
const changes = (s: GraphState, branch: string) => line(s, branch).map((c) => c.change).reverse().join(" ");
const unique = (s: GraphState, id: string) => {
  let x = id;
  while (s.commits.some((c) => c.id === x)) x += "'";
  return x;
};
function append(s: GraphState, branch: string, change: string, id: string, parents: readonly string[]): GraphState {
  const name = unique(s, id);
  const lane = branch === "main" ? 0 : 1;
  return { ...s, commits: [...s.commits, { id: name, parents, change, lane }], branches: { ...s.branches, [branch]: name } };
}

export function git(s: GraphState, command: string): GraphState {
  const [, verb = "", arg = ""] = command.split(" ");
  const me = s.head;
  const mine = s.branches[me] ?? "";
  const say = (next: GraphState, log: string): GraphState => ({ ...next, log });
  switch (verb) {
    case "switch":
      return say({ ...s, head: arg }, `Switched to branch '${arg}'`);
    case "merge": {
      const theirs = s.branches[arg] ?? "";
      if (ancestors(s, mine).includes(theirs)) return say(s, "Already up to date.");
      if (ancestors(s, theirs).includes(mine)) return say({ ...s, branches: { ...s.branches, [me]: theirs } }, "Fast-forward: the label just moved.");
      return say(append(s, me, `merge(${arg})`, "M", [mine, theirs]), "A merge commit, with two parents.");
    }
    case "rebase": {
      const base = s.branches[arg] ?? "";
      const below = ancestors(s, base);
      if (below.includes(mine)) return say({ ...s, branches: { ...s.branches, [me]: base } }, "Fast-forwarded.");
      const todo = line(s, me).filter((c) => !below.includes(c.id)).reverse();
      if (todo.length === 0 || ancestors(s, mine).includes(base)) return say(s, "Current branch is up to date.");
      let next: GraphState = { ...s, branches: { ...s.branches, [me]: base } };
      for (const c of todo) next = append(next, me, c.change, `${c.change}'`, [next.branches[me] ?? base]);
      return say({ ...next, broke: s.broke || s.shared.includes(me) }, s.shared.includes(me) ? `You rewrote ${me}, which others have pulled. Their copies no longer match.` : `Replayed ${todo.length} commit${todo.length === 1 ? "" : "s"}, with new hashes.`);
    }
    case "cherry-pick":
      return say(append(s, me, find(s, arg).change, `${arg}'`, [mine]), `Copied ${arg} onto ${me}.`);
    case "revert":
      return say(append(s, me, `undo(${find(s, arg).change})`, `-${arg}`, [mine]), `A new commit that undoes ${arg}. Nothing was removed.`);
    case "reset": {
      const parent = find(s, mine).parents[0] ?? mine;
      return say({ ...s, branches: { ...s.branches, [me]: parent }, broke: s.broke || s.shared.includes(me) }, s.shared.includes(me) ? `${me} moved back, but everyone else still has that commit.` : `${me} moved back one commit.`);
    }
    default:
      return s;
  }
}

const c = (id: string, parents: string, lane = 0): Commit => ({ id, parents: parents === "" ? [] : parents.split(" "), change: id, lane });
const state = (commits: Commit[], branches: Record<string, string>, head: string, shared: string[] = ["main"]): GraphState => ({ commits, branches, head, shared, log: "", broke: false });

export const GRAPH: readonly GraphLevel[] = [
  {
    name: "1. Slide forward", goal: "main hasn't moved since you branched. Bring the feature into main, with no new commit.",
    start: state([c("A", ""), c("B", "A"), c("X", "B", 1), c("Y", "X", 1)], { main: "B", feature: "Y" }, "feature"),
    commands: ["git switch main", "git switch feature", "git merge feature", "git merge main"],
    won: (s) => s.branches.main === "Y" && s.commits.length === 4,
    win: "A fast-forward: no new commit, the label slides along.",
  },
  {
    name: "2. Tie the knot", goal: "main moved on. Join both lines with a commit that has two parents, on main.",
    start: state([c("A", ""), c("B", "A"), c("X", "B", 1), c("C", "B"), c("Y", "X", 1)], { main: "C", feature: "Y" }, "feature"),
    commands: ["git switch main", "git switch feature", "git merge feature", "git rebase main"],
    won: (s) => tip(s, "main").parents.length === 2 && tip(s, "main").parents[0] === "C" && !s.broke,
    win: "The branch stays visible forever: when it existed, and when it landed.",
  },
  {
    name: "3. A straight line", goal: "Bring the feature into main as one straight line: A B C X Y, with no merge commit, and without rewriting main.",
    start: state([c("A", ""), c("B", "A"), c("X", "B", 1), c("C", "B"), c("Y", "X", 1)], { main: "C", feature: "Y" }, "feature"),
    commands: ["git switch main", "git switch feature", "git rebase main", "git rebase feature", "git merge feature"],
    won: (s) => changes(s, "main") === "A B C X Y" && line(s, "main").every((x) => x.parents.length < 2) && !s.broke,
    win: "X' and Y' are new commits. Yours alone, so nobody minds.",
  },
  {
    name: "4. Just the hotfix", goal: "main needs H, now, and nothing else from the feature.",
    start: state([c("A", ""), c("X", "A", 1), c("H", "X", 1), c("Z", "H", 1), c("B", "A")], { main: "B", feature: "Z" }, "feature"),
    commands: ["git switch main", "git merge feature", "git cherry-pick H", "git rebase main"],
    won: (s) => changes(s, "main") === "A B H" && s.branches.feature === "Z",
    win: "One commit, copied. Keep it for emergencies: the same change now exists twice.",
  },
  {
    name: "5. Too late to hide", goal: "Bad is on main, and everyone has pulled it. Undo it without rewriting anything.",
    start: state([c("A", ""), c("B", "A"), c("Bad", "B")], { main: "Bad" }, "main"),
    commands: ["git reset HEAD~1", "git revert Bad", "git rebase main"],
    won: (s) => changes(s, "main") === "A B Bad undo(Bad)" && !s.broke,
    win: "History keeps the mistake and its undoing, and nobody's copy broke.",
  },
];
