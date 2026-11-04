// @ts-check
/**
 * Lesson 0020, part 2: push the verdict with server-sent events.
 *
 *   cp sse.start.mjs sse.mjs
 *
 * createServer({ store, bus, heartbeatMs }) returns a node:http Server (not
 * listening yet) that answers GET /submissions/:id/events:
 *   - 404 if `await store.get(id)` is null
 *   - otherwise 200 with headers  Content-Type: text/event-stream
 *                                 Cache-Control: no-cache
 *     then one event per state of the submission, each written as
 *         event: status\ndata: <JSON of the submission>\n\n
 *     starting with its CURRENT state, then every change published on `bus`
 *     (bus.emit("submission", sub) happens after the worker's write commits;
 *     only send the ones whose sub.id is this id, and never the same state twice)
 *   - end the response right after sending a state whose status is "DONE"
 *   - every `heartbeatMs` with nothing to send, write a comment line ": ping\n\n"
 *     (proxies close connections that stay silent)
 *   - when the client goes away, remove every listener and timer you created
 *
 * Watch the order of "read the current state" and "subscribe to the bus": one
 * of the two orders loses a verdict that's published in between.
 *
 * @param {{ store: { get(id: string): Promise<any> }, bus: import("node:events").EventEmitter, heartbeatMs?: number }} deps
 */
import http from "node:http";

export function createServer(deps) {
  void deps;
  return http.createServer((req, res) => {
    res.writeHead(501).end("Not written yet.");
  });
}
