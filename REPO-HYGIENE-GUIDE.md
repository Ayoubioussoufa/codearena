# Repo Hygiene — Explained Simply

Two parts:

- **Part 1** — what we're doing and why, in plain words. Read it once.
- **Part 2** — a numbered walkthrough. Type each command in order. After each one I tell you what you should see.

There's a **[glossary](#glossary)** at the bottom for every technical word used.

---

# PART 1 — WHAT AND WHY

## The two problems we're fixing

**Problem 1: nothing checks your work before you save it.**

Right now you can save broken code into your project's history and nobody stops you. Typo, missing import, whatever — it goes in.

**Problem 2: your entire project is one giant save.**

You have exactly **one** save point (a "commit") containing **225 files**. Months of work, one blob.

---

## Problem 1 explained: the bouncer

Think of a nightclub with a bouncer at the door. Before anyone gets in, the bouncer checks them.

Git can do this. Every time you save your work, Git can run a script first. If that script says "no", the save is cancelled.

**That script is called a "hook."** That's the whole idea. A hook is a bouncer.

We want two bouncers:

| Bouncer | Checks |
| --- | --- |
| Bouncer 1 | **Your code.** Is it valid? Any typos? |
| Bouncer 2 | **Your description.** Did you describe what you changed? |

### The problem with bouncers

Git keeps bouncers in a hidden folder called `.git/`. That folder is **private to your computer**. It never gets copied when someone downloads your project.

So if you write a bouncer, only *you* have it. Your teammate downloads the project — no bouncer.

**This is on purpose.** Imagine if bouncers *were* copied. You download a stranger's project just to look at it, and their script runs on your laptop and steals your passwords. Downloading has to be safe. So Git says: bouncers stay local.

### Three tools fix this, one job each

**Husky** — moves the bouncers into a normal folder that *does* get copied, then tells Git "look over there instead."

That's it. Husky doesn't check anything. It's a shelf. You write the bouncers yourself.

**lint-staged** — makes checking fast.

Without it, every save checks all 225 files. That takes forever, so you'd turn it off within a day. lint-staged checks **only the files you actually changed**.

*Airport analogy: they scan the bag you're carrying, not every bag in the building.*

**commitlint** — spell-check for your description.

Every save needs a description. Without rules people write "stuff", "fix", "asdf". commitlint forces a format:

```
feat(web): add search bar
 |    |      \___ what you did
 |    \__________ which part of the project
 \_______________ what kind of change
```

### How they work together

```
You type: git commit

  1. Bouncer 1 runs  ->  lint-staged  ->  checks your changed files
                         Broken? Save cancelled.

  2. You write the description

  3. Bouncer 2 runs  ->  commitlint  ->  checks the description
                         Bad format? Save cancelled.

  4. Saved.
```

---

## Problem 2 explained: the moving boxes

You moved house and put **everything** into one enormous box labeled "stuff."

That's your project right now: one save, 225 files, labeled `first commit`.

**Why it's bad:**

**You can't undo one thing.** In two months something breaks. With small boxes you throw out one box. With one giant box, your only option is throwing out *everything*.

**You can't find when something broke.** Git has a tool that finds the exact save that introduced a bug — but only if you have many saves. With one, it says "the bug is in `first commit`." You knew that.

**Employers look at this.** When someone considers hiring you, one of the first things they run is a command listing your saves. They see:

```
first commit          225 files, +69,658 lines
```

That looks like you dumped a folder in, or generated it. Compare:

```
feat(dojo): dsa problem registry and generators
feat(web): problem workspace and editor
feat(api): nestjs bootstrap and prisma schema
chore(infra): docker compose for postgres and redis
...
```

That looks like someone who works step by step.

**The fix:** unpack the giant box, sort into about 17 labeled boxes.

### One honest warning

All 17 saves will be dated **today**. We are not faking dates to look like months of work. That would be lying to employers, and it's detectable. What we're doing is honest: organising an import. The *organisation* is what looks good, not the dates.

---

## One thing you'll see along the way

`pnpm` appears everywhere. It's the tool that downloads code libraries your project needs.

It replaces `npm`. The difference in one sentence:

> **npm** gives every project its own copy of every library. **pnpm** keeps one copy on your computer and lets all projects share it — like a library instead of everyone buying their own books.

Your project already uses pnpm. Nothing to decide. Just never type `npm install` here — mixing the two causes real problems.

---

# PART 2 — THE WALKTHROUGH

Type these in order. Don't skip. After each one I say what you should see.

**Where to type:** open a terminal in `/home/rhyzome/codeArena`. Confirm you're in the right place:

```bash
pwd
```

> Should print: `/home/rhyzome/codeArena`

---

## STEP 1 — Download the project's libraries

**Why:** right now only one of your four sub-projects has its libraries downloaded. The other three are empty. If we skip this, the checks will fail — not because your code is bad, but because the libraries are missing.

```bash
pnpm install
```

> **You'll see:** lots of progress lines, then `Done in Xs`. Takes 30 seconds to a few minutes.

---

## STEP 2 — Check your code is actually OK right now

**Why:** we're about to build a machine that blocks bad code. First we must be sure your code is currently good. Otherwise the machine blocks everything and you won't know whether the problem is your code or the machine.

```bash
pnpm --filter shared exec tsc --noEmit && echo "OK shared"
pnpm --filter api    exec tsc --noEmit && echo "OK api"
pnpm --filter web    exec tsc --noEmit && echo "OK web"
pnpm --filter dojo   exec tsc --noEmit && echo "OK dojo"
```

> **You'll see:** four lines — `OK shared`, `OK api`, `OK web`, `OK dojo`.

Each command checks one part of your project for mistakes. (`tsc` is the TypeScript checker. `--noEmit` means "just look, don't build anything.")

**If any fails:** stop and fix it first. Don't install a smoke alarm in a burning house.

---

## STEP 3 — Install the three tools

```bash
pnpm add -Dw husky lint-staged @commitlint/cli @commitlint/config-conventional
```

| Piece | Means |
| --- | --- |
| `pnpm add` | download and install |
| `-D` | these are tools for *building*, not part of the shipped app |
| `-w` | install at the top of the project, not inside one sub-app |
| the four names | husky, lint-staged, commitlint, and commitlint's rulebook |

> **You'll see:** `+ husky 9.x.x`, `+ lint-staged 17.x.x`, and so on, then `Done`.

---

## STEP 4 — Turn on Husky

```bash
pnpm exec husky init
```

**What it does:** creates a folder called `.husky/` and tells Git "bouncers live here now, not in the hidden folder."

> **You'll see:** not much. Maybe one line.

Check it worked:

```bash
git config core.hooksPath
```

> **Should print:** `.husky/_`
> **If it prints nothing:** run `pnpm run prepare`, then check again.

---

## STEP 5 — Write Bouncer 1 (checks your code)

```bash
printf 'pnpm lint-staged\n' > .husky/pre-commit
```

**What this does:** creates a file called `.husky/pre-commit` containing one line: `pnpm lint-staged`.

**That's a real bouncer.** It's a one-line script. The name `pre-commit` is what Git looks for — it means "run me *before* saving."

Check it:

```bash
cat .husky/pre-commit
```

> **Should print:** `pnpm lint-staged`

---

## STEP 6 — Write Bouncer 2 (checks your description)

```bash
printf 'pnpm commitlint --edit "$1"\n' > .husky/commit-msg
```

**What `$1` means:** when Git runs this bouncer, it hands over the location of a temporary file holding your description. `$1` is "the thing Git just handed me." So the line says: "commitlint, go read the description and judge it."

Check it:

```bash
cat .husky/commit-msg
```

> **Should print:** `pnpm commitlint --edit "$1"`

---

## STEP 7 — Make the bouncers runnable

```bash
chmod +x .husky/pre-commit .husky/commit-msg
```

**Why this matters a lot:** on Linux a file needs "permission to run", or it's treated as plain text. `chmod +x` grants it.

**If you skip this, Git ignores your bouncers completely and says nothing.** No error, no warning — it just silently doesn't work. This is the number one reason people think hooks are broken.

---

## STEP 8 — Give each sub-project a "check my code" button

**Why:** the bouncer needs a command to run for each sub-project. Three of them don't have one yet.

Save this as a small script first:

```bash
cat > /tmp/add-typecheck.js <<'SCRIPT'
const fs = require("fs");
for (const p of ["apps/api", "apps/web", "apps/dojo"]) {
  const f = p + "/package.json";
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  j.scripts.typecheck = "tsc --noEmit";
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
  console.log("added typecheck to", f);
}
const r = JSON.parse(fs.readFileSync("package.json", "utf8"));
r.scripts.typecheck = "pnpm -r typecheck";
fs.writeFileSync("package.json", JSON.stringify(r, null, 2) + "\n");
console.log("added typecheck to root");
SCRIPT
```

Then run it:

```bash
node /tmp/add-typecheck.js
```

> **You'll see:** four lines confirming each file was updated.

This adds a shortcut named `typecheck` to each sub-project, so `pnpm --filter web run typecheck` now works.

---

## STEP 9 — Tell lint-staged what to check

```bash
cat > .lintstagedrc.mjs <<'CONFIG'
export default {
  'apps/api/**/*.ts': [
    'pnpm --filter api exec eslint --fix',
    () => 'pnpm --filter api run typecheck',
  ],
  'apps/web/**/*.{ts,tsx}': [
    'pnpm --filter web exec eslint --fix',
    () => 'pnpm --filter web run typecheck',
  ],
  'apps/dojo/**/*.{ts,tsx}': [
    'pnpm --filter dojo exec eslint --fix',
    () => 'pnpm --filter dojo run typecheck',
  ],
  'packages/shared/**/*.ts': [() => 'pnpm --filter shared run typecheck'],
};
CONFIG
```

**How to read this file:** each block says *"if I changed a file matching this pattern, run these commands."*

So: "if I changed any `.ts` file inside `apps/api`, run the style-checker and the code-checker for `api`."

**Three things that look weird but matter:**

**1. Why `pnpm --filter api exec eslint` and not just `eslint`?**

Each sub-app has its own style rulebook. If you run the style-checker from the top of the project, it looks for a rulebook there, finds none, and crashes. `--filter api` means "go stand inside `apps/api` first, then run" — so it finds that app's rulebook.

**2. Why is `typecheck` wrapped in `() =>` but `eslint` isn't?**

lint-staged automatically adds your changed filenames to the end of each command.

That's right for the style-checker — it checks one file at a time.

It's **disastrous** for the code-checker. If you hand `tsc` specific filenames, it throws away all your project settings. It would still run, still say "OK", and be checking the wrong thing. Wrapping it in `() =>` means "run this command *without* adding filenames."

**3. Why check the whole sub-project instead of just the changed files?**

Because a change in one file can break a different file. If you change something in `shared` and `web` uses it, the error appears in `web` — a file you didn't touch. Checking only changed files would miss it.

---

## STEP 10 — Set the rules for descriptions

```bash
cat > commitlint.config.mjs <<'CONFIG'
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['api', 'web', 'dojo', 'shared', 'docs', 'adr', 'repo', 'infra', 'deps'],
    ],
  },
};
CONFIG
```

**Line by line:**

- `extends` — "use the standard rulebook" (the `feat:` / `fix:` format).
- `scope-enum` — "the part-of-project name must be one of these nine." This stops you writing `api` one day and `backend` the next, which makes your history impossible to search.
- The `2` means "error" (block the save). A `1` would mean "warning" (just complain).

**The allowed types:**

| Type | Use when |
| --- | --- |
| `feat` | you added a feature |
| `fix` | you fixed a bug |
| `docs` | you changed documentation |
| `refactor` | you reorganised code, same behaviour |
| `test` | you added tests |
| `chore` | maintenance, config, tooling |
| `perf` | you made it faster |
| `style` | formatting only |
| `ci` | build or deploy pipeline |

---

## STEP 11 — Test the description checker BEFORE trusting it

```bash
echo "updated stuff"                         | pnpm exec commitlint; echo "result: $?"
echo "feat(banana): add thing"               | pnpm exec commitlint; echo "result: $?"
echo "feat(web): add problem filter sidebar" | pnpm exec commitlint; echo "result: $?"
```

> **You should see:**
> - `result: 1` — rejected (no type, no format)
> - `result: 1` — rejected (`banana` isn't one of your nine allowed names)
> - `result: 0` — accepted

**`$?` means "did the last command succeed?"** `0` = yes. Anything else = no.

**This is the single most important idea about bouncers:** Git only looks at that number. `0` means let them in. Anything else means block. Git ignores everything the script printed on screen.

---

## STEP 12 — Update the "don't save these" list

**What `.gitignore` is:** a list of files Git should pretend don't exist. Useful for downloaded libraries (huge, re-downloadable) and secrets (passwords).

```bash
cat >> .gitignore <<'IGNORE'

# auto-generated code
generated/

# lockfiles from the WRONG package manager - this project uses pnpm
package-lock.json
yarn.lock

# local editor settings
.claude/settings.local.json

# next.js regenerates this every build
next-env.d.ts
IGNORE
```

> Note `>>` (two arrows) means **add to the end**. One arrow `>` would **erase and replace** the whole file. Don't mix them up.

Now check no passwords are saved:

```bash
git ls-files | grep -i env
```

> **Should print exactly one line:** `apps/api/.env.example`

That file is *supposed* to be saved. It's a template with **fake** values showing which settings exist. The real file with real passwords is `.env`, which is on the ignore list.

**The one mistake you cannot undo:** everything else in this guide is reversible. A saved password is not. It stays in the history forever, and adding it to `.gitignore` afterwards does nothing. If it ever happens: **change the password first**, immediately. Cleaning the history comes second.

---

## STEP 13 — Delete the wrong lockfile

```bash
rm -f apps/dojo/package-lock.json
```

**Why:** a "lockfile" records exact library versions. Yours uses pnpm, whose lockfile is `pnpm-lock.yaml`. Someone once ran `npm install` inside `apps/dojo`, creating a second, competing lockfile. Two lockfiles means two different answers to "which versions?" — so your laptop and your server can install different things.

(If it's already gone, this command does nothing. That's fine.)

---

## STEP 14 — Create the decisions folder

```bash
mkdir -p docs/adr
```

**What an ADR is:** a short note recording *one decision* and *why* you made it.

Your code shows **what** it does. Your history shows **when** it changed. Nothing records **why** you chose this way. So in six months you'll find something odd, "simplify" it, and rediscover the hard way why it was like that.

**Write one when:** the decision is hard to undo, or someone would ask "why not the obvious alternative?" — for example, why Postgres and not MongoDB.

**Don't write one for:** version bumps, formatting, anything a code comment covers.

**The rule:** once written and accepted, **never edit it.** If you change your mind, write a *new* one saying "this replaces number 3." The record of a decision you reversed is often the most useful one — it stops the next person suggesting what you already tried.

Create the template:

```bash
cat > docs/adr/template.md <<'TEMPLATE'
# ADR-00NN: <the decision, written as a statement>

- **Status:** Proposed | Accepted | Superseded by ADR-00XX
- **Date:** YYYY-MM-DD

## Context
What's going on? Constraints, requirements. No solution yet.

## Decision
What we're doing: "We will run submissions in a gVisor sandbox, 2s CPU limit, no network."

## Alternatives considered
- **Option A** - why we rejected it.
- **Option B** - why we rejected it.

## Consequences
- **Good:** what this gets us.
- **Bad:** what it costs us.
- **Revisit if:** what would make us change our mind.
TEMPLATE
```

And a README explaining the folder:

```bash
cat > docs/adr/README.md <<'README'
# Architecture Decision Records

Each file records one decision: what we chose, what we rejected, and why.

- One decision per file, numbered: `0001-use-postgres.md`
- **Never edit an accepted record.** Supersede it with a new one instead.
- Copy `template.md` to start a new one.

| Status | Meaning |
| --- | --- |
| Proposed | Written, not yet agreed |
| Accepted | This is how the system works |
| Superseded by ADR-00XX | Replaced by a later decision |

## Index

| ADR | Title | Status |
| --- | --- | --- |
| - | _none yet_ | - |
README
```

---

## CHECKPOINT

The bouncers are built. Everything so far is safe and reversible.

**The next steps rewrite your project's history.** That's the scary-sounding part. Read Step 15 fully before typing.

Nothing below deletes your files. All 225 files stay exactly where they are the whole time.

---

## STEP 15 — Make a safety copy

```bash
git branch backup-original
git log --oneline backup-original
```

> **Should print:** `cd211bf first commit`

**What this does:** creates a bookmark pointing at your current one-and-only save. As long as this bookmark exists, you can undo everything below with one command:

```bash
git reset --hard backup-original      # the undo button. Don't run it now.
```

**Do not skip this step.**

---

## STEP 16 — Open the giant box

```bash
git update-ref -d HEAD
git reset
git status --short | head
```

> **You'll see:** a list of files each starting with `??`.

**Don't panic. Here's exactly what happened.**

Git stores three separate things:

| Thing | What it is | What we did |
| --- | --- | --- |
| Your files | The actual files on disk | **Untouched** |
| The saves | Your project's history | **Untouched** (still there via the bookmark) |
| The bookmark | An arrow pointing at "where am I now" | We deleted this arrow |

We deleted an **arrow**, not your work. `??` means "Git doesn't currently know about this file" — which is what we want, because we're about to re-add them in organised groups.

Prove nothing is lost:

```bash
ls                                  # your files, all there
git log --oneline backup-original   # your old save, still there
```

**Why this odd command instead of a normal undo?** Normally you'd type `git reset --soft HEAD~1`, meaning "go back one save." But you only have *one* save — there's nothing before it to go back to. So we delete the arrow instead.

---

## STEP 17 — Pack into labeled boxes

Now the sorting. Each pair of lines is: **choose files** (`git add`), then **seal and label the box** (`git commit`).

Paste them one pair at a time, or all at once.

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json .gitignore
git commit --no-verify -m "chore(repo): pnpm workspace scaffold with shared tsconfig"

git add docker-compose.yml SETUP.md
git commit --no-verify -m "chore(infra): docker compose for postgres and redis"

git add docs/
git commit --no-verify -m "docs: phase 0-6 architecture and design notes"

git add packages/shared
git commit --no-verify -m "feat(shared): cross-workspace domain types"

git add apps/api
git commit --no-verify -m "feat(api): nestjs bootstrap, prisma schema and config"

git add apps/web/package.json apps/web/tsconfig.json apps/web/next.config.ts \
        apps/web/eslint.config.mjs apps/web/postcss.config.mjs \
        apps/web/public apps/web/.gitignore
git commit --no-verify -m "feat(web): next.js app scaffold"

git add apps/web/src/app
git commit --no-verify -m "feat(web): problems listing and routing"

git add apps/web/src/components apps/web/src/lib
git commit --no-verify -m "feat(web): problem workspace, editor and submission client"

git add apps/web/README.md apps/web/AGENTS.md apps/web/CLAUDE.md apps/web/PRACTICE.md
git commit --no-verify -m "docs(web): contributor and practice notes"

git add apps/dojo/package.json apps/dojo/tsconfig.json apps/dojo/next.config.ts \
        apps/dojo/eslint.config.mjs apps/dojo/postcss.config.mjs apps/dojo/.gitignore
git commit --no-verify -m "feat(dojo): next.js app scaffold on port 3002"

git add apps/dojo/src/lib
git commit --no-verify -m "feat(dojo): exercise engine, dsa registry and generators"

git add apps/dojo/src/app apps/dojo/src/components
git commit --no-verify -m "feat(dojo): learning ui and exercise renderer"

git add apps/dojo/content apps/dojo/README.md
git commit --no-verify -m "feat(dojo): dsa roadmap, patterns and language supplements"

git add apps/dojo/scripts
git commit --no-verify -m "chore(dojo): content and generator validation scripts"
```

> **After each `git commit`:** a line like `[main a3f9e21] feat(shared): ...` with a file count.

### What is `--no-verify` and why is it here?

`--no-verify` means **"skip the bouncers this time."**

Normally that's cheating. Here it's correct, for two reasons:

**Reason 1 — the bouncer would give a wrong answer.** lint-staged temporarily hides every file you *haven't* selected, so the checker sees only what you're saving. Normally that's exactly right. But right now you're saving one folder at a time out of a complete project. When you save `packages/shared` alone, the checker looks around, sees `apps/` is missing, and reports errors that aren't real.

**Reason 2 — it's pointless repetition.** This code is already written and already checked (Step 2). Re-checking it 14 times is about ten minutes of waiting for zero new information.

We check the whole thing once at the end instead (Step 19).

---

## STEP 18 — Save today's work (bouncers ON this time)

These are genuinely new changes, so they should be checked. **No `--no-verify`.**

```bash
git add .husky commitlint.config.mjs .lintstagedrc.mjs package.json \
        apps/api/package.json apps/web/package.json apps/dojo/package.json pnpm-lock.yaml
git commit -m "chore(repo): enforce lint, typecheck and conventional commits"

git add docs/adr
git commit -m "docs(adr): add decision record directory and template"

git add PROGRESS.md ROADMAP-12W.md WEEK-0.md WEEK-PLAN.md REPO-HYGIENE-GUIDE.md
git commit -m "docs: 12-week roadmap and progress tracking"
```

> **This time it will pause** and run the checks. Takes a few seconds. **This is the first time you see your bouncers work.**

Check nothing got left behind:

```bash
git status --short
```

> **Should print nothing at all.** Blank means everything is saved.
> If files are listed, add and commit them before continuing.

---

## STEP 19 — Check everything

```bash
git log --oneline | wc -l
```

> **Should print 17** (or at least 10).

```bash
git log --oneline
```

> Your history. Read it — does it tell a story?

```bash
pnpm -r typecheck
```

> All four sub-projects checked, all pass. **This is the real check** we skipped 14 times.

```bash
git ls-files | grep -i env
```

> Only `apps/api/.env.example`.

---

## STEP 20 — Prove the bouncers actually work

**Do not skip this.** A bouncer who lets everyone in and a bouncer who isn't there look identical from outside. You must see it say **no**.

```bash
echo "// test" >> apps/dojo/src/lib/engine/coding/typescript.ts
git add apps/dojo/src/lib/engine/coding/typescript.ts
```

Now try a bad description:

```bash
git commit -m "updated some stuff"
```

> **Should FAIL** with something like:
> ```
> subject may not be empty [subject-empty]
> type may not be empty [type-empty]
> ```
> **If this succeeds, your bouncers are not running.** See the fix list below.

Now a good one:

```bash
git commit -m "chore(dojo): verify hooks work"
```

> **Should succeed.** Your bouncers work.

Clean up the test:

```bash
git reset --hard HEAD~1
```

> Removes that test save and puts the file back to normal.

### If the bad message was accepted

Run these in order and stop when one shows a problem:

```bash
git config core.hooksPath     # blank? -> run: pnpm run prepare
ls -l .husky/                 # no "x" in the permissions? -> run: chmod +x .husky/*
cat .husky/commit-msg         # is the line actually there?
```

---

## STEP 21 — Upload to GitHub

**Read this before running it.**

Your old single save is already on GitHub. You just replaced it with 17 different ones. So GitHub's copy and yours now disagree, and GitHub will refuse a normal upload.

You have to tell it "mine is correct, replace yours."

```bash
git push --force-with-lease origin main
```

**Why `--force-with-lease` and not `--force`:**

- `--force` means "replace it, no questions." If someone else had uploaded something, it's gone.
- `--force-with-lease` means "replace it, **but only if nothing changed since I last looked.**" If something did change, it stops and warns you.

You work alone, so it makes no practical difference today. Build the safer habit now, before the day it matters.

> **You'll see:** `+ cd211bf...a3f9e21 main -> main (forced update)`

Go look at your repo on GitHub. You should see 17 saves.

---

## STEP 22 — Remove the safety bookmark

**Only after you've confirmed GitHub looks right.**

```bash
git branch -D backup-original
```

Done.

---

# WHAT YOU'LL DO LATER (Phase 0 / Phase 1)

Not now. This is written down so you don't have to rediscover it.

## Phase 0 — make your strictness settings actually apply

**The problem:** you have a file called `tsconfig.base.json` holding your strictest code-checking settings. Only `packages/shared` (3 lines of code) uses it. `apps/web` and `apps/dojo` — where nearly all your code lives — ignore it completely.

**Why it has a deadline:** the longer you write code without these settings, the more errors appear when you finally turn them on.

For `apps/web/tsconfig.json` and `apps/dojo/tsconfig.json`, add the first line and keep the rest:

```jsonc
{
  "extends": "../../tsconfig.base.json",     // <- add this
  "compilerOptions": {
    // these override the base, because Next.js requires them
    "module": "esnext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "jsx": "react-jsx",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "**/*.mts"],
  "exclude": ["node_modules"]
}
```

For `apps/api/tsconfig.json`: add the same `extends` line, then delete these, which it now inherits — `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `esModuleInterop`, `declaration`, `sourceMap`, `skipLibCheck`, `forceConsistentCasingInFileNames`, `noFallthroughCasesInSwitch`.

**Expect new errors.** They're real bugs the loose settings were hiding. Do this when you have a free hour, then run `pnpm -r typecheck`.

## Phase 1 — connect the shared folder

**The situation:** `packages/shared` exists but **nothing uses it.** Its file literally says `// Intentionally empty at setup time; populated starting Phase 1.` It's an empty socket.

Your `phase-1` doc, exercise 6 ("Zod at both edges"), is exactly this job.

**1.** Connect them:

```bash
pnpm --filter api add @codearena/shared@workspace:*
pnpm --filter web add @codearena/shared@workspace:*
```

`workspace:*` means "use my local folder, never download from the internet." pnpm then creates a shortcut inside `apps/web` pointing at `packages/shared`. Edit the shared file and `web` sees it instantly.

**2.** Next.js won't compile shared code unless told to:

```ts
// apps/web/next.config.ts
const nextConfig: NextConfig = { transpilePackages: ["@codearena/shared"] };
```

> Without this you get `Module parse failed` on the first import.

**3.** Put one rule in the shared folder and use it in both places:

```ts
// packages/shared/src/index.ts
import { z } from "zod";

export const CreateSubmission = z.object({
  problemId: z.string().uuid(),
  language:  z.enum(["typescript", "python", "cpp"]),
  source:    z.string().min(1).max(64_000),
});
export type CreateSubmission = z.infer<typeof CreateSubmission>;
```

Use it in the backend (validating requests) **and** the frontend (validating the form). Change one field and both sides break in the same commit — that's the entire point of a monorepo.

*(`z.infer` is the `infer` keyword you asked about earlier, in its most common real-world use.)*

**Checklist for later:**

- [ ] Three apps `extends` `tsconfig.base.json`
- [ ] `pnpm -r typecheck` passes after turning strictness on
- [ ] `@codearena/shared` connected to the apps
- [ ] `transpilePackages` set in both Next configs
- [ ] One Zod schema used by backend and frontend

---

# GLOSSARY

Every technical word used above.

| Word | Plain meaning |
| --- | --- |
| **repo / repository** | Your project folder, tracked by Git |
| **commit** | One save point in your project's history |
| **stage / staging** | Choosing which files go in the next save (`git add`) |
| **hook** | A script Git runs automatically at a certain moment |
| **pre-commit** | The hook that runs *before* saving |
| **commit-msg** | The hook that checks your save's description |
| **`--no-verify`** | "Skip the hooks this time" |
| **branch** | A bookmark pointing at a save |
| **HEAD** | "Where am I right now" in the history |
| **root commit** | The very first save — has nothing before it |
| **push** | Upload your saves to GitHub |
| **force push** | Upload and *replace* what's on GitHub |
| **remote / origin** | The GitHub copy of your project |
| **lint** | Check code style and common mistakes |
| **ESLint** | The tool that does linting |
| **typecheck / `tsc`** | Check that your types are consistent |
| **`--noEmit`** | "Just check, don't produce files" |
| **exit code / `$?`** | A number a command returns. `0` means success |
| **`chmod +x`** | Give a file permission to run |
| **monorepo** | One repo containing several apps that share code |
| **workspace** | One app or library inside a monorepo |
| **`pnpm --filter X`** | "Run this command inside app X" |
| **`pnpm -r`** | "Run this in every app, in the right order" |
| **package.json** | A project's settings file: name, libraries, shortcuts |
| **lockfile** | Records the *exact* library versions installed |
| **`node_modules`** | The folder holding downloaded libraries |
| **devDependency (`-D`)** | A tool for building, not shipped to users |
| **`.gitignore`** | List of files Git should pretend don't exist |
| **ADR** | A note recording one decision and why |
| **CI** | A server that runs your checks automatically after you push |
| **symlink** | A shortcut file pointing at another location |
| **Zod** | A library for describing and validating data shapes |
