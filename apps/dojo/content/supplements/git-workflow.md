# Git & Collaborative Workflow

Git is the tool you'll touch more than any other on a team, and the one an internship silently assumes you already know. Not the trivia — the *fluency*: branch without thinking, stage the right changes, rebase to tidy up, resolve a conflict calmly, undo safely, and open a pull request a reviewer enjoys reading. This guide builds that fluency from the mental model up, and pairs with the **Git & Workflow quiz topic** (concept cards + type-the-command recall, spaced-repeated).

The one idea that makes everything else click: **Git stores snapshots, and commits are cheap, immutable, and identified by a hash.** Branches and tags are just movable labels pointing at commits. Almost every command is moving a label or making a new snapshot.

## The four places your code lives

```
working directory  →  staging area (index)  →  local repository  →  remote
     (edits)            git add                   git commit          git push
```

- **Working directory** — the files you actually edit. The only place changes can be *lost*, because they aren't in a commit yet.
- **Staging area (index)** — a *draft of your next commit*. `git add` promotes specific changes into it.
- **Local repository** — your commit history (`.git`). `git commit` snapshots the index here.
- **Remote** — the shared copy (GitHub). `git push` sends commits up; `git fetch`/`pull` brings them down.

`git status` tells you where everything sits; run it constantly.

## The everyday loop

```bash
git switch -c fix-login        # branch off main
# …edit files…
git status                     # what changed, what's staged
git add .                      # stage everything (or `git add -p` to pick hunks)
git commit -m "Fix login redirect"
git push -u origin fix-login   # publish the branch
# …open a pull request…
```

That's 90% of daily Git. The rest of this guide is the other 10% — the moments that trip people up.

## Branching: cheap, so branch early

A branch is a movable pointer to a commit; creating one is instant and free. So do **all** feature work on a branch off `main`, never commit straight to `main` on a team, and open a pull request to merge back.

```bash
git switch -c feature          # create + switch (newer syntax)
git checkout -b feature        # same thing (older, still everywhere)
git switch main                # move back
git branch -d feature          # delete once merged
```

`HEAD` is "where you are" — normally it points at your current branch. If you check out a specific commit instead of a branch, you get a **detached HEAD**: commits you make there belong to no branch and are easy to lose. Make a branch first.

## The staging area is a feature, not a chore

The index is what makes Git commits *good*. Because you choose exactly which changes go in, one commit can be a single focused, reviewable unit:

```bash
git add src/auth.ts            # stage just the fix
git add -p                     # stage hunk-by-hunk within files
git commit -m "Fix token refresh"
# the unrelated debug print stays unstaged, uncommitted
```

`git commit` snapshots the **index**, not your whole working tree — so "commit the fix, keep the experiment" is a first-class move. Small, single-purpose commits make history readable and `revert`/`bisect` surgical.

## Rebase vs merge

Both bring your branch up to date with `main`; they differ in what history they leave.

- **Merge** (`git merge main` from your branch) is **non-destructive**: it creates a *merge commit* tying the two histories together, preserving exactly what happened. Cost: a busier, forked graph.
- **Rebase** (`git rebase main`) **rewrites** your commits to sit on top of the latest `main`, producing new commits (new hashes) and a clean, linear history. Cost: you've rewritten history.

Neither loses work. A common workflow: **rebase your feature branch onto `main` to tidy it before opening the PR** (linear, easy to review), then **merge the PR**.

### The golden rule of rebase

> **Never rebase commits others have already pulled.**

Rebase makes *new* commits with new hashes, so the originals your teammates based work on effectively vanish — their history and yours diverge and everyone fights conflicts. Rebase freely on your **own unshared** branch; once commits are pushed and pulled by others, only **merge**. If you truly must rewrite a pushed branch, use `--force-with-lease` (below) and warn your team.

## Resolving a merge conflict

A conflict happens when two branches changed the same lines. Git pauses and fences the two versions in the file:

```
<<<<<<< HEAD
const timeout = 3000;          // your current branch's version
=======
const timeout = 5000;          // the incoming branch's version
>>>>>>> feature
```

To resolve:

1. **Edit** the file to the final content you want (keep one side, the other, or a blend).
2. **Delete all three marker lines** (`<<<<<<<`, `=======`, `>>>>>>>`).
3. **`git add <file>`** to mark it resolved.
4. **`git commit`** (or `git rebase --continue`) to finish.

Between `<<<<<<< HEAD` and `=======` is *your* content; between `=======` and `>>>>>>>` is *theirs*. If it all goes wrong, `git merge --abort` (or `git rebase --abort`) backs out entirely — that's the escape hatch, not a resolution.

## Undoing things (the part everyone fears)

Match the tool to the situation. The key question: **is the mistake shared yet?**

**`git reset`** — moves the current branch pointer; for **local, unshared** history.
- `git reset --soft HEAD~1` — undo the last commit, **keep changes staged** (redo the commit).
- `git reset --mixed HEAD~1` (default) — undo the commit, keep changes but **unstaged**.
- `git reset --hard HEAD~1` — undo the commit and **discard the changes**. Destructive.

**`git revert <hash>`** — creates a **new commit that inverts** a bad one. This is the *safe* undo for **shared** history (e.g. a bad commit already on `main`): it never rewrites history, so nobody's clone breaks.

**`git restore <file>`** (or older `git checkout -- <file>`) — throw away **unstaged** edits to a file, restoring the committed version. Destructive — those edits were never committed, so Git can't get them back.

**`git commit --amend`** — fix the **last** commit's message or add a forgotten change (rewrites that commit — only before it's shared).

**`git stash`** — shelve uncommitted work to switch context, then `git stash pop` to bring it back. The safe "I'm not sure" button.

Rule of thumb: **reset/amend/rebase for local history; revert for shared history.**

## Reading history and diffs

```bash
git log --oneline              # one line per commit: <hash> <subject>
git log --oneline --graph --all  # visualise branches diverging/merging
git diff                       # unstaged changes vs the index
git diff --staged              # staged changes vs the last commit
git show <hash>                # what one commit changed
git blame <file>               # who last touched each line (and in which commit)
```

`git log --oneline` is how you grab a hash to `revert`, `reset`, or `cherry-pick` against. In a diff, lines with `-` were removed, `+` added; a chunk header `@@ -a,b +c,d @@` marks the region.

## force-with-lease, not force

After a rebase your local history diverges from the remote, so a normal push is rejected and you need to force. **Always prefer `--force-with-lease`:**

```bash
git push --force-with-lease
```

Plain `--force` overwrites the remote branch **unconditionally** — including a teammate's commit you never pulled, which is then lost. `--force-with-lease` first checks the remote is still where you last saw it and **aborts if someone else pushed**, turning a silent data-loss footgun into a safe "someone moved this" error.

## Pull requests: the collaboration surface

A PR is where your code meets the team. What makes one good:

- **Small and focused.** One logical change. A 40-file PR gets a rubber-stamp; a 3-file PR gets a real review. Keep unrelated refactors in separate PRs.
- **A clear description.** What changed and *why* — the diff can show the what, never the why.
- **Green CI before you ask.** Passing tests/lint respect the reviewer's time.
- **A readable commit history.** Rebase/squash the "fix typo" noise before review.

When a reviewer comments, treat it as **collaboration, not criticism**: address or reply to each thread (fix it, or explain why not), push follow-up commits so the discussion stays reviewable, then re-request review. Don't silently force-push away the context they commented on, and don't argue every point to exhaustion. Reviewing and being reviewed well is the actual teamwork skill the internship is testing.

## cherry-pick, tag, bisect (the useful extras)

- **`git cherry-pick <hash>`** — copy one commit from another branch onto yours (e.g. hotfix a release without merging everything).
- **`git tag v1.2.0`** — a permanent label on a commit, for releases.
- **`git bisect`** — binary-search history to find the commit that introduced a bug; pairs beautifully with small, single-purpose commits.

## Mastery checklist — you can…

- Name the four places code lives and what moves it between them.
- Branch and switch without thinking, and avoid detached HEAD.
- Explain why the staging area lets you make focused commits.
- Choose merge vs rebase, and state the golden rule of rebase.
- Resolve a conflict: edit, remove markers, `add`, commit.
- Pick the right undo — soft/mixed/hard reset, revert, restore, amend, stash — by whether it's shared.
- Use `--force-with-lease` and say why it beats `--force`.
- Read `git log --oneline` and a diff, and grab a hash to act on.
- Open a small, well-described PR and respond to review like a teammate.
