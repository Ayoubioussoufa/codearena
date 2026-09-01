# Getting Unstuck — how long to search, and how to ask

A working reference for the moment you're blocked. Keep it open.

---

## The signal is not the clock

A timer is a bad rule on its own. Use this instead:

> ### Can you state a *new* hypothesis you haven't tested yet?
> **Yes** → keep going.
> **No** → you're guessing. Guessing teaches nothing. Ask.

Re-reading the same file for the fourth time isn't persistence, it's stalling.

But forty minutes of *"maybe it's the import path… no. Maybe the client wasn't regenerated… no.
Maybe the process didn't restart…"* is exactly the skill you're building, even when it's slow.
**That's not wasted time — that's the work.**

---

## Rough time-boxes by kind of stuck

| Stuck on | Box | Why that number |
|---|---|---|
| **A type or syntax error you don't understand** | **10 min** | This is a lookup, not a puzzle. Search the exact code (`TS2739`, `TS7022`), read the docs. If it's still opaque you're missing *vocabulary* — and vocabulary is taught, not discovered |
| **"It compiles but doesn't do what I expect"** | **45–60 min** | **The valuable one.** Debugging is #1 in your study priorities and it only builds by doing. Push hardest here |
| **"Where does this code belong?"** | **20 min** | Design without feedback builds bad habits that are expensive to unlearn. But arrive with a *proposal*, not a blank |
| **"How do I do X with library Y?"** | **15 min in the official docs** | If the official docs don't answer it, more searching usually won't either. Blog posts are often a version behind |
| **Completely blocked, cannot proceed at all** | **30 min hard stop** | Being blocked costs the whole day, not just the hour. Protect the day |
| **Something worked yesterday and doesn't today** | **15 min** | Almost always environment, not code. Check the boring things first (below) before theorising |

### The boring things, checked first — every time

Before any clever theory:

```bash
ss -ltnp | grep 3001        # exactly ONE pid? A stale server means you're testing old code
git status                  # are you on the branch you think you're on?
docker ps                   # are the containers actually healthy?
pnpm --filter api exec tsc --noEmit    # does the compiler agree with your editor?
```

Those four caught **three** of this project's worst time-sinks: a stale server on port 3001, work
reverted by a branch switch, and a `Cannot find name 'describe'` error that only the editor could
see.

> **When your editor and the compiler disagree, the compiler is right.**

---

## The hypothesis log — what makes the box work

**Write your hypothesis down before each attempt.** One line, on paper or in a scratch file:

```
1. the import path is wrong           → checked, it's right
2. the client wasn't regenerated      → ran generate, same error
3. the server didn't restart          → ss -ltnp shows TWO pids   ← found it
```

Three things happen:

1. **You stop re-testing the same idea.** Most "stuck for two hours" is the same three thoughts on
   a loop.
2. **You can see when you've run out.** A blank next line *is* your signal to ask — objective,
   not a feeling.
3. **If you do ask, you paste the list** and get a precise answer instead of twenty questions.

Keep the log. In your ⑤ Write block each evening, add one line: *what broke, and how you found it.*
That log is what turns pain into skill — and it's the raw material for the "tell me about a hard
bug" interview question, which you will be asked.

---

## Ask well and you keep most of the learning

Compare:

> ❌ **"I get an error, what's wrong?"**

> ✅ **"Expected X, got Y. I've ruled out A and B. My current guess is C, because of D.
> Here's the exact error and the file."**

The second costs you five minutes to write — and **often solves itself while you write it**,
because articulating the problem forces you to state what you actually know. When it doesn't solve
itself, you get a real answer instead of a round of clarifying questions.

### The template

```
WHAT I'M TRYING TO DO
  One sentence.

WHAT I EXPECTED
  ...

WHAT ACTUALLY HAPPENED
  The exact error, copied — not paraphrased, not screenshotted.

WHAT I'VE RULED OUT
  1. ... → checked, not it
  2. ... → checked, not it

MY CURRENT GUESS
  I think it's ___ because ___.

WHERE
  file:line, and the command I ran.
```

### Four rules for the error itself

1. **Copy the exact text.** "It says something about a module" is unanswerable. `TS2739` is
   searchable.
2. **Include the first line, not just the last.** Stack traces are read top-down; the useful line
   is usually first.
3. **Say what you already tried** — otherwise you'll be told to try it.
4. **Paste the file, not a description of it.** Descriptions omit exactly the thing that's wrong.

---

## The honest trade-off

Asking isn't free — not in money, in **ownership**. Every answer handed to you is one you didn't
derive, and you'll feel that gap later when you try to build the same thing alone.

But hunting for three hours on something that's a one-line vocabulary gap isn't learning either.
It's just cost.

**Both failure modes are real.** The rule that balances them:

> ### Never ask a *"why doesn't this work"* question inside the first 30 minutes.
> ### Ask *"what does this error mean"* whenever you like.

The first kind is where the skill lives. The second kind is vocabulary, and there's no virtue in
rediscovering vocabulary slowly.

---

## The escalation order

1. **Re-read the error.** Literally. Out loud if needed. Most errors say what's wrong; we skim them.
2. **Check the boring things** (above).
3. **Read the linked doc section** — `docs/phase-*` or `WEEK-*-KNOWLEDGE.md`.
4. **Read the library's own docs.** Not a blog post. The official docs.
5. **Search the exact error string** in quotes.
6. **Write the hypothesis log.** Often ends here.
7. **Ask**, using the template.

---

## One last thing

When you *do* solve one alone — write down what it was and how you found it. Not for me. For you,
in three weeks, when something similar happens and a half-memory saves you an hour.

That log is the difference between doing this for twelve weeks and being *good* at this in twelve
weeks.
