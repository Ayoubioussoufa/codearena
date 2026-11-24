import type { Situation } from "../quiz";

export const RESCUE_PASS = 6;
export const RESCUE: readonly Situation[] = [
  {
    id: "switched", title: "Where are my files?", story: "You finished feature, switched to main, and 110 lines vanished from the editor.",
    exhibit: "$ git status -sb\n## main...origin/main\n$ git log --oneline --all\nd1d973a (feature) add the form\nf0b111d (HEAD -> main) readme",
    moves: [
      { text: "git reset --hard origin/main", outcome: "It does nothing useful, and would wipe uncommitted work." },
      { text: "git switch feature", outcome: "There they are. main is simply older than your files." },
      { text: "git pull", outcome: "GitHub's main doesn't have them either." },
      { text: "Type them again", outcome: "They're one command away." },
    ],
    best: 1, lesson: "Each branch is a snapshot. You were looking at an older one.",
  },
  {
    id: "reset", title: "reset --hard, twice", story: "You meant to drop one commit and dropped three.",
    exhibit: "$ git reflog\nf0b111d HEAD@{0}: reset: moving to HEAD~2\nb7c9d10 HEAD@{1}: reset: moving to HEAD~1\na1b2c3d HEAD@{2}: commit: rate limiter done",
    moves: [
      { text: "git revert HEAD", outcome: "That undoes a commit you still have." },
      { text: "git stash pop", outcome: "Nothing was stashed." },
      { text: "git clean -fd", outcome: "That deletes more files." },
      { text: "git reset --hard a1b2c3d", outcome: "Back to the moment before both resets." },
    ],
    best: 3, lesson: "The reflog lists everywhere HEAD has been.",
  },
  {
    id: "deleted", title: "The wrong branch", story: "git branch -d feature went through, with a warning. It wasn't merged, and you'd pushed it last night.",
    moves: [
      { text: "git switch feature", outcome: "Git finds origin/feature, and recreates your branch to track it." },
      { text: "Open a support ticket with GitHub", outcome: "They'd tell you it's right there." },
      { text: "git push --force", outcome: "Please put that down." },
      { text: "git merge main", outcome: "main never had it." },
    ],
    best: 0, lesson: "A branch is a label. Its commits are safe on the remote, which is why -d let you.",
  },
  {
    id: "nothing", title: "git pull did nothing", story: "You asked for your PR to be merged, ran git pull on main, and got \"Already up to date\". Your work isn't there.",
    moves: [
      { text: "git pull --force", outcome: "There's still nothing to pull." },
      { text: "Delete the repo and clone again", outcome: "A fresh copy of the same main." },
      { text: "Look at the PR: was it merged?", outcome: "Open, waiting for a review. git log origin/main -1 would have said so too." },
      { text: "git rebase feature", outcome: "Now your local main has diverged from everyone's." },
    ],
    best: 2, lesson: "Check that the remote thing happened before you clean up after it.",
  },
  {
    id: "restore", title: "The last row", story: "An hour of edits in parser.ts, never staged, never committed. Then: git restore parser.ts.",
    moves: [
      { text: "git reflog", outcome: "It lists commits. This was never one." },
      { text: "It's gone from Git: try the editor's local history", outcome: "Right. VS Code's Timeline may still have it. Git never did." },
      { text: "git stash pop", outcome: "Nothing was stashed." },
      { text: "git fsck --lost-found", outcome: "It finds objects Git has stored. These edits were never stored." },
    ],
    best: 1, lesson: "The only real loss: work Git never saw. Commit early, tidy later.",
  },
  {
    id: "detached", title: "Commits from nowhere", story: "You checked out a commit to look around, made two commits there, and switched to main. They're on no branch.",
    exhibit: "$ git reflog -4\n9f8e7d6 HEAD@{0}: checkout: moving from 5c4b3a2 to main\n5c4b3a2 HEAD@{1}: commit: second idea\n1a2b3c4 HEAD@{2}: commit: first idea",
    moves: [
      { text: "git switch -c idea 5c4b3a2", outcome: "A label on the last one, and both are safe." },
      { text: "git switch -c idea", outcome: "A new branch at main, without them." },
      { text: "git merge HEAD", outcome: "Merging main into main." },
      { text: "git reset --hard HEAD~2", outcome: "Two more commits to look for." },
    ],
    best: 0, lesson: "A detached HEAD's commits have no name. Give them one.",
  },
  {
    id: "force", title: "Someone forced", story: "A teammate force-pushed feature, and your three commits are gone from GitHub. You pushed them this morning from this laptop.",
    moves: [
      { text: "git pull", outcome: "Now you're merging with their rewritten history." },
      { text: "git reset --hard origin/feature", outcome: "You'd throw away the one copy that's left." },
      { text: "git fetch --prune", outcome: "It tidies labels. It brings nothing back." },
      { text: "Your local feature still has them: label it, then talk", outcome: "git branch rescue feature, and both of you decide how to join the work." },
    ],
    best: 3, lesson: "Every clone is a full copy. Yours still has what the remote lost.",
  },
];
