/**
 * Checks for content/reference/js/README.md.
 * Each trap re-run on Node 24.22 on 3 Nov 2026 (sort, key order, fill, %, Unicode length, SameValueZero, Math.max limit between 120k and 150k elements).
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const jsReferenceChecks: GuideCheckSet = {
  name: "JS/TS methods reference",
  source: {
    label: "MDN: JavaScript standard built-in objects",
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects",
    note: "The exact contract of every method on these sheets. This reference adds what MDN doesn't: costs inside a hot loop, measured on Node. For the sort trap, read [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) first.",
  },
  terms: [
    "Comparator",
    "Mutating method",
    "SameValueZero",
    "Code unit",
    "Hole (sparse array)",
    "Rope string",
    "Safe integer",
  ],
  checks: [
    {
      id: "traps",
      section: "The sheets' traps: arrays, maps, objects, strings, numbers",
      questions: [
        {
          prompt: "What does `[10, 9, 1].sort()` return?",
          options: [
            "[1, 9, 10], since it compares as numbers",
            "[1, 10, 9], since it compares as strings",
            "[10, 9, 1], since the default keeps order",
            "[10, 9, 1], since sort returns a copy",
          ],
          correct: 1,
          why: "With no comparator, `sort` converts elements to strings and compares UTF-16 code units, so \"10\" sorts before \"9\". Always pass `(a, b) => a - b` for numbers. It also mutates: use `toSorted` to keep the original.",
        },
        {
          prompt: "`const g = Array(2).fill([]); g[0].push(1);` What is `g` now?",
          options: [
            "[[1], []]: each row gets its own array",
            "[[], []]: fill makes frozen copies of it",
            "An error: fill can't take an array value",
            "[[1], [1]]: both rows are the same array",
          ],
          correct: 3,
          why: "`fill` puts the same reference in every slot, so both rows are one array. Build a grid with `Array.from({ length: n }, () => [])`, which calls the factory once per row.",
        },
        {
          prompt: "What does `Object.keys({ b: 1, 2: 1, a: 1, 1: 1 })` return?",
          options: [
            "[\"1\", \"2\", \"b\", \"a\"]: integer keys go first",
            "[\"b\", \"2\", \"a\", \"1\"]: insertion order is kept",
            "[\"1\", \"2\", \"a\", \"b\"]: every key is sorted",
            "[\"b\", \"a\", \"1\", \"2\"]: string keys go first",
          ],
          correct: 0,
          why: "The spec orders integer-like keys first, ascending, then string keys in insertion order, and every key becomes a string. `Map` keeps insertion order for every key type, which is why it's the default for algorithms.",
        },
        {
          prompt: "What is `\"😀\".length` in JavaScript?",
          options: [
            "1, since it counts the visible symbols",
            "4, since it counts the UTF-8 bytes",
            "2, since it counts UTF-16 code units",
            "0, since emoji aren't counted as text",
          ],
          correct: 2,
          why: "`length` counts UTF-16 code units, and an emoji outside the Basic Multilingual Plane takes two (a surrogate pair). `[...\"😀\"].length` is 1: spreading iterates code points. That's why `split(\"\")` breaks emoji when you reverse a string.",
        },
      ],
      explain: "Explain why `Math.max(...arr)` can crash on a large array, what limit Node hit when measured, and the loop you'd write instead.",
    },
  ],
};
