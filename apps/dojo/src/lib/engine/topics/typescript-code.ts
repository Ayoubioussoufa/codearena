/**
 * TypeScript — code-writing exercises (structure-checked). Imported by typescript.ts.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";

const DOC = { slug: "phase-0-foundations", label: "Phase 0 — TypeScript advanced types" };

const typeGuard: Generator = {
  id: "ts-code-guard",
  title: "✍️ Write a type predicate",
  generate: () =>
    codeTask({
      genId: "ts-code-guard",
      prompt:
        "API boundaries receive `unknown`. Write `isSubmission(x)` (parameter typed `unknown`) as a type guard — it should return a type predicate so the compiler narrows `x` to `Submission` after the call. Validate the shape safely at runtime.",
      language: "typescript",
      starter: `interface Submission {\n  id: number;\n  verdict: string;\n}\n\nfunction isSubmission(x: unknown) {\n  // return a type predicate\n}`,
      solution: `interface Submission {\n  id: number;\n  verdict: string;\n}\n\nfunction isSubmission(x: unknown): x is Submission {\n  return (\n    typeof x === "object" &&\n    x !== null &&\n    "id" in x &&\n    "verdict" in x\n  );\n}`,
      checks: [
        { re: "is\\s+Submission", label: "return type is the predicate `x is Submission`" },
        { re: "typeof\\s+x\\s*===\\s*[\"']object[\"']", label: "checks `typeof x === \"object\"`" },
        { re: "!==?\\s*null", label: "rules out `null` (typeof null is \"object\"!)" },
        { re: "[\"']\\w+[\"']\\s+in\\s+", label: "verifies keys with the `in` operator" },
      ],
      explanation:
        "The special `x is Submission` return type (a 'type predicate') is what turns an ordinary true/false check into *narrowing*: after `if (isSubmission(data))`, the compiler treats `data` as a `Submission` inside the block — no casts, no `any`. The `x !== null` line matters because of a famous JavaScript wart: `typeof null` is `\"object\"`, so without it `isSubmission(null)` would slip past the first check and then crash on the `in` checks. It's the smallest possible version of 'validate unknown input at the edge, then trust it'.",
      docRef: DOC,
    }),
};

const generic: Generator = {
  id: "ts-code-generic",
  title: "✍️ Write a generic function",
  generate: () =>
    codeTask({
      genId: "ts-code-generic",
      prompt:
        "Write `firstOr(items, fallback)` that returns the first element of the array, or the `fallback` when the array is empty. Make it fully generic — ONE implementation that works for numbers, strings and objects, with the return type linked to the element type, and no `any`.",
      language: "typescript",
      starter: `function firstOr(items, fallback) {\n  // add the generic signature + body\n}`,
      solution: `function firstOr<T>(items: T[], fallback: T): T {\n  return items.length > 0 ? (items[0] as T) : fallback;\n}`,
      checks: [
        { re: "firstOr\\s*<\\s*T\\s*>", label: "declares a type parameter `<T>`" },
        { re: "items\\s*:\\s*T\\[\\]|items\\s*:\\s*Array<T>", label: "types the array as `T[]`" },
        { re: "fallback\\s*:\\s*T", label: "fallback shares the same `T`" },
        { re: "\\)\\s*:\\s*T", label: "returns `T`" },
        { re: ":\\s*any\\b", expect: false, label: "no `any` anywhere" },
      ],
      explanation:
        "A **generic** is a type left blank for the *caller* to fill in: `T` is chosen when the function is called, and it links the inputs to the output — pass a `number[]` and you're guaranteed a `number` back. The non-generic alternatives are both bad: `any` throws type-safety away, and writing one copy per type duplicates code forever. One honest edge: under this repo's strict config (`noUncheckedIndexedAccess`), `items[0]` is `T | undefined` until you've proven the array isn't empty — so the ternary is doing real safety work, not decoration.",
      docRef: DOC,
    }),
};

const discriminated: Generator = {
  id: "ts-code-union",
  title: "✍️ Narrow a discriminated union",
  generate: () =>
    codeTask({
      genId: "ts-code-union",
      prompt:
        "Implement `describe(r)`: for `\"passed\"` return a string containing the runtime, for `\"error\"` one containing the message. Narrow on the discriminant — casts (`as`) are forbidden.",
      language: "typescript",
      starter: `type RunResult =\n  | { status: "passed"; runtimeMs: number }\n  | { status: "error"; message: string };\n\nfunction describe(r: RunResult): string {\n  // narrow, then use the branch-specific fields\n}`,
      solution: `type RunResult =\n  | { status: "passed"; runtimeMs: number }\n  | { status: "error"; message: string };\n\nfunction describe(r: RunResult): string {\n  if (r.status === "passed") {\n    return \`Accepted in \${r.runtimeMs} ms\`;\n  }\n  return \`Error: \${r.message}\`;\n}`,
      checks: [
        { re: "r\\.status\\s*===", label: "narrows on the discriminant `r.status`" },
        { re: "runtimeMs", label: "uses `runtimeMs` in the passed branch" },
        { re: "message", label: "uses `message` in the error branch" },
        { re: "\\sas\\s", expect: false, label: "no `as` casts" },
      ],
      explanation:
        "A **discriminated union** is a set of shapes that all share one 'tag' field (`status`) with a literal type. Checking that one tag is all the compiler needs to know *which* shape you're holding — so inside the `if (r.status === \"passed\")` block, `r` IS the passed shape, and trying `r.message` there won't even compile. A cast (`as`) would just *silence* the compiler instead of *convincing* it, defeating the whole safety design. Your workspace's RunResult and the contest state machine both lean on this exact pattern.",
      docRef: DOC,
    }),
};

export const typescriptCodeGens: Generator[] = [typeGuard, generic, discriminated];
