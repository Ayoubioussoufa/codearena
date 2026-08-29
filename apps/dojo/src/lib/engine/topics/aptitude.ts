/**
 * Topic: Aptitude & Reasoning — the timed screening tests at Deloitte,
 * Capgemini, Accenture, TCS, etc. Every generator constructs its numbers so
 * the answer is exact, and fresh numbers appear on every attempt — like the
 * real test, minus the proctoring.
 */
import { choice, numeric } from "../helpers";
import type { Generator, Topic } from "../types";

const DOC = { slug: "aptitude-reasoning", label: "Aptitude & Reasoning — full course" };

const percentages: Generator = {
  id: "apt-percentages",
  title: "Percentages",
  generate: (rng) => {
    if (rng.chance(0.5)) {
      const a = rng.pick([10, 15, 20, 25, 30, 40, 50]);
      const b = rng.pick([10, 15, 20, 25, 30]);
      const net = Math.round(((1 + a / 100) * (1 - b / 100) - 1) * 10000) / 100;
      return numeric({
        genId: "apt-percentages",
        prompt: `A price is increased by ${a}% and the new price is then decreased by ${b}%. What is the net percentage change? (negative for a decrease, e.g. -2.5)`,
        answer: net,
        tolerance: 0.05,
        explanation: `Successive changes multiply — they never simply add. Net factor = (1 + ${a}/100)(1 − ${b}/100) = ${(1 + a / 100).toFixed(2)} × ${(1 - b / 100).toFixed(2)} = ${((1 + a / 100) * (1 - b / 100)).toFixed(4)}, i.e. ${net}%. Shortcut: a + b + ab/100 with signs = ${a} − ${b} − ${(a * b / 100).toFixed(1)} = ${net}. The trap answer "${a - b}%" ignores that the second change applies to an already-changed base.`,
        docRef: DOC,
      });
    }
    const x = rng.pick([10, 20, 25, 50, 75]);
    const base = rng.int(3, 60) * 4;
    const ans = Math.round(((x * base) / 100) * 100) / 100;
    return numeric({
      genId: "apt-percentages",
      prompt: `What is ${x}% of ${base}?`,
      answer: ans,
      tolerance: 0.005,
      explanation: `${x}% of ${base} = ${x}/100 × ${base} = ${ans}. Speed trick for tests: know the fraction forms cold — 25% = 1/4, 75% = 3/4, 50% = 1/2, 20% = 1/5, 10% = 1/10 — and multiply by the fraction instead of computing ×${x}÷100. Under a minute per question, fraction fluency is the entire game.`,
      docRef: DOC,
    });
  },
};

const profitLoss: Generator = {
  id: "apt-profit-loss",
  title: "Profit & loss",
  generate: (rng) => {
    const cp = rng.int(3, 25) * 20;
    const p = rng.pick([5, 10, 15, 20, 25, 30, 40]);
    const sp = cp + (cp * p) / 100;
    if (rng.chance(0.5)) {
      return numeric({
        genId: "apt-profit-loss",
        prompt: `A trader buys an item for ${cp} and wants a ${p}% profit. At what price must it sell?`,
        answer: sp,
        tolerance: 0.005,
        explanation: `SP = CP × (1 + profit%/100) = ${cp} × ${(1 + p / 100).toFixed(2)} = ${sp}. Profit percentage is always computed on the COST price unless the question explicitly says otherwise — that convention is the source of most wrong answers in this family.`,
        docRef: DOC,
      });
    }
    return numeric({
      genId: "apt-profit-loss",
      prompt: `An item bought for ${cp} is sold for ${sp}. What is the profit percentage?`,
      answer: p,
      tolerance: 0.05,
      explanation: `Profit% = (SP − CP)/CP × 100 = (${sp} − ${cp})/${cp} × 100 = ${p}%. The base is the cost price ${cp}, not the selling price — dividing by ${sp} gives the tempting-but-wrong ${Math.round(((sp - cp) / sp) * 1000) / 10}%. Fix the formula's denominator in memory: "profit over COST".`,
      docRef: DOC,
    });
  },
};

const ratios: Generator = {
  id: "apt-ratios",
  title: "Ratios & shares",
  generate: (rng) => {
    const a = rng.int(1, 5);
    let b = rng.int(1, 6);
    if (b === a) b += 1;
    const c = rng.int(1, 7);
    const unit = rng.int(4, 40) * 5;
    const total = unit * (a + b + c);
    const names = rng.pick([
      ["Amina", "Bilal", "Chida"],
      ["Ana", "Ben", "Cleo"],
      ["Aya", "Boris", "Cam"],
    ]);
    const idx = rng.int(0, 2);
    const share = [a, b, c][idx]! * unit;
    return numeric({
      genId: "apt-ratios",
      prompt: `${total} is divided among ${names[0]}, ${names[1]} and ${names[2]} in the ratio ${a}:${b}:${c}. How much does ${names[idx]} receive?`,
      answer: share,
      tolerance: 0.005,
      explanation: `The ratio has ${a} + ${b} + ${c} = ${a + b + c} parts, so one part = ${total}/${a + b + c} = ${unit}. ${names[idx]} holds ${[a, b, c][idx]} parts = ${share}. Always resolve "one part" first — every ratio question (shares, mixtures, ages) reduces to finding the part size, then multiplying.`,
      docRef: DOC,
    });
  },
};

const TIME_WORK_PAIRS: ReadonlyArray<readonly [number, number, number]> = [
  [6, 3, 2], [12, 6, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12],
  [6, 12, 4], [8, 24, 6], [10, 40, 8], [15, 30, 10], [9, 18, 6],
  [4, 12, 3], [5, 20, 4], [14, 35, 10], [21, 28, 12],
];

const timeWork: Generator = {
  id: "apt-time-work",
  title: "Time & work",
  generate: (rng) => {
    const [x, y, together] = rng.pick(TIME_WORK_PAIRS);
    if (rng.chance(0.6)) {
      return numeric({
        genId: "apt-time-work",
        prompt: `A finishes a job alone in ${x} days; B finishes it alone in ${y} days. Working together, how many days do they need?`,
        answer: together,
        tolerance: 0.01,
        explanation: `Convert to RATES — days don't add, work-per-day does. A does 1/${x} of the job per day, B does 1/${y}; together 1/${x} + 1/${y} = ${x + y}/${x * y} per day, so the job takes ${x * y}/${x + y} = ${together} days. The formula xy/(x+y) is this reasoning compressed; understand it once, then use it at test speed.`,
        docRef: DOC,
      });
    }
    return numeric({
      genId: "apt-time-work",
      prompt: `A and B together finish a job in ${together} days. A alone takes ${x} days. How many days does B need alone?`,
      answer: y,
      tolerance: 0.01,
      explanation: `B's daily rate = together-rate minus A's rate = 1/${together} − 1/${x} = ${x - together}/${together * x} = 1/${y}, so B alone needs ${y} days. Same rates-first discipline, run backwards — subtraction of rates is legal exactly because addition of rates was.`,
      docRef: DOC,
    });
  },
};

const speedDistance: Generator = {
  id: "apt-speed-distance",
  title: "Speed & distance",
  generate: (rng) => {
    if (rng.chance(0.5)) {
      const pair = rng.pick([
        [40, 60, 48], [30, 60, 40], [20, 30, 24], [40, 120, 60], [60, 90, 72], [10, 15, 12],
      ] as const);
      return numeric({
        genId: "apt-speed-distance",
        prompt: `A car drives from town P to town Q at ${pair[0]} km/h and returns over the same road at ${pair[1]} km/h. What is its average speed for the round trip, in km/h?`,
        answer: pair[2],
        tolerance: 0.05,
        explanation: `Equal DISTANCES at different speeds average with the "harmonic mean" 2ab/(a+b) (not the plain (a+b)/2) = 2·${pair[0]}·${pair[1]}/(${pair[0]}+${pair[1]}) = ${pair[2]} km/h — the slow leg eats more time, dragging the average below the midpoint ${(pair[0] + pair[1]) / 2}. The arithmetic mean is the planted wrong answer in every version of this question.`,
        docRef: DOC,
      });
    }
    const vRel = rng.pick([36, 54, 72, 90, 108]);
    const ms = (vRel * 5) / 18;
    const totalLen = ms * rng.int(8, 30);
    const l1 = Math.round(totalLen / 2 / 10) * 10;
    const l2 = totalLen - l1;
    const seconds = totalLen / ms;
    return numeric({
      genId: "apt-speed-distance",
      prompt: `Two trains of lengths ${l1} m and ${l2} m run toward each other on parallel tracks, with speeds adding up to ${vRel} km/h. How many seconds do they take to fully cross each other?`,
      answer: seconds,
      tolerance: 0.05,
      explanation: `Opposite directions ⇒ relative speed is the SUM: ${vRel} km/h = ${vRel} × 5/18 = ${ms} m/s (memorize ×5/18). To fully cross, the trains must cover both lengths: ${l1} + ${l2} = ${totalLen} m. Time = ${totalLen}/${ms} = ${seconds} s. The two classic slips: forgetting to add both lengths, and mixing km/h with metres.`,
      docRef: DOC,
    });
  },
};

const interest: Generator = {
  id: "apt-interest",
  title: "Simple & compound interest",
  generate: (rng) => {
    const p = rng.int(2, 12) * 400;
    const r = rng.pick([5, 10, 20]);
    if (rng.chance(0.5)) {
      const t = rng.int(2, 5);
      const si = (p * r * t) / 100;
      return numeric({
        genId: "apt-interest",
        prompt: `What is the simple interest on ${p} at ${r}% per year for ${t} years?`,
        answer: si,
        tolerance: 0.005,
        explanation: `SI = P·r·t/100 = ${p} × ${r} × ${t} / 100 = ${si}. Simple interest is linear — the same ${(p * r) / 100} every year, because interest never earns interest. That linearity is what separates it from the compound version, where the base grows.`,
        docRef: DOC,
      });
    }
    const amount = p * Math.pow(1 + r / 100, 2);
    const ci = Math.round((amount - p) * 100) / 100;
    return numeric({
      genId: "apt-interest",
      prompt: `What is the compound interest (compounded yearly) on ${p} at ${r}% per year for 2 years?`,
      answer: ci,
      tolerance: 0.05,
      explanation: `A = P(1 + r/100)² = ${p} × ${(1 + r / 100).toFixed(2)}² = ${Math.round(amount * 100) / 100}, so CI = A − P = ${ci}. Compare: simple interest would give ${(p * r * 2) / 100}; the difference ${Math.round((ci - (p * r * 2) / 100) * 100) / 100} = P(r/100)² is exactly "interest on the first year's interest" — a favourite exam sub-question.`,
      docRef: DOC,
    });
  },
};

const averages: Generator = {
  id: "apt-averages",
  title: "Averages",
  generate: (rng) => {
    if (rng.chance(0.5)) {
      const n = rng.pick([5, 7, 9, 11]);
      const start = rng.int(3, 60);
      const avg = start + (n - 1) / 2;
      return numeric({
        genId: "apt-averages",
        prompt: `What is the average of the ${n} consecutive integers starting at ${start}?`,
        answer: avg,
        tolerance: 0.005,
        explanation: `Consecutive integers are evenly spread, so the average IS the middle term: ${start} + (${n} − 1)/2 = ${avg} — no summing required. Symmetry arguments like this (average of an evenly spaced list = midpoint) turn 30-second questions into 5-second ones.`,
        docRef: DOC,
      });
    }
    const n = rng.pick([4, 5, 6, 8, 10]);
    const d = rng.int(1, 4);
    const x = rng.int(10, 40);
    const y = x + n * d;
    return numeric({
      genId: "apt-averages",
      prompt: `The average weight of ${n} people increases by ${d} kg when a person weighing ${x} kg is replaced by a newcomer. What does the newcomer weigh, in kg?`,
      answer: y,
      tolerance: 0.005,
      explanation: `The group total must rise by ${n} × ${d} = ${n * d} kg for the average of ${n} people to rise by ${d}. The newcomer supplies all of it: ${x} + ${n * d} = ${y} kg. Thinking in TOTALS (average × count) instead of averages directly untangles every replace/join/leave average puzzle.`,
      docRef: DOC,
    });
  },
};

const sequences: Generator = {
  id: "apt-sequences",
  title: "Number sequences",
  generate: (rng) => {
    const kind = rng.int(0, 3);
    if (kind === 0) {
      const a = rng.int(2, 20);
      const d = rng.int(3, 12);
      const terms = [a, a + d, a + 2 * d, a + 3 * d];
      return numeric({
        genId: "apt-sequences",
        prompt: `What number comes next: ${terms.join(", ")}, … ?`,
        answer: a + 4 * d,
        tolerance: 0.005,
        explanation: `The gaps are constant (+${d} each step): an arithmetic sequence. Next term = ${terms[3]} + ${d} = ${a + 4 * d}. First reflex on any series: write the differences between neighbours — constant differences mean arithmetic, constant ratios mean geometric, and differences-of-differences expose quadratic patterns.`,
        docRef: DOC,
      });
    }
    if (kind === 1) {
      const a = rng.int(2, 6);
      const r = rng.pick([2, 3]);
      const terms = [a, a * r, a * r * r, a * r * r * r];
      return numeric({
        genId: "apt-sequences",
        prompt: `What number comes next: ${terms.join(", ")}, … ?`,
        answer: a * Math.pow(r, 4),
        tolerance: 0.005,
        explanation: `Each term is ×${r} the previous: geometric with ratio ${r}. Next = ${terms[3]} × ${r} = ${a * Math.pow(r, 4)}. When differences aren't constant, check ratios next — the two checks together crack most exam series in seconds.`,
        docRef: DOC,
      });
    }
    if (kind === 2) {
      const s = rng.int(2, 8);
      const terms = [s * s, (s + 1) * (s + 1), (s + 2) * (s + 2), (s + 3) * (s + 3)];
      return numeric({
        genId: "apt-sequences",
        prompt: `What number comes next: ${terms.join(", ")}, … ?`,
        answer: (s + 4) * (s + 4),
        tolerance: 0.005,
        explanation: `These are consecutive perfect squares: ${s}², ${s + 1}², ${s + 2}², ${s + 3}² — next is ${s + 4}² = ${(s + 4) * (s + 4)}. Tell-tale: the differences (${2 * s + 1}, ${2 * s + 3}, ${2 * s + 5}) are consecutive odd numbers, which is the square sequence's fingerprint. Recognizing squares/cubes up to 20²/10³ on sight pays for itself.`,
        docRef: DOC,
      });
    }
    const a = rng.int(3, 15);
    const p = rng.int(2, 6);
    const q = rng.int(7, 12);
    const terms = [a, a + p, a + p + q, a + 2 * p + q, a + 2 * p + 2 * q];
    return numeric({
      genId: "apt-sequences",
      prompt: `What number comes next: ${terms.join(", ")}, … ?`,
      answer: a + 3 * p + 2 * q,
      tolerance: 0.005,
      explanation: `The gaps alternate: +${p}, +${q}, +${p}, +${q}, … so the next step is +${p}: ${terms[4]} + ${p} = ${a + 3 * p + 2 * q}. Alternating-difference series are the exam's favourite disguise — if plain differences look chaotic, check them at every SECOND position before trying anything fancier.`,
      docRef: DOC,
    });
  },
};

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

const combinatorics: Generator = {
  id: "apt-combinatorics",
  title: "Permutations & combinations",
  generate: (rng) => {
    if (rng.chance(0.5)) {
      const n = rng.int(5, 10);
      const r = rng.int(2, 4);
      const ncr = factorial(n) / (factorial(r) * factorial(n - r));
      return numeric({
        genId: "apt-combinatorics",
        prompt: `From ${n} people, how many different committees of ${r} can be formed? (order doesn't matter)`,
        answer: ncr,
        tolerance: 0.005,
        explanation: `Committees ignore order ⇒ combinations: C(${n}, ${r}) = ${n}!/(${r}!·${n - r}!) = ${ncr}. The order test decides everything: "committee/team/select" → nCr; "arrange/rank/password" → nPr = n!/(n−r)!, which is ${r}! = ${factorial(r)} times larger because each chosen group can be internally ordered that many ways.`,
        docRef: DOC,
      });
    }
    const n = rng.int(4, 7);
    return numeric({
      genId: "apt-combinatorics",
      prompt: `In how many different orders can ${n} distinct books be arranged on a shelf?`,
      answer: factorial(n),
      tolerance: 0.005,
      explanation: `${n} choices for the first slot, ${n - 1} for the second, … 1 for the last: ${n}! = ${factorial(n)}. Multiplying available choices slot by slot is the fundamental counting principle — every P&C formula is that principle pre-packaged. Know 4! = 24 through 8! = 40320 by heart for speed.`,
      docRef: DOC,
    });
  },
};

const probability: Generator = {
  id: "apt-probability",
  title: "Probability",
  generate: (rng) => {
    if (rng.chance(0.5)) {
      const red = rng.pick([1, 2, 3, 4, 5]);
      const blue = rng.pick([1, 2, 3, 4, 5, 7]);
      const total = red + blue;
      const ans = Math.round((red / total) * 1000) / 1000;
      return numeric({
        genId: "apt-probability",
        prompt: `A bag holds ${red} red and ${blue} blue balls. One ball is drawn at random. What is the probability it is red? (decimal, rounded to 3 places)`,
        answer: ans,
        tolerance: 0.002,
        explanation: `P(red) = favourable/total = ${red}/${red + blue} ≈ ${ans}. Single-draw probability is pure counting — the exam layers difficulty by chaining draws ("without replacement": the denominator shrinks each draw) or by asking the complement ("at least one" = 1 − P(none), almost always the faster route).`,
        docRef: DOC,
      });
    }
    const s = rng.pick([4, 5, 6, 7, 8, 9, 10]);
    const ways = 6 - Math.abs(s - 7);
    const ans = Math.round((ways / 36) * 1000) / 1000;
    return numeric({
      genId: "apt-probability",
      prompt: `Two fair dice are rolled. What is the probability their sum is exactly ${s}? (decimal, rounded to 3 places)`,
      answer: ans,
      tolerance: 0.002,
      explanation: `Two dice give 36 equally likely ordered outcomes. Sum ${s} happens in ${ways} of them — the counts rise 1,2,3,4,5,6 up to sum 7 then fall symmetrically, captured by 6 − |s − 7|. So P = ${ways}/36 ≈ ${ans}. Memorize the 7-peak triangle; dice questions then become instant lookups.`,
      docRef: DOC,
    });
  },
};

const SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
const CUBES = [8, 27, 64, 125, 216];
const PRIMES = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41];

const oddOneOut: Generator = {
  id: "apt-odd-one-out",
  title: "Odd one out",
  generate: (rng) => {
    const kind = rng.int(0, 2);
    if (kind === 0) {
      const squares = rng.sample(SQUARES, 3);
      let odd = rng.int(10, 140);
      while (SQUARES.includes(odd) || odd === 1) odd = rng.int(10, 140);
      return choice(rng, {
        genId: "apt-odd-one-out",
        prompt: "Which number does NOT belong with the others?",
        correct: String(odd),
        wrong: squares.map(String),
        explanation: `${squares.join(", ")} are all perfect squares (${squares.map((v) => Math.sqrt(v) + "²").join(", ")}); ${odd} is not. Classification questions test a small library of properties — squares, cubes, primes, parity, digit sums — so scan the options against each property in that order until exactly one number fails.`,
        docRef: DOC,
      });
    }
    if (kind === 1) {
      const cubes = rng.sample(CUBES, 3);
      const odd = rng.pick([30, 50, 70, 100, 120, 150, 200, 90]);
      return choice(rng, {
        genId: "apt-odd-one-out",
        prompt: "Which number does NOT belong with the others?",
        correct: String(odd),
        wrong: cubes.map(String),
        explanation: `${cubes.join(", ")} are perfect cubes (${cubes.map((v) => Math.round(Math.cbrt(v)) + "³").join(", ")}); ${odd} is not a cube. Cubes are rarer than squares in these tests precisely because fewer people recognize them past 27 — knowing 1, 8, 27, 64, 125, 216 on sight is the entire trick.`,
        docRef: DOC,
      });
    }
    const primes = rng.sample(PRIMES, 3);
    const odd = rng.pick([9, 15, 21, 25, 27, 33, 35, 39]);
    return choice(rng, {
      genId: "apt-odd-one-out",
      prompt: "Which number does NOT belong with the others?",
      correct: String(odd),
      wrong: primes.map(String),
      explanation: `${primes.join(", ")} are prime; ${odd} is composite (${odd} = ${odd % 3 === 0 ? `3 × ${odd / 3}` : `5 × ${odd / 5}`}). Odd composite numbers like ${odd} are the classic decoys — they FEEL prime because they're odd. Divisibility by 3 (digit sum) and by 7 are the checks that catch them fastest.`,
      docRef: DOC,
    });
  },
};

const syllogisms: Generator = {
  id: "apt-syllogisms",
  title: "Syllogisms & logic",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      const [A, B, C] = rng.pick([
        ["engineers", "chess players", "swimmers"],
        ["managers", "readers", "runners"],
        ["designers", "gamers", "hikers"],
      ]);
      return choice(rng, {
        genId: "apt-syllogisms",
        prompt: `Premises: All ${A} are ${B}. Some ${B} are ${C}. Which conclusion MUST be true?`,
        correct: `None of the following is certain: no conclusion linking ${A} and ${C} follows`,
        wrong: [
          `Some ${A} are ${C}`,
          `All ${C} are ${B}`,
          `Some ${C} are ${A}`,
        ],
        explanation: `"All ${A} are ${B}" puts ${A} inside ${B}; "some ${B} are ${C}" only says the ${B} and ${C} circles overlap SOMEWHERE — possibly entirely outside the ${A} region. Draw the Venn circles: any conclusion connecting ${A} to ${C} can be made false by a valid diagram, so nothing follows. "Must be true" means true in EVERY consistent diagram, not in the most natural-looking one.`,
        docRef: DOC,
      });
    }
    if (variant === 1) {
      const [A, B] = rng.pick([
        ["cats", "animals"],
        ["roses", "flowers"],
        ["sedans", "cars"],
      ]);
      return choice(rng, {
        genId: "apt-syllogisms",
        prompt: `Premise: All ${A} are ${B}. Which statement MUST be true?`,
        correct: `If something is not a ${B.slice(0, -1)}, it is not a ${A.slice(0, -1)}`,
        wrong: [
          `All ${B} are ${A}`,
          `If something is not a ${A.slice(0, -1)}, it is not a ${B.slice(0, -1)}`,
          `Some ${B} are not ${A}`,
        ],
        explanation: `"All ${A} are ${B}" is logically equivalent to its CONTRAPOSITIVE: outside ${B} means outside ${A}. The converse ("all ${B} are ${A}") and the inverse are the two classic traps, and "some ${B} are not ${A}" merely SOUNDS safe — it isn't guaranteed if the two sets happen to coincide. Contrapositive yes, converse no: the one rule powering half of formal-logic questions.`,
        docRef: DOC,
      });
    }
    const n = rng.int(3, 6);
    const total = n * (n - 1);
    return choice(rng, {
      genId: "apt-syllogisms",
      prompt: `In a round-robin chess event, each of ${n} players plays every other player twice (once with white, once with black). How many games are played?`,
      correct: String(total),
      wrong: [String(total / 2), String(n * n), String((n - 1) * (n - 1))],
      explanation: `Each ordered pair plays once: ${n} × ${n - 1} = ${total} games (equivalently C(${n},2) = ${total / 2} pairs, doubled for the colour swap). The half-value ${total / 2} is the answer to the SINGLE round-robin — reading whether pairings are counted once or twice is the actual skill this question tests.`,
      docRef: DOC,
    });
  },
};

export const aptitudeTopic: Topic = {
  id: "aptitude",
  title: "Aptitude & Reasoning",
  icon: "🧠",
  blurb:
    "The timed screening tests at Deloitte, Capgemini, Accenture & co. — quant, series, and logic with fresh numbers every attempt.",
  docSlug: "aptitude-reasoning",
  docTitle: "Aptitude & Reasoning — speed math and logic",
  generators: [
    percentages,
    profitLoss,
    ratios,
    timeWork,
    speedDistance,
    interest,
    averages,
    sequences,
    combinatorics,
    probability,
    oddOneOut,
    syllogisms,
  ],
};
