import type { Deck } from "../engines";

export const UNDO: Deck = {
  ask: "Which command?",
  options: ["git restore <file>", "git restore --staged <file>", "git commit --amend", "git reset --soft HEAD~1", "git rebase -i", "git revert <hash>"],
  pass: 10,
  cards: [
    { text: "You staged .env by accident. Keep the file.", answer: "git restore --staged <file>", why: "Out of the index, still on disk." },
    { text: "The last commit's message has a typo. Nobody has it yet.", answer: "git commit --amend", why: "Replaces the last commit. Fine while it's yours alone." },
    { text: "The commit that broke production is on main, and everyone has pulled it.", answer: "git revert <hash>", why: "Shared, so add the opposite. Never rewrite." },
    { text: "Throw away the edits you just made to one file. They were never staged.", answer: "git restore <file>", why: "And be sure: Git has no copy." },
    { text: "Undo your last, unpushed commit, and keep its changes staged to commit again.", answer: "git reset --soft HEAD~1", why: "The label moves, and the changes wait in the index." },
    { text: "Your unpushed branch reads: add login, typo, typo again. Make it one commit.", answer: "git rebase -i", why: "squash or fixup, before anyone sees it." },
    { text: "You forgot to include one file in the commit you just made, unpushed.", answer: "git commit --amend", why: "Stage it, then amend with --no-edit." },
    { text: "Four commits ago you added a password, on your own unpushed branch.", answer: "git rebase -i", why: "Edit or drop that commit. If it had been pushed: rotate the password first." },
    { text: "A pushed commit from last week must go. Three others came after it.", answer: "git revert <hash>", why: "It undoes that one, and leaves the three alone." },
    { text: "You committed on main by mistake, unpushed, and want the changes back, ready to commit on a branch.", answer: "git reset --soft HEAD~1", why: "Then git switch -c feature, and commit." },
    { text: "You staged the right file too early. You want to keep editing before it's in a commit.", answer: "git restore --staged <file>", why: "Nothing is lost, it's just not in the next commit." },
    { text: "An experiment in one file failed. Back to the last commit's version, and good riddance.", answer: "git restore <file>", why: "One file, back to the version Git has." },
  ],
};

export const DANGER: Deck = {
  ask: "Can you get it back?",
  options: ["Yes", "No, it's gone"],
  pass: 9,
  cards: [
    { text: "A commit, after git reset --hard HEAD~3 ten minutes ago.", answer: "Yes", why: "git reflog has its hash." },
    { text: "An edit you never staged, after git restore app.ts.", answer: "No, it's gone", why: "Git never had a copy." },
    { text: "A branch you deleted with git branch -D this morning, never pushed.", answer: "Yes", why: "The commits are still there: reflog, then git switch -c." },
    { text: "Untracked notes, after git clean -fd.", answer: "No, it's gone", why: "Never in a commit, never in the index. Run git clean -n first, next time." },
    { text: "The old version of a commit you amended an hour ago.", answer: "Yes", why: "Amending makes a new commit. The old one is in the reflog." },
    { text: "Uncommitted, unstaged work, after git reset --hard.", answer: "No, it's gone", why: "The reflog remembers commits, not your working tree." },
    { text: "Your commits, after a rebase that went badly and that you finished anyway.", answer: "Yes", why: "ORIG_HEAD or the reflog points at the branch before it." },
    { text: "A file deleted in a commit two months ago.", answer: "Yes", why: "git restore --source=<hash>~1 file. History has it." },
    { text: "A pushed branch, deleted on your machine.", answer: "Yes", why: "git switch <name> rebuilds it from the remote." },
    { text: "A new file you were typing, never saved in Git, after rm notes.md.", answer: "No, it's gone", why: "Git can't return what it never saw. Your editor's history might." },
  ],
};
