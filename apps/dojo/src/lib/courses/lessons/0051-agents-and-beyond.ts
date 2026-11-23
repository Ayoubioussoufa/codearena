import type { Lesson } from "../types";

const BEA = "https://www.anthropic.com/engineering/building-effective-agents";
const MCP = "https://modelcontextprotocol.io/introduction";
const LORA = "https://arxiv.org/abs/2106.09685";

export const lesson0051: Lesson = {
  slug: "0051-agents-and-beyond",
  number: 51,
  track: "ai",
  title: "Agents, tools, and the levers beyond RAG",
  summary:
    "An agent is a loop: the model asks for a tool, your code runs it, the result goes back. Build that loop with the limits a real one needs, then map the rest of the field (MCP, fine-tuning, LoRA, guardrails) and when each is the right lever.",
  minutes: 80,
  status: "ready",
  builds: "`agent.mjs`: the tool-use loop with errors fed back, unknown tools refused, human approval for risky tools, and a step limit",
  lab: { dir: "0051-agents-and-beyond", writes: ["agent.mjs"], check: "bash check.sh" },
  reference: "ai",
  warmup: [
    { lesson: "0045-prompts-and-injection", question: 2 },
    { lesson: "0049-rag", question: 4 },
  ],
  words: ["tool use", "agent", "workflow", "Model Context Protocol (MCP)", "fine-tuning", "LoRA"],
  answers: [
    { id: "codearena", label: "Section 5: workflow or agent for the hint, and the next lever you'd pull" },
    { id: "challenge", label: "Challenge: your agent loop driving a real model with one read-only tool (optional)" },
  ],
  quiz: [
    {
      prompt: "In tool use, who actually runs the tool?",
      options: [
        "The model, inside the network, as part of generating text",
        "Your code: the model only asks, with name and arguments",
        "The tool's own server, which the model calls over HTTP",
        "Ollama, which runs every tool it finds in the prompt",
      ],
      correct: 1,
      why: `The model emits a structured request (a tool name and JSON arguments); your code decides whether to run it, runs it, and sends the result back as a new message. Everything the tool can do, your code allowed. That's where limits and approval live ([Anthropic: building effective agents](${BEA})).`,
    },
    {
      prompt: "Anthropic separates workflows from agents. What's the difference?",
      options: [
        "Workflows need a GPU, but agents run fine on CPUs",
        "Workflows use tools, while agents can only ever write text",
        "Code sets a workflow's steps; an agent picks its own",
        "Agents are workflows that run for more than an hour",
      ],
      correct: 2,
      why: `Workflows orchestrate model calls through predefined code paths; agents let the model direct its own process and tool use. Their advice: find the simplest solution, and add agentic complexity only when it's needed ([building effective agents](${BEA})).`,
    },
    {
      prompt: "Why must the loop stop after a fixed number of steps?",
      options: [
        "A model may keep calling tools forever, at real cost",
        "The context window can hold only eight tool results total",
        "Ollama closes the connection after eight requests in a row",
        "Each tool can only be called once in a conversation",
      ],
      correct: 0,
      why: "A confused model can loop: call a tool, misread the result, call it again. A step limit turns that into a clean error instead of a bill or a hung worker. It's the timeout from lesson 2, for agents.",
    },
    {
      prompt: "What is the Model Context Protocol (MCP)?",
      options: [
        "A method to fine-tune a model on a company's private data",
        "A file format to store the weights of all open models",
        "A rule set limiting what a model may say to users",
        "An open standard to plug tools and data into AI apps",
      ],
      correct: 3,
      why: `MCP is an open protocol for connecting AI applications to external tools and data sources through one interface, so a tool written once works in any MCP client ([MCP introduction](${MCP})). It standardises the tool layer of this lesson's loop.`,
    },
    {
      prompt: "What does LoRA change when you fine-tune a model?",
      options: [
        "Every single weight in the model, retrained from the start",
        "Only the tokenizer, so that the model learns words faster",
        "Small added matrices; all of the original weights stay frozen",
        "Only the system prompt, which it saves inside the model",
      ],
      correct: 2,
      why: `LoRA freezes the pretrained weights and trains small low-rank matrices added to some layers, cutting the trainable parameters by orders of magnitude ([Hu et al., 2021](${LORA})). It's how fine-tuning fits on one GPU, and it's still the last lever, after prompting and retrieval.`,
    },
  ],
};

