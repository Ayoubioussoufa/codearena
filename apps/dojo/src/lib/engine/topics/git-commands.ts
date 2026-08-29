/**
 * Git command-surface drills — the companion set to `git.ts`.
 *
 * `git.ts` covers the collaborative *workflow* (branch early, rebase vs merge,
 * PR etiquette). This file drills the *commands themselves*: which one to reach
 * for, what its flags mean, and which ones can lose work. Mostly type-the-
 * command recall, because recognising a command in a tutorial and producing it
 * under pressure are different skills.
 *
 * Drills the "Git — Workflow & Command Reference" guide.
 */
import { choice, text } from "../helpers";
import type { Generator } from "../types";

const DOC = {
  slug: "git-workflow",
  label: "Dojo guide — Git: Workflow & Command Reference",
};

/* ── inspecting ── */

const diffStaged: Generator = {
  id: "git-cmd-diff-staged",
  title: "See what you're about to commit",
  generate: () =>
    text({
      genId: "git-cmd-diff-staged",
      prompt:
        "You've staged some files. Before committing, you want to review exactly what is IN the staging area — not your unstaged edits. What command?",
      answers: ["git diff --staged", "git diff --cached"],
      placeholder: "git diff …",
      explanation:
        "`git diff --staged` (alias `--cached`) compares the index against the last commit — that IS your next commit. Plain `git diff` compares the working tree against the index, so it shows nothing once everything is staged. That surprise is not a bug: you asked 'what have I not staged?' and the answer was 'nothing'.",
      docRef: DOC,
    }),
};

const logSearchContent: Generator = {
  id: "git-cmd-log-search-content",
  title: "Find when code was added or removed",
  generate: () =>
    text({
      genId: "git-cmd-log-search-content",
      prompt:
        "A function named `parseUser` used to exist and is now gone. Find the commit that removed it, by searching commit CONTENT (not messages). What command?",
      answers: [
        'git log -S "parseUser"',
        "git log -S parseUser",
        "git log -S 'parseUser'",
        'git log -S"parseUser"',
      ],
      placeholder: "git log …",
      explanation:
        "`git log -S <string>` (the 'pickaxe') finds commits where the number of occurrences of that string changed — i.e. where it was added or deleted. `--grep` searches commit MESSAGES instead, which won't help when nobody mentioned the function by name. `-S` is the tool for 'when did this disappear?'.",
      docRef: DOC,
    }),
};

const blameLine: Generator = {
  id: "git-cmd-blame",
  title: "Who last changed each line",
  generate: () =>
    text({
      genId: "git-cmd-blame",
      prompt:
        "You want to see, for every line of `app.ts`, which commit last changed it and who wrote it. What command?",
      answers: ["git blame app.ts", "git blame -- app.ts"],
      placeholder: "git …",
      explanation:
        "`git blame app.ts` annotates each line with its last-touching commit and author. Use it not to assign fault but to find the COMMIT — then `git show <hash>` gives you the message and the surrounding change, which is where the 'why' lives. `git blame -L 10,20 app.ts` limits it to a line range.",
      docRef: DOC,
    }),
};

const statusMM: Generator = {
  id: "git-cmd-status-mm",
  title: "Reading git status --short",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-status-mm",
      prompt:
        "`git status --short` shows `MM src/app.ts`. What does the double M mean?",
      correct:
        "The file has staged changes AND newer unstaged changes — committing now saves only the older, staged version",
      wrong: [
        "The file was modified twice in the last two commits",
        "The file is modified and also renamed",
        "The file is modified on both your branch and the remote",
      ],
      explanation:
        "In `--short` output the LEFT column is the index and the RIGHT column is the working tree. `MM` means both differ: you staged a version, then edited the file again. Commit now and the newer edits are left behind. Run `git add` again first. ` M` (space then M) means modified but not staged; `M ` means staged and clean since.",
      docRef: DOC,
    }),
};

const showFileAtCommit: Generator = {
  id: "git-cmd-show-file-at-commit",
  title: "Read a file as it was in an old commit",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-show-file-at-commit",
      prompt:
        "You want to READ `config.ts` exactly as it looked in commit `a1b2c3d`, without changing anything in your working tree. What do you run?",
      correct: "git show a1b2c3d:config.ts",
      wrong: [
        "git checkout a1b2c3d config.ts",
        "git restore --source=a1b2c3d config.ts",
        "git diff a1b2c3d config.ts",
      ],
      explanation:
        "`git show <commit>:<path>` prints that file's contents at that commit — read-only, nothing on disk changes. The other two OVERWRITE your working copy with the old version, which is a different (and destructive) intent. `git diff` shows the difference, not the file.",
      docRef: DOC,
    }),
};

/* ── staging ── */

const addPatch: Generator = {
  id: "git-cmd-add-patch",
  title: "Stage part of a file",
  generate: () =>
    text({
      genId: "git-cmd-add-patch",
      prompt:
        "One file contains a bug fix AND an unrelated debug print. You want to stage only the bug-fix hunk, interactively. What command?",
      answers: ["git add -p", "git add --patch", "git add -p ."],
      placeholder: "git add …",
      explanation:
        "`git add -p` walks you through each hunk asking y/n/s (split). It's the command that makes the staging area worth having — one file can become two commits. It also forces you to re-read your own diff before committing, which catches a surprising number of leftover debug lines.",
      docRef: DOC,
    }),
};

const unstageFile: Generator = {
  id: "git-cmd-unstage",
  title: "Unstage a file, keep the edits",
  generate: () =>
    text({
      genId: "git-cmd-unstage",
      prompt:
        "You accidentally staged `notes.md`. Remove it from the staging area but KEEP your edits on disk. What command?",
      answers: [
        "git restore --staged notes.md",
        "git reset notes.md",
        "git reset HEAD notes.md",
        "git restore --staged -- notes.md",
      ],
      placeholder: "git …",
      explanation:
        "`git restore --staged notes.md` (modern) or `git reset notes.md` (older) removes it from the index while leaving the working-tree file untouched. Note the danger nearby: `git restore notes.md` WITHOUT `--staged` throws your edits away instead. The `--staged` flag is the whole difference between unstaging and destroying.",
      docRef: DOC,
    }),
};

const untrackFile: Generator = {
  id: "git-cmd-untrack",
  title: "Stop tracking a committed file",
  generate: () =>
    text({
      genId: "git-cmd-untrack",
      prompt:
        "You committed `.env` by mistake. You've added it to `.gitignore`, but Git keeps tracking it. Stop tracking it while keeping the file on your disk. What command?",
      answers: ["git rm --cached .env", "git rm --cached -- .env"],
      placeholder: "git rm …",
      explanation:
        "`git rm --cached .env` removes it from the index only — the file stays on disk. `.gitignore` never untracks anything; it only stops UNtracked files being picked up, so a file already in the index is updated forever regardless. Without `--cached`, `git rm` deletes the file too. And if a real secret was pushed: rotate the credential first, it's in the history permanently.",
      docRef: DOC,
    }),
};

/* ── committing ── */

const amendNoEdit: Generator = {
  id: "git-cmd-amend-noedit",
  title: "Add a forgotten file to the last commit",
  generate: () =>
    text({
      genId: "git-cmd-amend-noedit",
      prompt:
        "You committed, then noticed you forgot to include a file. You've already staged it. Fold it into the previous commit WITHOUT changing that commit's message. What command?",
      answers: ["git commit --amend --no-edit", "git commit --amend --no-edit ."],
      placeholder: "git commit …",
      explanation:
        "`git commit --amend --no-edit` replaces the last commit with a new one containing the extra staged changes, reusing the old message (`--no-edit` skips the editor). Only safe BEFORE pushing: amending creates a new commit hash, so if others already have the old one your histories diverge.",
      docRef: DOC,
    }),
};

const amendWhen: Generator = {
  id: "git-cmd-amend-when",
  title: "When --amend is safe",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-amend-when",
      prompt: "When is `git commit --amend` safe to use?",
      correct: "When the commit has not been pushed or otherwise shared yet",
      wrong: [
        "Any time, since it only edits the message",
        "Only on the main branch",
        "Whenever the working tree is clean",
      ],
      explanation:
        "`--amend` doesn't edit a commit — it REPLACES it with a new one that has a different hash. If nobody else has the old commit, that's invisible and harmless. If they do, their history and yours have diverged and they'll hit a confusing conflict on the next pull. The rule generalises: rewriting is fine on private history, dangerous on shared history.",
      docRef: DOC,
    }),
};

const commitAmGap: Generator = {
  id: "git-cmd-commit-am-gap",
  title: "What -am misses",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-commit-am-gap",
      prompt:
        "You created a brand-new file, then ran `git commit -am \"add feature\"`. What happens to the new file?",
      correct: "It is NOT committed — `-a` only stages files Git already tracks",
      wrong: [
        "It is committed along with everything else",
        "It is committed but marked as untracked",
        "The commit fails with an error about untracked files",
      ],
      explanation:
        "`-a` means 'stage all modified and deleted TRACKED files'. A file Git has never seen isn't tracked, so `-a` skips it silently — no error, no warning, and you only notice when the build breaks for someone else. Use `git add .` then `git commit`, or check `git status` before committing.",
      docRef: DOC,
    }),
};

/* ── undoing ── */

const resetFlags: Generator = {
  id: "git-cmd-reset-flags",
  title: "The three resets",
  generate: (rng) => {
    const cases = [
      {
        q: "Undo the last commit but leave its changes STAGED, ready to re-commit. Which reset?",
        answer: "git reset --soft HEAD~1",
        wrong: ["git reset --mixed HEAD~1", "git reset --hard HEAD~1", "git revert HEAD"],
        why: "`--soft` moves the branch pointer back and stops there — the changes stay in the index, so `git commit` immediately re-creates a commit from them. This is how you redo a commit message properly, or squash the last three commits (`git reset --soft HEAD~3`, then one commit).",
      },
      {
        q: "Undo the last commit and UNSTAGE its changes, but keep them on disk. Which reset?",
        answer: "git reset HEAD~1",
        wrong: ["git reset --soft HEAD~1", "git reset --hard HEAD~1", "git restore HEAD~1"],
        why: "`--mixed` is the DEFAULT, so plain `git reset HEAD~1` does it: the pointer moves back and the index is reset, but your files keep the changes as unstaged edits. Use it when you want to re-stage things differently — for example, to split one commit into two.",
      },
      {
        q: "Undo the last commit and DESTROY its changes completely. Which reset?",
        answer: "git reset --hard HEAD~1",
        wrong: ["git reset --soft HEAD~1", "git reset HEAD~1", "git clean -fd"],
        why: "`--hard` moves the pointer AND overwrites your working tree — the changes are gone from disk. It's the one Git command that routinely loses work. The commit itself is usually recoverable via `git reflog` for about 90 days, but any uncommitted edits mixed in are not.",
      },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "git-cmd-reset-flags",
      prompt: c.q,
      correct: c.answer,
      wrong: [...c.wrong],
      explanation: c.why,
      docRef: DOC,
    });
  },
};

const revertPushed: Generator = {
  id: "git-cmd-revert-pushed",
  title: "Undo a commit that's already pushed",
  generate: () =>
    text({
      genId: "git-cmd-revert-pushed",
      prompt:
        "Commit `a1b2c3d` is already pushed and other people have pulled it. Undo its effect safely, without rewriting history. What command?",
      answers: ["git revert a1b2c3d", "git revert -- a1b2c3d"],
      placeholder: "git …",
      explanation:
        "`git revert a1b2c3d` creates a NEW commit that applies the inverse change. Nothing is removed, so everyone else's history stays valid. `git reset` would delete the commit and force you to force-push, breaking every clone that already had it. The rule: not pushed → reset; already pushed → revert.",
      docRef: DOC,
    }),
};

const reflogRecover: Generator = {
  id: "git-cmd-reflog",
  title: "Recover after a bad reset",
  generate: () =>
    text({
      genId: "git-cmd-reflog",
      prompt:
        "You ran `git reset --hard` and destroyed two commits you needed. What command shows you every position HEAD has been in, so you can find their hashes?",
      answers: ["git reflog", "git reflog show"],
      placeholder: "git …",
      explanation:
        "`git reflog` lists everywhere HEAD has pointed, including commits no branch references any more. Find the hash from just before the mistake, then `git reset --hard <hash>` to return. Entries last about 90 days. Reflog is why almost nothing committed to Git is truly lost — it's local-only, though, so it can't recover work that was never committed.",
      docRef: DOC,
    }),
};

const cleanDryRun: Generator = {
  id: "git-cmd-clean-dryrun",
  title: "Preview before deleting untracked files",
  generate: () =>
    text({
      genId: "git-cmd-clean-dryrun",
      prompt:
        "Before running `git clean -fd` to delete untracked files, you want a DRY RUN listing exactly what would be deleted. What command?",
      answers: ["git clean -n", "git clean --dry-run", "git clean -nd", "git clean -dn"],
      placeholder: "git clean …",
      explanation:
        "`git clean -n` (or `--dry-run`) lists what would go without deleting anything. Always do this first: untracked files were never in a commit, so there is NO reflog, no stash, nothing to recover from. `-f` forces, `-d` includes directories, and `-x` additionally deletes gitignored files like `node_modules` and `.env`.",
      docRef: DOC,
    }),
};

/* ── branching ── */

const switchBack: Generator = {
  id: "git-cmd-switch-back",
  title: "Jump back to the previous branch",
  generate: () =>
    text({
      genId: "git-cmd-switch-back",
      prompt:
        "You're on `hotfix` and want to return to the branch you were on immediately before, without typing its name. What command?",
      answers: ["git switch -", "git checkout -"],
      placeholder: "git …",
      explanation:
        "`git switch -` (or `git checkout -`) toggles to the previously checked-out branch, exactly like `cd -` in a shell. Handy when you're bouncing between a feature branch and main to compare behaviour or cherry-pick a fix.",
      docRef: DOC,
    }),
};

const deleteBranchForce: Generator = {
  id: "git-cmd-delete-branch-force",
  title: "Delete an unmerged branch",
  generate: () =>
    text({
      genId: "git-cmd-delete-branch-force",
      prompt:
        "`git branch -d experiment` refused, saying the branch isn't fully merged. You're sure you want it gone. What command?",
      answers: ["git branch -D experiment", "git branch --delete --force experiment", "git branch -D -- experiment"],
      placeholder: "git branch …",
      explanation:
        "`-D` is the force form of `-d`. The lowercase version refuses to delete unmerged work precisely because that work would become unreachable — which is Git protecting you. `-D` overrides it. If you're wrong, `git reflog` usually still has the commits for about 90 days.",
      docRef: DOC,
    }),
};

const switchVsCheckout: Generator = {
  id: "git-cmd-switch-vs-checkout",
  title: "Why switch and restore exist",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-switch-vs-checkout",
      prompt:
        "Git 2.23 added `git switch` and `git restore`, which do things `git checkout` already did. Why were they added?",
      correct:
        "`checkout` did several unrelated jobs, so a typo could silently discard file changes instead of switching branch — splitting it makes the destructive one explicit",
      wrong: [
        "`checkout` was deprecated and will be removed in a future Git release",
        "`switch` and `restore` are faster on large repositories",
        "`checkout` only works with branches, not commits or tags",
      ],
      explanation:
        "`git checkout` switched branches, restored files from a commit, AND detached HEAD — all under one name. `git checkout main` moves branch; `git checkout main.ts` overwrites a file and destroys your edits. One character apart, wildly different outcomes. `switch` handles branches, `restore` handles files. `checkout` still works and appears everywhere in older material.",
      docRef: DOC,
    }),
};

/* ── rebase & merge ── */

const rebaseInteractive: Generator = {
  id: "git-cmd-rebase-interactive",
  title: "Edit the last N commits",
  generate: () =>
    text({
      genId: "git-cmd-rebase-interactive",
      prompt:
        "Your branch has 3 messy commits ('add login', 'fix typo', 'fix typo again'). Open the interactive editor to squash them before opening a PR. What command?",
      answers: ["git rebase -i HEAD~3", "git rebase --interactive HEAD~3", "git rebase -i head~3"],
      placeholder: "git rebase …",
      explanation:
        "`git rebase -i HEAD~3` opens an editor listing those three commits, each prefixed `pick`. Change the second and third to `squash` (or `fixup`) and they fold into the first. This is the standard tidy-up before review — but only on commits you haven't pushed, since it rewrites their hashes.",
      docRef: DOC,
    }),
};

const rebaseWords: Generator = {
  id: "git-cmd-rebase-words",
  title: "squash vs fixup vs reword",
  generate: (rng) => {
    const cases = [
      {
        q: "In an interactive rebase, which keyword folds a commit into the one above it AND discards its message entirely?",
        answer: "fixup",
        wrong: ["squash", "reword", "drop"],
        why: "`fixup` merges the changes upward and throws the message away — right for commits literally named 'fix typo'. `squash` also merges but opens an editor so you can combine both messages. `reword` keeps the commit but edits its message. `drop` deletes the commit and its changes.",
      },
      {
        q: "In an interactive rebase, which keyword keeps a commit's changes but lets you edit only its message?",
        answer: "reword",
        wrong: ["fixup", "squash", "edit"],
        why: "`reword` reopens just the message. `edit` is different and stronger: it pauses the rebase at that commit so you can amend its CONTENT, then you run `git rebase --continue`. `squash` and `fixup` both combine a commit into the previous one.",
      },
      {
        q: "In an interactive rebase, which keyword removes a commit and its changes from history entirely?",
        answer: "drop",
        wrong: ["fixup", "reword", "squash"],
        why: "`drop` (or simply deleting the line) removes the commit — its changes never happened. Note the risk: if a later commit depends on that code, you'll hit a conflict when the rebase replays it. `fixup` and `squash` keep the changes and merge them upward instead.",
      },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "git-cmd-rebase-words",
      prompt: c.q,
      correct: c.answer,
      wrong: [...c.wrong],
      explanation: c.why,
      docRef: DOC,
    });
  },
};

const rebaseContinue: Generator = {
  id: "git-cmd-rebase-continue",
  title: "Resume after a rebase conflict",
  generate: () =>
    text({
      genId: "git-cmd-rebase-continue",
      prompt:
        "A rebase stopped on a conflict. You've edited the file and run `git add` on it. What command resumes the rebase?",
      answers: ["git rebase --continue"],
      placeholder: "git rebase …",
      explanation:
        "`git rebase --continue` replays the remaining commits. Note that staging IS the resolution: `git add` is how you tell Git 'this file is settled' — there's no separate resolve command. If you'd rather back out entirely, `git rebase --abort` returns you to exactly where you started.",
      docRef: DOC,
    }),
};

const mergeAbort: Generator = {
  id: "git-cmd-merge-abort",
  title: "Back out of a bad merge",
  generate: () =>
    text({
      genId: "git-cmd-merge-abort",
      prompt:
        "A merge produced conflicts in twelve files and you'd rather not deal with it now. Undo the whole merge attempt and return to the pre-merge state. What command?",
      answers: ["git merge --abort"],
      placeholder: "git merge …",
      explanation:
        "`git merge --abort` restores your branch to exactly where it was before the merge started, conflicts and all discarded. The rebase equivalent is `git rebase --abort`. Both are safe escape hatches — knowing they exist is what makes it reasonable to attempt a scary merge in the first place.",
      docRef: DOC,
    }),
};

/* ── remotes ── */

const firstPush: Generator = {
  id: "git-cmd-first-push",
  title: "Push a new branch the first time",
  generate: () =>
    text({
      genId: "git-cmd-first-push",
      prompt:
        "You created a local branch `feature` and want to push it to GitHub for the first time, so that future plain `git push` works. What command?",
      answers: [
        "git push -u origin feature",
        "git push --set-upstream origin feature",
        "git push -u origin HEAD",
      ],
      placeholder: "git push …",
      explanation:
        "`-u` (`--set-upstream`) records that your local `feature` tracks `origin/feature`. After that, bare `git push` and `git pull` know where to go. Without it, Git asks you to specify the remote and branch every single time.",
      docRef: DOC,
    }),
};

const fetchVsPull: Generator = {
  id: "git-cmd-fetch-vs-pull",
  title: "fetch vs pull",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-fetch-vs-pull",
      prompt: "What's the difference between `git fetch` and `git pull`?",
      correct:
        "`fetch` downloads remote changes without touching your files; `pull` is `fetch` followed by a merge (or rebase) into your branch",
      wrong: [
        "`fetch` gets one branch, `pull` gets all branches",
        "`fetch` is read-only on the server; `pull` also uploads your commits",
        "They are aliases for the same operation",
      ],
      explanation:
        "`git fetch` is always safe — it updates your knowledge of the remote and changes nothing in your working tree, so you can inspect with `git log origin/main` before integrating. `git pull` does that AND immediately merges, which is where surprise conflicts and unwanted merge commits come from mid-task.",
      docRef: DOC,
    }),
};

const pullRebase: Generator = {
  id: "git-cmd-pull-rebase",
  title: "Pull without a merge commit",
  generate: () =>
    text({
      genId: "git-cmd-pull-rebase",
      prompt:
        "You want to bring in remote changes and replay YOUR local commits on top, instead of creating a merge commit. What command?",
      answers: ["git pull --rebase", "git pull -r"],
      placeholder: "git pull …",
      explanation:
        "`git pull --rebase` fetches, then rebases your local commits onto the updated remote tip — a straight line, no 'Merge branch main' noise. Set it as the default with `git config --global pull.rebase true`. Safe here because the commits being replayed are your own unpushed ones.",
      docRef: DOC,
    }),
};

const deleteRemoteBranch: Generator = {
  id: "git-cmd-delete-remote-branch",
  title: "Delete a branch on GitHub",
  generate: () =>
    text({
      genId: "git-cmd-delete-remote-branch",
      prompt:
        "Your PR is merged. Delete the branch `feature` from the remote `origin` (not just locally). What command?",
      answers: [
        "git push origin --delete feature",
        "git push origin -d feature",
        "git push --delete origin feature",
      ],
      placeholder: "git push …",
      explanation:
        "`git push origin --delete feature` removes the remote branch. Deleting your local copy with `git branch -d feature` does NOT touch the remote — they're independent. Left-over merged branches are the main reason `git branch -a` becomes unreadable on long-lived projects.",
      docRef: DOC,
    }),
};

const forceWithLeaseWhy: Generator = {
  id: "git-cmd-force-with-lease-why",
  title: "Why --force-with-lease",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-force-with-lease-why",
      prompt:
        "You rewrote history and must overwrite the remote branch. Why prefer `--force-with-lease` over `--force`?",
      correct:
        "It aborts if the remote moved since your last fetch, so you can't silently destroy someone else's pushed commits",
      wrong: [
        "It is faster because it transfers only the changed commits",
        "It creates a backup branch on the remote before overwriting",
        "It asks the server for permission before rewriting",
      ],
      explanation:
        "`--force` is a blind write: whatever is on the remote is replaced, including commits you never saw. `--force-with-lease` is a compare-and-swap — it first checks the remote still matches what your last fetch recorded, and refuses if not. Caveat: it compares your remote-TRACKING ref, which a background fetch can silently update.",
      docRef: DOC,
    }),
};

/* ── stashing ── */

const stashUntracked: Generator = {
  id: "git-cmd-stash-untracked",
  title: "Stash including new files",
  generate: () =>
    text({
      genId: "git-cmd-stash-untracked",
      prompt:
        "You need to switch branches. `git stash` left your brand-new untracked files behind. What command stashes those too?",
      answers: [
        "git stash -u",
        "git stash --include-untracked",
        "git stash push -u",
        "git stash -au",
      ],
      placeholder: "git stash …",
      explanation:
        "Plain `git stash` only shelves TRACKED files, so new files stay in your working tree and follow you onto the other branch — usually a nasty surprise. `-u` (`--include-untracked`) takes them along. `-a` (`--all`) goes further and includes gitignored files too.",
      docRef: DOC,
    }),
};

const stashPopVsApply: Generator = {
  id: "git-cmd-stash-pop-vs-apply",
  title: "pop vs apply",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-stash-pop-vs-apply",
      prompt: "What's the difference between `git stash pop` and `git stash apply`?",
      correct:
        "`pop` applies the stash and deletes it from the stash list; `apply` applies it and keeps it",
      wrong: [
        "`pop` takes the oldest stash, `apply` takes the newest",
        "`pop` applies to the current branch, `apply` applies to all branches",
        "`pop` restores untracked files, `apply` restores only tracked ones",
      ],
      explanation:
        "Both restore your shelved changes. `pop` removes the entry on success — the usual choice, since a leftover stash you forget about causes confusion later. `apply` keeps it, which is what you want when applying the same work to two different branches, or when you're not yet sure it merges cleanly.",
      docRef: DOC,
    }),
};

const stashList: Generator = {
  id: "git-cmd-stash-list",
  title: "See what's on the shelf",
  generate: () =>
    text({
      genId: "git-cmd-stash-list",
      prompt:
        "You stashed work several times over the past week and can't remember what's saved. What command lists every stash you have?",
      answers: ["git stash list"],
      placeholder: "git stash …",
      explanation:
        "`git stash list` shows entries as `stash@{0}`, `stash@{1}`, … with newest first. `git stash show -p stash@{1}` prints one as a diff, and any stash command takes that reference — e.g. `git stash pop stash@{1}`. Naming them at save time (`git stash push -m \"wip auth\"`) makes this list actually readable.",
      docRef: DOC,
    }),
};

/* ── moving commits ── */

const cherryPick: Generator = {
  id: "git-cmd-cherry-pick",
  title: "Copy one commit to another branch",
  generate: () =>
    text({
      genId: "git-cmd-cherry-pick",
      prompt:
        "A one-line bug fix sits in commit `a1b2c3d` on your feature branch, and `main` needs it NOW without the rest of the branch. You're already on `main`. What command?",
      answers: ["git cherry-pick a1b2c3d", "git cherry-pick -- a1b2c3d"],
      placeholder: "git …",
      explanation:
        "`git cherry-pick a1b2c3d` applies that commit's changes as a NEW commit on your current branch. Use it for urgent hotfixes that can't wait for the whole feature. Overuse duplicates work across branches and makes later merges conflict, so treat it as an exception rather than a workflow.",
      docRef: DOC,
    }),
};

const bisectFlow: Generator = {
  id: "git-cmd-bisect-flow",
  title: "Find the commit that broke it",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-bisect-flow",
      prompt:
        "Something worked at tag `v1.0` and is broken now, across ~100 commits. What does `git bisect` do after you mark the current commit bad and `v1.0` good?",
      correct:
        "It checks out a commit halfway between them and asks you to test it, halving the range each time — about 7 tests total",
      wrong: [
        "It automatically runs your test suite on all 100 commits and reports every failure",
        "It scans commit messages for words like 'fix' and 'break' to guess the culprit",
        "It reverts commits one at a time from newest to oldest until the bug disappears",
      ],
      explanation:
        "Bisect is a binary search over history: each answer of `git bisect good` or `git bisect bad` halves the candidates, so log2(100) is about 7 steps. Finish with `git bisect reset`. Crucially it only works if you have many small commits — one giant commit gives it nothing to search, which is a concrete reason to commit in slices.",
      docRef: DOC,
    }),
};

const tagAnnotated: Generator = {
  id: "git-cmd-tag-annotated",
  title: "Lightweight vs annotated tags",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-tag-annotated",
      prompt:
        "For marking a real release, why use `git tag -a v1.0.0 -m \"…\"` rather than plain `git tag v1.0.0`?",
      correct:
        "An annotated tag is a real object storing author, date and message; a lightweight tag is just a name pointing at a commit",
      wrong: [
        "Only annotated tags can be pushed to a remote",
        "Lightweight tags are deleted automatically after 90 days",
        "Annotated tags can point at a branch, lightweight ones cannot",
      ],
      explanation:
        "An annotated tag records WHO tagged the release, WHEN, and WHY — which is exactly the metadata you want months later. A lightweight tag is a bare pointer with none of it. Either way, remember tags are not pushed by default: you need `git push --tags` or `git push origin v1.0.0`.",
      docRef: DOC,
    }),
};

const checkIgnore: Generator = {
  id: "git-cmd-check-ignore",
  title: "Find which rule is ignoring a file",
  generate: () =>
    text({
      genId: "git-cmd-check-ignore",
      prompt:
        "`git add build/output.js` seems to do nothing and you suspect a `.gitignore` rule. Find out WHICH rule is hiding it. What command?",
      answers: [
        "git check-ignore -v build/output.js",
        "git check-ignore --verbose build/output.js",
      ],
      placeholder: "git …",
      explanation:
        "`git check-ignore -v <path>` prints the file, line number and text of the exact rule that matched — invaluable when several `.gitignore` files at different levels are in play. If it prints nothing, no rule matches and your problem is something else. `git add -f` force-adds past an ignore rule when you really mean to.",
      docRef: DOC,
    }),
};

/* ── danger ── */

const unrecoverable: Generator = {
  id: "git-cmd-unrecoverable",
  title: "What Git can't get back",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-unrecoverable",
      prompt:
        "Which of these losses can `git reflog` generally NOT help you recover?",
      correct: "Uncommitted edits destroyed by `git restore file.ts` or `git clean -fd`",
      wrong: [
        "Commits removed by `git reset --hard`",
        "An unmerged branch deleted with `git branch -D`",
        "Commits rewritten by an interactive rebase",
      ],
      explanation:
        "Reflog tracks where HEAD and branches have pointed, so anything that was ever COMMITTED is usually reachable for about 90 days. Work that was never committed has no object in the database — nothing to point at. That's the real dividing line: commit-level mistakes are recoverable, working-tree mistakes are not. `git stash` before anything risky.",
      docRef: DOC,
    }),
};

const gitignoreTracked: Generator = {
  id: "git-cmd-gitignore-tracked",
  title: "Why .gitignore didn't work",
  generate: (rng) =>
    choice(rng, {
      genId: "git-cmd-gitignore-tracked",
      prompt:
        "You added `config/secrets.json` to `.gitignore`, but Git still shows it as modified on every change. Why?",
      correct:
        "`.gitignore` only applies to untracked files — this one is already tracked, so it must be untracked with `git rm --cached`",
      wrong: [
        "The pattern needs a leading slash to match a nested path",
        "`.gitignore` only takes effect after the next commit",
        "Ignore rules are cached; you need to run `git gc` to refresh them",
      ],
      explanation:
        "Ignore rules are consulted only when Git decides whether to start tracking a NEW file. A file already in the index is updated forever regardless. Fix with `git rm --cached config/secrets.json`, then commit. And if it held a real secret that was pushed, rotate the credential — it stays in history, and removing it later doesn't un-leak it.",
      docRef: DOC,
    }),
};

export const gitCommandGens: Generator[] = [
  // inspecting
  diffStaged,
  logSearchContent,
  blameLine,
  statusMM,
  showFileAtCommit,
  // staging
  addPatch,
  unstageFile,
  untrackFile,
  // committing
  amendNoEdit,
  amendWhen,
  commitAmGap,
  // undoing
  resetFlags,
  revertPushed,
  reflogRecover,
  cleanDryRun,
  // branching
  switchBack,
  deleteBranchForce,
  switchVsCheckout,
  // rebase & merge
  rebaseInteractive,
  rebaseWords,
  rebaseContinue,
  mergeAbort,
  // remotes
  firstPush,
  fetchVsPull,
  pullRebase,
  deleteRemoteBranch,
  forceWithLeaseWhy,
  // stashing
  stashUntracked,
  stashPopVsApply,
  stashList,
  // moving commits
  cherryPick,
  bisectFlow,
  tagAnnotated,
  checkIgnore,
  // danger
  unrecoverable,
  gitignoreTracked,
];
