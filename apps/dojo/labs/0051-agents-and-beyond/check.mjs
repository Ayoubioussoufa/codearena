// Lesson 0051 checker: your agent loop, driven by a scripted fake model.
import { load, section, check, assert, eq, throwsWith, finish } from "../_lib/js-check.mjs";

const { runAgent } = await load(import.meta.dirname, "agent.mjs", "agent.start.mjs");

/** A fake model that plays back replies in order and records what it saw. */
function scripted(...replies) {
  const seen = [];
  const model = async (messages) => {
    seen.push(structuredClone(messages));
    const r = replies[Math.min(seen.length - 1, replies.length - 1)];
    return typeof r === "function" ? r(messages) : r;
  };
  return { model, seen };
}
const call = (id, name, args = {}) => ({ type: "tool_call", id, name, args });
const final = (text) => ({ type: "final", text });
const lastTool = (messages) => {
  const m = [...messages].reverse().find((x) => x.role === "tool");
  assert(m, "no tool message was appended");
  assert(typeof m.content === "string", "a tool message's content must be a JSON string");
  return { ...m, result: JSON.parse(m.content) };
};

section("The loop");
await check("a final reply ends it at once", async () => {
  const { model } = scripted(final("Your loop starts at 1."));
  const r = await runAgent({ model, tools: {}, input: "Why did I fail test 2?" });
  eq([r.text, r.steps, r.messages.length], ["Your loop starts at 1.", 1, 2], "[text, steps, messages]");
  eq(r.messages[0], { role: "user", content: "Why did I fail test 2?" }, "first message");
});
await check("a tool call runs the tool, and the model sees its result", async () => {
  let got;
  const tools = { get_failing_test: async (args) => { got = args; return { input: "3\n1 2 3", expected: "6", actual: "5" }; } };
  const { model, seen } = scripted(call("t1", "get_failing_test", { submissionId: "s42" }), (msgs) => final(`expected ${lastTool(msgs).result.expected}`));
  const r = await runAgent({ model, tools, input: "Explain my failure." });
  eq(got, { submissionId: "s42" }, "the tool's arguments");
  eq(r.text, "expected 6", "final text");
  eq(r.steps, 2, "steps");
  const t = lastTool(seen[1]);
  eq([t.role, t.id, t.name], ["tool", "t1", "get_failing_test"], "the tool message");
});
await check("the assistant's replies are kept in the history", async () => {
  const { model } = scripted(call("t1", "ping"), final("done"));
  const r = await runAgent({ model, tools: { ping: async () => "pong" }, input: "go" });
  eq(r.messages.map((m) => m.role), ["user", "assistant", "tool", "assistant"], "roles");
});

section("When a tool fails");
await check("a tool that throws: the error goes back to the model", async () => {
  const tools = { get_failing_test: async () => { throw new Error("submission s9 not found"); } };
  const { model, seen } = scripted(call("t1", "get_failing_test", { submissionId: "s9" }), final("I couldn't find that submission."));
  const r = await runAgent({ model, tools, input: "?" });
  eq(lastTool(seen[1]).result, { error: "submission s9 not found" }, "tool result");
  eq(r.text, "I couldn't find that submission.", "final text");
});
await check("an unknown tool: an error, not a crash", async () => {
  const { model, seen } = scripted(call("t1", "rm_rf", { path: "/" }), final("ok"));
  await runAgent({ model, tools: {}, input: "?" });
  eq(lastTool(seen[1]).result, { error: "unknown tool rm_rf" }, "tool result");
});

section("Limits a real agent needs");
await check("a risky tool waits for a human: no", async () => {
  let ran = false, asked;
  const tools = { delete_submission: async () => { ran = true; return "deleted"; } };
  const { model, seen } = scripted(call("t1", "delete_submission", { id: "s1" }), final("Not deleted."));
  await runAgent({ model, tools, input: "clean up", needsApproval: ["delete_submission"], approve: async (n, a) => { asked = [n, a]; return false; } });
  assert(!ran, "the tool ran although the human said no");
  eq(asked, ["delete_submission", { id: "s1" }], "approve was asked with");
  eq(lastTool(seen[1]).result, { error: "denied by the user" }, "tool result");
});
await check("…and yes", async () => {
  let ran = false;
  const tools = { delete_submission: async () => { ran = true; return "deleted"; } };
  const { model } = scripted(call("t1", "delete_submission", { id: "s1" }), final("Deleted."));
  await runAgent({ model, tools, input: "clean up", needsApproval: ["delete_submission"], approve: async () => true });
  assert(ran, "the human said yes, but the tool didn't run");
});
await check("tools that don't need approval don't ask", async () => {
  let asked = false;
  const { model } = scripted(call("t1", "ping"), final("ok"));
  await runAgent({ model, tools: { ping: async () => "pong" }, input: "?", needsApproval: ["delete_submission"], approve: async () => { asked = true; return true; } });
  assert(!asked, "approve was called for a tool that doesn't need it");
});
await check("a model that never stops hits the step limit", async () => {
  const { model, seen } = scripted(call("t", "ping"));
  await throwsWith(() => runAgent({ model, tools: { ping: async () => "pong" }, input: "?", maxSteps: 4 }), "step limit");
  eq(seen.length, 4, "model calls before giving up");
});
await check("the default limit is 8", async () => {
  const { model, seen } = scripted(call("t", "ping"));
  await throwsWith(() => runAgent({ model, tools: { ping: async () => "pong" }, input: "?" }), "step limit");
  eq(seen.length, 8, "model calls");
});

finish();
