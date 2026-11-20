/**
 * Shared workspace state (language, code, run output), provided by
 * WorkspaceProvider.
 */
"use client";

import { createContext, useContext, useRef, useState } from "react";
import type { Language, Problem, RunResult } from "@/lib/types";
import { runCode } from "@/lib/api";

/** Everything the workspace UI can read or do. This shape is the contract. */
export interface WorkspaceValue {
  problem: Problem;
  language: Language;
  /** The code currently in the editor for the active language. */
  code: string;
  result: RunResult | null;
  isRunning: boolean;
  setLanguage: (language: Language) => void;
  setCode: (code: string) => void;
  run: () => void;
  reset: () => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

/** Null outside a WorkspaceProvider. */
export function useWorkspace(): WorkspaceValue | null {
  return useContext(WorkspaceContext);
}

interface WorkspaceProviderProps {
  problem: Problem;
  children: React.ReactNode;
}

export function WorkspaceProvider({ problem, children }: WorkspaceProviderProps) {
  const [language, setLanguage] = useState<Language>('javascript');
  const [codes, setCode] = useState<Record<Language, string>>({
    ...problem.starterCode,
  });
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const runId = useRef(0);

  const run = async () => {
    const id = ++runId.current;
    setIsRunning(true);
    const result = await runCode(problem, language, codes[language]);
    if (id !== runId.current) return;
    setResult(result);
    setIsRunning(false);
  }

  const wrapper = (text: string) => {
      setCode((prev) => ({ ...prev, [language]: text }));
    }

  const reset = () => {
    setCode((prev) => ({
      ...prev,
      [language]: problem.starterCode[language],
    }));
    setResult(null);
  }

  const value = {
    problem,
    language,
    code: codes[language],
    result,
    isRunning,
    setLanguage,
    setCode: wrapper,
    run,
    reset,
  };
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
