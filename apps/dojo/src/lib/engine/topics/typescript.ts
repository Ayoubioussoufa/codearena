/**
 * Topic: TypeScript foundations (drills docs/phase-0-foundations.md).
 */
import { choice, text } from "../helpers";
import type { Generator, Topic } from "../types";
import { typescriptCodeGens } from "./typescript-code";

const DOC = { slug: "phase-0-foundations", label: "Phase 0 — TypeScript advanced types" };
const DOC_DI = { slug: "phase-0-foundations", label: "Phase 0 — NestJS modules, providers & DI" };

const narrowing: Generator = {
  id: "ts-narrowing",
  title: "Union narrowing with typeof",
  generate: (rng) => {
    const pairs = [
      { union: "string | number", guard: "typeof x === \"string\"", then: "string", otherwise: "number" },
      { union: "number | boolean", guard: "typeof x === \"number\"", then: "number", otherwise: "boolean" },
      { union: "string | string[]", guard: "Array.isArray(x)", then: "string[]", otherwise: "string" },
      { union: "Date | string", guard: "x instanceof Date", then: "Date", otherwise: "string" },
    ] as const;
    const p = rng.pick(pairs);
    const askElse = rng.chance(0.5);
    return choice(rng, {
      genId: "ts-narrowing",
      prompt: `Inside the ${askElse ? "else" : "if"} branch, what is the type of \`x\`?`,
      code: `function f(x: ${p.union}) {\n  if (${p.guard}) {\n    // if branch\n  } else {\n    // else branch\n  }\n}`,
      codeLang: "ts",
      correct: askElse ? p.otherwise : p.then,
      wrong: [askElse ? p.then : p.otherwise, p.union, "unknown"],
      explanation: `A **union type** like \`${p.union}\` means "one of these types". A **type guard** is a runtime check TypeScript understands — \`${p.guard}\` here — and inside the branch where it's true, TypeScript **narrows** the type down to just \`${p.then}\`. Just as important: in the \`else\` branch it *subtracts* that option, leaving \`${p.otherwise}\`. The full union and \`unknown\` are wrong because the check already ruled options out — and that narrowing is exactly what lets you safely call type-specific methods without casting.`,
      docRef: DOC,
    });
  },
};

const utilityTypes: Generator = {
  id: "ts-utility",
  title: "Pick / Omit / Partial / Readonly",
  generate: (rng) => {
    const keys = ["id", "name", "email", "rating"] as const;
    const kept = rng.sample(keys, 2).sort();
    const dropped = keys.filter((k) => !kept.includes(k));
    const usePick = rng.chance(0.5);
    const expr = usePick
      ? `Pick<User, ${kept.map((k) => `"${k}"`).join(" | ")}>`
      : `Omit<User, ${dropped.map((k) => `"${k}"`).join(" | ")}>`;
    const correct = `{ ${kept.map((k) => `${k}: User["${k}"]`).join("; ")} }`;
    return choice(rng, {
      genId: "ts-utility",
      prompt: `\`User\` has the keys ${keys.map((k) => `\`${k}\``).join(", ")}. Which shape is equivalent to \`${expr}\`?`,
      correct,
      wrong: [
        `{ ${dropped.map((k) => `${k}: User["${k}"]`).join("; ")} }`,
        `{ ${kept.map((k) => `${k}?: User["${k}"]`).join("; ")} }`,
        "User, but with every key optional",
      ],
      explanation: `A **utility type** is a built-in type helper. \`Pick\` **keeps** exactly the keys you list; \`Omit\` **removes** the ones you list and keeps the rest — here both spellings land on the same fields: ${kept.map((k) => `\`${k}\``).join(" and ")}. The answers that make keys *optional* (with a \`?\`) describe a different helper, \`Partial\`. Pick/Omit only change *which* properties exist, never whether they're required — mixing those two up is the classic way DTO types quietly drift from reality.`,
      docRef: DOC,
    });
  },
};

const conditional: Generator = {
  id: "ts-conditional",
  title: "Conditional types & infer",
  generate: (rng) => {
    const cases = [
      { t: "ReturnType<typeof f>", code: "function f() {\n  return { ok: true, hits: 3 };\n}", answer: "{ ok: boolean; hits: number }", wrong: ["boolean", "{ ok: true, hits: 3 }", "unknown"] },
      { t: "Awaited<Promise<Promise<string>>>", code: "", answer: "string", wrong: ["Promise<string>", "Promise<Promise<string>>", "unknown"] },
      { t: "NonNullable<string | null | undefined>", code: "", answer: "string", wrong: ["string | null", "string | undefined", "never"] },
      { t: "Extract<\"a\" | \"b\" | \"c\", \"a\" | \"c\" | \"d\">", code: "", answer: '"a" | "c"', wrong: ['"a" | "b" | "c" | "d"', '"b"', '"d"'] },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "ts-conditional",
      prompt: `What does \`${c.t}\` resolve to?`,
      ...(c.code ? { code: c.code, codeLang: "ts" } : {}),
      correct: c.answer,
      wrong: [...c.wrong],
      explanation: `Think of these as **functions that run on types instead of values.** Under the hood they're "conditional types" — they pattern-match a type (using a keyword called \`infer\`) and produce a new one. \`ReturnType\` pulls out a function's return type, \`Awaited\` unwraps a Promise down to its value, \`NonNullable\` subtracts \`null | undefined\`, and \`Extract\` keeps only the union members that also appear in the second argument. Reading them as "type-level functions" is the whole trick — it turns advanced types from magic into something mechanical you can work out step by step.`,
      docRef: DOC,
    });
  },
};

const unknownVsAny: Generator = {
  id: "ts-unknown",
  title: "unknown vs any",
  generate: (rng) => {
    const varName = rng.pick(["payload", "input", "data", "body"]);
    return choice(rng, {
      genId: "ts-unknown",
      prompt: "Which line fails to compile?",
      code: `declare const ${varName}: unknown;\ndeclare const loose: any;\n\nconst a = loose.toUpperCase();   // line 1\nconst b = ${varName}.toUpperCase(); // line 2\nif (typeof ${varName} === "string") {\n  const c = ${varName}.toUpperCase(); // line 3\n}`,
      codeLang: "ts",
      correct: "Line 2 only",
      wrong: ["Line 1 only", "Lines 2 and 3", "None — all three compile"],
      explanation: `\`any\` **turns the type checker off** for that value, so line 1 compiles — and can blow up at runtime. \`unknown\` is the safe opposite: it can hold anything, but you must *prove* what it is before using it. So line 2 errors (nothing has shown \`${varName}\` is a string yet), while line 3 compiles because the \`typeof\` check narrowed it to \`string\` first. That's why data crossing your API boundary should arrive as \`unknown\` and be validated into a known type, never typed \`any\` — the "parse it at the edge" habit starts right here.`,
      docRef: DOC,
    });
  },
};

const diBasics: Generator = {
  id: "ts-di",
  title: "NestJS dependency injection",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "ts-di",
        prompt: "In NestJS, `UsersService` needs `PrismaService`. What is the idiomatic way to get it?",
        correct: "Declare it as a constructor parameter and let the DI container inject it",
        wrong: [
          "Call `new PrismaService()` inside `UsersService`",
          "Import it and use it as a global singleton object",
          "Fetch it from a service-locator registry at call time",
        ],
        explanation: "**Dependency injection**: the class *declares* what it needs as constructor parameters and never builds them itself — NestJS's 'container' reads those parameter types and hands in the instances. That flip is what makes swapping a real dependency for a fake in a test a one-line override. Calling `new PrismaService()` inline welds you to one concrete class (you can't fake it), and a 'service locator' you fetch from at call time hides the dependency so neither the type system nor the next reader can see what the class actually needs.",
        docRef: DOC_DI,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "ts-di",
        prompt: "A provider is declared in `ProblemsModule` but `ContestsModule` needs it too. What must happen?",
        correct: "ProblemsModule adds it to `exports`, and ContestsModule adds ProblemsModule to `imports`",
        wrong: [
          "Nothing — providers are global once declared anywhere",
          "ContestsModule re-declares the same provider in its own `providers` array",
          "Both modules must be merged into one",
        ],
        explanation: "A NestJS **module** is a walled-off box: a provider inside it is private *unless the module exports it*, and another module gets it by importing the module (not the class). Re-declaring the same provider elsewhere doesn't share it — it makes a *second copy*, a nasty bug when that provider holds state or a database connection pool. Keeping these boundaries honest is what stops a big app's separate areas from bleeding into each other.",
        docRef: DOC_DI,
      });
    }
    return choice(rng, {
      genId: "ts-di",
      prompt: "Why does hexagonal architecture put an interface (port) between the domain service and Prisma?",
      correct: "So the domain depends on an abstraction it owns, and the database adapter can be swapped without touching domain logic",
      wrong: [
        "Because Prisma cannot be used directly from services",
        "To make queries run faster through the abstraction layer",
        "Because NestJS requires interfaces for all providers",
      ],
      explanation: "The direction of the arrows is the whole point: **domain → port ← adapter.** A 'port' is just an interface the *domain* owns; the database code (the 'adapter') implements it and plugs in from the outside. So Prisma today, raw SQL or a fake tomorrow — swap freely without touching business logic. It's not about speed or a framework rule; it's about which side is *allowed to know about* the other, and that one-way knowledge is what keeps your business rules testable on their own.",
      docRef: DOC_DI,
    });
  },
};

const literalTypes: Generator = {
  id: "ts-literal",
  title: "Literal types & as const",
  generate: (rng) => {
    const word = rng.pick(["Easy", "pending", "dark", "admin"]);
    return text({
      genId: "ts-literal",
      prompt: `After this declaration, what is the inferred type of \`v.kind\`? (write the type exactly)`,
      code: `const v = { kind: "${word}" } as const;`,
      codeLang: "ts",
      answers: [`"${word}"`, `'${word}'`, word],
      placeholder: "type of v.kind",
      explanation: `By default TypeScript **widens** \`{ kind: "${word}" }\` to \`{ kind: string }\` — since the property *could* be reassigned, it assumes the general type \`string\`. \`as const\` says "this never changes", so the property stays the exact **literal type** \`"${word}"\` (and becomes \`readonly\`). That precision is the foundation of **discriminated unions** (like an exercise's \`kind: "choice" | "input"\`): the compiler can only tell the cases apart by a value it hasn't already widened into a plain \`string\`.`,
      docRef: DOC,
    });
  },
};

export const typescriptTopic: Topic = {
  id: "typescript",
  title: "TypeScript",
  icon: "🔷",
  blurb: "Narrowing, utility types, conditional types, unknown vs any, and the DI patterns Phase 0 builds on.",
  docSlug: "phase-0-foundations",
  docTitle: "Phase 0 — Foundations",
  generators: [
    narrowing,
    utilityTypes,
    conditional,
    unknownVsAny,
    diBasics,
    literalTypes,
    ...typescriptCodeGens,
  ],
};
