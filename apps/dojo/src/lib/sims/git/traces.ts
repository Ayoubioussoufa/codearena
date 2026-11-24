import { at, type Trace, type TraceMove } from "../engines";

/* ── Peace talks: settle a conflict ── */
interface Conflict {
  name: string;
  story: string;
  /** Which command is running. */
  during: "merge" | "rebase";
  top: string;
  topLabel: string;
  bottom: string;
  bottomLabel: string;
  want: "top" | "bottom" | "both";
  note: string;
}
const CONFLICTS: readonly Conflict[] = [
  {
    name: "1. One wins", during: "merge", story: "You're on main, merging slow-network. Slow phones need 5 seconds, and the team agreed on it yesterday.",
    top: "const timeout = 3000;", topLabel: "HEAD (main)", bottom: "const timeout = 5000;", bottomLabel: "slow-network", want: "bottom",
    note: "The incoming side was right, so it stays.",
  },
  {
    name: "2. Both are right", during: "merge", story: "Two people each added a route, at the same line. The app needs both.",
    top: "app.use('/users', users);", topLabel: "HEAD (main)", bottom: "app.use('/health', health);", bottomLabel: "health-check", want: "both",
    note: "Most conflicts aren't a fight: both changes belong.",
  },
  {
    name: "3. Who is HEAD?", during: "rebase", story: "You're rebasing your branch retry onto main. Keep your own change: 5 retries.",
    top: "const retries = 2;", topLabel: "HEAD", bottom: "const retries = 5;", bottomLabel: "add retries (your commit)", want: "bottom",
    note: "In a rebase, HEAD is the base you're being replayed onto, so \"ours\" is theirs. Read the content, not the label.",
  },
];
export interface ConflictState extends Conflict {
  kept: "top" | "bottom" | "both" | null;
  step: number;
}
const CHOICES: readonly TraceMove[] = [
  { id: "top", label: "Keep the top side" },
  { id: "bottom", label: "Keep the bottom side" },
  { id: "both", label: "Keep both" },
];
const FINISH: readonly TraceMove[] = [
  { id: "git add", label: "git add file.ts" },
  { id: "git commit", label: "git commit" },
  { id: "git rebase --continue", label: "git rebase --continue" },
  { id: "git push", label: "git push" },
];
export const conflictTrace: Trace<ConflictState> = {
  levels: CONFLICTS.map((x) => x.name),
  start: (level) => ({ ...at(CONFLICTS, level), kept: null, step: 0 }),
  moves: (s) => (s.step === 0 ? CHOICES : FINISH),
  correct: (s) => (s.step === 0 ? [s.want] : s.step === 1 ? ["git add"] : s.step === 2 ? [s.during === "merge" ? "git commit" : "git rebase --continue"] : []),
  apply: (s, move) => (s.step === 0 ? { ...s, kept: move as "top" | "bottom" | "both", step: 1 } : { ...s, step: s.step + 1 }),
  why(s, move) {
    if (s.step === 0) return s.want === "both" ? "One of the two people would lose their route." : move === "both" ? "The same constant can't be declared twice: which value does the story ask for?" : "Read the story again: whose value should survive?";
    if (move === "git push") return "The merge isn't finished yet.";
    if (s.step === 1) return "Git doesn't know the file is settled. How do you tell it?";
    if (move === "git add") return "It's staged already. Now finish what was interrupted.";
    return s.during === "merge" ? "This was a merge, not a rebase." : "A rebase is still replaying your commits: tell it to go on.";
  },
  say: (s) => (s.step === 0 ? "Edit the file to what it should be." : s.step === 1 ? "The markers are gone. Next command?" : s.step === 2 ? "Staged. Next command?" : s.note),
  done: (s) => s.step >= 3,
};

/* ── Two mains: the evening of the merge ── */
export interface SyncState {
  level: number;
  /** Commits on each main: GitHub's, your note of it, yours. */
  github: number;
  note: number;
  local: number;
  onMain: boolean;
  branch: "local+remote" | "remote" | "none";
  merged: boolean;
  said: string;
  over: boolean;
}
const SYNC: readonly TraceMove[] = [
  { id: "merge", label: "Merge the PR on GitHub" },
  { id: "fetch", label: "git fetch" },
  { id: "switch", label: "git switch main" },
  { id: "pull", label: "git pull" },
  { id: "delete", label: "git branch -d feature" },
  { id: "recreate", label: "git switch feature" },
];
const settled = (s: SyncState) => (s.level === 2 ? s.branch === "local+remote" && !s.onMain : s.merged && s.onMain && s.local === s.github && s.branch !== "local+remote");
export const syncTrace: Trace<SyncState> = {
  levels: ["1. Merge evening", "2. Already merged", "3. Oops"],
  start(level) {
    if (level === 0) return { level, github: 5, note: 5, local: 5, onMain: false, branch: "local+remote", merged: false, said: "Your PR is approved. End the evening with main up to date, and the local feature branch gone.", over: false };
    if (level === 1) return { level, github: 6, note: 5, local: 5, onMain: false, branch: "local+remote", merged: true, said: "A teammate merged your PR for you. Same goal: main up to date, and the local feature branch gone.", over: false };
    return { level, github: 5, note: 5, local: 5, onMain: true, branch: "remote", merged: false, said: "You deleted the local feature branch by mistake. The PR isn't merged, and the branch was pushed. Get it back.", over: false };
  },
  moves: () => SYNC,
  correct(s) {
    if (settled(s)) return [];
    if (s.level === 2) return ["recreate"];
    if (!s.merged) return ["merge"];
    const out: string[] = [];
    if (s.note < s.github) out.push("fetch");
    if (!s.onMain) out.push("switch");
    if (s.onMain && s.local < s.github) out.push("pull");
    if (s.onMain && s.local === s.github) out.push("delete");
    return out;
  },
  apply(s, move) {
    switch (move) {
      case "merge":
        return { ...s, merged: true, github: s.github + 1, said: "GitHub's main moved. Your machine heard nothing." };
      case "fetch":
        return { ...s, note: s.github, said: "origin/main is up to date now. Your files haven't changed." };
      case "switch":
        return { ...s, onMain: true, said: "On main. Your feature's files left the disk: this commit is older than they are." };
      case "pull":
        return { ...s, note: s.github, local: s.github, said: "Fast-forward. Your work is on main, and on disk." };
      case "delete":
        return { ...s, branch: "remote", said: "Deleted branch feature. Its commits are on main." };
      default:
        return { ...s, onMain: false, branch: "local+remote", said: "branch 'feature' set up to track 'origin/feature'. One command, nothing lost." };
    }
  },
  why(s, move) {
    switch (move) {
      case "merge":
        return s.merged ? "It's merged already." : "The PR isn't what's missing here.";
      case "fetch":
        return s.level === 2 ? "Nothing new to learn: origin/feature is already known here." : s.merged ? "Your note of GitHub is already fresh." : "Nothing has changed over there yet.";
      case "switch":
        return s.onMain ? "You're on main." : "Is the PR merged? Until it is, main has nothing for you.";
      case "pull":
        return !s.merged ? "\"Already up to date.\" There's nothing to pull until the PR is merged." : !s.onMain ? "That would pull into feature. Where does the merge live?" : "main already has everything.";
      case "delete":
        return !s.onMain ? "You can't delete the branch you're standing on." : s.branch !== "local+remote" ? "It's gone already." : "First make sure your own main has the work: fetch, look, pull.";
      default:
        return s.branch === "local+remote" ? "You have that branch." : "You don't need it back.";
    }
  },
  say: (s) => s.said,
  done: settled,
};
