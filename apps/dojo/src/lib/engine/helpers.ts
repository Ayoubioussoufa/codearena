/**
 * Small builders shared by all topic generators.
 */
import type {
  ChoiceExercise,
  CodeCheckResult,
  CodeExercise,
  CodeGradeResult,
  CodeFile,
  DesignExercise,
  DesignRubricItem,
  DocRef,
  InputExercise,
  MultiFileExercise,
} from "./types";
import type { Rng } from "./rng";
import { runTests, type FnTest } from "./run-js";

interface ChoiceSpec {
  genId: string;
  prompt: string;
  code?: string;
  codeLang?: string;
  correct: string;
  wrong: string[];
  explanation: string;
  docRef: DocRef;
}

/** Builds a choice exercise with shuffled options. */
export function choice(rng: Rng, spec: ChoiceSpec): ChoiceExercise {
  const options = rng.shuffle([spec.correct, ...spec.wrong]);
  const exercise: ChoiceExercise = {
    kind: "choice",
    genId: spec.genId,
    prompt: spec.prompt,
    options,
    correctIndex: options.indexOf(spec.correct),
    explanation: spec.explanation,
    docRef: spec.docRef,
  };
  if (spec.code !== undefined) exercise.code = spec.code;
  if (spec.codeLang !== undefined) exercise.codeLang = spec.codeLang;
  return exercise;
}

interface NumericSpec {
  genId: string;
  prompt: string;
  code?: string;
  codeLang?: string;
  answer: number;
  /** Absolute tolerance (default: exact after rounding to 2 decimals). */
  tolerance?: number;
  /** How the canonical answer is displayed (default: String(answer)). */
  display?: string;
  placeholder?: string;
  explanation: string;
  docRef: DocRef;
}

/** Builds a numeric-input exercise with tolerance-based grading. */
export function numeric(spec: NumericSpec): InputExercise {
  const tol = spec.tolerance ?? 0.005;
  const exercise: InputExercise = {
    kind: "input",
    genId: spec.genId,
    prompt: spec.prompt,
    answer: spec.display ?? String(spec.answer),
    accept: (raw) => {
      const value = Number(raw.trim().replace(",", "."));
      return Number.isFinite(value) && Math.abs(value - spec.answer) <= tol;
    },
    placeholder: spec.placeholder ?? "number",
    explanation: spec.explanation,
    docRef: spec.docRef,
  };
  if (spec.code !== undefined) exercise.code = spec.code;
  if (spec.codeLang !== undefined) exercise.codeLang = spec.codeLang;
  return exercise;
}

interface TextSpec {
  genId: string;
  prompt: string;
  code?: string;
  codeLang?: string;
  /** Accepted answers (case/whitespace-insensitive). First one is canonical. */
  answers: string[];
  placeholder?: string;
  explanation: string;
  docRef: DocRef;
}

function normalize(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Builds a short-text input exercise. */
export function text(spec: TextSpec): InputExercise {
  const normalized = spec.answers.map(normalize);
  const exercise: InputExercise = {
    kind: "input",
    genId: spec.genId,
    prompt: spec.prompt,
    answer: spec.answers[0] ?? "",
    accept: (raw) => normalized.includes(normalize(raw)),
    placeholder: spec.placeholder ?? "answer",
    explanation: spec.explanation,
    docRef: spec.docRef,
  };
  if (spec.code !== undefined) exercise.code = spec.code;
  if (spec.codeLang !== undefined) exercise.codeLang = spec.codeLang;
  return exercise;
}

/* ── open-ended design prompts (self-graded) ── */

interface DesignSpec {
  genId: string;
  /** The scenario — what to design, and the scale to assume. */
  prompt: string;
  /** Whiteboard time budget in minutes (default 20). */
  minutes?: number;
  /** Requirements/constraints to pin down before drawing. */
  constraints: string[];
  /** The self-grade rubric — the dimensions a strong answer covers. */
  rubric: DesignRubricItem[];
  /** The worked reference design, revealed for self-grading. */
  solution: string;
  /** How to grade yourself / the single highest-signal move. */
  explanation: string;
  docRef: DocRef;
}

/** Builds a self-graded design prompt (scenario + timer + reveal + rubric). */
export function designPrompt(spec: DesignSpec): DesignExercise {
  return {
    kind: "design",
    genId: spec.genId,
    prompt: spec.prompt,
    minutes: spec.minutes ?? 20,
    constraints: spec.constraints,
    rubric: spec.rubric,
    solution: spec.solution,
    explanation: spec.explanation,
    docRef: spec.docRef,
  };
}

/* ── code-writing exercises ── */

export interface StaticCheck {
  /** Regex source tested against the raw code. */
  re: string;
  flags?: string;
  /** true (default) = code must match; false = code must NOT match. */
  expect?: boolean;
  /** Human description shown in the results list. */
  label: string;
}

interface CodeSpec {
  genId: string;
  prompt: string;
  /** highlight.js language key ("typescript", "sql", "xml", "graphql", …). */
  language: string;
  starter: string;
  solution: string;
  /** Hint 1 — opt-in "how to approach it" nudge (falls back to `explanation`). */
  hint?: string;
  explanation: string;
  docRef: DocRef;
  /** Static structure checks. */
  checks?: StaticCheck[];
  /** Execute a function the user must define against test cases (JS/TS only). */
  fn?: { name: string; tests: FnTest[] };
  /**
   * Tailwind-style grading: the answer is a space-separated class list;
   * required classes must all appear, forbidden ones must not. Order and
   * extra utility classes are ignored.
   */
  classTask?: { required: string[]; forbidden?: string[] };
}

function classesOf(code: string): Set<string> {
  return new Set(code.trim().split(/\s+/).filter(Boolean));
}

/** The gradable part of a code spec — shared by single- and multi-file tasks. */
interface Checkable {
  checks?: StaticCheck[];
  fn?: { name: string; tests: FnTest[] };
  classTask?: { required: string[]; forbidden?: string[] };
}

/** Runs one file's static checks, class checks and fn tests against `code`. */
async function runChecks(code: string, spec: Checkable): Promise<CodeCheckResult[]> {
  const results: CodeCheckResult[] = [];

  for (const check of spec.checks ?? []) {
    const matched = new RegExp(check.re, check.flags ?? "m").test(code);
    results.push({ label: check.label, passed: matched === (check.expect ?? true) });
  }

  if (spec.classTask) {
    const classes = classesOf(code);
    for (const cls of spec.classTask.required) {
      results.push({ label: `includes \`${cls}\``, passed: classes.has(cls) });
    }
    for (const cls of spec.classTask.forbidden ?? []) {
      const present = classes.has(cls);
      const entry: CodeCheckResult = { label: `avoids \`${cls}\``, passed: !present };
      if (present) entry.detail = "remove it — see the why below";
      results.push(entry);
    }
  }

  if (spec.fn) {
    const testResults = await runTests(code, spec.fn.name, spec.fn.tests);
    results.push(...testResults);
  }

  return results;
}

/** A code exercise passes only when it has at least one check and all pass. */
function verdict(results: CodeCheckResult[]): CodeGradeResult {
  return { passed: results.length > 0 && results.every((r) => r.passed), results };
}

/** Builds a code exercise whose grade() runs static checks, class checks and fn tests. */
export function codeTask(spec: CodeSpec): CodeExercise {
  return {
    kind: "code",
    genId: spec.genId,
    prompt: spec.prompt,
    language: spec.language,
    starter: spec.starter,
    solution: spec.solution,
    hint: spec.hint,
    explanation: spec.explanation,
    docRef: spec.docRef,
    grade: async (code: string) => verdict(await runChecks(code, spec)),
  };
}

/* ── multi-file code exercises ── */

/** One file of a multi-file exercise: its editor content plus its own checks. */
export interface FileSpec extends Checkable {
  name: string;
  language: string;
  starter: string;
  solution: string;
  /** Short always-visible note of the file's role, shown under the tab bar. */
  role?: string;
  /** Hint 1 for this file — an opt-in approach nudge (hint 2 is the solution). */
  hint?: string;
}

interface MultiFileSpec {
  genId: string;
  prompt: string;
  files: FileSpec[];
  /**
   * Checks run against every file concatenated — for wiring that must line up
   * ACROSS files (a type defined in one, consumed in another). Use `(?=…)`
   * lookaheads to assert several fragments all appear.
   */
  crossChecks?: StaticCheck[];
  explanation: string;
  docRef: DocRef;
}

/**
 * Builds a build-a-feature exercise spread over several files. Each file grades
 * on its own (per-tab debug); the whole exercise grades every file plus the
 * cross-file wiring, and only that whole-exercise pass records progress.
 */
export function multiFileTask(spec: MultiFileSpec): MultiFileExercise {
  const byName = new Map(spec.files.map((f) => [f.name, f]));

  const gradeFile = async (name: string, code: string): Promise<CodeGradeResult> => {
    const file = byName.get(name);
    if (!file) return { passed: false, results: [] };
    return verdict(await runChecks(code, file));
  };

  const files: CodeFile[] = spec.files.map((f) => {
    const file: CodeFile = {
      name: f.name,
      language: f.language,
      starter: f.starter,
      solution: f.solution,
    };
    if (f.role !== undefined) file.role = f.role;
    if (f.hint !== undefined) file.hint = f.hint;
    return file;
  });

  return {
    kind: "multi-file",
    genId: spec.genId,
    prompt: spec.prompt,
    explanation: spec.explanation,
    docRef: spec.docRef,
    files,
    gradeFile,
    grade: async (submitted: Record<string, string>) => {
      const perFile: { name: string; result: CodeGradeResult }[] = [];
      for (const f of spec.files) {
        perFile.push({ name: f.name, result: await gradeFile(f.name, submitted[f.name] ?? "") });
      }
      const joined = spec.files.map((f) => submitted[f.name] ?? "").join("\n\n");
      const cross = await runChecks(joined, { checks: spec.crossChecks });
      const passed = perFile.every((p) => p.result.passed) && cross.every((c) => c.passed);
      return { passed, perFile, cross };
    },
  };
}
