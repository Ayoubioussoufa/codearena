/** Files in four places, and the commands that move them. */
export interface FileState {
  name: string;
  /** Version in the last commit (0 = not there). */
  head: number;
  /** Version in the index (0 = not there, so untracked). */
  index: number;
  /** Version on disk. */
  work: number;
}
export interface PlacesState {
  files: readonly FileState[];
  /** Commits not yet on the remote. */
  ahead: number;
  commits: number;
  log: string;
  /** Uncommitted work was destroyed. */
  lost: boolean;
}
export interface PlacesLevel {
  name: string;
  goal: string;
  start: PlacesState;
  commands: readonly string[];
  won(s: PlacesState): boolean;
  win: string;
}
const f = (name: string, head: number, index: number, work: number): FileState => ({ name, head, index, work });
const begin = (...files: FileState[]): PlacesState => ({ files, ahead: 0, commits: 0, log: "", lost: false });
const get = (s: PlacesState, name: string) => s.files.find((x) => x.name === name) ?? f(name, 0, 0, 0);

export function short(x: FileState): string {
  if (x.head === 0 && x.index === 0) return "??";
  const left = x.index === x.head ? " " : x.head === 0 ? "A" : "M";
  const right = x.work === x.index ? " " : "M";
  return left + right;
}

export function run(s: PlacesState, command: string): PlacesState {
  const each = (change: (x: FileState) => FileState, log: string): PlacesState => ({ ...s, files: s.files.map(change), log });
  const one = (name: string, change: (x: FileState) => FileState, log: string) => each((x) => (x.name === name ? change(x) : x), log);
  const commit = (from: PlacesState): PlacesState => {
    const n = from.files.filter((x) => x.index !== x.head).length;
    if (n === 0) return { ...from, log: "nothing added to commit" };
    return { ...from, files: from.files.map((x) => ({ ...x, head: x.index })), ahead: from.ahead + 1, commits: from.commits + 1, log: `1 commit, ${n} file${n === 1 ? "" : "s"} changed` };
  };
  const add = /^git add (?!\.)(\S+)$/.exec(command), unstage = /^git restore --staged (\S+)$/.exec(command), restore = /^git restore (?!--)(\S+)$/.exec(command);
  if (command === "git add .") return each((x) => ({ ...x, index: x.work }), "everything is staged");
  if (add) return one(add[1] ?? "", (x) => ({ ...x, index: x.work }), `${add[1]} is staged, as it is right now`);
  if (unstage) return one(unstage[1] ?? "", (x) => ({ ...x, index: x.head }), `${unstage[1]} is out of the index. Your edits are still on disk`);
  if (restore) {
    const x = get(s, restore[1] ?? "");
    return { ...one(x.name, (y) => ({ ...y, work: y.index }), `${x.name} is back to the version in the index. The edits are gone for good`), lost: s.lost || x.work !== x.index };
  }
  if (command === "git commit") return commit(s);
  if (command === "git commit -am") return commit(each((x) => (x.head === 0 && x.index === 0 ? x : { ...x, index: x.work }), ""));
  if (command === "git push") return s.ahead === 0 ? { ...s, log: "Everything up-to-date" } : { ...s, ahead: 0, log: "pushed" };
  return s;
}

export const PLACES: readonly PlacesLevel[] = [
  {
    name: "1. Only the fix", goal: "Commit the fix in login.ts. Leave the debug print in debug.ts uncommitted, and still on disk.",
    start: begin(f("login.ts", 1, 1, 2), f("debug.ts", 1, 1, 2)),
    commands: ["git add login.ts", "git add .", "git restore debug.ts", "git commit", "git commit -am"],
    won: (s) => get(s, "login.ts").head === 2 && get(s, "debug.ts").head === 1 && get(s, "debug.ts").work === 2,
    win: "That's why the index exists: you choose what goes in.",
  },
  {
    name: "2. Both letters", goal: "login.ts shows MM: you staged it, then edited it again. Commit the newest version, in a single commit.",
    start: begin(f("login.ts", 1, 2, 3)),
    commands: ["git add login.ts", "git commit", "git restore login.ts", "git restore --staged login.ts"],
    won: (s) => get(s, "login.ts").head === 3 && s.commits === 1,
    win: "Committing straight away would have saved version 2. The index holds a copy, not a promise.",
  },
  {
    name: "3. Too eager", goal: "You staged everything. Take secrets.txt out of the next commit without losing it, and commit the rest.",
    start: begin(f("app.ts", 1, 2, 2), f("secrets.txt", 0, 1, 1)),
    commands: ["git restore --staged secrets.txt", "git restore app.ts", "git commit", "git add ."],
    won: (s) => get(s, "app.ts").head === 2 && get(s, "secrets.txt").head === 0 && get(s, "secrets.txt").work === 1,
    win: "Unstaged, and still yours. Now put it in .gitignore.",
  },
  {
    name: "4. The quiet skip", goal: "Commit both files: the edited one and the brand-new one, in a single commit.",
    start: begin(f("app.ts", 1, 1, 2), f("new.ts", 0, 0, 1)),
    commands: ["git commit -am", "git add new.ts", "git add .", "git commit"],
    won: (s) => get(s, "app.ts").head === 2 && get(s, "new.ts").head === 1 && s.commits === 1,
    win: "commit -am skips files Git has never tracked, without a word.",
  },
  {
    name: "5. All the way", goal: "Get the change to the remote.",
    start: begin(f("app.ts", 1, 1, 2)),
    commands: ["git push", "git add app.ts", "git commit", "git restore app.ts"],
    won: (s) => get(s, "app.ts").head === 2 && s.ahead === 0,
    win: "Working tree, index, local repo, remote: all four.",
  },
];
/** A level is lost when what it needs no longer exists. */
export const placesStuck = (l: PlacesLevel, s: PlacesState): boolean => s.lost && !l.won(s);
