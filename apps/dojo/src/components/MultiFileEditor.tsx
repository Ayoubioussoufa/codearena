/**
 * Tabbed editor for multi-file coding exercises. Each file is a tab (onglet)
 * carrying its own status dot — green once its checks pass, red once they've
 * been run and failed — so you can write and debug a controller, provider,
 * module and DTO one at a time, then submit the whole feature.
 *
 * Purely presentational: the parent owns the file contents, the active tab and
 * the per-file check status, and drives grading. Switching tabs stays enabled
 * even after submit so you can review any file's solution.
 */
"use client";

import type { CodeFile } from "@/lib/engine/types";
import { CodePracticeEditor } from "./CodePracticeEditor";

export interface MultiFileEditorProps {
  files: CodeFile[];
  values: Record<string, string>;
  active: string;
  onActiveChange: (name: string) => void;
  onChange: (name: string, value: string) => void;
  /** Disables editing (after submit); tab switching stays live. */
  disabled?: boolean;
  /** Per-file check outcome: true = passing, false = failing, undefined = not run. */
  status?: Record<string, boolean | undefined>;
}

export function MultiFileEditor({
  files,
  values,
  active,
  onActiveChange,
  onChange,
  disabled = false,
  status = {},
}: MultiFileEditorProps) {
  const activeFile = files.find((f) => f.name === active) ?? files[0];
  if (!activeFile) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Exercise files"
        className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800"
      >
        {files.map((file) => {
          const isActive = file.name === activeFile.name;
          const state = status[file.name];
          return (
            <button
              key={file.name}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onActiveChange(file.name)}
              className={`-mb-px flex items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-1.5 font-mono text-xs transition-colors ${
                isActive
                  ? "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span
                aria-hidden
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  state === true
                    ? "bg-emerald-500"
                    : state === false
                      ? "bg-rose-500"
                      : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              {file.name}
            </button>
          );
        })}
      </div>

      {/* Active file's role */}
      {activeFile.role && (
        <p className="px-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono text-slate-400">{activeFile.name}</span> — {activeFile.role}
        </p>
      )}

      {/* Active file's editor — keyed so state resets cleanly per tab */}
      <CodePracticeEditor
        key={activeFile.name}
        value={values[activeFile.name] ?? ""}
        language={activeFile.language}
        onChange={(v) => onChange(activeFile.name, v)}
        disabled={disabled}
      />
    </div>
  );
}
