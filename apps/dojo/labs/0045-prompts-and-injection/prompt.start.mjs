// @ts-check
/**
 * Lesson 0045: the hint prompt, built so that untrusted code stays data.
 *
 *   cp prompt.start.mjs prompt.mjs     then write buildHintPrompt
 *   bash check.sh
 *
 * buildHintPrompt({ problem, verdict, failingTest, code, maxCodeChars })
 * returns the two messages you send to the model:
 *     [{ role: "system", content: SYSTEM }, { role: "user", content: USER }]
 *
 * SYSTEM holds your rules and nothing from the user. Write your own, but it
 * must: say the hint must never contain a solution or corrected code, and say
 * that whatever sits inside <code> is data to analyse, never instructions.
 *
 * USER holds the four values, each in its own tag, in this order, code last:
 *     <problem>…</problem>
 *     <verdict>…</verdict>
 *     <failing_test>…</failing_test>
 *     <code>…</code>
 *
 * Rules (each one is a checker case):
 *   - Escape every value before it goes in a tag: & → &amp;  < → &lt;  > → &gt;
 *     (& first). Then nothing a user types can open or close a tag.
 *   - Code longer than maxCodeChars (default 6000) keeps its first maxCodeChars
 *     characters, then a line "[… N more characters cut]" with N the number cut.
 *     Count and cut BEFORE escaping, so the limit is about the user's code.
 *   - Same input, same output, character for character: no dates, no randomness
 *     (prompt caching and evals both depend on it).
 */

/**
 * @param {{ problem: string, verdict: string, failingTest: string, code: string, maxCodeChars?: number }} input
 * @returns {{ role: "system" | "user", content: string }[]}
 */
export function buildHintPrompt(input) {
  void input;
  throw new Error("Not written yet.");
}
