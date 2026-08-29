/**
 * Teacher chat — streaming conversation with the Claude-powered Dojo Teacher.
 * Per-topic history persists in localStorage; assistant replies render as
 * markdown (mermaid diagrams included).
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownView } from "./MarkdownView";

export interface TeacherGuide {
  slug: string;
  title: string;
  source: "phase" | "supplement" | "dsa" | "reference";
}

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "dojo.teacher.v1";
const MENTOR = "";

const MODES = [
  { id: "classroom", label: "🎓 Classroom teacher" },
  { id: "amazon-behavioral", label: "🗣️ Amazon behavioral mock (STAR)" },
  { id: "system-design", label: "📐 System design interview" },
  { id: "case-interview", label: "💼 Consulting case interview" },
  { id: "coding-interview", label: "💻 Coding interview" },
] as const;
type ModeId = (typeof MODES)[number]["id"];

const QUICK_PROMPTS = [
  "Teach me this topic from scratch",
  "Quiz me on what I've learned so far",
  "Give me a hands-on exercise",
  "Explain that again, but differently",
] as const;

const INTERVIEW_PROMPTS = [
  "Start the interview",
  "Ask me a harder one",
  "Pause — coach me on my last answer",
] as const;

const SOURCE_LABEL: Record<TeacherGuide["source"], string> = {
  phase: "Phase guides",
  supplement: "Supplements",
  dsa: "DSA",
  reference: "Method references",
};

function loadHistory(): Record<string, ChatTurn[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveHistory(topic: string, turns: ChatTurn[]) {
  try {
    const all = loadHistory();
    all[topic] = turns;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage full or unavailable — chat still works, just won't persist
  }
}

export function TeacherChat({ guides }: { guides: TeacherGuide[] }) {
  const [topic, setTopic] = useState<string>(MENTOR);
  const [mode, setMode] = useState<ModeId>("classroom");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const historyKey = mode === "classroom" ? topic : `${mode}|${topic}`;

  useEffect(() => {
    setTurns(loadHistory()[historyKey] ?? []);
    setError(null);
  }, [historyKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setError(null);
    setInput("");
    setBusy(true);

    const sent: ChatTurn[] = [...turns, { role: "user", content }];
    setTurns(sent);

    const controller = new AbortController();
    abortRef.current = controller;
    let reply = "";
    try {
      const res = await fetch("/api/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic || null, mode, messages: sent }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      if (!res.body) throw new Error("No response stream.");

      setTurns([...sent, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setTurns([...sent, { role: "assistant", content: reply }]);
      }
      saveHistory(historyKey, [...sent, { role: "assistant", content: reply }]);
    } catch (err) {
      if (controller.signal.aborted) {
        // user hit Stop — keep whatever streamed so far
        if (reply) saveHistory(historyKey, [...sent, { role: "assistant", content: reply }]);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setTurns(sent);
        saveHistory(historyKey, sent);
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  function clearConversation() {
    if (!confirm("Clear this conversation?")) return;
    setTurns([]);
    saveHistory(historyKey, []);
  }

  const selectedGuide = guides.find((g) => g.slug === topic);
  const interviewing = mode !== "classroom";
  const modeLabel = MODES.find((m) => m.id === mode)?.label ?? "";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6">
      {/* Topic bar */}
      <div className="sticky top-14 z-30 -mx-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="teacher-mode" className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Mode
          </label>
          <select
            id="teacher-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as ModeId)}
            disabled={busy}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <label htmlFor="teacher-topic" className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Topic
          </label>
          <select
            id="teacher-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={busy}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 sm:max-w-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value={MENTOR}>Open mentor — anything goes</option>
            {(["phase", "supplement", "dsa", "reference"] as const).map((source) => {
              const group = guides.filter((g) => g.source === source);
              if (group.length === 0) return null;
              return (
                <optgroup key={source} label={SOURCE_LABEL[source]}>
                  {group.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      {g.title}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          {turns.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-rose-500/50 dark:hover:text-rose-400"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 py-6">
        {turns.length === 0 ? (
          <div className="mx-auto max-w-lg py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-2xl">
              {interviewing ? "🎤" : "🎓"}
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              {interviewing
                ? modeLabel.replace(/^\S+\s/, "")
                : selectedGuide
                  ? selectedGuide.title
                  : "Your teacher is ready"}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {interviewing
                ? "A realistic mock — the interviewer probes, pushes back, and debriefs you at the end."
                : selectedGuide
                  ? "The teacher has read this guide cover to cover. Ask anything, or start with:"
                  : "Pick a guide above for grounded lessons, or just ask about any concept:"}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {(interviewing
                ? INTERVIEW_PROMPTS.slice(0, 1)
                : QUICK_PROMPTS.slice(0, selectedGuide ? 4 : 3)
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  disabled={busy}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-cyan-500/60 dark:hover:text-cyan-400"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {turns.map((turn, i) =>
              turn.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-cyan-600 px-4 py-2.5 text-sm text-white">
                    {turn.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm dark:bg-slate-800">
                    🎓
                  </div>
                  <div className="min-w-0 flex-1 text-sm [&_.prose]:text-sm">
                    {turn.content ? (
                      <MarkdownView markdown={turn.content} />
                    ) : (
                      <p className="animate-pulse py-1.5 text-slate-400">Thinking…</p>
                    )}
                  </div>
                </div>
              ),
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Composer */}
      <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-slate-800 dark:bg-slate-950/95">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder={busy ? "The teacher is replying…" : "Ask, answer, or paste your attempt… (Enter to send)"}
            disabled={busy}
            className="min-h-[3rem] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-500/60"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-slate-800 dark:text-slate-300"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-40"
            >
              Send
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
