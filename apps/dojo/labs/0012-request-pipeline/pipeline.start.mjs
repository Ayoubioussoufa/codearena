// @ts-check
/**
 * Lesson 0012: the request pipeline, from scratch.
 *
 *   cp pipeline.start.mjs pipeline.mjs     then write createApp() below
 *
 * The order, from NestJS's request lifecycle:
 *   middleware → guards (global, then route) → interceptors, before (global, then route)
 *   → pipes (global, then route) → handler → interceptors, after (route, then global)
 *   and any error, from anywhere after middleware → filters (route first, then global).
 *
 * Shapes:
 *   middleware   (req, next) => Promise<Response>      call next() to continue, or return a Response to stop
 *   guard        (req) => boolean | Promise<boolean>   false → 403 "Forbidden resource"; may throw an HttpError
 *   interceptor  (req, next) => Promise<any>           next() runs the rest and returns the handler's result
 *   pipe         (body, req) => body                   transform or validate; throw HttpError(400, …) to refuse
 *   filter       (err, req) => Response | undefined    return a Response to handle the error, undefined to pass
 *   handler      (body, req) => any                    its result becomes the response body
 *
 * Responses are { status, body }. Success: 201 for POST, 200 otherwise.
 * An HttpError nobody handled → { status: err.status, body: { statusCode, message } }.
 * Any other error → 500 { statusCode: 500, message: "Internal server error" }: never leak its message.
 * No such route → 404 { statusCode: 404, message: "Cannot <METHOD> <path>" }.
 */
import { HttpError } from "./http-error.mjs";

export function createApp() {
  void HttpError;
  return {
    use(middleware) { void middleware; },
    useGlobalGuard(guard) { void guard; },
    useGlobalInterceptor(interceptor) { void interceptor; },
    useGlobalPipe(pipe) { void pipe; },
    useGlobalFilter(filter) { void filter; },
    /** @param {string} method @param {string} path @param {Function} handler @param {object} [route] guards, interceptors, pipes, filters */
    route(method, path, handler, route = {}) { void method; void path; void handler; void route; },
    /** @param {{ method: string, path: string, body?: any, headers?: object }} req */
    async handle(req) { void req; throw new Error("Not written yet."); },
  };
}
