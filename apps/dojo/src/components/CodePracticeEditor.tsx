/**
 * The dojo's code editor: a transparent <textarea> overlaid on a live
 * syntax-highlighted mirror — real editing UX with real colors, no heavy
 * editor dependency. Tab inserts two spaces; scrolling stays in sync.
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart, selectionEnd } = el;
    const next = value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + 2;
    });
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
