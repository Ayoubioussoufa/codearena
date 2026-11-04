// @ts-check
/**
 * Lesson 0013: a job queue on Redis lists.
 *
 *   cp queue.start.mjs queue.mjs     then write createQueue() below
 *
 * `redis.cmd(...)` sends one Redis command (see ../_lib/resp.mjs). Keys for a queue named "judge":
 *   judge:waiting   jobs not taken yet (push on the left, take from the right: FIFO)
 *   judge:active    jobs a worker has taken but not finished (the "processing list")
 *   judge:dead      jobs that failed for good (the dead-letter list)
 *   judge:ids       every job id ever enqueued (a set, to refuse duplicates)
 *
 * A job is stored as JSON: {"id":"…","payload":{…},"attempts":0}. Keep the exact
 * string you took: LREM needs it, byte for byte.
 *
 * @typedef {{ id: string, payload: object, attempts: number, raw: string }} Job
 */
export const MAX_PAYLOAD_BYTES = 1024;

/**
 * @param {{ cmd: (...args: (string|number)[]) => Promise<any> }} redis
 * @param {string} name
 * @param {{ maxAttempts?: number }} [options]
 */
export function createQueue(redis, name, options = {}) {
  void redis; void name; void options;
  return {
    /** Adds a job, unless that id was enqueued before. Resolves true if added. Throws if the JSON is over MAX_PAYLOAD_BYTES. */
    async enqueue(id, payload = {}) { void id; void payload; throw new Error("Not written yet."); },
    /** Takes the oldest waiting job and moves it to active, atomically. Resolves the Job, or null if none. */
    async take() { throw new Error("Not written yet."); },
    /** The job is done: remove it from active. */
    async ack(job) { void job; throw new Error("Not written yet."); },
    /** It failed. Retryable and attempts left: back to waiting with attempts + 1. Otherwise: dead. */
    async fail(job, { retryable }) { void job; void retryable; throw new Error("Not written yet."); },
    /** After a crash: move every active job back to waiting. Resolves how many moved. */
    async recover() { throw new Error("Not written yet."); },
    /** { waiting, active, dead } lengths. */
    async counts() { throw new Error("Not written yet."); },
  };
}
