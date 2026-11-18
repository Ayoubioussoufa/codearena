/**
 * The contract with the API: the queue's name and the job's payload. The API
 * declares the same two things in its judge-queue port.
 */
export const JUDGE_QUEUE_NAME = "judge";
export type JudgeJobData = { submissionId: string };
