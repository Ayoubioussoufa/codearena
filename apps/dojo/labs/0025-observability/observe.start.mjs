// @ts-check
/**
 * Lesson 0025, part 1: see what your server is doing.
 *
 *   cp observe.start.mjs observe.mjs
 *
 * createObservedServer({ routes, checks, log }) returns a node:http Server (not listening).
 *
 *   routes  [{ method, path, handler }], path like "/submissions/:id";
 *           handler(req, res, params) may be async, and may throw
 *   checks  { name: async () => void }: a dependency is down if its check throws,
 *           or takes longer than 500 ms
 *   log     (line: string) => void; default: process.stdout.write
 *
 * Built in:
 *   GET /health   200 {"status":"ok"} whenever the process can answer (liveness)
 *   GET /ready    200 {"status":"ready"} if every check passes, else 503
 *                 {"status":"unavailable","failed":[names]} (readiness)
 *   GET /metrics  Prometheus text format (Content-Type: text/plain; version=0.0.4):
 *       http_requests_total{method,route,status}                     a counter
 *       http_request_duration_seconds{method,route} _bucket{le=…} _sum _count
 *           a histogram, buckets 0.005 0.01 0.025 0.05 0.1 0.25 0.5 1 2.5 5 +Inf
 *       with # HELP and # TYPE lines. `route` is the route's PATH TEMPLATE
 *       ("/submissions/:id"), or "unmatched" for a 404: never the raw path.
 *   anything else that matches no route: 404
 *   a handler that throws: 500 with body {"error":"Internal server error"}
 *
 * One log line per request, JSON, after the response:
 *   {"time":ISO,"level":"info"|"error","msg":"request","method","path","status",
 *    "durationMs":number,"requestId"}            plus "error":message when it threw
 *   - level "error" for status ≥ 500
 *   - path WITHOUT the query string (tokens live there)
 *   - never a header's value: no Authorization, no cookies
 *   - requestId: the incoming x-request-id if it's 1 to 64 characters of
 *     [A-Za-z0-9._-], otherwise a new random one; sent back as x-request-id
 */
import http from "node:http";

export function createObservedServer({ routes = [], checks = {}, log = (l) => process.stdout.write(l) } = {}) {
  void routes; void checks; void log;
  return http.createServer((req, res) => res.writeHead(501).end("Not written yet."));
}
