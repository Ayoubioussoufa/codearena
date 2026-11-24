/** Three limiters, all "10 requests per 10 seconds". Only one has a hole. */
export type Limiter = "fixed" | "sliding" | "bucket";
export const LIMIT = 10;
export const WINDOW = 10;
export interface Hit {
  t: number;
  ok: boolean;
}
export interface LimiterState {
  limiter: Limiter;
  now: number;
  hits: Hit[];
  tokens: number;
}
export type LimiterAction = { type: "send"; count: number } | { type: "wait"; seconds: number } | { type: "pick"; limiter: Limiter };

export const limiterStart = (limiter: Limiter): LimiterState => ({ limiter, now: 0, hits: [], tokens: LIMIT });

/** May one more request pass right now? */
function allowed(s: LimiterState): boolean {
  const passed = s.hits.filter((h) => h.ok);
  if (s.limiter === "fixed") {
    const start = Math.floor(s.now / WINDOW) * WINDOW;
    return passed.filter((h) => h.t >= start).length < LIMIT;
  }
  if (s.limiter === "sliding") return passed.filter((h) => h.t > s.now - WINDOW).length < LIMIT;
  return s.tokens >= 1;
}

export function limiterReducer(s: LimiterState, a: LimiterAction): LimiterState {
  if (a.type === "pick") return limiterStart(a.limiter);
  if (a.type === "wait") {
    return { ...s, now: s.now + a.seconds, tokens: Math.min(LIMIT, s.tokens + (a.seconds * LIMIT) / WINDOW) };
  }
  let next = s;
  for (let i = 0; i < a.count; i++) {
    const ok = allowed(next);
    next = { ...next, hits: [...next.hits, { t: next.now, ok }], tokens: ok && next.limiter === "bucket" ? next.tokens - 1 : next.tokens };
  }
  return next;
}

/** The most requests let through, and sent, inside any 2 seconds. */
export function best(hits: readonly Hit[]): { passed: number; sent: number } {
  let passed = 0, sent = 0;
  for (const h of hits) {
    const span = hits.filter((x) => x.t >= h.t && x.t <= h.t + 2);
    passed = Math.max(passed, span.filter((x) => x.ok).length);
    sent = Math.max(sent, span.length);
  }
  return { passed, sent };
}
export const HOLE = 18;
/** An attack counts as "the same" when you really sent a double burst. */
export const ATTACK = 20;
