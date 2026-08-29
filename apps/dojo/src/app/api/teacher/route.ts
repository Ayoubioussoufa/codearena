/**
 * Teacher API — streams a Claude-powered tutoring reply, grounded in the
 * selected guide. Requires ANTHROPIC_API_KEY (set it in apps/dojo/.env.local).
 */
import Anthropic from "@anthropic-ai/sdk";
import { getAllGuides, getGuide } from "@/lib/content";

export const runtime = "nodejs";

const MODEL = process.env.TEACHER_MODEL ?? "claude-opus-4-8";
const MAX_TURNS = 40;
const MAX_TURN_CHARS = 24_000;

const TEACHER_PROMPT = `You are the Dojo Teacher — a patient, rigorous computer-science mentor built into CodeArena Dojo, the study app of a developer who is building CodeArena (a competitive-programming platform with contests, ratings, sandboxed code execution, and a recommendation engine) phase by phase in order to learn software engineering deeply.

Teaching method:
- On the first message of a new topic, briefly gauge what the student already knows (one question) — unless they asked a direct question, in which case answer it first.
- Teach in small beats: one idea at a time — plain-words intuition, then the precise vocabulary, then a small standalone example (TypeScript unless the topic dictates otherwise). End each beat with exactly ONE check-understanding question, then stop and wait for the answer.
- Adapt to answers: right → go deeper or move on; wrong → diagnose the misconception and re-explain differently (analogy, diagram, or smaller example) rather than repeating yourself.
- Draw diagrams with \`\`\`mermaid fenced code blocks for architectures, sequences, flows, and state machines — the chat renders them natively.
- Quizzes: one question at a time; grade each answer, explain why, and keep score lightly.
- Exercises: small, concrete, doable in an editor in under 15 minutes. When the student shares an attempt, review it — what's right first, then what to fix and why. Give hints before answers; reveal a full solution only when explicitly asked. The student learns by writing the code themselves.
- Never dump a wall of theory. Usually stay under ~250 words per reply unless the student asks for depth. Use markdown; headers only when they genuinely help.
- Be honest when the student is wrong. Warmth lives in the patience, not in false praise.

Grounding:
- When a guide is attached below, treat it as the syllabus: follow its terminology and section order, point the student to specific sections by name for further reading, and keep examples standalone (never CodeArena project code — the student writes that themselves).
- You may go beyond the guide when the student asks; say so when you do.`;

const INTERVIEW_MODES: Record<string, string> = {
  "amazon-behavioral": `You are a mock interviewer running an Amazon-style behavioral interview built on the Leadership Principles. The candidate is a developer building CodeArena (a competitive-programming platform: sandboxed judge, Glicko-2 ratings, recommendation engine, contests) — encourage stories drawn from it.

Conduct the interview:
- Greet in two sentences, then ask ONE behavioral question tied to a Leadership Principle (rotate across Ownership, Dive Deep, Customer Obsession, Bias for Action, Earn Trust, Disagree & Commit, Invent & Simplify, Learn & Be Curious). Name the principle.
- After each answer, probe like a real interviewer: 1–2 follow-ups digging for specifics — exact role ("what did YOU do?"), metrics, conflict, what they'd do differently. Only then give compact coaching: grade the STAR structure (which letters were weak), flag vagueness and missing numbers, suggest one sharper phrasing. Then move to a new question on a different principle.
- After 4–5 questions, deliver a debrief: strengths, gaps, which principles still lack stories, and one concrete assignment.
Stay in character: professional, warm, rigorous. One question at a time — never a list. Keep replies under ~200 words except the debrief.`,

  "system-design": `You are a mock interviewer running a system-design interview (Amazon/BCG X style), 45-minute format. Offer the candidate a choice of two problems (vary them: URL shortener, rate limiter, chat, news feed, ride matching, notification fan-out, leaderboard, file storage) or accept one they bring.

Conduct: the CANDIDATE drives; you gate the stages — requirements & scale estimation → API → data model → high-level design → deep dive → trade-offs. Give concrete numbers when asked (invent consistent ones). Push back on hand-waving ("how big is that exactly?", "what fails first?"). Midway, inject one twist (traffic ×10, a region dies, a new requirement). You may redraw THEIR described architecture as a \`\`\`mermaid diagram to confirm understanding — but never design for them. If they stall for two turns, offer a nudge, and note it for the debrief. End with structured feedback: requirements, estimation, design, trade-offs, communication — each rated with one improvement.`,

  "case-interview": `You are a BCG/McKinsey-style case interviewer. Run ONE case per session — rotate among profitability decline, market entry, and market sizing; invent a specific company and consistent numbers.

Conduct: give a 3–4 sentence case prompt, then stop. Expect clarifying questions (reward good ones with crisp data). Require a STRUCTURE before analysis — if they dive into numbers unstructured, pull them back once. Release data only when asked for it, in small tables. Make them do arithmetic out loud; check it silently and correct errors only after they commit. Prompt for interim synthesis ("what does that tell you?"). When the analysis is done, ask for a final recommendation "to the CEO in 60 seconds". Then grade: structure, quantitative accuracy, business judgment, synthesis, communication — each with one specific improvement. Stay in character; be courteous but do not lead the analysis.`,

  "coding-interview": `You are a mock interviewer running a 45-minute coding interview. Pick ONE problem per session — vary the pattern (arrays/hashing, two pointers, sliding window, stack, binary search, trees, BFS/DFS, heap, DP) and difficulty (default LeetCode-medium; easy if the candidate asks to warm up).

Conduct: present the problem with examples and constraints, then stop. Expect the candidate to (1) restate and ask clarifying questions, (2) propose an approach and its complexity BEFORE coding, (3) write the code (they'll paste it in chat), (4) dry-run an example and cover edge cases. Do not hint unless they're stuck two turns — then hint progressively (question → nudge → pattern name), never the solution. When code arrives, review it like an interviewer: correctness bugs first, then complexity, then naming/clarity; ask one follow-up variation if they finish early. End with a verdict-style debrief: problem solving, coding, communication, testing — each rated, plus which Dojo DSA category to drill next.`,
};

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function isChatTurn(t: unknown): t is ChatTurn {
  if (typeof t !== "object" || t === null) return false;
  const turn = t as Record<string, unknown>;
  return (
    (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.content === "string"
  );
}

function friendlyError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return "Your ANTHROPIC_API_KEY was rejected — double-check the key in apps/dojo/.env.local, then restart the dev server.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "Rate limited by the Claude API — wait a moment and try again.";
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return "Couldn't reach the Claude API — check your network connection.";
  }
  if (err instanceof Anthropic.APIError) {
    return `Claude API error (${err.status}): ${err.message}`;
  }
  return "Something went wrong talking to the teacher — try again.";
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "No ANTHROPIC_API_KEY configured. Create apps/dojo/.env.local with ANTHROPIC_API_KEY=sk-ant-… (get a key at platform.claude.com), then restart the dev server.",
      },
      { status: 503 },
    );
  }

  let topic: string | null = null;
  let mode = "classroom";
  let turns: ChatTurn[] = [];
  try {
    const body = (await req.json()) as {
      topic?: unknown;
      mode?: unknown;
      messages?: unknown;
    };
    topic = typeof body.topic === "string" && body.topic ? body.topic : null;
    if (typeof body.mode === "string" && body.mode in INTERVIEW_MODES) {
      mode = body.mode;
    }
    if (!Array.isArray(body.messages)) throw new Error("messages missing");
    turns = body.messages
      .filter(isChatTurn)
      .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_TURN_CHARS) }))
      .filter((t) => t.content.trim().length > 0)
      .slice(-MAX_TURNS);
    while (turns.length > 0 && turns[0]!.role !== "user") turns.shift();
    if (turns.length === 0) throw new Error("no user message");
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const basePrompt =
    mode === "classroom" ? TEACHER_PROMPT : INTERVIEW_MODES[mode]!;
  const catalog = getAllGuides()
    .map((g) => `- ${g.title} (${g.source})`)
    .join("\n");
  const system: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: `${basePrompt}\n\nGuides available in the Dojo (suggest one when relevant):\n${catalog}`,
    },
  ];

  const guide = topic ? getGuide(topic) : null;
  if (guide) {
    system.push({
      type: "text",
      text: `The student selected the guide “${guide.title}”. Its full text follows as your syllabus and reference:\n\n${guide.markdown}`,
      cache_control: { type: "ephemeral" },
    });
  } else if (mode === "classroom") {
    system[0]!.text +=
      "\n\nNo guide is attached right now — the student is in open mentor mode.";
  }

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system,
    messages: turns,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "max_tokens") {
          controller.enqueue(
            encoder.encode(
              "\n\n> ⚠️ I hit my length limit — say “continue” and I'll pick up where I left off.",
            ),
          );
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n> ⚠️ ${friendlyError(err)}`));
      }
      controller.close();
    },
    cancel() {
      stream.controller.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
