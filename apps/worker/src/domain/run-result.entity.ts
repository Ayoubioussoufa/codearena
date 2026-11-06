export type Language = "TYPESCRIPT" | "PYTHON" | "CPP" | "JAVA" | "JAVASCRIPT";

type RunOutput = {
  stdout: string;
  stderr: string;
  timeMs: number;
};

/**
 * What happened to a run: facts only. Deciding whether those facts mean
 * "Accepted" or "Wrong Answer" is the job of the application layer.
 *
 * `outcome` is the discriminant: each variant carries only the fields that
 * can exist for it, so reading `exitCode` on a timeout does not compile.
 */
export type RunResult =
  | (RunOutput & { outcome: "EXIT"; exitCode: number })
  | (RunOutput & { outcome: "SIGNAL"; signal: string })
  | (RunOutput & { outcome: "TIMEOUT" })
  | (RunOutput & { outcome: "OUTPUT_LIMIT" });
