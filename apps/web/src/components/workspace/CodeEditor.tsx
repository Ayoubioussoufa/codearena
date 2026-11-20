/**
 * Monospace textarea editor (presentational, no state).
 *
 * Controlled when `value`/`onChange` are passed; otherwise an uncontrolled
 * textarea seeded with `defaultValue`.
 */
"use client";

import type { Language } from "@/lib/types";

const FILENAMES: Record<Language, string> = {
  javascript: "solution.js",
  typescript: "solution.ts",
  python: "solution.py",
};

export interface CodeEditorProps {
  language: Language;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}

export function CodeEditor({ language, value, onChange, defaultValue }: CodeEditorProps) {
  const shared =
    "h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-6 text-slate-800 outline-none dark:text-slate-200";

  return (
    <div className="flex min-h-64 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 py-2 font-mono text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
        {FILENAMES[language]}
      </div>
      {value !== undefined ? (
        <textarea
          spellCheck={false}
          aria-label="Code editor"
          className={shared}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        // key ensures the seed refreshes if the language (and thus file) changes
        <textarea
          key={language}
          spellCheck={false}
          aria-label="Code editor"
          className={shared}
          defaultValue={defaultValue}
        />
      )}
    </div>
  );
}
