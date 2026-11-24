/** Walk a request through Nest's stages: does it pass, or stop here? */
import { at, type Trace } from "../engines";

export const STAGES = ["Middleware", "Guards", "Interceptors in", "Pipes", "Handler", "Interceptors out"] as const;
interface Req {
  name: string;
  story: string;
  /** Index of the stage that throws, or null. */
  stops: number | null;
  status: string;
  note: string;
}
const REQS: readonly Req[] = [
  { name: "1. All good", story: "POST /submissions, with a valid token and a valid body. The route answers 202.", stops: null, status: "202", note: "All the way in, and all the way out." },
  { name: "2. No token", story: "POST /submissions, no token, valid body.", stops: 1, status: "401", note: "\"I don't know who you are.\" Nothing below the guard ran." },
  { name: "3. Two problems", story: "POST /submissions, no token and an empty body.", stops: 1, status: "401", note: "Guards run before pipes, so a stranger never learns what a valid body looks like." },
  { name: "4. Bad body", story: "POST /submissions, valid token, code is missing.", stops: 3, status: "400", note: "The interceptor had already started: your timing log saw this one begin." },
  { name: "5. Not an admin", story: "DELETE /problems/7, by a signed-in user whose role is USER. The route needs ADMIN.", stops: 1, status: "403", note: "\"I know who you are, and you may not.\"" },
  { name: "6. No such problem", story: "GET /problems/nope, a public route. The service throws NotFoundException.", stops: 4, status: "404", note: "The filter turns it into JSON. A tap() after next.handle() doesn't fire for it." },
  { name: "7. A plain Error", story: "POST /auth/register, public, with a valid body and a taken email. The service does: throw new Error('Email taken').", stops: 4, status: "500", note: "Nest only knows the status of an HttpException. ConflictException would have been a 409." },
];
export const PIPELINE_STATUSES = ["202", "400", "401", "403", "404", "409", "500"] as const;

export interface PipelineState {
  story: string;
  stops: number | null;
  answer: string;
  note: string;
  stage: number;
  stopped: boolean;
  status: string | null;
}
const atEnd = (s: PipelineState) => s.stopped || s.stage >= STAGES.length;

export const pipelineTrace: Trace<PipelineState> = {
  levels: REQS.map((r) => r.name),
  start(level) {
    const r = at(REQS, level);
    return { story: r.story, stops: r.stops, answer: r.status, note: r.note, stage: 0, stopped: false, status: null };
  },
  moves: (s) =>
    atEnd(s)
      ? PIPELINE_STATUSES.map((c) => ({ id: c, label: c }))
      : [
          { id: "pass", label: "It passes" },
          { id: "stop", label: "It stops here" },
        ],
  correct(s) {
    if (s.status !== null) return [];
    return atEnd(s) ? [s.answer] : [s.stage === s.stops ? "stop" : "pass"];
  },
  apply: (s, move) => (move === "pass" ? { ...s, stage: s.stage + 1 } : move === "stop" ? { ...s, stopped: true } : { ...s, status: move }),
  why(s, move) {
    const stage = STAGES[s.stage];
    if (move === "pass") return `Something in "${stage}" refuses this one. ${stage === "Guards" ? "May this caller go on?" : stage === "Pipes" ? "Is the input valid?" : "What does the service do?"}`;
    if (move === "stop") {
      if (stage === "Middleware") return "Middleware only prepares the request here: it doesn't know which route this is.";
      if (stage === "Guards") return "This caller may go on: a guard doesn't look at the body.";
      if (stage === "Pipes") return "The input is fine.";
      return `Nothing in "${stage}" objects to it.`;
    }
    if (move === "403" && s.answer === "401") return "403 is for someone you know. Nobody has said who they are yet.";
    if (move === "409" && s.answer === "500") return "It should be. But Nest can't guess a status from a plain Error.";
    return "Look at where it stopped, and at what was thrown.";
  },
  say: (s) => (s.status !== null ? `${s.status}. ${s.note}` : s.stopped ? "It threw, so the exception filter answers. With which status?" : s.stage >= STAGES.length ? "Out the other side. With which status?" : `Now in: ${STAGES[s.stage]}.`),
  done: (s) => s.status !== null,
};
