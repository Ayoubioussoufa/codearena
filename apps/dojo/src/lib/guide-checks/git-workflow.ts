/**
 * Checks for content/supplements/git-workflow.md.
 * Standard Git behaviour (Pro Git book); questions follow the guide's own rules (3 Nov 2026).
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const gitWorkflowChecks: GuideCheckSet = {
  name: "Git guide",
  source: {
    label: "Pro Git (free book, git-scm.com)",
    href: "https://git-scm.com/book/en/v2",
    note: "The official Git book: chapter 3 (branching, including \"Rebasing\" and its golden rule) and chapter 7.7 (reset demystified) cover Parts 2–6 in depth.",
  },
  terms: [
    "Working tree",
    "Index",
    "Remote-tracking branch",
    "Rebase",
    "Revert",
    "Reflog",
    "Fetch",
    "Bisect",
  ],
  checks: [
    {
      id: "model",
      section: "Parts 1–3 · The four places, branches, staging",
      questions: [
        {
          prompt: "What is the index (staging area) for?",
          options: [
            "It keeps a backup of every file, so deleted work can be recovered",
            "It drafts the next commit, so you commit only part of your changes",
            "It holds a copy of the remote's commits, so pushes go much faster",
            "It lists all of the files that Git has been told to ignore",
          ],
          correct: 1,
          why: "The index is a draft of the next commit: stage the bug fix, leave the debug print unstaged, commit only the fix. Without it you'd commit both or neither.",
        },
        {
          prompt: "You create a new file, then run `git commit -am \"add feature\"`. What happens to the new file?",
          options: [
            "It's committed: -a stages every file in the folder",
            "It's deleted: -a removes every file that isn't tracked",
            "It's ignored for good: -a adds it to .gitignore",
            "It's left out: -a stages only files Git tracks",
          ],
          correct: 3,
          why: "`-a` stages modifications to tracked files only. A brand-new file must be `git add`-ed once; until then the commit silently skips it.",
        },
      ],
      explain: "Name the four places your code lives, which command moves it between each pair, and where you can actually lose work.",
    },
    {
      id: "history",
      section: "Parts 4–6 · Merge, rebase, conflicts, undoing",
      questions: [
        {
          prompt: "What's the golden rule of rebase?",
          options: [
            "Never rebase any commits that others have already pulled",
            "Never rebase a branch that contains any merge commits",
            "Always rebase main onto your branch before you push",
            "Always rebase instead of merging, to keep it linear",
          ],
          correct: 0,
          why: "Rebase creates new commits with new hashes; teammates who built on the originals now have a diverged history. Rebase private work to tidy it; merge public work.",
        },
        {
          prompt: "A bad commit is already pushed and pulled by teammates. How do you undo it?",
          options: [
            "git reset --hard, and then force-push your own branch",
            "git commit --amend, and then push the amended one",
            "git revert, which adds a commit undoing the change",
            "git rebase -i, then drop the bad commit, push",
          ],
          correct: 2,
          why: "Not pushed → reset; already pushed → revert. `revert` adds a new commit that applies the inverse change, so nobody's history is rewritten. The other three rewrite shared history.",
        },
        {
          prompt: "You ran `git reset --hard` and lost a commit. What can bring it back?",
          options: [
            "git status, which shows the commits you lost",
            "git stash pop, which restores the last reset",
            "git reflog, which still lists where HEAD was",
            "Nothing: a hard reset deletes the commits forever",
          ],
          correct: 2,
          why: "The reflog records every place HEAD has pointed, including the commit you just reset away from; `git reset --hard <that hash>` brings it back. Uncommitted changes destroyed by `--hard` are the part that's really gone.",
        },
      ],
      explain: "Explain the three resets (`--soft`, `--mixed`, `--hard`): where your changes end up with each, and one use for each.",
    },
    {
      id: "remotes",
      section: "Parts 7–13 · Remotes, history, after the merge",
      questions: [
        {
          prompt: "What's the difference between `git fetch` and `git pull`?",
          options: [
            "fetch only updates origin/main; pull also merges it in",
            "fetch merges your work in; pull only downloads commits",
            "fetch works on all branches; pull only on main",
            "fetch needs the network; pull works fully offline too",
          ],
          correct: 0,
          why: "`fetch` downloads commits and moves your cached note `origin/main`, leaving your files alone: always safe. `pull` is fetch plus a merge (or a rebase with `pull.rebase true`), which can conflict.",
        },
        {
          prompt: "Your PR was merged on GitHub, but your local main doesn't have the work. Why?",
          options: [
            "GitHub merges into a hidden branch, not into main",
            "Merged PRs reach local clones only after a day",
            "The feature branch must be deleted before you pull",
            "The merge happened on GitHub's copy; fetch it first",
          ],
          correct: 3,
          why: "Your clone is an independent copy, and `origin/main` is only a note from your last fetch. Clicking Merge changes GitHub's `main`; your machine learns nothing until `git fetch` (or `pull`). Check with `git log origin/main -1` before cleaning up.",
        },
      ],
      explain: "Explain how `git bisect` finds the commit that broke a test, and why it needs only about log₂(n) steps.",
    },
  ],
};
