/**
 * Exercises for the Team workflow guide.
 *
 * The pipeline around Git — hooks, commitlint, CI, pull requests, review — is
 * mostly written in prose and config rather than code, so these ask you to
 * write what you would write on a real team: a commit message, a hook, a PR
 * description, a review comment, or the steps you would take. Several quote
 * real output from CodeArena, so the situation is one you have already met.
 */
import type { GuideExercise } from "./types";

export const teamWorkflowExercises: GuideExercise[] = [
  {
    id: "which-layer",
    title: "Name the layer that catches it",
    prompt:
      "For each problem, write the FIRST layer that catches it, as `1. <layer>` … `6. <layer>`. The layers: `editor`, `pre-commit`, `commit-msg`, `CI`, `review`, `protection`.",
    language: "text",
    given: `1. a commit message "Fixed stuff."
2. a type error in a file you didn't touch, caused by your rename
3. an e2e test that fails only against a real Postgres
4. a correct, tested function that duplicates one the codebase already has
5. clicking Merge while CI is still running
6. a misspelled variable in the file you're typing in`,
    starter: `1.
2.
3.
4.
5.
6.
`,
    solution: `1. commit-msg
2. pre-commit
3. CI
4. review
5. protection
6. editor
`,
    hint: "For each one, ask: what is the cheapest moment anything could notice it? Number 2 depends on HOW lint-staged runs the typecheck.",
    explanation:
      "Each check lives at the earliest layer that can see the problem — that's **shift left**. 1 is pure text, so commitlint in `commit-msg` sees it before the commit even exists. 2 is caught at `pre-commit` only because CodeArena's typecheck is a lint-staged *function* that checks the whole app, not just the staged files. 3 needs a database, which no hook has, so the first layer is CI's e2e job with its Postgres service. 4 is correct and green: only a human who knows the codebase can say \"we already have this\". 5 is the job of protection (required status checks), and it's exactly what you keep by hand while the repo can't have rules. 6 shows as a squiggle before you've even saved.",
    checks: [
      { re: "^1\\.\\s*commit-msg", flags: "mi", label: "1 — `commit-msg`: commitlint sees the message" },
      { re: "^2\\.\\s*pre-commit", flags: "mi", label: "2 — `pre-commit`: the whole-app typecheck" },
      { re: "^3\\.\\s*ci\\b", flags: "mi", label: "3 — CI: the only layer with a database" },
      { re: "^4\\.\\s*review", flags: "mi", label: "4 — review: tools can't spot a duplicate" },
      { re: "^5\\.\\s*protection", flags: "mi", label: "5 — protection: required status checks" },
      { re: "^6\\.\\s*editor", flags: "mi", label: "6 — the editor, as you type" },
    ],
  },

  {
    id: "fix-commit-messages",
    title: "Rewrite five rejected messages",
    prompt:
      "commitlint refused all five. Rewrite each one so it passes CodeArena's config (Conventional Commits, plus the scope list), keeping its meaning. One per line.",
    language: "text",
    given: `Allowed scopes: api worker web dojo shared docs adr repo infra deps

1. Added login page.
2. fix: Handle the empty cursor
3. feature(api): rate-limit /auth/login
4. docs(readme): explain how to run the stack
5. update stuff        ← it bumped @nestjs/core from 11.0.1 to 11.1.0`,
    starter: `1. Added login page.
2. fix: Handle the empty cursor
3. feature(api): rate-limit /auth/login
4. docs(readme): explain how to run the stack
5. update stuff
`,
    solution: `1. feat(web): add the login page
2. fix: handle the empty cursor
3. feat(api): rate-limit /auth/login
4. docs: explain how to run the stack
5. build(deps): bump @nestjs/core from 11.0.1 to 11.1.0
`,
    hint: "Read each one against the rules: is there a type, is it on the list, is the scope on the list, does the subject start lowercase, does it end with a full stop?",
    explanation:
      "Each one broke a different rule. **1** had no type at all (`type-empty`), a past tense, and a full stop: the subject completes *\"If applied, this commit will…\"*, so `add`, not `added`. **2** is `subject-case`: lowercase after the colon. **3** is `type-enum`: the type is `feat`, and `feature` isn't on the list. **4** is `scope-enum`: `readme` isn't one of your scopes, so drop the scope (or use `repo`). **5** said nothing: a dependency bump is `build(deps):` (or `chore(deps):` on many teams), and it names the package and both versions, so `git log` alone tells you what changed.",
    checks: [
      { re: "^1\\.\\s*feat(\\((web|api)\\))?: add\\b", flags: "m", label: "1 — `feat`, and the imperative `add`" },
      { re: "^2\\.\\s*fix(\\([a-z]+\\))?: handle\\b", flags: "m", label: "2 — lowercase after the colon" },
      { re: "^3\\.\\s*feat\\(api\\): ", flags: "m", label: "3 — `feat`: `feature` isn't a type" },
      { re: "^4\\.\\s*docs(\\((docs|repo)\\))?: explain\\b", flags: "m", label: "4 — a scope from the list, or none" },
      { re: "^5\\.\\s*(build|chore)\\(deps\\): bump @nestjs/core", flags: "m", label: "5 — a type, the `deps` scope, and what actually changed" },
      { re: "^\\d\\.[^\\n]*\\.[ \\t]*$", flags: "m", expect: false, label: "no subject ends with a full stop" },
    ],
  },

  {
    id: "debug-hooks-path",
    title: "Debug a hook that never starts",
    prompt:
      "Every commit fails with `sh: 0: Illegal option --`, and `HUSKY=2` prints nothing. Explain what happened (line 1), then write the command that repairs it (line 2).",
    language: "text",
    given: `$ GIT_TRACE=1 git commit -m "chore: test"
trace: run_command: GIT_EDITOR=: GIT_INDEX_FILE=.git/index --version/_/pre-commit
sh: 0: Illegal option --

# The only husky command anyone ran today: pnpm exec husky --version`,
    starter: `1. what happened:
2. the fix:
`,
    solution: `1. what happened: husky has no --version flag. Its only argument is the hooks directory, so it set core.hooksPath to "--version/_", and Git now looks for hooks in a folder whose name starts with "--".
2. the fix: pnpm exec husky
`,
    hint: "Compare the path in the trace with the one `git config core.hooksPath` should print. Where could `--version` have come from?",
    explanation:
      "`HUSKY=2` printing nothing was the clue: husky's own code never ran, so the problem was **before** husky — in how Git finds the hook. `GIT_TRACE=1` shows the path Git tried, and that path came from `core.hooksPath`. `husky [dir]` sets that path to `<dir>/_`, and `husky --version` passed `--version` as the directory. Running `pnpm exec husky` with no argument resets it to `.husky/_` (so would `git config core.hooksPath .husky/_`). The lesson isn't about husky: when a tool misbehaves, find the layer that actually failed before guessing, and trace that layer.",
    checks: [
      { re: "hooks ?path", flags: "i", label: "names the setting that broke: `core.hooksPath`" },
      { re: "director|folder|argument", flags: "i", label: "explains that husky's argument is a directory" },
      { re: "^2\\.[^\\n]*(pnpm exec husky|npx husky|git config core\\.hooksPath \\.husky/_)[ \\t]*$", flags: "mi", label: "repairs it: re-run husky, or set the path back" },
    ],
  },

  {
    id: "commit-msg-hook",
    title: "Write the commit-msg hook",
    prompt:
      "Write the line that goes in `.husky/commit-msg`, so every message is checked before the commit is created.",
    language: "bash",
    given: `# Git calls this hook with ONE argument: the path of the file holding the message.
# @commitlint/cli is in devDependencies; the rules are in commitlint.config.mjs.`,
    starter: `# .husky/commit-msg
`,
    solution: `# .husky/commit-msg
pnpm exec commitlint --edit "$1"
`,
    hint: "commitlint can read a message from stdin or from a file. Git gives the hook a file.",
    explanation:
      "`$1` is the path Git passes to `commit-msg`, normally `.git/COMMIT_EDITMSG`, and `--edit` tells commitlint to read the message from there. The quotes keep the path in one piece if it ever contains a space. `pnpm exec` (or `npx`) runs the version pinned in **your lockfile**, so everyone checks against the same rules. If commitlint exits non-zero, the hook fails, and Git refuses the commit — unless someone uses `--no-verify`, which is why CI should check the messages again.",
    checks: [
      { re: "^\\s*(pnpm( exec)?|npx( --no)?) commitlint\\b", flags: "m", label: "runs the project's own commitlint" },
      { re: "(--edit|\\s-e)\\s+", label: "reads the message from a file (`--edit`)" },
      { re: "\"\\$1\"", label: "passes the path Git gives the hook, in quotes" },
    ],
  },

  {
    id: "lint-staged-entry",
    title: "Add a package to lint-staged",
    prompt:
      "A new TypeScript package, `packages/judge-kit`, joins the monorepo. Add its lint-staged entry: lint only the staged files, but typecheck the whole package.",
    language: "javascript",
    given: `// A STRING command gets the staged file names appended.
// A FUNCTION command returns the command to run, and gets nothing appended.
// The package is named "judge-kit" in its package.json, and has a "typecheck" script.`,
    starter: `// .lintstagedrc.mjs
export default {
  '*.md': 'prettier --write',
  // TODO: packages/judge-kit, TypeScript
};
`,
    solution: `// .lintstagedrc.mjs
export default {
  '*.md': 'prettier --write',
  'packages/judge-kit/**/*.ts': [
    'pnpm --filter judge-kit exec eslint --fix',
    () => 'pnpm --filter judge-kit run typecheck',
  ],
};
`,
    hint: "ESLint is happy to receive a list of files. `tsc` is not: given file names, it ignores tsconfig.json.",
    explanation:
      "The glob decides which staged files trigger the commands. ESLint goes in as a **string**, so lint-staged appends the staged files and only they get linted and fixed. The typecheck goes in as a **function**, so nothing is appended: `tsc` then reads the package's `tsconfig.json` and checks every file, which is the only way to catch a rename that broke a file you didn't stage. `--filter judge-kit` runs both inside the package, with its own configs.",
    checks: [
      { re: "['\"`]packages/judge-kit/\\*\\*/\\*\\.ts['\"`]", label: "a glob for the package's TypeScript files" },
      { re: "['\"`][^'\"`]*eslint[^'\"`]*--fix", label: "ESLint with `--fix`, as a string, so it gets the staged files" },
      { re: "\\(\\)\\s*=>\\s*['\"`][^'\"`]*typecheck", label: "the typecheck as a function, so no file list is appended" },
      { re: "--filter judge-kit", label: "runs inside the package with `--filter`" },
    ],
  },

  {
    id: "read-commitlint-output",
    title: "Read commitlint's verdict",
    prompt:
      "This is the real output for a message written on 1 Nov. Say what each rule wants (lines 1 and 2), then write a corrected header (line 3).",
    language: "text",
    given: `$ echo "docs: This weeks revision is focused on the judge." | pnpm exec commitlint
✖   subject must not be sentence-case, start-case, pascal-case, upper-case [subject-case]
✖   subject may not end with full stop [subject-full-stop]
✖   found 2 problems, 0 warnings`,
    starter: `1. [subject-case]
2. [subject-full-stop]
3.
`,
    solution: `1. [subject-case] the subject starts with a capital letter ("This"); it must start lowercase
2. [subject-full-stop] the subject ends with a period; a header is a title, so no full stop
3. docs: add the week 2 plan focused on the judge
`,
    hint: "The rule's name is in the brackets. For line 3, describe what the commit DOES, the way the imperative would.",
    explanation:
      "commitlint names the rule in brackets at the end of each ✖ line, so you never have to guess: find the rule, fix that one thing, test again with `echo … | pnpm exec commitlint`. Fixing only the two errors would give `docs: this weeks revision is focused on the judge`, which passes and is still weak. It describes the week, not the change, and it misses an apostrophe (*week's*). A header says what applying the commit does: `docs: add the week 2 plan …`.",
    checks: [
      { re: "^1\\.[^\\n]*(lower|capital|upper)", flags: "mi", label: "1 — the capital letter at the start" },
      { re: "^2\\.[^\\n]*(period|full stop|dot)", flags: "mi", label: "2 — the full stop at the end" },
      { re: "^3\\.\\s*docs(\\([a-z]+\\))?: [a-z]", flags: "m", label: "3 — `docs:`, then a lowercase start" },
      { re: "^3\\.[^\\n]*[^.\\s][ \\t]*$", flags: "m", label: "3 — no full stop at the end" },
      { re: "^3\\.\\s*docs[^:]*: (?!this\\b)", flags: "m", label: "3 — says what the commit does, not \"this …\"" },
    ],
  },

  {
    id: "read-ci-log",
    title: "Read a red CI run",
    prompt: "A real failure from CodeArena on 2 Nov. Answer the four questions, one line each.",
    language: "text",
    given: `$ gh run view 41461297356 --json jobs --jq '.jobs[] | "\\(.conclusion)\\t\\(.name)"'
failure  API end-to-end
success  Dojo content checks
success  Lint, typecheck, build

$ gh run view 41461297356 --log-failed | grep -m1 "Cannot find"
API end-to-end  Run pnpm --filter api test:e2e  Cannot find module './internal/class.js' from '../generated/prisma/client.ts'

1. Which job failed, and in which step?
2. "Lint, typecheck, build" passed. Why didn't the typecheck catch it?
3. Is it the code, the test, or the CI machine? Why, in a few words?
4. What do you run on your laptop to reproduce it?`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. the job "API end-to-end", in the step "pnpm --filter api test:e2e"
2. tsc maps './internal/class.js' to the .ts file, so typecheck and build pass; only Jest's own resolver looks for a real .js file
3. the code (the generated client's imports): it fails the same way on every machine, so it isn't the CI machine
4. pnpm --filter api test:e2e
`,
    hint: "The `--log-failed` line has three columns: the job, the step, then the error.",
    explanation:
      "Reading a red run is always the same three moves: **which job, which step, what error**, and `gh run view --log-failed` gives you all three without scrolling a thousand lines. The interesting part is question 2: the same import was fine for one tool and fatal for another, because `tsc` and Jest resolve modules differently. That's also why it's not the machine: anything that fails the same way everywhere is in the code or its config. And you reproduce with **the failing step's exact command**, so you're fixing the failure CI saw, not a different one.",
    checks: [
      { re: "^1\\.[^\\n]*end-to-end", flags: "mi", label: "1 — names the failing job" },
      { re: "^1\\.[^\\n]*test:e2e", flags: "mi", label: "1 — names the failing step" },
      { re: "^2\\.[^\\n]*(jest|resolv)", flags: "mi", label: "2 — only Jest's resolver needs a real .js file" },
      { re: "^3\\.[^\\n]*(code|config|generat|import)", flags: "mi", label: "3 — the code, not the machine" },
      { re: "^4\\.[^\\n]*test:e2e", flags: "mi", label: "4 — the failing step's exact command" },
    ],
  },

  {
    id: "pr-description",
    title: "Write the PR description",
    prompt:
      "Fill in the four headings for this change. Write it for a reviewer who hasn't seen the issue.",
    language: "markdown",
    given: `Issue #21: "The load balancer needs a health endpoint."
Your change: GET /health returns 200 {"status":"ok"}, without touching the database.
It's marked @Public(), because the load balancer has no token.
You ran: pnpm --filter api test (a new controller test passes), and curl -i localhost:3001/health`,
    starter: `## What

## Why

## How I tested it

## Security notes
`,
    solution: `## What

Adds \`GET /health\`, which answers \`200 {"status":"ok"}\` without touching the database.

## Why

The load balancer needs a cheap way to know whether this instance can take traffic. Closes #21.

## How I tested it

- \`pnpm --filter api test\`: the new controller test passes
- \`curl -i localhost:3001/health\` → \`HTTP/1.1 200 OK\` and \`{"status":"ok"}\`

## Security notes

The endpoint is public on purpose (\`@Public()\`): the load balancer has no token. It returns no
version, hostname or dependency status, so it tells an attacker nothing about the system.
`,
    hint: "Security notes is where a public endpoint has to justify itself. What could someone learn from it?",
    explanation:
      "Each heading answers a reviewer's question. **What**: the behaviour, in one line. **Why**: the problem, plus `Closes #21`, so merging closes the issue and links the two forever. **How I tested it**: the actual commands and what they showed — \"tested locally\" gives the reviewer nothing to check. **Security notes**: an unauthenticated endpoint is exactly the change a security reviewer looks for, so say why it's public and why it leaks nothing. A health check that printed versions or database hosts would hand an attacker a map.",
    checks: [
      { re: "## What[ \\t]*\\n\\s*[A-Za-z`]", label: "says what changes under **What**" },
      { re: "(Closes|Fixes|Resolves) #21", flags: "i", label: "links issue #21, so merging closes it" },
      { re: "## How I tested it[^#]*`[^`\\n]*(test|curl)[^`\\n]*`", flags: "i", label: "shows the commands you actually ran" },
      { re: "## Security notes[ \\t]*\\n\\s*[A-Za-z`(]", label: "fills in **Security notes**" },
      { re: "## Security notes[\\s\\S]*(public|unauthenticated|no token|@Public)", flags: "i", label: "explains why it's safe for it to be public" },
    ],
  },

  {
    id: "review-comments",
    title: "Rewrite three review comments",
    prompt:
      "Each comment is right, but hard to receive. Rewrite them: start with a label (`nit:`, `suggestion:`, `question:` or `issue:`), say why, and make clear whether it blocks the merge.",
    language: "text",
    given: `1. "This is wrong. Use a Set."
2. "Why would you name it data2??"
3. "You forgot to handle the error, again."   ← an unhandled rejection: the page goes blank`,
    starter: `1.
2.
3.
`,
    solution: `1. suggestion (non-blocking): a Set would make this lookup O(1) instead of O(n), which starts to matter once the list holds thousands of ids. Fine to merge as is if it stays small.
2. nit: could we call it \`submissionsByUser\`? \`data2\` makes the reader scroll back to find out what it holds.
3. issue (blocking): if this fetch rejects, the error is swallowed and the user sees a blank page. Could we catch it and show the error state, so failures are visible?
`,
    hint: "Which of the three is a real bug for users, and which are preferences? The label should say so before the reader gets to the reason.",
    explanation:
      "The label tells the author what matters before they read a word of the reason: a `nit:` can be ignored, an `issue (blocking):` can't. The reason turns an order into something the author can evaluate — maybe the list never exceeds ten items, and the Set doesn't matter. And every rewrite talks about **the code** (\"this lookup\", \"this fetch\"), never about the person: \"you forgot, again\" makes the author defend themselves instead of fixing the bug. That's the convention at [conventionalcomments.org](https://conventionalcomments.org/).",
    checks: [
      { re: "^1\\.\\s*(nit|suggestion|question|issue|thought)\\b", flags: "mi", label: "1 is labelled" },
      { re: "^2\\.\\s*(nit|suggestion|question)\\b", flags: "mi", label: "2 is labelled, as the preference it is" },
      { re: "^3\\.\\s*(issue|suggestion|question)[^\\n]*(?<!non-)blocking", flags: "mi", label: "3 says it blocks: a blank page is a bug, not a preference" },
      { re: "\\b(because|which|so that|so the|makes|matters|otherwise)\\b", flags: "i", label: "gives a reason" },
      { re: "\\b(wrong|again|forgot|why would you)\\b", flags: "i", expect: false, label: "no blame: about the code, not the person" },
    ],
  },

  {
    id: "merge-button",
    title: "Pick the merge button",
    prompt:
      "For each PR, write `squash`, `rebase` or `merge commit`, and why in a few words. One per line.",
    language: "text",
    given: `1. 1 commit: "fix(api): generate the Prisma client without .js import extensions"
2. 6 commits: "wip", "fix test", "oops", "address review", "feat(worker): add the docker runner", "lint"
3. 4 clean commits: two docs: and two chore:, each meaningful on its own
4. a release branch many people merged into, on a team whose policy is to keep branch history`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. squash: one commit either way, and the PR title becomes its message (rebase works too)
2. squash: the six commits are noise, and the PR title becomes one clean commit
3. rebase: each commit is clean and says something different, so keep them all
4. merge commit: the policy is to keep the branch's history, and a merge commit does exactly that
`,
    hint: "The question is always: do the branch's commits deserve to be on main one by one?",
    explanation:
      "Squash when the commits are noise: `main` gets one commit, titled with the PR title plus `(#N)`, so the title has to be a valid Conventional Commit. Rebase-merge when every commit is clean and says something different: squashing PR 3 would bury two `chore:` commits inside one `docs:` commit. A merge commit keeps the branch's shape, which some teams want for long-lived branches; with *Require linear history* on, that button disappears.",
    checks: [
      { re: "^1\\.\\s*(squash|rebase)", flags: "mi", label: "1 — squash (or rebase): one commit either way" },
      { re: "^2\\.\\s*squash", flags: "mi", label: "2 — squash the noise" },
      { re: "^3\\.\\s*rebase", flags: "mi", label: "3 — rebase: keep the clean commits" },
      { re: "^4\\.\\s*merge", flags: "mi", label: "4 — a merge commit, as the policy asks" },
    ],
  },

  {
    id: "leaked-secret",
    title: "A secret reached GitHub: order the steps",
    prompt:
      "Put the four steps in order, as `1. <letter>` … `4. <letter>`.",
    language: "text",
    given: `You pushed .env, with the real production JWT_SECRET, to a public repository 10 minutes ago.

A. delete .env in a new commit, and add it to .gitignore
B. rotate: generate a new JWT_SECRET and deploy it, so the old one stops working
C. purge the file from history (git filter-repo), force-push, and tell everyone who cloned
D. check the logs for tokens signed with the old secret while it was exposed`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. B
2. D
3. A
4. C
`,
    hint: "Bots scan public GitHub for secrets within minutes. Which step makes what they found worthless?",
    explanation:
      "**Rotate first.** The secret was public the moment it was pushed, and it stays copied in clones, forks and caches whatever you delete afterwards. Until you rotate it, anyone holding it can sign valid tokens. Then check whether that happened while it was exposed. Only then clean up: remove the file, then purge it from history. In CodeArena, rotating `JWT_SECRET` invalidates every access token at once, and users barely notice: their next request gets a 401, and the refresh interceptor gets them a new token, signed with the new secret.",
    checks: [
      { re: "^1\\.\\s*B\\b", flags: "m", label: "rotates FIRST: until then, the leaked secret still works" },
      { re: "^\\d\\.\\s*A\\b[\\s\\S]*^\\d\\.\\s*C\\b", flags: "m", label: "removes the file before rewriting history" },
      { re: "^\\d\\.\\s*D\\b", flags: "m", label: "checks whether the secret was used" },
    ],
  },
];
