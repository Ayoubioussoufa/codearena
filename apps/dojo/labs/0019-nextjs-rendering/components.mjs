// Given: CodeArena's problem page, as plain render functions. You decide, in
// problem-page.mjs, which become server components and which client components.
import { h } from "./kit.mjs";

/** Stands in for Prisma. Async, like any real data access. */
export const db = {
  async findProblem(slug) {
    await new Promise((r) => setTimeout(r, 5));
    if (slug !== "two-sum") return null;
    return {
      id: 1, slug, title: "Two Sum <b>easy</b>", difficulty: "EASY",
      statement: "Given an array of integers and a target, return the indices of the two numbers that add up to the target.",
      examples: [{ input: "2 7 11 15\n9", output: "0 1" }],
      starterCode: "def solve(nums, target):\n    pass\n",
    };
  },
};
/** A server-side secret: the token the web server uses to call the API. */
export const API_TOKEN = "sk_live_7f3a9c-never-in-the-browser";

/** Async: loads the problem. Uses the database. */
export async function statement({ slug }) {
  const p = await db.findProblem(slug);
  if (!p) return h("p", {}, "No such problem.");
  return h("article", {},
    h("h1", {}, p.title),
    h("p", { class: "difficulty" }, p.difficulty),
    h("p", {}, p.statement));
}
/** Static markup from data it's given. */
export function examples({ items }) {
  return h("section", { class: "examples" }, ...items.map((e) => h("pre", {}, `${e.input}\n→ ${e.output}`)));
}
/** Interactive: reacts to typing. */
export function editor({ language, code }) {
  return h("textarea", { name: "code", "data-language": language, onInput: (e) => void e, spellcheck: false }, code);
}
/** Interactive: submits on click. */
export function submitButton({ problemId }) {
  return h("button", { type: "button", "data-problem": problemId, onClick: () => fetch("/submissions", { method: "POST" }) }, "Submit");
}
