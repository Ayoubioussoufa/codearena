// @ts-check
/**
 * Lesson 0020, part 1: poll a submission until it has a verdict.
 *
 *   cp poll.start.mjs poll.mjs
 *
 * pollUntilDone(fetchStatus, options) calls `await fetchStatus()` (it resolves
 * { status: "PENDING" | "RUNNING" | "DONE", verdict? }) until status is "DONE",
 * then resolves with that last result. The rules:
 *   - wait `intervalMs` between the END of one call and the START of the next:
 *     never two calls in flight at once (a slow API must not pile up requests)
 *   - no call after the one that returned DONE
 *   - `signal` (an AbortSignal: the component unmounted) stops everything: reject
 *     with an error whose name is "AbortError", and make no further call
 *   - after `timeoutMs` without a verdict, reject with an error whose name is
 *     "TimeoutError", and make no further call
 *   - if fetchStatus throws (a network blip), try again after intervalMs; after
 *     `maxErrors` errors in a row, reject with the last error
 *
 * @param {() => Promise<{ status: string, verdict?: string }>} fetchStatus
 * @param {{ intervalMs?: number, timeoutMs?: number, maxErrors?: number, signal?: AbortSignal }} [options]
 */
export async function pollUntilDone(fetchStatus, options = {}) {
  void fetchStatus; void options;
  throw new Error("Not written yet.");
}
