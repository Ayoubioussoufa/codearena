/**
 * Checks for content/supplements/aptitude-reasoning.md.
 * Every numeric answer recomputed on 3 Nov 2026.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const aptitudeChecks: GuideCheckSet = {
  name: "Aptitude guide",
  source: {
    label: "IndiaBix: aptitude questions and answers",
    href: "https://www.indiabix.com/aptitude/questions-and-answers/",
    note: "The free question bank that services-firm tests resemble, organised by the same topics as this guide. Use it for timed volume once the dojo's generated drills feel familiar.",
  },
  terms: [
    "Percentage base",
    "Successive change",
    "Harmonic mean",
    "Relative speed",
    "Permutation",
    "Combination",
    "Syllogism",
    "Back-substitution",
  ],
  checks: [
    {
      id: "foundation",
      section: "§1–4 · Method, mental math, percentages, profit",
      questions: [
        {
          prompt: "A price rises 30%, then falls 30%. What's the net change?",
          options: [
            "No change at all",
            "A 9% fall overall",
            "A 9% rise overall",
            "A 3% fall overall",
          ],
          correct: 1,
          why: "Net = a + b + ab/100 = 30 − 30 + (30 × −30)/100 = −9. The fall is taken on the raised price, so you end below the start.",
        },
        {
          prompt: "Successive discounts of 20% and then 10%. What single discount equals them?",
          options: [
            "30%: the discounts just add up",
            "25%: the average of the two",
            "32%: they compound, so it grows",
            "28%: 0.8 × 0.9 leaves 0.72",
          ],
          correct: 3,
          why: "Successive discounts multiply what's left: 0.8 × 0.9 = 0.72 of the price remains, so the discount is 28%, not 30%. The second discount applies to an already-reduced price.",
        },
        {
          prompt: "Why read the answer options before computing?",
          options: [
            "They show how precise the working must be",
            "They reveal the formula that the test expects",
            "They are always listed in order of difficulty",
            "They hide the trick inside the first option",
          ],
          correct: 0,
          why: "If the options are 240, 480, 720 and 960, a rough estimate picks the answer and exact work wastes time. Options also allow back-substitution: plug one in and check the condition.",
        },
      ],
      explain: "Explain the \"name the base\" habit with one percentage trap, and the four kinds of miss you log after each drill.",
    },
    {
      id: "ratios",
      section: "§5–7 · Ratios, averages, time and work",
      questions: [
        {
          prompt: "Split 900 in the ratio 2 : 3 : 4. What's the largest share?",
          options: [
            "300",
            "450",
            "400",
            "360",
          ],
          correct: 2,
          why: "The parts sum to 9, so one part is 100 and the largest share is 4 parts: 400.",
        },
        {
          prompt: "One pipe fills a tank in 6 hours, another empties it in 9. With both open, how long to fill it?",
          options: [
            "15 hours",
            "3 hours",
            "18 hours",
            "12 hours",
          ],
          correct: 2,
          why: "Rates add, with the drain negative: 1/6 − 1/9 = 3/18 − 2/18 = 1/18 of the tank per hour, so 18 hours. Think in work per hour, never in hours.",
        },
        {
          prompt: "The average of 10 numbers is 40. One number, 25, is replaced by 75. What's the new average?",
          options: [
            "45",
            "50",
            "42",
            "90",
          ],
          correct: 0,
          why: "Replacing x with y shifts the average by (y − x)/n = 50/10 = 5, so 45. No need to recompute the total.",
        },
      ],
      explain: "Derive the \"together\" formula xy/(x + y) for two workers from their rates, out loud.",
    },
    {
      id: "motion",
      section: "§8–9 · Speed, distance, interest",
      questions: [
        {
          prompt: "A 200 m train at 72 km/h crosses a 100 m platform. How long does it take?",
          options: [
            "10 seconds",
            "5 seconds",
            "25 seconds",
            "15 seconds",
          ],
          correct: 3,
          why: "72 km/h × 5/18 = 20 m/s. The train must cover its own length plus the platform: 300 m ÷ 20 m/s = 15 s.",
        },
        {
          prompt: "What's the difference between compound and simple interest on 10,000 at 10% for 2 years?",
          options: [
            "200: two years of interest",
            "100: P times (r/100) squared",
            "0: too short to compound",
            "1,000: one year of interest",
          ],
          correct: 1,
          why: "For 2 years, CI − SI = P(r/100)² = 10,000 × 0.01 = 100: the interest earned on the first year's interest.",
        },
      ],
      explain: "Explain relative speed for two trains moving in opposite directions and in the same direction, with the time-to-cross formula.",
    },
    {
      id: "counting",
      section: "§10–11 · Counting and probability",
      questions: [
        {
          prompt: "How many ways can you choose a team of 3 from 7 people, when order doesn't matter?",
          options: [
            "35 possible teams",
            "210 possible teams",
            "21 possible teams",
            "343 possible teams",
          ],
          correct: 0,
          why: "Order doesn't matter, so it's a combination: 7C3 = 7!/(3!·4!) = 35. 210 is 7P3 (order matters); 343 is 7³ (repetition allowed).",
        },
        {
          prompt: "Two dice are rolled. What's the probability that the sum is 7?",
          options: [
            "1/12 of the time",
            "7/36 of the time",
            "1/6 of the time",
            "1/9 of the time",
          ],
          correct: 2,
          why: "36 equally likely outcomes, and six of them sum to 7 (1+6 … 6+1): 6/36 = 1/6. The number of ways to make sum s is 6 − |s − 7|.",
        },
      ],
      explain: "Explain when a counting question is a permutation and when it's a combination, with one example of each.",
    },
    {
      id: "logic",
      section: "§12–14 · Logical reasoning and drilling",
      questions: [
        {
          prompt: "\"All coders are logical. Some logical people are artists.\" Does \"some coders are artists\" follow?",
          options: [
            "Yes: coders are logical, some are artists",
            "No: the artists may overlap only non-coders",
            "Yes: \"some\" carries over to every subset",
            "No: two premises can never lead anywhere",
          ],
          correct: 1,
          why: "Draw coders inside logical; artists must overlap logical but nothing forces them to touch coders. One valid diagram that breaks the conclusion means it does not follow.",
        },
        {
          prompt: "What comes next: 2, 6, 12, 20, 30, …?",
          options: [
            "40",
            "36",
            "44",
            "42",
          ],
          correct: 3,
          why: "The differences are 4, 6, 8, 10, so the next is 12: 30 + 12 = 42. (It's n(n + 1): 1·2, 2·3, 3·4, … 6·7.)",
        },
        {
          prompt: "A man walks 4 km north, turns right and walks 3 km. How far is he from the start?",
          options: [
            "7 km, to the north-east",
            "5 km, to the north-east",
            "5 km, to the north-west",
            "1 km, to the south-east",
          ],
          correct: 1,
          why: "Coordinates: (0, 0) → (0, 4) → turning right while facing north means east → (3, 4). Distance √(9 + 16) = 5 km, north-east: the 3-4-5 triangle.",
        },
      ],
      explain: "Solve a blood-relation puzzle out loud: \"She is the daughter of my grandfather's only son.\" Who is she to the speaker, and how do you work backwards?",
    },
  ],
};
