/**
 * Guide content loader (server-only): merges the repo's docs/ phase guides
 * with the Dojo's own supplement guides, and extracts titles + TOC.
 */
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { REPO_ROOT } from "./repo";

const REPO_DOCS = path.join(REPO_ROOT, "docs");
const SUPPLEMENTS = path.join(REPO_ROOT, "apps/dojo/content/supplements");
const DSA_DIR = path.join(REPO_ROOT, "apps/dojo/content/dsa");
/** Language method references: content/reference/<lang>/<topic>.md → slug "<lang>-<topic>". */
const REFERENCE = path.join(REPO_ROOT, "apps/dojo/content/reference");

export interface GuideMeta {
  slug: string;
  title: string;
  source: "phase" | "supplement" | "dsa" | "reference";
  minutes: number;
  intro: string;
  /**
   * For reference sub-pages, the slug of their language index (e.g. "js" for "js-array").
   * The guides listing shows only the index pages so it doesn't fill up with per-topic files;
   * the index links onward to its own sub-pages.
   */
  parent?: string;
}

export interface TocEntry {
  depth: 2 | 3;
  text: string;
  id: string;
}

export interface Guide extends GuideMeta {
  markdown: string;
  toc: TocEntry[];
}

function listDir(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .sort();
  } catch {
    return [];
  }
}

/** Every reference file as [slug, absolute path], flattening one level of language folders. */
function listReference(): Array<[string, string]> {
  try {
    return fs
      .readdirSync(REFERENCE, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((langDir) => {
        const dir = path.join(REFERENCE, langDir.name);
        return fs
          .readdirSync(dir)
          .filter((f) => f.endsWith(".md"))
          .sort()
          .map((f) => {
            const base = f.replace(/\.md$/, "");
            const slug = base === "README" ? langDir.name : `${langDir.name}-${base}`;
            return [slug, path.join(dir, f)] as [string, string];
          });
      })
      .sort((a, b) => a[0].localeCompare(b[0]));
  } catch {
    return [];
  }
}

function firstHeading(md: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim() ?? "Untitled";
}

/** Strip inline markdown so a card shows prose, not `**bold**` and `[links](…)`. */
function plainText(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url) → text
    .replace(/`([^`]+)`/g, "$1") // `code` → code
    .replace(/\*\*(.+?)\*\*/g, "$1") // **bold** → bold (may contain nested emphasis)
    .replace(/\*(.+?)\*/g, "$1") // *italic* → italic
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate on a word boundary rather than mid-word. */
function clip(text: string, max = 200): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.]$/, "") + "…";
}

const isBlockLine = (t: string) =>
  !t || t.startsWith("#") || t.startsWith(">") || t.startsWith("|") || t.startsWith("```") || t.startsWith("-");

function firstParagraph(md: string): string {
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const t = (lines[i] ?? "").trim();
    if (isBlockLine(t)) continue;
    // Join the whole paragraph — emphasis often spans a line break, and half a
    // `**bold**` span would otherwise leak its asterisks onto the card.
    const para: string[] = [];
    for (let j = i; j < lines.length; j++) {
      const line = (lines[j] ?? "").trim();
      if (isBlockLine(line)) break;
      para.push(line);
    }
    return clip(plainText(para.join(" ")));
  }
  return "";
}

function readingMinutes(md: string): number {
  const words = md.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function metaFor(file: string, dir: string, source: GuideMeta["source"]): GuideMeta {
  const md = fs.readFileSync(path.join(dir, file), "utf8");
  return {
    slug: file.replace(/\.md$/, ""),
    title: firstHeading(md),
    source,
    minutes: readingMinutes(md),
    intro: firstParagraph(md),
  };
}

export function getAllGuides(): GuideMeta[] {
  const phase = listDir(REPO_DOCS).map((f) => metaFor(f, REPO_DOCS, "phase"));
  const supp = listDir(SUPPLEMENTS).map((f) => metaFor(f, SUPPLEMENTS, "supplement"));
  const dsa = listDir(DSA_DIR).map((f) => metaFor(f, DSA_DIR, "dsa"));
  const reference = listReference().map(([slug, file]) => {
    const lang = path.basename(path.dirname(file));
    return {
      ...metaFor(path.basename(file), path.dirname(file), "reference"),
      slug,
      ...(slug === lang ? {} : { parent: lang }),
    };
  });
  return [...supp, ...dsa, ...reference, ...phase];
}

function extractToc(md: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  let inFence = false;
  for (const line of md.split("\n")) {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!m) continue;
    const text = (m[2] as string).replace(/[*`]/g, "");
    entries.push({
      depth: (m[1] as string).length === 2 ? 2 : 3,
      text,
      id: slugger.slug(text),
    });
  }
  return entries;
}

export function getGuide(slug: string): Guide | null {
  const safe = slug.replace(/[^a-z0-9-]/gi, "");
  for (const [dir, source] of [
    [SUPPLEMENTS, "supplement"],
    [DSA_DIR, "dsa"],
    [REPO_DOCS, "phase"],
  ] as const) {
    const file = path.join(dir, `${safe}.md`);
    if (fs.existsSync(file)) {
      const markdown = fs.readFileSync(file, "utf8");
      return {
        ...metaFor(`${safe}.md`, dir, source),
        markdown,
        toc: extractToc(markdown).filter((e) => e.depth === 2),
      };
    }
  }
  const ref = listReference().find(([s]) => s === safe);
  if (ref) {
    const markdown = fs.readFileSync(ref[1], "utf8");
    const lang = path.basename(path.dirname(ref[1]));
    return {
      ...metaFor(path.basename(ref[1]), path.dirname(ref[1]), "reference"),
      slug: ref[0],
      ...(ref[0] === lang ? {} : { parent: lang }),
      markdown,
      toc: extractToc(markdown).filter((e) => e.depth === 2),
    };
  }
  return null;
}
