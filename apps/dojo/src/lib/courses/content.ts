/**
 * Course content loader (server-only). Lesson bodies and reference pages are
 * trusted HTML fragments authored in this repo, in content/courses/.
 *
 * A lesson body is HTML with component markers, which the page replaces with
 * interactive pieces:
 *   <!-- warmup -->        questions from earlier lessons
 *   <!-- drill:<id> -->    a generated in-browser drill (src/lib/courses/drills.ts)
 *   <!-- quiz -->          the lesson's quiz
 *   <!-- words -->         your own definitions and answers, and the done message
 */
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { REPO_ROOT } from "../repo";

const COURSES = path.join(REPO_ROOT, "apps/dojo/content/courses");

export type Segment =
  | { kind: "html"; html: string }
  | { kind: "warmup" }
  | { kind: "quiz" }
  | { kind: "words" }
  | { kind: "drill"; id: string };

export interface TocEntry {
  id: string;
  text: string;
}

export interface LessonBody {
  segments: Segment[];
  /** The lesson's h2 sections, in order, with the ids added to them. */
  toc: TocEntry[];
  /** Number of tickable build steps (`data-key` checkboxes). */
  steps: number;
}

const MARKER = /<!--\s*(warmup|quiz|words|drill:([a-z0-9-]+))\s*-->/g;

function read(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

const stripTags = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

/** Gives every bare <h2> an id, and lists them. */
function addHeadingIds(html: string): { html: string; toc: TocEntry[] } {
  const slugger = new GithubSlugger();
  const toc: TocEntry[] = [];
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const text = stripTags(inner);
    const id = slugger.slug(text);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export function getLessonBody(slug: string): LessonBody | null {
  const raw = read(path.join(COURSES, "lessons", `${slug}.html`));
  if (raw === null) return null;
  const { html, toc } = addHeadingIds(raw);

  const segments: Segment[] = [];
  let last = 0;
  for (const m of html.matchAll(MARKER)) {
    const at = m.index ?? 0;
    if (at > last) segments.push({ kind: "html", html: html.slice(last, at) });
    const what = m[1] ?? "";
    if (what.startsWith("drill:")) segments.push({ kind: "drill", id: m[2] ?? "" });
    else segments.push({ kind: what as "warmup" | "quiz" | "words" });
    last = at + m[0].length;
  }
  if (last < html.length) segments.push({ kind: "html", html: html.slice(last) });

  const steps = (raw.match(/data-key="/g) ?? []).length;
  return { segments, toc, steps };
}

export interface ReferencePage {
  slug: string;
  title: string;
  html: string;
}

/** Reference pages: content/courses/reference/<slug>.html, title from the first <h1>. */
export function getReferencePages(): ReferencePage[] {
  const dir = path.join(COURSES, "reference");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".html")).sort();
  } catch {
    return [];
  }
  return files.flatMap((file) => {
    const html = read(path.join(dir, file));
    if (html === null) return [];
    const title = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1]?.replace(/<[^>]+>/g, "").trim();
    return [{ slug: file.replace(/\.html$/, ""), title: title ?? file, html }];
  });
}

export function getReferencePage(slug: string): ReferencePage | undefined {
  return getReferencePages().find((p) => p.slug === slug);
}
