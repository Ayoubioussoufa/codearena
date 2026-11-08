export type Verdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "OUTPUT_LIMIT"
  | "RUNTIME_ERROR";

export type TestCase = {
  input: string;
  expected: string;
};

export type Judgement = {
  verdict: Verdict;
  /** 1-based. Null when every test passed. */
  failedTest: number | null;
  /** The slowest test that ran. */
  maxTimeMs: number;
};
