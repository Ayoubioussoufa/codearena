// @ts-check
/**
 * Lesson 0051: the loop inside every "agent", with the limits that make it safe.
 *
 *   cp agent.start.mjs agent.mjs     then write runAgent
 *   bash check.sh            (a scripted fake model: no LLM needed)
 *
 * runAgent({ model, tools, input, maxSteps = 8, needsApproval = [], approve })
 *
 *   model(messages)  → Promise of one reply, either
 *                        { type: "tool_call", id, name, args }   or
 *                        { type: "final", text }
 *   tools            an object: name → async (args) => result
 *   approve(name, args) → Promise<boolean>, asked before any tool whose name
 *                        is in needsApproval runs (a human, in real life)
 *
 * The loop:
 *   1. messages starts as [{ role: "user", content: input }].
 *   2. Call model(messages) and append { role: "assistant", content: reply }.
 *   3. A "final" reply ends the loop: resolve to { text, steps, messages },
 *      where steps is how many times you called the model.
 *   4. A "tool_call" reply: work out a result, append
 *        { role: "tool", id, name, content: JSON.stringify(result) }
 *      and go back to 2. The result is:
 *        - { error: "unknown tool NAME" } if there is no such tool;
 *        - { error: "denied by the user" } if it needs approval and
 *          approve(name, args) said no (then the tool must NOT run);
 *        - { error: <the message> } if the tool throws (the model can recover);
 *        - otherwise whatever the tool returned.
 *   5. If the model has been called maxSteps times without a final reply,
 *      throw an Error whose message has "step limit".
 */

/**
 * @param {{
 *   model: (messages: any[]) => Promise<any>,
 *   tools: Record<string, (args: any) => Promise<any>>,
 *   input: string,
 *   maxSteps?: number,
 *   needsApproval?: string[],
 *   approve?: (name: string, args: any) => Promise<boolean>,
 * }} opts
 */
export async function runAgent(opts) {
  void opts;
  throw new Error("Not written yet.");
}
