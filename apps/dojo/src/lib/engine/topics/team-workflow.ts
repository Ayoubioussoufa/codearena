/**
 * Team-workflow cards, mixed into the Git topic: the pipeline around Git —
 * hooks, commitlint, lint-staged, CI, pull requests, protection, secrets.
 * Concept cards plus two type-the-command recalls. Drills the Team workflow
 * supplement guide.
 */
import { choice, text } from "../helpers";
import type { Generator } from "../types";

const DOC = { slug: "team-workflow", label: "Dojo guide — Team workflow" };

const commitValid: Generator = {
  id: "tw-commit-valid",
  title: "Which message passes commitlint?",
  generate: (rng) =>
    choice(rng, {
      genId: "tw-commit-valid",
      prompt:
        "With CodeArena's commitlint config (config-conventional, plus the scopes api, worker, web, dojo, shared, docs, adr, repo, infra, deps), which message is accepted?",
      correct: "fix(api): handle an empty cursor",
      wrong: [
        "fix(api): Handle an empty cursor",
        "fix(backend): handle an empty cursor",
        "fixed(api): handle an empty cursor.",
      ],
      explanation:
        "`Handle` breaks `subject-case` (the subject starts lowercase). `backend` breaks `scope-enum`: it isn't on the list, so `git log --grep 'fix(api)'` would miss it. `fixed` breaks `type-enum`, and the full stop breaks `subject-full-stop`. Test any message without committing: `echo \"…\" | pnpm exec commitlint`.",
      docRef: DOC,
    }),
};

const hookOrder: Generator = {
  id: "tw-hook-order",
  title: "The order of the commit hooks",
  generate: (rng) =>
    choice(rng, {
      genId: "tw-hook-order",
      prompt: "You run `git commit -m \"…\"`. In what order do things happen?",
      correct: "pre-commit hook → commit-msg hook → the commit is created",
      wrong: [
        "commit-msg hook → pre-commit hook → the commit is created",
        "the commit is created → pre-commit hook → commit-msg hook",
        "pre-commit hook → the commit is created → commit-msg hook",
      ],
      explanation:
        "`pre-commit` checks the staged files before there's even a message, so in CodeArena lint-staged runs first. `commit-msg` runs once the message exists, and the commit is created only if both exit with 0. That's why a refused message can still leave your files reformatted: `pre-commit` had already run.",
      docRef: DOC,
    }),
};

const whyCi: Generator = {
  id: "tw-why-ci",
  title: "Why CI re-checks what hooks checked",
  generate: (rng) =>
    choice(rng, {
      genId: "tw-why-ci",
      prompt: "The hooks already lint the code and check the message. Why does CI check again?",
      correct:
        "Hooks run on one laptop and `--no-verify` skips them; CI runs on a clean machine for every push, and with protection nobody can skip it",
      wrong: [
        "It doesn't need to: CI is only there to deploy",
        "Hooks only check formatting, never types or messages",
        "CI is faster than hooks, so it catches problems first",
      ],
      explanation:
        "**Local layers are for speed; server layers are for trust.** A hook gives you feedback in seconds, but it lives on one machine, and `--no-verify` or `HUSKY=0` turns it off. CI starts from a clean machine (no local `.env`, no stale generated files), runs everything, and behaves the same for everyone.",
      docRef: DOC,
    }),
};

const functionForm: Generator = {
  id: "tw-function-form",
  title: "lint-staged's function form",
  generate: (rng) =>
    choice(rng, {
      genId: "tw-function-form",
      prompt:
        "In `.lintstagedrc.mjs`, why is the typecheck written `() => 'pnpm --filter api run typecheck'` instead of a plain string?",
      correct:
        "A string gets the staged files appended, and `tsc` given files ignores tsconfig.json and misses breakage in unstaged files; the function form typechecks the whole app once",
      wrong: [
        "Functions run in parallel; strings run one after another",
        "lint-staged can't run pnpm commands written as strings",
        "The function form only runs when a .ts file has changed",
      ],
      explanation:
        "ESLint checks files one by one, so it's a string: it gets the staged files. Types don't work file by file: rename a function in one file, and the error appears in a file you never touched. Given file names, `tsc` also ignores `tsconfig.json`, so it would check with the wrong settings. The function form appends nothing, so the whole app is checked.",
      docRef: DOC,
    }),
};

const squashTitle: Generator = {
  id: "tw-squash-title",
  title: "What a squash merge writes on main",
  generate: (rng) =>
    choice(rng, {
      genId: "tw-squash-title",
      prompt:
        "You click **Squash and merge** on PR #3. What's the first line of the new commit on `main`?",
      correct: "The PR title, followed by ` (#3)`",
      wrong: [
        "The message of the branch's first commit",
        "The message of the branch's last commit",
        "`Merge pull request #3 from …`",
      ],
      explanation:
        "CodeArena's `a9a86cb fix(api): generate the Prisma client without .js import extensions (#3)` is exactly that. So with squash merging, the PR title **is** the commit message, and it has to be a valid Conventional Commit. No hook checks it, because GitHub creates that commit on its own servers: only a CI check on the PR can.",
      docRef: DOC,
    }),
};

const soloApprovals: Generator = {
  id: "tw-solo-approvals",
  title: "Required approvals when you work alone",
  generate: (rng) =>
    choice(rng, {
      genId: "tw-solo-approvals",
      prompt: "You protect `main` on a repository you work on alone. Why set required approvals to 0?",
      correct: "GitHub never lets a PR's author approve it, so 1 required approval would block every merge",
      wrong: [
        "Approvals slow CI down",
        "0 means every PR is approved automatically",
        "Rulesets don't support approvals on personal repositories",
      ],
      explanation:
        "The rule *Require a pull request* still applies with 0 approvals: every change goes through a PR and its checks. What you lose is the second pair of eyes, which you replace by reviewing your own diff the next morning. On a team you'd require 1 or 2 approvals, often from the code owners of the files changed.",
      docRef: DOC,
    }),
};

const upToDate: Generator = {
  id: "tw-up-to-date",
  title: "Why branches must be up to date",
  generate: (rng) =>
    choice(rng, {
      genId: "tw-up-to-date",
      prompt: "Why require a branch to be up to date with `main` before it can merge?",
      correct:
        "CI tested the branch with the old `main`; what lands is the branch plus the new `main`, and two passing changes can break together",
      wrong: [
        "It prevents merge conflicts entirely",
        "Git can't merge a branch that's behind",
        "It makes the history linear",
      ],
      explanation:
        "One PR renames a function, another adds a call to its old name. Each is green alone; together, `main` breaks. Requiring the branch to be up to date forces CI to run on the actual combination before it lands. Conflicts are a separate thing: they're textual, and Git tells you about them anyway.",
      docRef: DOC,
    }),
};

const secretFirst: Generator = {
  id: "tw-secret-first",
  title: "The first move after a leaked secret",
  generate: (rng) =>
    choice(rng, {
      genId: "tw-secret-first",
      prompt: "A real secret was pushed to a public repository. What's the first step?",
      correct: "Rotate it: create a new one and revoke the old one, so the leaked value is worthless",
      wrong: [
        "Delete the file in a new commit",
        "Make the repository private",
        "Rewrite history with git filter-repo and force-push",
      ],
      explanation:
        "Bots scan public GitHub for secrets within minutes, and every clone, fork and cache keeps a copy whatever you delete. Deleting, hiding and rewriting history all come too late. Rotating is the only step that takes the attacker's copy away from them. After that: check the logs for use, then clean the files and the history.",
      docRef: DOC,
    }),
};

const commitlintRange: Generator = {
  id: "tw-commitlint-range",
  title: "Check every commit on a branch",
  generate: () =>
    text({
      genId: "tw-commitlint-range",
      prompt:
        "Write the commitlint command that checks every commit between `origin/main` and `HEAD`, the way CI would.",
      answers: [
        "pnpm exec commitlint --from origin/main --to HEAD",
        "pnpm commitlint --from origin/main --to HEAD",
        "npx commitlint --from origin/main --to HEAD",
        "commitlint --from origin/main --to HEAD",
        "pnpm exec commitlint --from=origin/main --to=HEAD",
        "npx commitlint --from=origin/main --to=HEAD",
      ],
      placeholder: "pnpm exec commitlint …",
      explanation:
        "`--from` and `--to` set the range, just like `git log origin/main..HEAD`. The `commit-msg` hook checks one message, on one laptop. This checks all of a branch's messages, so a commit made with `--no-verify` can't reach `main` unchecked. In CI, use the PR's base and head SHAs, and check out with enough history (`fetch-depth: 0`).",
      docRef: DOC,
    }),
};

const hooksPath: Generator = {
  id: "tw-hookspath",
  title: "The one setting husky changes",
  generate: () =>
    text({
      genId: "tw-hookspath",
      prompt:
        "husky works by changing a single Git setting. Which command prints that setting's value?",
      answers: ["git config core.hooksPath", "git config --get core.hooksPath"],
      placeholder: "git config …",
      explanation:
        "`core.hooksPath` tells Git where to find hooks, and husky sets it to `.husky/_`, where its stubs call your committed `.husky/<hook>` files. `\"prepare\": \"husky\"` re-applies it after every `pnpm install`, which is how a fresh clone gets the hooks. When hooks misbehave, it's the first thing to check: a wrong value means Git never even reaches your scripts.",
      docRef: DOC,
    }),
};

export const teamWorkflowGens: Generator[] = [
  commitValid,
  hookOrder,
  whyCi,
  functionForm,
  squashTitle,
  soloApprovals,
  upToDate,
  secretFirst,
  commitlintRange,
  hooksPath,
];
