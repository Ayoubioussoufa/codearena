import { Difficulty } from '../../../generated/prisma/client';

export type Example = { input: string; output: string; explanation?: string };

export type OriginalProblem = {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  description: string[];
  constraints: string[];
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
  examples: Example[];
  /** The inputs that come after the examples. The LAST one kills O(n²). */
  generatedInputs: () => string[];
};

/** The web's editor needs a starter for every language it offers. */
export const STDIN_STARTER: Record<string, string> = {
  javascript: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean).map(Number);\n\n// Your code here.\nconsole.log(0);\n`,
  typescript: `import { readFileSync } from "fs";\n\nconst data = readFileSync(0, "utf8").split(/\\s+/).filter(Boolean).map(Number);\n\n// Your code here.\nconsole.log(0);\n`,
  python: `import sys\n\ndata = sys.stdin.read().split()\n\n# Your code here.\nprint(0)\n`,
};
