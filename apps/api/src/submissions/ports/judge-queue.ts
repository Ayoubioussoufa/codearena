/** Puts a submission on the judging queue. The payload is the id, never the code. */
export interface JudgeQueue {
  enqueue(submissionId: string): Promise<void>;
}
export const JUDGE_QUEUE = Symbol('JudgeQueue');
