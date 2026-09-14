import { RunResult, Language } from "../domain/run-result.entity";

export type RunLimits = { timeoutMs: number; memoryMb: number; pids: number };

export interface CodeRunner {
  run(code: string, language: Language, limits: RunLimits): Promise<RunResult>;
}

export const CODE_RUNNER = Symbol("CodeRunner");
