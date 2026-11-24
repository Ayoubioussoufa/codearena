/**
 * What reaches the handler, for each ValidationPipe setting. Without
 * `transform` the pipe still validates a DTO instance, but hands the handler
 * the original plain object: the string "20", and no default values.
 */
export interface PipeOptions {
  whitelist: boolean;
  forbid: boolean;
  transform: boolean;
}
export const PIPE_START: PipeOptions = { whitelist: false, forbid: false, transform: false };
export const PAYLOADS = [
  { id: "register", title: "POST /auth/register", sent: '{ "email": "a@b.co", "password": "long-enough" }' },
  { id: "sneaky", title: "POST /auth/register, sneaky", sent: '{ "email": "a@b.co", "password": "long-enough", "role": "ADMIN" }' },
  { id: "limit", title: "GET /problems?limit=20", sent: '{ "limit": "20" }' },
  { id: "nothing", title: "GET /problems", sent: "{ }" },
] as const;
export interface Outcome {
  status: 200 | 400;
  got: string;
  verdict: string;
  good: boolean;
}

export function receive(p: (typeof PAYLOADS)[number]["id"], o: PipeOptions): Outcome {
  // forbidNonWhitelisted only works on top of whitelist.
  const forbid = o.whitelist && o.forbid;
  switch (p) {
    case "register":
      return { status: 200, got: '{ email: "a@b.co", password: "long-enough" }', verdict: "A normal sign-up.", good: true };
    case "sneaky":
      if (forbid) return { status: 400, got: '["property role should not exist"]', verdict: "Refused, and the client is told why.", good: true };
      if (o.whitelist) return { status: 200, got: '{ email: "a@b.co", password: "long-enough" }', verdict: "Safe: role was dropped. Silent, though: an honest typo would vanish the same way.", good: false };
      return { status: 200, got: '{ email: "a@b.co", password: "long-enough", role: "ADMIN" }', verdict: "One careless spread into a database write, and that's an admin.", good: false };
    case "limit":
      return o.transform
        ? { status: 200, got: "{ limit: 20 }", verdict: "A number, as the DTO promises.", good: true }
        : { status: 200, got: '{ limit: "20" }', verdict: 'TypeScript says number, the runtime says string: "20" + 1 is "201".', good: false };
    case "nothing":
      return o.transform
        ? { status: 200, got: "{ limit: 20 }", verdict: "The DTO's default, because you got the DTO.", good: true }
        : { status: 200, got: "{ limit: undefined }", verdict: "The default lives on the DTO, and you were handed the plain object.", good: false };
  }
}
export const validationWon = (o: PipeOptions) => PAYLOADS.every((p) => receive(p.id, o).good);
