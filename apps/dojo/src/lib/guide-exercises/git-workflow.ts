/**
 * Exercises for the Git guide.
 *
 * Git exercises are command recall and scenario reasoning rather than code, so
 * most of these ask you to write the command you would actually type, or to
 * say what a command did. Weighted toward the situations that feel like lost
 * work and are not.
 */
import type { GuideExercise } from "./types";

export const gitWorkflowExercises: GuideExercise[] = [
  {
    id: "four-places",
    title: "Move between the four places",
    prompt:
      "Write the command for each move, one per line, as `1. <command>` … `5. <command>`.",
    language: "bash",
    given: `working tree  →  index  →  local repo  →  remote

1. stage everything, including deletions
2. see exactly what you are about to commit
3. unstage a file but keep the edits
4. throw away unstaged edits to one file
5. download the remote's commits WITHOUT changing your files`,
    starter: `1.
2.
3.
4.
5.
`,
    solution: `1. git add -A
2. git diff --staged
3. git restore --staged path/to/file
4. git restore path/to/file
5. git fetch
`,
    hint: "Number 2 catches people out: plain `git diff` shows the opposite of what you want once things are staged.",
    explanation:
      "Nearly every confusing Git moment comes from not knowing which of the four places you are touching. **`git diff` shows working tree vs index; `git diff --staged` shows index vs last commit** — so after `git add`, plain `git diff` shows nothing and people conclude their changes vanished. Note 3 and 4 are the same verb with and without `--staged`, which is the clearest naming in modern Git. And 5 is the one to build a habit around: `fetch` is always safe, so you can look before integrating.",
    checks: [
      { re: "1\\.\\s*git add (-A|--all|\\.)", flags: "mi", label: "1 — stages everything" },
      { re: "2\\.\\s*git diff\\s+--(staged|cached)", flags: "mi", label: "2 — `--staged`, not plain diff" },
      { re: "3\\.\\s*git restore\\s+--staged|3\\.\\s*git reset\\s+HEAD", flags: "mi", label: "3 — unstages, keeping edits" },
      { re: "4\\.\\s*git restore\\s+(?!--staged)", flags: "mi", label: "4 — discards unstaged edits" },
      { re: "5\\.\\s*git fetch", flags: "mi", label: "5 — `fetch`, which never touches your files" },
    ],
  },

  {
    id: "commit-am-trap",
    title: "Explain what `commit -am` swept up",
    prompt:
      "You had a half-finished feature in `auth.service.ts` and a new untracked file `notes.md`. You ran `git commit -am \"wip\"` on a throwaway branch, switched back to main, and your feature edits were gone while `notes.md` was still there. Explain, in three lines, what happened to each and why.",
    language: "text",
    given: `git commit -am "wip"     # on branch ci-test
git switch main          # feature edits gone, notes.md still present`,
    starter: `1. auth.service.ts:
2. notes.md:
3. the rule:
`,
    solution: `1. auth.service.ts: it was TRACKED, so -a staged it and it went into the wip commit on ci-test; switching branches then restored main's version, so the edits looked deleted.
2. notes.md: it was UNTRACKED, so -a ignored it; untracked files are not touched by a branch switch and stay where they are.
3. the rule: switching branches rewrites TRACKED files. Untracked files stay put. Never use -a when unrelated work is in flight.
`,
    hint: "`-a` means 'stage every tracked file'. The word doing the work in that sentence is *tracked*.",
    explanation:
      "Nothing was lost — the edits were sitting in a commit on `ci-test` the whole time, recoverable with `git checkout <hash> -- <file>`. But the confusion is total the first time, because the two files behaved differently for a reason that is invisible. **`-a` stages every tracked file, including ones you never meant to commit.** The habit that prevents it: run `git diff --staged` before every commit, and reach for `-a` only when you know the whole working tree belongs in this one.",
    checks: [
      { re: "track", flags: "i", label: "names tracked vs untracked as the cause" },
      { re: "untracked", flags: "i", label: "explains why `notes.md` survived" },
      { re: "-a\\b|--all", label: "identifies `-a` as what staged it" },
      { re: "switch|checkout|branch", flags: "i", label: "explains the branch switch restoring main's version" },
    ],
  },

  {
    id: "reset-vs-revert",
    title: "Choose reset or revert",
    prompt:
      "For each situation write `reset` or `revert` and the command, one per line.",
    language: "bash",
    given: `1. the last commit is local only, and you want the changes back as unstaged edits
2. a bad commit is already pushed and others have pulled it
3. the last commit is local only and completely wrong — destroy it and its changes`,
    starter: `1.
2.
3.
`,
    solution: `1. git reset --soft HEAD~1   (or --mixed to unstage them too)
2. git revert <hash>
3. git reset --hard HEAD~1
`,
    hint: "The question is never which is nicer. It is whether anyone else has the commit yet.",
    explanation:
      "**`reset` rewrites history; `revert` adds to it.** That single distinction decides every case: rewriting a commit others have pulled makes their history and yours diverge, and everyone fights conflicts they did not cause. Once pushed, you add a new commit that undoes the old one, and the record stays honest. The three resets differ only in how far they undo — `--soft` keeps changes staged, `--mixed` (the default) unstages them, `--hard` destroys them. Only `--hard` can lose work, and even then `reflog` usually has the commit.",
    checks: [
      { re: "1\\.[^\\n]*reset\\s+--soft", flags: "mi", label: "1 — `reset --soft`, keeping the changes" },
      { re: "2\\.[^\\n]*revert", flags: "mi", label: "2 — `revert`, because it is pushed" },
      { re: "3\\.[^\\n]*reset\\s+--hard", flags: "mi", label: "3 — `reset --hard`" },
      { re: "2\\.[^\\n]*reset", flags: "mi", expect: false, label: "never rewrites a pushed commit" },
    ],
  },

  {
    id: "recover-reset-hard",
    title: "Recover from `reset --hard`",
    prompt:
      "You ran `git reset --hard HEAD~1` twice and destroyed work you needed. Write the two commands: one to find the lost commit, one to get back to it.",
    language: "bash",
    given: `# The commits were made, then reset away. Nothing was pushed.`,
    starter: `# 1. find it

# 2. return to it
`,
    solution: `# 1. find it
git reflog

# 2. return to it
git reset --hard <hash>
`,
    hint: "Every position HEAD has ever held is written down, including the ones no branch points at any more.",
    explanation:
      "`reflog` is the log of everywhere `HEAD` has been, and it survives resets, rebases and deleted branches. A commit removed from a branch is not deleted — it is just unreachable, and sits in `.git/objects` until garbage collection, which by default leaves it for weeks. **What `reflog` cannot recover is anything never committed**: uncommitted edits destroyed by `reset --hard` are genuinely gone, because Git never had a copy. That asymmetry is the whole argument for committing early and often, even messily — you can tidy history later with `rebase -i`, but you cannot recover a file Git never saw.",
    checks: [
      { re: "git reflog", label: "uses `reflog` to find the commit" },
      { re: "git reset\\s+--hard|git checkout|git cherry-pick", label: "returns to it" },
      { re: "git fsck|git reflog", label: "recovers through Git rather than guessing" },
    ],
  },

  {
    id: "branch-d-rule",
    title: "Say what `git branch -d` actually checks",
    prompt:
      "You pushed `feature` but never merged it into `main`. From `main` you run `git branch -d feature` and it succeeds. Explain why in two lines, and give the one command that brings the branch back.",
    language: "text",
    given: `$ git branch -d feature
warning: deleting branch 'feature' that has been merged to
         'refs/remotes/origin/feature', but not yet merged to HEAD
Deleted branch feature (was d1d973a).`,
    starter: `1. why it was allowed:
2. how to get it back:
`,
    solution: `1. why it was allowed: -d checks whether the commits are safe in the branch's UPSTREAM (or HEAD) — never whether they reached main. Because it was pushed, origin/feature holds them, so the local label was disposable.
2. how to get it back: git switch feature
`,
    hint: "Read the warning literally. It names the ref it compared against, and it is not `main`.",
    explanation:
      "The folk wisdom — '-d refuses if unmerged' — is imprecise in the way that surprises you. Git's actual rule is: fully merged **in its upstream, or in HEAD if no upstream is set.** `main` is never consulted. So **`-d` protects commits, not branch names**: it guarantees nothing is stranded, and promises nothing about keeping a branch you still wanted. Recovery is one command because a branch is a 41-byte file holding a hash — `git switch feature` finds no local branch, sees exactly one remote with that name, and recreates it tracking that.",
    checks: [
      { re: "upstream", flags: "i", label: "names the upstream as what `-d` checks" },
      { re: "push", flags: "i", label: "connects it to having pushed" },
      { re: "git switch \\w+|git checkout \\w+", label: "recovers with a plain switch/checkout" },
      { re: "-b\\b", expect: false, label: "no `-b` needed — Git recreates it from the remote" },
    ],
  },

  {
    id: "post-merge-sync",
    title: "Check before you clean up",
    prompt:
      "Before deleting branches after a PR, write the two commands that prove the merge actually landed on the remote `main`.",
    language: "bash",
    given: `# The PR was merged in the browser — or was it?`,
    starter: `# 1.

# 2.
`,
    solution: `# 1.
git fetch

# 2.
git log --oneline origin/main -1
`,
    hint: "Your machine learns nothing about a merge that happened on GitHub until you ask it.",
    explanation:
      "`origin/main` is a **cached note** of where GitHub's main was the last time you looked — not a live view, and Git never warns you it is stale. Running `git pull` before the PR is merged correctly does nothing, `main` stays put, and the feature files vanish from disk because you are standing on a commit that predates them. It looks exactly like lost work and is not. **Never run cleanup commands on faith that a remote action succeeded**: ten seconds of fetch-and-look replaces an hour of panic.",
    checks: [
      { re: "git fetch", label: "fetches first" },
      { re: "git log[^\\n]*origin/main", label: "inspects `origin/main`, not local main" },
      { re: "git pull", expect: false, label: "does not pull — you are checking, not integrating" },
    ],
  },

  {
    id: "rebase-golden-rule",
    title: "Decide: rebase or merge",
    prompt:
      "For each case write `rebase` or `merge` and one clause of reasoning.",
    language: "text",
    given: `1. tidying your own feature branch before opening a PR
2. bringing main's latest into a branch two colleagues are also committing to
3. your branch is pushed but nobody else has pulled it, and you want to squash three messy commits`,
    starter: `1.
2.
3.
`,
    solution: `1. rebase — it is your own unshared branch, so a straight line costs nobody anything
2. merge — the branch is shared; rebasing would rewrite commits others already have
3. rebase — still effectively unshared, then push with --force-with-lease
`,
    hint: "The question is never which produces prettier history. It is who else already has these commits.",
    explanation:
      "Rebase creates **new commits with new hashes**, so the originals others based work on effectively vanish and their history diverges from yours. Hence the golden rule: **rebase freely on your own unshared branch; once others have pulled, only merge.** Case 3 is the honest middle — pushed but unpulled is still safe in practice, and the follow-up matters: `--force-with-lease` is a compare-and-swap that aborts if the remote moved since your last fetch, where plain `--force` silently destroys whatever arrived.",
    checks: [
      { re: "1\\.[^\\n]*rebase", flags: "mi", label: "1 — rebase" },
      { re: "2\\.[^\\n]*merge", flags: "mi", label: "2 — merge, because it is shared" },
      { re: "3\\.[^\\n]*rebase", flags: "mi", label: "3 — rebase" },
      { re: "shared|others|colleagues|pulled", flags: "i", label: "reasons from who else has the commits" },
    ],
  },

  {
    id: "force-with-lease",
    title: "Push a rewritten branch safely",
    prompt:
      "You rebased a pushed branch and `git push` is rejected. Write the command you should use, and say in one line what it protects against that `--force` does not.",
    language: "bash",
    given: `! [rejected]  feature -> feature (non-fast-forward)`,
    starter: `# command:

# what it protects against:
`,
    solution: `# command:
git push --force-with-lease

# what it protects against:
# a colleague's commit that arrived after your last fetch — the push aborts
# instead of silently overwriting it. Plain --force would destroy it.
`,
    hint: "One of them is a blind write. The other is a compare-and-swap.",
    explanation:
      "`--force` says 'replace it, no questions', and will happily delete commits pushed by someone else in the last five minutes. `--force-with-lease` says 'replace it **only if nothing has changed since I last fetched**', and aborts otherwise. It costs nothing and it is the habit you want in place before the day it matters. One caveat worth knowing: the lease compares your remote-tracking ref, which a background fetch — including your IDE's — can silently update; the airtight form names the hash, `--force-with-lease=feature:<hash>`.",
    checks: [
      { re: "--force-with-lease", label: "uses `--force-with-lease`" },
      { re: "fetch|since|changed|someone|colleague", flags: "i", label: "explains what it compares against" },
      { re: "push\\s+--force\\s*$", flags: "m", expect: false, label: "does not reach for plain `--force`" },
    ],
  },

  {
    id: "conflict-resolution",
    title: "Finish a conflict",
    prompt:
      "You have edited the file and removed the markers. Write the two commands that finish a conflicted rebase, and the one that abandons it instead.",
    language: "bash",
    given: `<<<<<<< HEAD
const limit = 20;
=======
const limit = 50;
>>>>>>> feature`,
    starter: `# 1. mark it resolved

# 2. continue

# 3. or abandon the whole thing
`,
    solution: `# 1. mark it resolved
git add src/config.ts

# 2. continue
git rebase --continue

# 3. or abandon the whole thing
git rebase --abort
`,
    hint: "There is no `git resolve`. The command that marks a conflict handled is one you already use every day.",
    explanation:
      "**`git add` is the resolution** — staging a conflicted file is how you tell Git you have dealt with it, which surprises people looking for a dedicated command. The markers themselves are just text: `<<<<<<< HEAD` is your side, `>>>>>>>` is theirs, and nothing checks that you removed them, so a stray `=======` can be committed and compiled. And `--abort` is the escape hatch worth remembering under pressure: it returns you to exactly where you started, so a rebase going badly is never a one-way door.",
    checks: [
      { re: "git add", label: "`git add` marks it resolved" },
      { re: "rebase --continue|merge --continue", label: "continues the operation" },
      { re: "--abort", label: "knows the escape hatch" },
      { re: "git resolve|git continue\\b", expect: false, label: "no invented commands" },
    ],
  },

  {
    id: "find-the-breakage",
    title: "Find when it broke",
    prompt:
      "A test passes at tag `v1.2` and fails on `main`, 200 commits later. Write the commands to find the exact commit that broke it.",
    language: "bash",
    given: `# You can tell good from bad by running: pnpm test`,
    starter: `# start

# mark the current state

# mark the known-good state

# then, for each commit Git checks out:

# when finished
`,
    solution: `# start
git bisect start

# mark the current state
git bisect bad

# mark the known-good state
git bisect good v1.2

# then, for each commit Git checks out:
pnpm test && git bisect good || git bisect bad

# when finished
git bisect reset
`,
    hint: "Binary search over history. You only have to answer good-or-bad about eight times for 200 commits.",
    explanation:
      "`bisect` halves the range each answer, so 200 commits is about **eight** tests rather than 200. It is the single highest-leverage Git command for a bug you cannot reason about, and almost nobody reaches for it. Two things make it work: small commits, so the commit it names is actually informative, and a **reliable** good/bad test — an intermittent failure sends the search down the wrong half and the result is worse than useless. `git bisect run <cmd>` automates the loop entirely when the test is scriptable.",
    checks: [
      { re: "git bisect start", label: "starts the bisect" },
      { re: "git bisect bad", label: "marks the bad end" },
      { re: "git bisect good v1\\.2|git bisect good \\w", label: "marks the known-good commit" },
      { re: "git bisect reset", label: "resets when finished" },
    ],
  },

  {
    id: "find-deleted-code",
    title: "Find when a line disappeared",
    prompt:
      "A function called `calculateRating` used to exist and is gone. Nobody remembers removing it. Write the command that finds the commit that did.",
    language: "bash",
    given: `# It is not in any current file, so grep finds nothing.`,
    starter: `
`,
    solution: `git log -S "calculateRating" --oneline
`,
    hint: "There is a `log` flag that searches the CONTENT of every diff, not the commit messages.",
    explanation:
      "`git log -S` is the 'pickaxe': it finds commits where the **number of occurrences** of a string changed, so it catches both the commit that added it and the one that removed it. `git log --grep` searches commit messages, which is a different question and rarely the one you have. This is how you answer 'why was this deleted' — find the commit, then `git show <hash>` to read the reasoning, which is the strongest argument for writing commit messages that explain *why*.",
    checks: [
      { re: "git log", label: "uses `git log`" },
      { re: "-S|-G", label: "uses the pickaxe to search diff content" },
      { re: "calculateRating", label: "searches for the missing symbol" },
      { re: "--grep", expect: false, label: "not `--grep` — that searches messages, not code" },
    ],
  },

  {
    id: "lost-work-triage",
    title: "Triage 'I lost my work'",
    prompt:
      "For each symptom write `recoverable` or `gone`, and the command if recoverable.",
    language: "text",
    given: `1. files disappeared after: git switch main
2. a branch vanished after:  git branch -d
3. commits disappeared after: git reset --hard
4. uncommitted edits disappeared after: git reset --hard`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. recoverable — git switch <branch>; you are just standing on a commit that predates them
2. recoverable — git switch <name>; the commits are on the remote, the label was disposable
3. recoverable — git reflog, then git reset --hard <hash>
4. gone — Git never had a copy, so there is nothing to recover
`,
    hint: "Three of these are the same fact wearing different clothes. One is the only real loss in the list.",
    explanation:
      "**Everything Git has ever committed is recoverable; only the working tree is fragile.** Three of these four look like disaster and are a single command away, because commits live in the object store whether or not a branch points at them. The fourth is the only genuine loss, and it is genuine precisely because Git was never told about it. That asymmetry is the entire argument for committing early, often, and messily — history can be tidied later with `rebase -i`, but a file Git never saw cannot come back.",
    checks: [
      { re: "1\\.[^\\n]*recoverable", flags: "mi", label: "1 — recoverable" },
      { re: "2\\.[^\\n]*recoverable", flags: "mi", label: "2 — recoverable" },
      { re: "3\\.[^\\n]*recoverable", flags: "mi", label: "3 — recoverable" },
      { re: "4\\.[^\\n]*gone|4\\.[^\\n]*lost|4\\.[^\\n]*not recoverable", flags: "mi", label: "4 — genuinely gone" },
      { re: "reflog", flags: "i", label: "names `reflog` for the destroyed commits" },
    ],
  },
];
