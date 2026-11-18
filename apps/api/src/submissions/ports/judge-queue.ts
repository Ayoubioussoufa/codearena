/** Puts a submission on the judging queue. The payload is the id, never the code. */
export interface JudgeQueue {
  enqueue(submissionId: string): Promise<void>;
}
export const JUDGE_QUEUE = Symbol('JudgeQueue');

/**
 * The contract with the worker: the queue's name and the job's payload. The
 * worker declares the same two things on its side.
 */
export const JUDGE_QUEUE_NAME = 'judge';
export type JudgeJobData = { submissionId: string };
