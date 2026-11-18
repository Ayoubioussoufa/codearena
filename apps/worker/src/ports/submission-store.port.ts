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
  /**
   * Moves the submission to JUDGING for `claimant`, if it's PENDING or its
   * claim is older than `leaseMs`. One statement: the database picks the
   * winner. True if this caller won.
   */
  claim(
    submissionId: string,
    claimant: string,
    leaseMs: number,
  ): Promise<boolean>;
  /** Null if the submission doesn't exist (deleted since it was queued). */
  load(submissionId: string): Promise<JudgeTask | null>;
  /** Fenced: writes only if `claimant` still holds the claim. True if written. */
  saveVerdict(
    submissionId: string,
    claimant: string,
    judgement: Judgement,
  ): Promise<boolean>;
  /** Gives the claim back (JUDGING → PENDING), so a retry can take it. */
  release(submissionId: string, claimant: string): Promise<void>;
  /** The end of the line: our failure, after the last retry. */
  markSystemError(submissionId: string): Promise<void>;
}

export const SUBMISSION_STORE = Symbol("SubmissionStore");
