export type Verdict =
  | "PENDING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR";

export type Language = "TYPESCRIPT" | "PYTHON" | "CPP" | "JAVA";

export type RunResult = {
  verdict: Verdict;
  runtimeMs: number;
  stdout: string;
  stderr: string;
};
