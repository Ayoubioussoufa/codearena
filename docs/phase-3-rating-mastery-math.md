# Phase 3 — Rating, Mastery & the Math: The Complete Study Guide

> **Prerequisite:** Phases 0–2. This phase is light on infrastructure and heavy on **math** — so
> this guide teaches the math from zero, assuming only school algebra. If a formula scares you, slow
> down and read the sentence before it: every symbol is defined in words first. Conventions
> unchanged: **bold = defined here**, examples standalone (chess, dart players, flashcards — never
> the project), and you should reproduce every worked number by hand or in a REPL.

---


---

## ⌨️ This guide is interactive

**Three exercises are embedded below. The arithmetic is deliberately small — the point is knowing which direction a number moves and why, not reproducing a formula.**

## Table of contents

1. [Part A — The math toolkit you need first](#part-a)
2. [Part B — Rating systems: Elo → Glicko → Glicko-2](#part-b)
3. [Part C — Item Response Theory: measuring skill and difficulty together](#part-c)
4. [Part D — FSRS: spaced repetition and memory](#part-d)
5. [Part E — Engineering the math: pure functions & property-based testing](#part-e)
6. [Part F — From formula to code: two complete walkthroughs](#worked)
7. [Self-quiz with answers](#quiz)
8. [Exercises](#exercises)

---

<a name="part-a"></a>
# Part A — The math toolkit

You need five ideas. Each is small; together they unlock everything else.

## A.1 Probability as a number between 0 and 1

A **probability** is a number from 0 (impossible) to 1 (certain) expressing how likely something is.
0.5 = a coin flip; 0.9 = "very likely"; 0.1 = "unlikely". Percentages are the same thing ×100.
Every model in this phase ultimately outputs a probability — "how likely is this player to win",
"how likely is this student to recall this card" — so get comfortable reading 0.73 as "73% chance".

## A.2 The logistic (sigmoid) function — turning any number into a probability

Skill differences are unbounded numbers (player A is "200 points stronger"). Probabilities live in
[0, 1]. We need a function that squashes "any real number" into "a probability". That function is
the **logistic function**, also called the **sigmoid** (Greek for "S-shaped"):

```
sigmoid(x) = 1 / (1 + e^(-x))
```

`e` is Euler's number (~2.718); you never compute it by hand — `Math.exp` does. What matters is the
*shape*:

```
sigmoid(x)
 1.0 |                         ________________
     |                    ____/
 0.5 |------------------/·------------------------   ← sigmoid(0) = 0.5 exactly
     |            ____/
 0.0 |___________/____________________________
      -6   -4   -2    0    2    4    6   → x
```

Read the picture:
- `sigmoid(0) = 0.5` — no advantage → 50/50.
- large positive x → approaches 1 ("almost certain").
- large negative x → approaches 0 ("almost impossible").
- It's smooth and monotonic (always increasing): more advantage never *lowers* your win chance.

Every "strength difference → win probability" and "ability minus difficulty → success probability"
step in this phase is a sigmoid. If you understand this one S-curve, the rest is bookkeeping.


```exercise
sigmoid-intuition
```

## A.3 Odds, log-odds, and why ratings are "points"

**Odds** = probability of yes ÷ probability of no. A 0.75 chance = odds of 0.75/0.25 = 3 ("3 to 1").
The **log-odds** (or **logit**) is the natural log of the odds — and it is the *inverse* of the
sigmoid:

```
logit(p) = ln( p / (1 - p) )         sigmoid(logit(p)) = p
```

Why care? Because **log-odds turn multiplication into addition and make "skill" additive.** Rating
points (Elo's 1500s and 1800s) are essentially scaled log-odds. "200 points stronger" means a
*fixed multiplicative* edge in odds, no matter where on the scale you are. This is the hidden reason
rating systems use a points scale at all.

## A.4 Uncertainty: point estimate vs. a range

If you flip a coin 4 times and get 3 heads, is it a 75% coin? Maybe — but you're *not sure*, because
4 flips is little evidence. Flip 4,000 times and get 3,000 heads and you're quite sure it's ~75%.
Same estimate (0.75), wildly different **confidence**.

Statistics captures this with two numbers, not one:

- a **point estimate** — the single best guess (0.75).
- a measure of **uncertainty** — how wide the plausible range around it is. Common forms: the
  **standard error / standard deviation** (a ± spread), or a **confidence/credible interval**
  ("95% sure the true value is between 0.6 and 0.9").

**The core lesson of this whole phase: never report a point estimate without its uncertainty.**
"Your rating is 1843" is dishonest if you've played 2 games; "1843 ± 300" tells the truth. Elo
gives you only the point; Glicko and IRT track the uncertainty too — that's *why* they're better.

## A.5 Learning from one example at a time: gradient ascent

Suppose you have a knob (a number) and a "score" function measuring how well your model fits the
data. You want the knob setting that *maximizes* the score. **Gradient ascent** is: compute which
direction nudging the knob *increases* the score (the **gradient** — the slope), take a small step
that way, repeat. Downhill's twin, gradient *descent*, minimizes instead; same idea, opposite sign.

Hill-climbing-in-fog analogy: you can't see the summit, but you can feel the slope under your feet;
step uphill; repeat; you reach a peak. The **step size** (or **learning rate**) is how big each step
is — too big and you overshoot and wobble; too small and it takes forever.

**Online** learning means updating after *each* new data point (one game, one answer) rather than
crunching the whole dataset at once (**batch**). You'll use online updates for live practice
(instant feedback) and batch updates for contests (fairness — everyone updated together at the end).
That "online for practice, batch for contests — why both?" is a defensible design choice, not an
accident.

---


```check
toolkit
```

<a name="part-b"></a>
# Part B — Rating systems

## B.1 Elo — the ancestor

**Elo** (named after Arpad Elo, chess) assigns each player a single number, their **rating**. The
higher, the stronger. Two rules define it:

1. **Expected score** from a rating difference, via a sigmoid:

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))     // chance A beats B
```

(Chess Elo uses base-10 and a scale of 400 instead of base-e; it's the same S-curve, just
differently scaled. If A and B are equal, `E_A = 0.5`. If A is 400 points higher, `E_A ≈ 0.91`.)

2. **Update** after a game by the surprise — actual result minus expected:

```
R_A_new = R_A + K * (S_A - E_A)      // S_A = 1 if A won, 0 if lost, 0.5 draw
```

`K` is the **K-factor**, the step size. Beat someone you were *expected* to beat (E_A = 0.9,
S_A = 1) → small gain (`K * 0.1`). Beat someone you were expected to *lose* to (E_A = 0.1, S_A = 1)
→ big gain (`K * 0.9`). Upsets move ratings more. That's the whole engine, and it's just gradient
ascent (A.5) on a sigmoid model (A.2).

**Elo's fatal flaw for us:** one number, no uncertainty (A.4). A brand-new player and a
10,000-game veteran can both be "1500", but you *know* far less about the newcomer. Elo can't
express that, so it over-reacts to the veteran's games and under-reacts to the newcomer's. Fixing
this is the entire point of Glicko.


```exercise
elo-update
```

## B.2 Glicko — add an uncertainty number

**Glicko** (Mark Glickman) keeps the rating `R` but adds **RD**, the **Rating Deviation** — the
standard error of the rating (A.4). Small RD = "we're confident about this rating"; large RD =
"this is a rough guess."

Two behaviors fall out, both matching intuition:

- **RD shrinks as you play** (more evidence → more confidence) and **grows during inactivity**
  (you haven't played in a year → we're less sure you're still that strong). The invariant preserved
  by RD-widening: *confidence should decay when evidence goes stale.* A returning player's rating
  is treated as uncertain again, so it can move quickly to find its true level. (That's a quiz
  answer.)
- **Updates scale with certainty.** Beating an opponent whose RD is huge tells you little (their
  rating was noise), so your rating barely moves; beating a low-RD (well-established) opponent is
  strong evidence and moves you more. And *your* own high RD makes *your* rating move faster. Elo's
  fixed K becomes a K that adapts to how much each side actually knows.

## B.3 Glicko-2 — add a volatility number

**Glicko-2** adds a third number: **volatility σ**, capturing how *consistent* a player is. A
steady player (always ~1600) has low volatility; an erratic player (crushes masters on Monday, loses
to beginners on Tuesday) has high volatility, so their rating is allowed to swing more readily. So
each player is a triple:

```
(rating μ, rating deviation φ, volatility σ)
```

(Glicko-2 does its math on an internal scale where rating is `μ` and deviation is `φ`; you convert
to/from the familiar 1500-scale at the edges. Don't let the Greek letters intimidate — they're just
`R` and `RD` in different units.)

The algorithm, in plain steps (you will implement each as a pure function and match Glickman's
worked example exactly):

1. Convert the player and their opponents to the internal scale.
2. Compute `g(φ)` and `E` for each game — these are the sigmoid-based expected scores, weighted by
   how certain each opponent's rating is.
3. Compute the **variance** `v` of the player's performance from those games (how much information
   the games carried).
4. Compute the performance-based **improvement** `Δ` (the "surprise", like Elo's `S - E`, but
   information-weighted).
5. **Iterate** to update volatility σ (a small numerical root-finding loop — the one genuinely
   fiddly part; the paper gives the exact procedure and a convergence tolerance).
6. Update deviation φ and rating μ using v, Δ and the new σ.
7. Convert back to the display scale.

Two engineering notes that are also interview answers:

- **Rating periods / batching.** In production you don't recompute after every single game;
  you collect a player's games over a **rating period** (a day, a contest) and update once. This is
  numerically more stable and fairer, and it's why contests do a *batch* update at the end
  (everyone processed together in one transaction) while casual practice can update *online*.
- **The system constant τ (tau)** controls how much volatility itself can change per period —
  smaller τ = more conservative. You tune it for your platform (typical 0.3–1.2); too high and
  ratings jump on noise, too low and they're sluggish.

> **Why Glicko-2 over Elo — three reasons for the interview:** (1) it tracks *uncertainty* (RD), so
> new and established players are handled correctly instead of both being a bare number; (2) it
> tracks *consistency* (volatility), letting erratic players' ratings move appropriately; (3)
> updates are *information-weighted* — a result against a well-known opponent counts more than one
> against a mystery — instead of Elo's one-size-fits-all K. Net: it's honest about what it doesn't
> know.

### A number you should be able to reason about (quiz)

"A 1500 player with RD=200 beats a 1700 player with RD=50 — new rating?" You won't compute the exact
value by hand (that's the code's job, tested against the paper), but you must predict the *shape* of
the answer: the 1500 player was an underdog (big positive surprise) **and** highly uncertain
(RD=200), so their rating jumps up substantially — noticeably more than Elo would move it — and
their RD drops (they just gained evidence). The 1700 player loses a bit and their RD barely changes
(they were already well-established). If your implementation doesn't show that pattern, it's wrong.

---


```check
ratings
```

<a name="part-c"></a>
# Part C — Item Response Theory (IRT)


```exercise
glicko-rd
```

## C.1 The idea: rate *people* and *questions* on the same scale

Rating systems compare players to players. But a learning platform has two unknowns at once: *how
skilled is this person* **and** *how hard is this problem*? **Item Response Theory** estimates both
**simultaneously**, on one shared scale, from the pattern of who-solved-what.

The magic: you never have to *tell* the system a problem's difficulty. If strong people breeze
through problem X and weak people fail it, X is easy; if even strong people fail Y, Y is hard. The
platform **self-calibrates** difficulty from the response data. (An exam works the same way: a
question everyone gets right was easy; a question only top students get right was hard — IRT just
makes it quantitative.)

## C.2 The 2PL model

Vocabulary:
- **θ (theta)** — a person's **ability** (their skill on this scale). Higher = more able.
- **b** — an **item's difficulty** on the *same* scale. Higher = harder.
- **a** — an item's **discrimination**: how sharply it separates able from less-able people.

The **2PL model** (two-parameter logistic — the `a` and `b` parameters) gives the probability that
person θ answers item (a, b) correctly:

```
P(correct) = sigmoid( a * (θ - b) )
```

Read it through the toolkit:
- `θ - b` = "ability minus difficulty" — the advantage, exactly like a rating difference in Elo.
- the sigmoid (A.2) squashes that advantage into a probability.
- `a` scales the advantage — a steep `a` makes the S-curve sharp (people just above the difficulty
  almost always pass, just below almost always fail — a very *discriminating* item); a shallow `a`
  makes it gentle (the item barely distinguishes ability — near-useless for measurement).

```
P(correct)
 1 |        a large (steep):  __|‾‾‾‾    a small (shallow): ___----‾‾‾
   |                         /                            /
0.5|------------------------•-----------  (both cross 0.5 exactly at θ = b)
   |                       /                          _-‾
 0 |________________----‾‾______________________----‾‾___
     θ < b   |   θ = b   |   θ > b
```

At `θ = b` (ability exactly equals difficulty) the probability is 0.5 for *any* item — a coin flip,
the point of maximum information about that person.

## C.3 Why 2PL (not 1PL or 3PL)

- **1PL (Rasch)** fixes `a` = 1 for every item: all items discriminate equally. Simpler, but false
  — some problems really do separate skill better than others.
- **3PL** adds `c`, a **guessing** parameter (floor probability from multiple-choice luck). More
  realistic for MCQ tests, but the extra parameter needs *much* more data to estimate stably and
  matters little for open-ended coding.
- **2PL** is the sweet spot: it models genuine difference in discrimination (`a`) without the data
  hunger and instability of `c`. (That's the "why 2PL" interview answer.)

## C.4 Learning θ and b online — gradient ascent again

You don't know θ or b up front; you learn them from responses. The tool is A.5's gradient ascent on
the **log-likelihood** — a score measuring "how well do the current θ and b values explain the
answers we actually saw?" After each submission you nudge the relevant θ (this user's skill on this
tag) and b (this problem's difficulty) a small step in the direction that better explains the
outcome:

```
error = actual (1 or 0) − P(correct)          // the "surprise", same shape as Elo's S − E
θ ← θ + rate * a * error                       // solved a hard one? θ rises. failed an easy one? θ drops.
b ← b − rate * a * error                       // people keep failing it? b (difficulty) rises.
```

Notice the symmetry with Elo (B.1): `actual − expected`, scaled, stepped. It's the same engine
wearing statistics clothes. Because you keep a θ **per tag** (graphs, DP, strings…), you get a
*mastery profile*, not one global number — which is what powers targeted recommendations in Phase 4.

Two disciplines that are also pitfalls:
- **Initialize new users with a default θ and a *large* standard error** (A.4) — you know nothing
  yet, so say so; the wide uncertainty lets early answers move θ fast.
- **Update transactionally.** Two submissions updating the same θ concurrently can interleave and
  corrupt it (a lost update — recall Phase 1's ACID isolation). Wrap the read-modify-write in a
  transaction or use atomic updates.

## C.5 Discrimination = 0, and honest error bars (quiz)

- **If `a` = 0**, then `a * (θ − b) = 0` for everyone, so `P(correct) = sigmoid(0) = 0.5`
  regardless of ability. The item tells you *nothing* about who's skilled — it's pure noise, useless
  for measurement (you'd drop or flag it).
- IRT gives each θ a **standard error** too, so you can draw the mastery dashboard with **credible
  intervals** ("θ = 1.2 ± 0.8"). For a recommender that means: don't confidently push expert-level
  problems at someone whose estimate is `1.2 ± 0.8` — the wide interval says "we're not sure yet,"
  so explore to narrow it before exploiting. Showing point estimates without those error bars would
  repeat Elo's dishonesty.

---


```check
irt
```

<a name="part-d"></a>
# Part D — FSRS: spaced repetition

## D.1 The forgetting curve

Memory decays over time — Hermann Ebbinghaus measured this in the 1880s. Right after learning,
recall is high; days later it's faded. The **forgetting curve** plots recall probability falling
with time since last review:

```
recall
 1.0 |•
     | \__
     |    \____
 0.5 |         \________            ← "retrievability" drops as time passes
     |                  \_______________
 0.0 |________________________________________ → days since last review
```

**Spaced repetition** exploits a second fact: *each successful review flattens the curve* — the
memory becomes more durable, so the next review can wait longer. Review a card just as you're about
to forget it, and each review buys exponentially more time. That's why flashcard apps show a card
after 1 day, then 3, then 7, then 16, then 40…

## D.2 The DSR model — three numbers per memory

**FSRS** (Free Spaced Repetition Scheduler) models each memorized item with three quantities — the
**DSR** model:

- **D — Difficulty**: how inherently hard this item is to remember (intrinsic, like IRT's `b` but
  for memory). Harder items grow their intervals slower.
- **S — Stability**: the current *durability* of the memory — technically, the number of days until
  recall probability falls to a target. This is what *grows* with each successful review; it's the
  "memory strength" dial.
- **R — Retrievability**: the probability you'd recall it *right now*, given the time elapsed since
  the last review. This *falls* between reviews (the forgetting curve) and resets up after one.

Retrievability is a function of elapsed time `t` (in days) and stability `S`. FSRS models the
forgetting curve as a **power function**, not the exponential decay you might expect — real review
logs fit a power curve much better, because forgetting slows down more than exponentially over time:

```
R(t) = (1 + FACTOR * t / S) ^ DECAY

  DECAY  = -0.5             // FSRS-4.5's fitted exponent
  FACTOR = 19 / 81 ≈ 0.2346 // chosen so the curve passes through R = 0.9 at t = S
```

Check the two anchor points by hand — this is what makes the formula stop being arbitrary:

```
t = 0:  R = (1 + 0)^-0.5            = 1        ← just reviewed, certain recall
t = S:  R = (1 + 19/81)^-0.5
          = (100/81)^-0.5
          = (81/100)^0.5   = 0.9               ← by construction
```

That second line **is the definition of stability**: `S` is the number of days until recall
probability falls to 90%. So "stability = 15" literally means "in 15 days I'll have a 90% chance of
remembering this."

Where `FACTOR` comes from: it is not a free parameter. Demand `R(S) = 0.9`, and
`FACTOR = 0.9^(1/DECAY) − 1 = 0.9^(−2) − 1 = 1/0.81 − 1 = 19/81`. Any `DECAY` you plug in
determines its own `FACTOR` by that identity — which is exactly what FSRS-6 does, treating `DECAY`
as one more parameter fitted from data rather than fixed at −0.5.

## D.3 The scheduling decision

The scheduler's job: **pick the next review date so that, when it arrives, retrievability has fallen
to a chosen target retention** (say 90%). That means solving `R(t) = r` for `t` — and because `R` is
a clean power function, the inverse is closed-form, no numerics needed:

```
R(t) = (1 + FACTOR * t/S)^DECAY = r
  ⇒   1 + FACTOR * t/S = r^(1/DECAY)
  ⇒   t = (S / FACTOR) * ( r^(1/DECAY) − 1 )        ← the next interval, in days
```

Hand-check it with `S = 15` days and a target retention of `r = 0.9`:

```
t = (15 / 0.2346) * (0.9^(1/-0.5) − 1)
  = 63.94 * (0.9^-2 − 1)
  = 63.94 * (1.2346 − 1)
  = 63.94 * 0.2346 = 15 days        ← target 0.9 returns exactly S, as it must
```

Now lower the target to `r = 0.8` and the interval more than doubles:

```
t = 63.94 * (0.8^-2 − 1) = 63.94 * (1.5625 − 1) = 63.94 * 0.5625 ≈ 36 days
```

**That single pair of numbers is the whole retention trade-off, quantified**: dropping your target
from 90% to 80% stretches a 15-day interval to 36 days — you review less than half as often, and
forget twice as often. Review too early = wasted effort (you still knew it); too late = you've
already forgotten and must relearn. FSRS aims the interval right at whichever target *you* choose.

After each review you feed back the outcome (recalled or not, how easily) and FSRS updates D and S:
a success *raises stability* (bigger next interval); a lapse *drops stability* (shorter interval,
relearn). You choose your target retention: higher retention = more reviews but stronger memory;
lower = fewer reviews but more forgetting — an explicit, tunable trade-off.

## D.4 Why FSRS over SM-2 (quiz)

**SM-2** is the classic SuperMemo algorithm from the 1980s, which Anki adopted: a handful of fixed rules and an "ease factor" nudged
by hard-coded constants. It works, but it's rigid — the same interval multipliers for everyone,
ignoring the actual statistical shape of forgetting. **FSRS** is a *fitted statistical model*: its
parameters are trained on millions of real review logs, and it separates D, S, and R explicitly, so
it predicts recall probability far more accurately and is **more sample-efficient** — it extracts
more scheduling signal from fewer reviews, meaning fewer total reviews for the same retention. In
short: SM-2 is heuristics; FSRS is a model — and the model wins because memory really does follow
measurable curves.

---


```check
fsrs
```

<a name="part-e"></a>
# Part E — Engineering the math

The math is only half the phase; *how you package it* is the other half and the part interviewers
probe.

## E.1 Pure functions — the non-negotiable rule

A **pure function** (1) returns the same output for the same input, always, and (2) has no **side
effects** (doesn't touch a database, the clock, the network, or any external state). All the math
above — Glicko-2 update, IRT step, FSRS interval — must be pure:

```ts
// ✅ pure — deterministic, testable in microseconds, no I/O
function glicko2Update(
  player: Rating,
  results: GameResult[],
  tau: number,
): Rating { /* only arithmetic on the inputs */ }

// ❌ impure — reaches for the clock and the DB inside the math
function badUpdate(playerId: string): void {
  const player = db.load(playerId);          // side effect: I/O
  const now = Date.now();                     // side effect: hidden input (the clock)
  db.save(playerId, /* ... */);               // side effect: I/O
}
```

Why this matters so much here:

- **Testability.** You can assert `glicko2Update(known_input) === known_output` against Glickman's
  paper — impossible if the function secretly needs a database. (The "implement it in the service
  layer and regret it at test time" pitfall is exactly this.)
- **Determinism.** No hidden clock means two runs never disagree; re-judging is reproducible
  (Phase 2's idempotency depends on this).
- **Reasoning.** A pure function is a mathematical object — you can understand it in isolation.

The pattern: **pure functions do the math; a thin service layer does the I/O** — it loads the
player, calls the pure function, saves the result, all inside a transaction. The clock and the
database live in the service; never inside the math. (Pass `now` in as an argument if the math needs
time — then it's still pure.)

## E.2 Property-based testing — testing invariants, not examples

**Example-based testing** checks specific cases: `expect(update(1500, win)).toBe(1516)`. Useful, but
you'll only ever write a handful, and they don't cover the space.

**Property-based testing** (via a library like **fast-check**) instead asserts *properties that must
hold for ALL inputs*, and the library generates hundreds of random inputs trying to break them. You
describe a *law*, not a case:

```ts
import fc from "fast-check";

// LAW: after A beats B, A's rating must not decrease. For ANY valid ratings.
test("winning never lowers your rating", () => {
  fc.assert(fc.property(
    fc.integer({ min: 100, max: 3000 }),   // random A rating
    fc.integer({ min: 100, max: 3000 }),   // random B rating
    (ratingA, ratingB) => {
      const after = glicko2Update(makePlayer(ratingA), [win(makeOpp(ratingB))], TAU);
      return after.rating >= makePlayer(ratingA).rating;   // must hold for every pair
    },
  ));
});
```

fast-check throws hundreds of `(ratingA, ratingB)` pairs at this; if any breaks the law it
**shrinks** the failure to the *simplest* counterexample (e.g., the smallest ratings that trigger
the bug), which usually points straight at the cause. Properties worth encoding here:

- **Monotonicity:** beating someone never lowers your rating; losing never raises it.
- **RD widening:** an inactive period never *shrinks* rating deviation.
- **IRT bounds:** `P(correct)` always stays in [0, 1] for any θ, a, b.
- **FSRS sanity:** a successful review never *shortens* the next interval; retrievability is always
  in [0, 1] and decreasing in elapsed time.

Property tests catch the bugs example tests miss precisely because they explore inputs you'd never
think to type — the ideal companion to code that must be *mathematically* correct.

---


```check
engineering
```

<a name="worked"></a>
# Part F — From formula to code: two complete walkthroughs

The gap self-learners hit here is "I understand the formula but I can't turn it into code." So here
are two complete translations. Nothing project-specific.

## F.1 Elo, fully coded and hand-checked

```ts
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));   // the sigmoid, base-10, scale-400 (B.1)
}

function eloUpdate(ratingA: number, ratingB: number, scoreA: 0 | 0.5 | 1, k = 32): number {
  const expected = expectedScore(ratingA, ratingB);
  return Math.round(ratingA + k * (scoreA - expected));  // surprise × step size (gradient ascent)
}
```

Hand-check it so you *trust* it. A 1600 player beats a 2000 player:

```
expected(1600, 2000) = 1 / (1 + 10^((2000-1600)/400))
                     = 1 / (1 + 10^1) = 1 / 11 ≈ 0.0909    // underdog: ~9% predicted
new = 1600 + 32 * (1 - 0.0909) = 1600 + 32 * 0.9091 ≈ 1600 + 29.1 ≈ 1629
```

A ~29-point jump for a big upset — matches the intuition from B.1 (upsets move ratings a lot). Run
`eloUpdate(1600, 2000, 1)` and confirm you get 1629. *That* is how you validate math code: predict
the shape by hand, then check the machine agrees.

## F.2 Glicko-2, as complete pseudocode

The real thing you implement in Phase 3. This is the full update as pure-function pseudocode,
matching the step list in B.3 — implement it against Glickman's paper and reproduce his numbers.

```
CONSTANTS
  SCALE = 173.7178          // converts display rating ↔ internal μ
  TAU   = 0.5               // system constant (B.3): how fast volatility can change

// convert a player from display scale (rating R, deviation RD) to internal (μ, φ)
toInternal(R, RD):  μ = (R - 1500) / SCALE ;  φ = RD / SCALE ;  return (μ, φ)
toDisplay(μ, φ):    R = μ * SCALE + 1500  ;  RD = φ * SCALE ;  return (R, RD)

g(φ):        return 1 / sqrt(1 + 3*φ² / π²)                 // weights an opponent by their certainty
E(μ, μ_j, φ_j): return 1 / (1 + exp(-g(φ_j) * (μ - μ_j)))   // expected score vs opponent j (a sigmoid!)

glicko2Update(player {μ, φ, σ}, games [{μ_j, φ_j, score_j}], TAU):
  // Step 3: variance v of performance from these games
  v = 1 / Σ_j [ g(φ_j)² * E(μ,μ_j,φ_j) * (1 - E(μ,μ_j,φ_j)) ]

  // Step 4: performance-based improvement Δ (information-weighted surprise, like Elo's S−E)
  Δ = v * Σ_j [ g(φ_j) * (score_j - E(μ,μ_j,φ_j)) ]

  // Step 5: update volatility σ by iterating to solve f(x)=0 (see solveVolatility below)
  σ' = solveVolatility(φ, v, Δ, σ, TAU)

  // Step 6: update deviation φ and rating μ
  φ*  = sqrt(φ² + σ'²)                        // pre-rating-period deviation (RD widens if inactive)
  φ'  = 1 / sqrt(1/φ*² + 1/v)                 // new deviation (shrinks with evidence — B.2)
  μ'  = μ + φ'² * Σ_j [ g(φ_j) * (score_j - E(μ,μ_j,φ_j)) ]   // new rating

  return { μ', φ', σ' }
```

### The volatility solver, in full

Step 5 is the only part of Glicko-2 that isn't a closed-form formula, and it's where most
implementations go wrong. You are solving `f(x) = 0` for `x = ln(σ'²)` using the **Illinois
algorithm** — a variant of regula-falsi (false position) that converges fast and can't get stuck.
Here it is completely; nothing is left to the paper.

```
// the function whose root we want. a = ln(σ²) is a constant here.
f(x):
  ex = exp(x)
  num = ex * (Δ² − φ² − v − ex)
  den = 2 * (φ² + v + ex)²
  return num/den − (x − a)/TAU²

solveVolatility(φ, v, Δ, σ, TAU):
  EPSILON = 0.000001
  a = ln(σ²)

  // 1. bracket the root: find A and B with f(A), f(B) on opposite sides
  A = a
  if Δ² > φ² + v:
      B = ln(Δ² − φ² − v)
  else:
      k = 1
      while f(a − k*TAU) < 0:  k = k + 1      // step left until f turns positive
      B = a − k*TAU

  fA = f(A);  fB = f(B)

  // 2. Illinois iteration
  while |B − A| > EPSILON:
      C  = A + (A − B) * fA / (fB − fA)       // false-position secant step
      fC = f(C)
      if fC * fB <= 0:
          A = B;  fA = fB                     // root is between B and C
      else:
          fA = fA / 2                         // ← the "Illinois" halving: prevents a stalled endpoint
      B = C;  fB = fC

  return exp(A / 2)                           // x = ln(σ'²)  ⇒  σ' = e^(x/2)
```

The one line that makes it "Illinois" rather than plain false-position is `fA = fA / 2`. Plain
regula-falsi can keep one endpoint fixed forever and crawl toward the root from one side; halving
the stale endpoint's value forces it to move. Without that line the loop still converges — just
slowly enough that you'll think it's broken.

### Glickman's worked example — reproduce these exact numbers

The paper's example, which your implementation must match. A player rated **1500, RD 200,
σ = 0.06**, `τ = 0.5`, plays three games:

| Opponent | rating | RD | result |
|---|---|---|---|
| 1 | 1400 | 30 | **win** |
| 2 | 1550 | 100 | loss |
| 3 | 1700 | 300 | loss |

Convert to the internal scale (divide by 173.7178, centre on 1500):

```
player:  μ  = 0            φ  = 1.1513
opp 1:   μ₁ = −0.5756      φ₁ = 0.1727     s₁ = 1
opp 2:   μ₂ =  0.2878      φ₂ = 0.5756     s₂ = 0
opp 3:   μ₃ =  1.1513      φ₃ = 1.7269     s₃ = 0
```

Then, step by step:

```
g(φ₁) = 0.9955     E₁ = 0.6395
g(φ₂) = 0.9531     E₂ = 0.4318
g(φ₃) = 0.7242     E₃ = 0.3028

v = 1 / (0.9955²·0.6395·0.3605 + 0.9531²·0.4318·0.5682 + 0.7242²·0.3028·0.6972)
  = 1 / (0.2285 + 0.2229 + 0.1107)
  = 1 / 0.5621  = 1.7790

Σ = 0.9955·(1−0.6395) + 0.9531·(0−0.4318) + 0.7242·(0−0.3028)
  = 0.3589 − 0.4116 − 0.2193 = −0.2720       ← reuse this sum in μ' below

Δ = v · Σ = 1.7790 · (−0.2720) = −0.4839

σ' = 0.059996                          ← from solveVolatility above
φ* = sqrt(1.1513² + 0.059996²)              = 1.1529
φ' = 1 / sqrt(1/1.1529² + 1/1.7790)         = 0.8722
μ' = 0 + 0.8722² · (−0.2720)                = −0.2069
```

Back to the display scale:

```
rating' = −0.2069 · 173.7178 + 1500 = 1464.05
RD'     =  0.8722 · 173.7178        =  151.52
σ'      =  0.059996
```

> **The rounding trap that wastes an afternoon.** Glickman's paper prints `v = 1.7785` and
> `Δ = −0.4834`, and you will get `1.7790` and `−0.4839`. **Neither is wrong.** The paper rounds
> each `E` to three decimals *before* feeding it forward; a real implementation carries full
> precision. The divergence is in the 4th decimal and washes out by the end — both routes give
> `RD' = 151.52` and a rating within 0.01 of 1464.06. Assert your tests to ~2 decimals on the
> display-scale outputs, not to the paper's intermediate digits, or you will chase a bug that
> isn't there.

**Sanity-read the result before you trust the code.** The player lost two of three, so the rating
falls 1500 → 1464. RD drops sharply, 200 → 151.5: they arrived uncertain and three games is real
evidence. Volatility barely moves, 0.06 → 0.05999: the results were roughly what a 1500 player with
huge uncertainty would produce, so there's no reason to call them erratic. If your implementation
returns those three numbers, Steps 1–7 are all correct — this single test case catches nearly every
possible mistake.

Notes that save you hours:
- Everything is **pure** (E.1): inputs → outputs, no clock, no DB. That's what lets you diff against
  the intermediate numbers above one at a time — when a result is wrong, bisect on `v`, then `Δ`,
  then `σ'`.
- If a player played **no** games this period, you skip Steps 3–6 entirely and apply only
  `φ* = sqrt(φ² + σ²)` — RD widens, rating and volatility unchanged. That single branch *is* the
  "inactivity raises uncertainty" behavior from B.2.
- `v` and `Δ` both sum over the *same* games, and `μ'` reuses the sum inside `Δ` — compute that sum
  once and pass it around rather than looping three times.

## F.3 IRT online update, hand-traced

One submission, one tag. Current state: user `θ = 0.0`, problem `b = 1.0`, `a = 1.2`, learning
`rate = 0.1`. The user **solves** it (actual = 1):

```
P = sigmoid(a * (θ - b)) = sigmoid(1.2 * (0.0 - 1.0)) = sigmoid(-1.2) ≈ 0.231   // 23% predicted
error = actual - P = 1 - 0.231 = 0.769                                          // big positive surprise
θ ← θ + rate * a * error = 0.0 + 0.1 * 1.2 * 0.769 ≈ +0.092  → θ ≈ 0.092        // ability rises
b ← b - rate * a * error = 1.0 - 0.1 * 1.2 * 0.769 ≈ -0.092  → b ≈ 0.908        // difficulty falls
```

The user beat the odds, so their ability estimate rose and the problem's difficulty estimate fell —
both directions correct, both proportional to how *surprising* the result was. Code it and reproduce
these three numbers, then feed it a stream of simulated answers and watch θ converge toward the true
value.

## Mastery checklist — you're ready to build Phase 3 when you can…

- [ ] Draw the sigmoid from memory and explain why it maps "advantage" to "probability."
- [ ] Explain point estimate vs. uncertainty and why reporting a rating without RD is dishonest.
- [ ] Code Elo and hand-check one update to the point value.
- [ ] Explain Glicko-2's three numbers (rating, RD, volatility) and what each captures.
- [ ] Reproduce the intermediate numbers of Glickman's worked example in your implementation.
- [ ] Explain why RD widens with inactivity and what invariant that preserves.
- [ ] Write the 2PL formula and explain θ, b, and a — and what a=0 means.
- [ ] Hand-trace one IRT online update (θ and b both move).
- [ ] Explain FSRS's D/S/R and why it beats SM-2.
- [ ] Explain why all this math must be pure functions, and write one property-based test with an
  invariant.

<a name="quiz"></a>
# Self-quiz — with answers

**1. A 1500 player (RD=200) beats a 1700 player (RD=50). New rating — shape of the answer?**
The 1500 player: big positive surprise (was the underdog) *and* high uncertainty (RD=200), so
rating rises substantially and RD drops. The 1700 player: small loss, RD nearly unchanged (already
well-established). Direction and relative magnitude are what you must predict; the exact figure comes
from the implementation checked against Glickman's worked example.

**2. Why does RD widen for inactive users? What invariant does it preserve?**
Because evidence goes stale — an old rating is a less reliable estimate of current strength.
Widening RD encodes "we're less sure now," which lets the returning player's rating move quickly to
its true level. Invariant preserved: *confidence must decay as evidence ages* (uncertainty reflects
information recency, not just quantity).

**3. In 2PL IRT, discrimination `a` = 0 — is the item useful?**
No. `a = 0` makes `P(correct) = sigmoid(0) = 0.5` for every ability, so the item can't distinguish
skilled from unskilled respondents — zero measurement value; drop or flag it.

**4. IRT says θ = 1.2 ± 0.8 (95% CI). What does that mean for recommendation?**
The best guess of ability is 1.2 but the true value is plausibly anywhere from ~0.4 to ~2.0 — high
uncertainty. So don't confidently exploit (push problems tuned to exactly 1.2); explore to shrink
the interval first. Wide error bars = "gather more evidence before committing."

**5. Why is FSRS more sample-efficient than SM-2?**
FSRS is a statistical model (D/S/R) fitted to millions of real review logs, so it predicts recall
probability accurately and extracts more scheduling signal per review; SM-2 is fixed heuristics with
hard-coded multipliers that ignore the true forgetting curve. The model needs fewer reviews to reach
the same retention.

**6. Why pure functions for all this math?**
So each function can be unit-tested against known outputs (e.g., the Glicko-2 paper), is
deterministic and reproducible, carries no hidden clock/DB dependency, and can be reasoned about in
isolation. I/O lives in a thin service layer around the pure core; time is passed in as an argument.

---

<a name="exercises"></a>
# Exercises — learn by doing

All pure-TS, no project code. Check numbers in a REPL.

1. **Sigmoid intuition.** Implement `sigmoid` and `logit`; verify `sigmoid(logit(0.75)) === 0.75`
   (within floating tolerance). Tabulate `sigmoid(x)` for x = −4…4 and sketch the S-curve from the
   numbers alone.
2. **Elo by hand, then code.** Compute on paper: a 1600 player beats a 2000 player, K=32 — new
   rating? (Expect a big jump; it was an upset.) Then code `elo(rA, rB, scoreA, k)` and confirm.
   Feel how upsets move ratings more.
3. **Match the Glicko-2 paper.** Take Glickman's "Example of the Glicko-2 system" (4 pages).
   Implement the update as pure functions and reproduce *every intermediate number* in the worked
   example (g, E, v, Δ, new σ, φ, μ). This single exercise teaches the algorithm better than any
   summary.
4. **IRT self-calibration demo.** Simulate 200 "students" with random θ and 30 "items" with random
   b; generate correct/incorrect via the 2PL model; then *throw away* the true b values and recover
   them by online gradient ascent from the responses alone. Plot recovered-vs-true difficulty —
   watch the platform self-calibrate.
5. **Forgetting curve.** Implement FSRS retrievability `R(t, S)`; plot it for S = 1, 5, 20 days;
   then solve `R(t) = 0.9` for `t` at each S to get the optimal interval, and confirm bigger S →
   longer interval.
6. **Property tests.** Using fast-check, encode all the invariants from E.2 against your Elo and IRT
   implementations. Deliberately introduce a sign bug (`θ + error` → `θ − error`) and watch a
   property test catch and shrink it to a tiny counterexample.

# Where each topic came from (the original reading list)

| Topic | Source to go deeper |
|---|---|
| Glicko-2, the worked example | Glickman (2012), "Example of the Glicko-2 system" — 4 pages, glicko.net |
| A real production rating system | Codeforces blog, "How rating updates work"; Microsoft TrueSkill paper (compare/contrast) |
| Item Response Theory | de Ayala, *Item Response Theory for Psychologists*, ch. 1–3; the 2PL Wikipedia article (reproduce the math by hand) |
| Uncertainty visualization | *Bayesian Methods for Hackers* (Davidson-Pilon), the uncertainty chapter |
| FSRS | The FSRS-4 paper (arXiv, "stochastic shortest path… spaced repetition"); Open Spaced Repetition blog (plain-English) |
| Property-based testing | fast-check docs; the "property-based testing" idea from *Unit Testing Principles* (Khorikov) |
