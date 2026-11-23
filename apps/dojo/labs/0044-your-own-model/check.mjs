// Lesson 0044 checker: your Ollama client, against a fake Ollama server.
// The fake answers /api/chat like Ollama does (non-streaming), and its
// behaviour depends on the model name, so each case can script a reply.
import http from "node:http";
import { load, section, check, assert, eq, near, throwsWith, finish, show } from "../_lib/js-check.mjs";

const { createClient } = await load(import.meta.dirname, "ollama-client.mjs", "ollama-client.start.mjs");

const HINT = { type: "object", properties: { hint: { type: "string" }, concept: { type: "string" } }, required: ["hint", "concept"] };
const good = JSON.stringify({ hint: "Your loop stops one element early.", concept: "off-by-one" });
const seen = [];
const scripts = {
  good: [good],
  "bad-once": ["Sure! Here is a hint: {", good],
  "bad-twice": ["not json", "still not json"],
  "missing-field": [JSON.stringify({ hint: "Check your loop bound." }), JSON.stringify({ hint: "Check it." })],
  plain: ["The loop stops early."],
};
const calls = {};
const server = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let body;
    try { body = JSON.parse(raw); } catch { res.writeHead(400).end(JSON.stringify({ error: "invalid JSON body" })); return; }
    seen.push({ method: req.method, url: req.url, type: req.headers["content-type"], body });
    if (req.url !== "/api/chat" || req.method !== "POST") { res.writeHead(404).end(JSON.stringify({ error: "not found" })); return; }
    if (body.model === "missing") { res.writeHead(404, { "content-type": "application/json" }).end(JSON.stringify({ error: "model 'missing' not found" })); return; }
    if (body.model === "broken") { res.writeHead(500, { "content-type": "application/json" }).end(JSON.stringify({ error: "out of memory" })); return; }
    const n = (calls[body.model] = (calls[body.model] ?? 0) + 1);
    const script = scripts[body.model] ?? [good];
    const content = script[Math.min(n - 1, script.length - 1)];
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({
      model: body.model, created_at: new Date().toISOString(),
      message: { role: "assistant", content }, done: true, done_reason: "stop",
      total_duration: 2_500_000_000, load_duration: 100_000_000,
      prompt_eval_count: 412, prompt_eval_duration: 400_000_000,
      eval_count: 60, eval_duration: 1_500_000_000,
    }));
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const last = () => seen[seen.length - 1];
const msgs = [{ role: "system", content: "You write hints." }, { role: "user", content: "Why is my answer wrong?" }];

section("The request");
await check("POSTs to /api/chat as JSON", async () => {
  await createClient({ baseUrl, model: "good" }).chat(msgs, { schema: HINT, temperature: 0.2 });
  const r = last();
  assert(r.method === "POST" && r.url === "/api/chat", `got ${r.method} ${r.url}`);
  assert(String(r.type).includes("application/json"), `content-type was ${r.type}`);
});
await check("model, messages, stream: false, temperature, format", async () => {
  await createClient({ baseUrl, model: "good" }).chat(msgs, { schema: HINT, temperature: 0.2 });
  const b = last().body;
  eq(b.model, "good", "model"); eq(b.messages, msgs, "messages"); eq(b.stream, false, "stream");
  eq(b.options?.temperature, 0.2, "options.temperature"); eq(b.format, HINT, "format");
});
await check("no schema: no format field", async () => {
  await createClient({ baseUrl, model: "plain" }).chat(msgs);
  assert(!("format" in last().body), `format was sent: ${show(last().body.format)}`);
  assert(!("temperature" in (last().body.options ?? {})), "temperature was sent though none was given");
});

section("The response");
await check("content and parsed data", async () => {
  const r = await createClient({ baseUrl, model: "good" }).chat(msgs, { schema: HINT });
  eq(r.content, good, "content"); eq(r.data, JSON.parse(good), "data");
});
await check("no schema: data is null", async () => {
  const r = await createClient({ baseUrl, model: "plain" }).chat(msgs);
  eq(r.content, "The loop stops early.", "content"); eq(r.data, null, "data");
});
await check("tokens, seconds and speed, from nanoseconds", async () => {
  const r = await createClient({ baseUrl, model: "good" }).chat(msgs, { schema: HINT });
  eq([r.promptTokens, r.outputTokens], [412, 60], "promptTokens, outputTokens");
  near(r.seconds, 2.5, "seconds"); near(r.tokensPerSecond, 40, "tokensPerSecond");
  return "60 tokens in 1.5 s of generation: 40 tok/s";
});

section("When things go wrong");
await check("invalid JSON once: one retry, then success", async () => {
  const before = seen.length;
  const r = await createClient({ baseUrl, model: "bad-once" }).chat(msgs, { schema: HINT });
  eq(seen.length - before, 2, "requests sent"); eq(r.data?.concept, "off-by-one", "data.concept");
});
await check("invalid twice: throws \"invalid output\" after 2 tries", async () => {
  const before = seen.length;
  await throwsWith(() => createClient({ baseUrl, model: "bad-twice" }).chat(msgs, { schema: HINT }), "invalid output");
  eq(seen.length - before, 2, "requests sent");
});
await check("a required field missing counts as invalid", async () => {
  const before = seen.length;
  await throwsWith(() => createClient({ baseUrl, model: "missing-field" }).chat(msgs, { schema: HINT }), "invalid output");
  eq(seen.length - before, 2, "requests sent");
});
await check("404 and 500: throw with the status, no retry", async () => {
  const before = seen.length;
  const a = await throwsWith(() => createClient({ baseUrl, model: "missing" }).chat(msgs), "404");
  await throwsWith(() => createClient({ baseUrl, model: "broken" }).chat(msgs, { schema: HINT }), "500");
  eq(seen.length - before, 2, "requests sent (one each)");
  return a.slice(0, 40);
});

server.close();

if (process.argv.includes("--real")) {
  section("★ Your real Ollama");
  const realUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL;
  await check(`a real hint from ${model ?? "(set OLLAMA_MODEL)"}`, async () => {
    assert(model, "run: OLLAMA_MODEL=<a model you pulled> bash check.sh --real");
    const r = await createClient({ baseUrl: realUrl, model }).chat(
      [{ role: "user", content: "In one sentence, why might a loop `for (i = 0; i <= n; i++)` over an array of n items crash?" }],
      { schema: { type: "object", properties: { hint: { type: "string" }, concept: { type: "string" } }, required: ["hint", "concept"] }, temperature: 0 },
    );
    return `${r.outputTokens} tokens at ${r.tokensPerSecond.toFixed(1)} tok/s: ${r.data.concept}`;
  });
}

finish();
