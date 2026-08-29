/**
 * Topic: Git & collaborative workflow — the version-control skills an internship
 * assumes you already have: branching, staging, rebase vs merge, resolving
 * conflicts, undoing safely, reading a diff, and pull-request etiquette. Mixes
 * concept cards (choice) with command recall (type the command). Drills the
 * Git supplement guide.
 */
import { choice, text } from "../helpers";
import type { Generator, Topic } from "../types";

const DOC = { slug: "git-workflow", label: "Dojo guide — Git & collaborative workflow" };

/* ── command recall ── */

const stageAll: Generator = {
  id: "git-stage-all",
  title: "Stage all changes",
  generate: () =>
    text({
      genId: "git-stage-all",
      prompt:
        "You've edited several files and want to stage EVERYTHING (new, modified, deleted) for the next commit. What command?",
      answers: ["git add .", "git add -A", "git add --all", "git add ."],
      placeholder: "git …",
      explanation:
        "`git add .` stages changes under the current directory; `git add -A` / `--all` stages across the whole repo including deletions. Staging is Git's distinctive step: the INDEX (staging area) is a draft of your next commit, so you can commit some changes and leave others — commit the bug fix, keep the debug print unstaged.",
      docRef: DOC,
    }),
};

const newBranch: Generator = {
  id: "git-new-branch",
  title: "Create and switch to a branch",
  generate: () =>
    text({
      genId: "git-new-branch",
      prompt:
        "Create a new branch called `feature` AND switch to it in one command. What do you type?",
      answers: [
        "git checkout -b feature",
        "git switch -c feature",
        "git checkout -b feature",
      ],
      placeholder: "git …",
      explanation:
        "`git switch -c feature` (newer, clearer) and `git checkout -b feature` (older, still everywhere) both create and move onto the branch. Branch early: a branch is a cheap, movable pointer to a commit, so you do all feature work off `main` and open a pull request from it — never commit straight to `main` on a team.",
      docRef: DOC,
    }),
};

const undoKeepChanges: Generator = {
  id: "git-undo-soft",
  title: "Undo the last commit, keep the changes",
  generate: () =>
    text({
      genId: "git-undo-soft",
      prompt:
        "You committed too early. Undo the LAST commit but keep its changes staged, so you can redo the commit. What command?",
      answers: ["git reset --soft HEAD~1", "git reset --soft HEAD^", "git reset --soft head~1"],
      placeholder: "git reset …",
      explanation:
        "`git reset --soft HEAD~1` moves the branch pointer back one commit but leaves your changes staged — the commit 'un-happens', the work stays. `--mixed` (the default) would keep the changes but unstage them; `--hard` would DISCARD them (dangerous). `HEAD~1` means 'one commit before HEAD'.",
      docRef: DOC,
    }),
};

const discardFile: Generator = {
  id: "git-discard-file",
  title: "Discard unstaged edits to a file",
  generate: () =>
    text({
      genId: "git-discard-file",
      prompt:
        "You made a mess in `app.ts` (not staged) and want to throw those edits away, restoring the last committed version. What command?",
      answers: [
        "git restore app.ts",
        "git checkout -- app.ts",
        "git checkout app.ts",
        "git restore app.ts",
      ],
      placeholder: "git …",
      explanation:
        "`git restore app.ts` (newer) or `git checkout -- app.ts` (older) overwrites the working-copy file with the committed version. This is destructive — unstaged edits are the one thing Git can't get back for you, since they were never in a commit. Stash instead (`git stash`) if you're unsure.",
      docRef: DOC,
    }),
};

const historyOneline: Generator = {
  id: "git-log-oneline",
  title: "See compact history",
  generate: () =>
    text({
      genId: "git-log-oneline",
      prompt:
        "Show the commit history as one line per commit (short hash + message). What command?",
      answers: ["git log --oneline", "git log --oneline"],
      placeholder: "git log …",
      explanation:
        "`git log --oneline` collapses each commit to `<short-hash> <subject>` — the fast way to scan recent history and grab a hash to reset/revert/cherry-pick against. Add `--graph --all` to visualise how branches diverge and merge.",
      docRef: DOC,
    }),
};

/* ── concept cards ── */

const mergeVsRebase: Generator = {
  id: "git-merge-vs-rebase",
  title: "Merge vs rebase",
  generate: (rng) =>
    choice(rng, {
      genId: "git-merge-vs-rebase",
      prompt:
        "What's the essential difference between merging `main` into your branch and rebasing your branch onto `main`?",
      correct:
        "Merge creates a merge commit that ties the two histories together (preserving what happened); rebase REWRITES your commits to sit on top of the latest main, giving a linear history",
      wrong: [
        "They're identical — rebase is just the newer name for merge",
        "Merge rewrites history while rebase preserves it",
        "Rebase deletes your commits; merge keeps them",
      ],
      explanation:
        "Merge is non-destructive: it records a merge commit and keeps both histories exactly as they were, at the cost of a busier graph. Rebase replays your commits onto the new base, producing new commits (new hashes) and a clean straight line — at the cost of rewriting history. Neither loses work; they trade a tidy graph against an honest one.",
      docRef: DOC,
    }),
};

const goldenRule: Generator = {
  id: "git-rebase-golden-rule",
  title: "The golden rule of rebase",
  generate: (rng) =>
    choice(rng, {
      genId: "git-rebase-golden-rule",
      prompt:
        "When should you NOT rebase?",
      correct:
        "Never rebase commits that others have already pulled — rewriting shared/public history forces everyone else into painful conflicts",
      wrong: [
        "Never rebase your own local feature branch before it's shared",
        "Never rebase branches with more than 10 commits",
        "Never rebase — merge is always the safer and correct choice",
      ],
      explanation:
        "Rebase creates NEW commits with new hashes, so the old ones others based work on effectively vanish — their history and yours diverge and everyone fights conflicts. The rule: rebase freely on your OWN unshared branch to tidy it before opening a PR; once commits are pushed and pulled by others, only merge. If you must rewrite a pushed branch, `--force-with-lease`, and warn your team.",
      docRef: DOC,
    }),
};

const revertVsReset: Generator = {
  id: "git-revert-vs-reset",
  title: "Revert vs reset",
  generate: (rng) =>
    choice(rng, {
      genId: "git-revert-vs-reset",
      prompt:
        "A bad commit is already pushed to the shared `main`. What's the safe way to undo it?",
      correct:
        "git revert — it creates a NEW commit that inverts the bad one, so shared history is never rewritten",
      wrong: [
        "git reset --hard to the previous commit, then force-push main",
        "git checkout the previous commit and commit over it",
        "Delete the branch and recreate it from the good commit",
      ],
      explanation:
        "On SHARED history, `git revert <hash>` is correct: it adds a new commit that undoes the changes, leaving the original commit in place — nobody's history breaks. `git reset` moves the branch pointer and (with `--hard`) discards commits; force-pushing that over `main` rewrites history everyone else has, which is the destructive move `revert` exists to avoid. Reset is for LOCAL, unshared history.",
      docRef: DOC,
    }),
};

const conflictMarkers: Generator = {
  id: "git-conflict-markers",
  title: "Resolving a merge conflict",
  generate: (rng) =>
    choice(rng, {
      genId: "git-conflict-markers",
      prompt:
        "Git marks a conflict with `<<<<<<< HEAD`, `=======`, and `>>>>>>> feature`. What do you actually do to resolve it?",
      correct:
        "Edit the file to the final desired content, delete all three marker lines, then stage the file (git add) and complete the merge/commit",
      wrong: [
        "Run `git merge --abort` — it's the only way to fix a conflict",
        "Pick the HEAD side automatically; Git never wants the other side",
        "Delete the whole file and let Git regenerate it from both branches",
      ],
      explanation:
        "The markers fence the two versions: between `<<<<<<< HEAD` and `=======` is YOUR current branch's content; between `=======` and `>>>>>>> feature` is the incoming branch's. Resolving means producing the correct combined result by hand, removing the markers, and `git add`-ing the file to tell Git it's resolved — then commit. (`--abort` is the escape hatch to bail out entirely, not a resolution.)",
      docRef: DOC,
    }),
};

const forceWithLease: Generator = {
  id: "git-force-with-lease",
  title: "--force vs --force-with-lease",
  generate: (rng) =>
    choice(rng, {
      genId: "git-force-with-lease",
      prompt:
        "You rebased your own feature branch and need to update the remote. Why prefer `git push --force-with-lease` over `git push --force`?",
      correct:
        "--force-with-lease refuses to overwrite the remote if someone else pushed commits you haven't seen, protecting their work; plain --force clobbers it unconditionally",
      wrong: [
        "--force-with-lease is faster because it skips the upload check",
        "They're the same; --force-with-lease is just an alias",
        "--force-with-lease pushes without needing to authenticate",
      ],
      explanation:
        "After a rebase your local history diverges from the remote, so a normal push is rejected and you need a force. Plain `--force` overwrites the remote branch no matter what — including a teammate's commit you never pulled, which is then lost. `--force-with-lease` first checks the remote is still where you last saw it and aborts if not, turning a silent data-loss footgun into a safe 'someone else moved this' error.",
      docRef: DOC,
    }),
};

const stagingArea: Generator = {
  id: "git-staging-area",
  title: "The staging area",
  generate: (rng) =>
    choice(rng, {
      genId: "git-staging-area",
      prompt:
        "What is the point of Git's staging area (the index)?",
      correct:
        "It's a draft of your next commit — you choose exactly which changes go in, so one commit can be a focused, reviewable unit",
      wrong: [
        "It's a backup copy of your files in case the commit fails",
        "It's where Git stores the remote's version during a fetch",
        "It's a required cache with no effect on what gets committed",
      ],
      explanation:
        "The index sits between your working directory and the repository. `git add` promotes specific changes into it; `git commit` snapshots the index (not your whole working tree). That lets you split a messy working state into clean, single-purpose commits — commit the fix now, leave the unrelated experiment unstaged. `git add -p` even stages hunk-by-hunk within a file.",
      docRef: DOC,
    }),
};

const prReview: Generator = {
  id: "git-pr-review",
  title: "Pull-request etiquette",
  generate: (rng) => {
    const cases = [
      {
        q: "What makes a pull request easy to review?",
        answer:
          "Small and focused — one logical change, a clear description of what and why, and green CI before you ask for review",
        wrong: [
          "As large as possible, so reviewers see the whole feature at once",
          "No description — the diff speaks for itself",
          "Mixing unrelated refactors in so you don't need a second PR",
        ],
        why: "Small PRs get reviewed faster and more carefully; a 40-file PR gets a rubber-stamp. The description carries the WHY the diff can't, and passing CI respects the reviewer's time. Keep unrelated changes in separate PRs.",
      },
      {
        q: "A reviewer leaves comments on your PR. What's the good response?",
        answer:
          "Address or reply to each comment, push follow-up commits, and re-request review — treat feedback as collaboration, not criticism",
        wrong: [
          "Force-push a rewrite silently so the comments no longer apply",
          "Merge immediately; comments are optional suggestions",
          "Argue every point until the reviewer gives up",
        ],
        why: "Review is a conversation. Responding to each thread (fix, or explain why not) and pushing incremental commits keeps the history of the discussion reviewable. Silently force-pushing away the context reviewers commented on is how you lose their trust.",
      },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "git-pr-review",
      prompt: c.q,
      correct: c.answer,
      wrong: [...c.wrong],
      explanation: c.why,
      docRef: DOC,
    });
  },
};

export const gitTopic: Topic = {
  id: "git",
  title: "Git & Workflow",
  icon: "🌿",
  blurb:
    "Version control an internship assumes: branching, staging, rebase vs merge, resolving conflicts, undoing safely, force-with-lease, and pull-request etiquette. Concept cards plus type-the-command recall.",
  docSlug: "git-workflow",
  docTitle: "Git & collaborative workflow",
  generators: [
    stageAll,
    newBranch,
    undoKeepChanges,
    discardFile,
    historyOneline,
    mergeVsRebase,
    goldenRule,
    revertVsReset,
    conflictMarkers,
    forceWithLease,
    stagingArea,
    prReview,
  ],
};
