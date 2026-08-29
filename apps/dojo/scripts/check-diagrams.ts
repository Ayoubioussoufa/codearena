/**
 * Validate every ```mermaid block in the guides so none silently falls back to
 * a code block in the browser. Structural checks always run; a real
 * mermaid.parse() runs too if the library initializes headless.
 *   pnpm test:diagrams
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "../src/lib/repo";

const GUIDE_DIRS = [
  path.join(REPO_ROOT, "apps/dojo/content/supplements"),
  path.join(REPO_ROOT, "apps/dojo/content/dsa"),
  path.join(REPO_ROOT, "docs"),
];

const KNOWN_TYPES =
  /^(flowchart|graph|sequenceDiagram|stateDiagram(-v2)?|classDiagram|erDiagram|gantt|pie|journey|gitGraph)\b/;

interface Block {
  file: string;
  index: number;
  code: string;
}

function extract(): Block[] {
  const blocks: Block[] = [];
  for (const dir of GUIDE_DIRS) {
    let files: string[];
    try {
      files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }
    for (const file of files) {
      const md = fs.readFileSync(path.join(dir, file), "utf8");
      const re = /```mermaid\n([\s\S]*?)```/g;
      let m: RegExpExecArray | null;
      let i = 0;
      while ((m = re.exec(md)) !== null) {
        blocks.push({ file: path.relative(REPO_ROOT, path.join(dir, file)), index: i++, code: (m[1] ?? "").trim() });
      }
    }
  }
  return blocks;
}

const failures: string[] = [];

function structural(b: Block) {
  const id = `${b.file} #${b.index}`;
  const firstLine = b.code.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "";
  if (!KNOWN_TYPES.test(firstLine)) {
    failures.push(`${id}: unknown/missing diagram type — starts with "${firstLine.slice(0, 30)}"`);
  }
  const pairs: [string, string][] = [
    ["[", "]"],
    ["{", "}"],
    ["(", ")"],
  ];
  for (const [open, close] of pairs) {
    const o = b.code.split(open).length - 1;
    const c = b.code.split(close).length - 1;
    if (o !== c) failures.push(`${id}: unbalanced ${open}${close} (${o} vs ${c})`);
  }
  if ((b.code.split('"').length - 1) % 2 !== 0) {
    failures.push(`${id}: odd number of double-quotes`);
  }
  // subgraph / alt / loop / opt / par openers must match standalone `end`s.
  const lines = b.code.split("\n").map((l) => l.trim());
  const openers = lines.filter(
    (l) => l.startsWith("subgraph") || /^(alt|loop|opt|par)\b/.test(l),
  ).length;
  const ends = lines.filter((l) => l === "end").length;
  if (openers !== ends) {
    failures.push(`${id}: ${openers} block openers vs ${ends} 'end' terminators`);
  }
}

async function main() {
  const blocks = extract();
  const dojoBlocks = blocks.filter((b) => b.file.includes("apps/dojo/content"));
  for (const b of blocks) structural(b);

  // Best-effort real parse. Mermaid needs a DOM to fully initialize, so a
  // "DOMPurify/document" error means "couldn't test here", NOT a bad diagram
  // (the pre-existing phase-doc diagrams render fine in the browser). Only a
  // genuine "Parse error" counts as a real failure.
  let parsed = 0;
  let skipped = 0;
  try {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize({ startOnLoad: false });
    for (const b of blocks) {
      try {
        await mermaid.parse(b.code);
        parsed++;
      } catch (e) {
        const msg = String(e).split("\n").slice(0, 2).join(" ");
        const envIssue = /DOMPurify|is not a function|document is not defined|window is not defined/.test(msg);
        if (envIssue) skipped++;
        else failures.push(`${b.file} #${b.index}: real parse error — ${msg}`);
      }
    }
  } catch {
    console.log("(mermaid unavailable headless — structural checks only)");
  }

  console.log(
    `Found ${blocks.length} mermaid diagrams (${dojoBlocks.length} in dojo guides); ` +
      `mermaid parsed ${parsed}, skipped ${skipped} (no DOM).`,
  );
  if (failures.length > 0) {
    console.error(`\n${failures.length} PROBLEMS:`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
  }
  console.log("All diagrams structurally valid. ✓");
}

void main();
