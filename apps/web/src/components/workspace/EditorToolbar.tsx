/**
 * src/components/workspace/EditorToolbar.tsx — language select + run/reset (presentational)
 * TODOs: none — fully implemented scaffold. Purely props-driven: no state here.
 */
"use client";

import { LANGUAGES, LANGUAGE_LABELS, type Language } from "@/lib/types";

export interface EditorToolbarProps {
  language: Language;
  isRunning: boolean;
  onLanguageChange: (language: Language) => void;
  onRun: () => void;
  onReset: () => void;
}

export function EditorToolbar({
  language,
  isRunning,
  onLanguageChange,
  onRun,
  onReset,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Language"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_LABELS[lang]}
          </option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? (
            <>
              <Spinner /> Running…
            </>
          ) : (
            <>▶ Run</>
          )}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}
