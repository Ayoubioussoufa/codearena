// @ts-check
/**
 * Lesson 0044: a client for the model you host.
 *
 *   cp ollama-client.start.mjs ollama-client.mjs     then write createClient
 *   bash check.sh            (a fake Ollama server: no GPU, no model needed)
 *   bash check.sh --real     (★ optional: your real Ollama, see the lesson)
 *
 * createClient({ baseUrl, model }) returns { chat }.
 *
 * chat(messages, { schema, temperature }) POSTs to `${baseUrl}/api/chat` with
 * the JSON body
 *     { model, messages, stream: false, options: { temperature }, format: schema }
 * (leave `format` out when there is no schema; leave `temperature` out of
 * `options` when none was given), and resolves to:
 *     {
 *       content,          // message.content, the raw text
 *       data,             // JSON.parse(content) when a schema was given, else null
 *       promptTokens,     // prompt_eval_count
 *       outputTokens,     // eval_count
 *       seconds,          // total_duration, converted from nanoseconds
 *       tokensPerSecond,  // eval_count / eval_duration, per second
 *     }
 *
 * Rules (each one is a checker case):
 *   - With a schema, the reply must be valid JSON and have every field in
 *     schema.required. If not, ask again ONCE with the same body; if the
 *     second reply is bad too, throw an Error whose message has "invalid output".
 *   - A non-2xx answer throws an Error that includes the status code. No retry:
 *     a 404 (unknown model) or a 500 won't fix itself in a millisecond.
 */

/**
 * @param {{ baseUrl: string, model: string }} config
 * @returns {{ chat: (messages: {role: string, content: string}[], opts?: { schema?: any, temperature?: number }) => Promise<any> }}
 */
export function createClient(config) {
  void config;
  return {
    async chat(messages, opts = {}) {
      void messages; void opts;
      throw new Error("Not written yet.");
    },
  };
}
