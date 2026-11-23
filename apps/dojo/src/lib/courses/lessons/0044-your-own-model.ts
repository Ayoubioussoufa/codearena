import type { Lesson } from "../types";

const CHAT = "https://docs.ollama.com/api/chat";
const SO = "https://docs.ollama.com/capabilities/structured-outputs";

export const lesson0044: Lesson = {
  slug: "0044-your-own-model",
  number: 44,
  track: "ai",
  title: "Running your own model: weights, memory, and Ollama",
  summary:
    "What \"7B, 4-bit\" means for your GPU and your VM, how Ollama serves a model over HTTP, and how to get JSON you can trust out of it: a schema, a check, one retry.",
  minutes: 80,
  status: "ready",
  builds: "`ollama-client.mjs`: chat with a JSON schema, validated output, one retry, token counts and speed, tested against a fake Ollama",
  lab: { dir: "0044-your-own-model", writes: ["ollama-client.mjs"], check: "bash check.sh" },
  reference: "ai",
  warmup: [
    { lesson: "0043-what-a-model-does", question: 1 },
    { lesson: "0043-what-a-model-does", question: 3 },
  ],
  words: ["open-weights model", "parameter", "quantization", "KV cache", "structured output", "tokens per second"],
  answers: [
    { id: "codearena", label: "Section 5: your model sizes, the memory each needs, and where each one runs" },
    { id: "challenge", label: "Challenge: your real model's tokens per second, on the GPU and on the CPU (optional)" },
  ],
  quiz: [
    {
      prompt: "Roughly how much memory do a 7B model's weights take at 4 bits?",
      options: [
        "About 28 GB, four bytes for every single parameter",
        "About 14 GB, two bytes for every single parameter",
        "About 7 GB, exactly one byte for every parameter",
        "About 3.5 GB, half a byte for every parameter",
      ],
      correct: 3,
      why: "4 bits is half a byte: 7 billion × 0.5 ≈ 3.5 GB, before the context's memory and the runtime's overhead. At 16 bits it's 14 GB. Quantization trades a little quality for a lot of memory ([Hugging Face: quantization](https://huggingface.co/docs/transformers/main/en/quantization/overview)).",
    },
    {
      prompt: "What does `\"stream\": false` change in an Ollama /api/chat call?",
      options: [
        "The model runs faster, since it skips the network entirely",
        "One JSON object arrives at the end, not many chunks",
        "The answer is cached, so a second call returns instantly",
        "The model reads the whole prompt before it starts writing",
      ],
      correct: 1,
      why: `Streaming is on by default: you get the answer piece by piece as it's generated. With \`stream: false\` you wait and receive one object, which is simpler for a background job like the hint ([Ollama: /api/chat](${CHAT})).`,
    },
    {
      prompt: "You pass a JSON schema in `format`. Why validate the reply anyway?",
      options: [
        "Ollama ignores the schema unless a header is sent too",
        "The schema only works with the very largest of models",
        "Your code is the contract: check, then retry or fail",
        "Checking the reply makes the model generate it much faster",
      ],
      correct: 2,
      why: `\`format\` takes \`"json"\` or a JSON schema and constrains generation ([Ollama: structured outputs](${SO})), but your code is what the rest of CodeArena trusts. A check costs microseconds; a bad hint shown to a user costs trust. Validate, retry once, then fail cleanly.`,
    },
    {
      prompt: "Which field gives the generation speed in tokens per second?",
      options: [
        "eval_count divided by eval_duration in seconds",
        "total_duration divided by the prompt_eval_count tokens",
        "prompt_eval_count divided by load_duration in seconds",
        "eval_count divided by total_duration in seconds",
      ],
      correct: 0,
      why: `eval_count is the tokens generated and eval_duration the time spent generating them, in nanoseconds ([Ollama: /api/chat](${CHAT})). total_duration also includes loading the model and reading the prompt, so it understates the speed.`,
    },
    {
      prompt: "The VM has no GPU. What does that change for CodeArena's hint?",
      options: [
        "Nothing: any CPU runs 7B models just as fast as GPUs",
        "It must use a hosted API, since CPUs can't run models",
        "It becomes a queued job, since it takes so many seconds",
        "The model must be retrained before a CPU can run it",
      ],
      correct: 2,
      why: "A CPU runs small quantized models, just slowly: a hint can take tens of seconds. An HTTP request shouldn't wait that long, so the hint becomes a job on the queue you built in week 3, like judging: 202 now, the result later.",
    },
  ],
};
