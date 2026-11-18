import type { Language } from "../domain/run-result.entity";
import type { Judgement, TestCase } from "../domain/verdict.entity";

/** Everything the worker needs to judge one submission, read from the database. */
export type JudgeTask = {
  submissionId: string;
  code: string;
  language: Language;
  /** In order: the judge stops at the first failure. */
  tests: TestCase[];
  timeLimitMs: number;
  memoryLimitMb: number;
};

/** Where submissions come from and where verdicts go. The worker never sees Prisma. */
export interface SubmissionStore {
  /** Null if the submission doesn't exist (deleted since it was queued). */
  load(submissionId: string): Promise<JudgeTask | null>;
  saveVerdict(submissionId: string, judgement: Judgement): Promise<void>;
}

export const SUBMISSION_STORE = Symbol("SubmissionStore");
