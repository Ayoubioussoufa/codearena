/**
 * The dojo's code editor: a transparent <textarea> overlaid on a live
 * syntax-highlighted mirror — real editing UX with real colors, no heavy
 * editor dependency. Scrolling stays in sync.
 *
 * Editing behaves the way an IDE does, because fighting the editor is not the
 * skill being practised:
 *   ( [ { " ' `   auto-close, and wrap the selection when there is one
 *   ) ] } " ' `   type OVER the auto-inserted partner instead of doubling it
 *   Backspace     between an empty pair removes both halves
 *   Enter         keeps the current indent, and opens a block out to its own
 *                 line when pressed between { and }
 *   Tab           two spaces, or indents every line of a selection
 *   Shift+Tab     outdents
 */
"use client";

import { useRef } from "react";
import { highlightToHtml } from "@/lib/highlight";

export interface CodePracticeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  minRows?: number;
}

export function CodePracticeEditor({
  value,
  language,
  onChange,
  disabled = false,
  minRows = 8,
}: CodePracticeEditorProps) {
  const mirrorRef = useRef<HTMLPreElement>(null);

  function syncScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    const mirror = mirrorRef.current;
    if (!mirror) return;
    mirror.scrollTop = e.currentTarget.scrollTop;
    mirror.scrollLeft = e.currentTarget.scrollLeft;
  }

  /** Applies a new value and puts the caret (or selection) where we want it. */
  function apply(
    el: HTMLTextAreaElement,
    next: string,
    start: number,
    end: number = start,
  ) {
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = start;
      el.selectionEnd = end;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const selected = value.slice(start, end);
    const nextChar = value[end] ?? "";
    const prevChar = value[start - 1] ?? "";

    /* ── Tab / Shift+Tab ─────────────────────────────────────────────── */
    if (e.key === "Tab") {
      e.preventDefault();

      // A multi-line selection indents or outdents as a block.
      if (selected.includes("\n")) {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const block = value.slice(lineStart, end);
        const shifted = e.shiftKey
          ? block.replace(/^ {1,2}/gm, "")
          : block.replace(/^/gm, "  ");
        const next = value.slice(0, lineStart) + shifted + after;
        apply(el, next, lineStart, lineStart + shifted.length);
        return;
      }

      if (e.shiftKey) {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const removed = value.slice(lineStart, lineStart + 2) === "  " ? 2 : 0;
        if (!removed) return;
        const next = value.slice(0, lineStart) + value.slice(lineStart + 2);
        apply(el, next, Math.max(lineStart, start - 2));
        return;
      }

      apply(el, before + "  " + after, start + 2);
      return;
    }

    /* ── auto-closing pairs ──────────────────────────────────────────── */
    const PAIRS: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
      "`": "`",
    };
    const CLOSERS = new Set(Object.values(PAIRS));

    if (e.key in PAIRS) {
      const close = PAIRS[e.key] as string;

      // With a selection, wrap it rather than replacing it.
      if (selected) {
        e.preventDefault();
        const next = before + e.key + selected + close + after;
        apply(el, next, start + 1, end + 1);
        return;
      }

      // Quotes are their own closer, so typing one next to a word is almost
      // always closing a string rather than opening one. Don't double it.
      const isQuote = e.key === close;
      if (isQuote && (/[\w"'`]/.test(prevChar) || /[\w]/.test(nextChar))) return;

      e.preventDefault();
      apply(el, before + e.key + close + after, start + 1);
      return;
    }

    // Typing the closing character when it is already there just steps over it.
    if (CLOSERS.has(e.key) && nextChar === e.key && start === end) {
      e.preventDefault();
      apply(el, value, start + 1);
      return;
    }

    /* ── Backspace between an empty pair removes both ────────────────── */
    if (e.key === "Backspace" && start === end) {
      const closer = PAIRS[prevChar];
      if (closer && nextChar === closer) {
        e.preventDefault();
        apply(el, value.slice(0, start - 1) + value.slice(end + 1), start - 1);
        return;
      }
    }

    /* ── Enter: keep the indent, and open a block ────────────────────── */
    if (e.key === "Enter" && start === end) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const indent = /^[ \t]*/.exec(value.slice(lineStart, start))?.[0] ?? "";

      // Between { and } (or [ ], ( )) — put the closer on its own line.
      if (PAIRS[prevChar] && PAIRS[prevChar] === nextChar) {
        e.preventDefault();
        const inner = indent + "  ";
        const next = before + "\n" + inner + "\n" + indent + after;
        apply(el, next, start + 1 + inner.length);
        return;
      }

      // Opening a block without its closer yet still deserves the extra level.
      const deeper = /[{([]$/.test(prevChar) ? "  " : "";
      e.preventDefault();
      apply(el, before + "\n" + indent + deeper + after, start + 1 + indent.length + deeper.length);
      return;
    }
  }

  const shared =
    "m-0 whitespace-pre font-mono text-[13px] leading-6 p-4 tracking-normal";
  const minHeight = `${minRows * 1.5 + 2}rem`;

  return (
    <div
      className={`hljs-surface relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 ${
        disabled ? "opacity-70" : ""
      }`}
    >
      {/* Highlighted mirror (behind) */}
      <pre
        ref={mirrorRef}
        aria-hidden
        className={`${shared} pointer-events-none overflow-hidden`}
        style={{ minHeight }}
      >
        <code
          dangerouslySetInnerHTML={{
            __html: highlightToHtml(value, language) + "\n",
          }}
        />
      </pre>
      {/* Transparent editable layer (front) */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        aria-label="Code editor"
        className={`${shared} absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-cyan-600 outline-none selection:bg-cyan-500/20 dark:caret-cyan-300`}
      />
    </div>
  );
}
