/** An order whose total must equal the sum of its lines. Who may change what? */
export interface OrderState {
  closed: boolean;
  lines: readonly number[];
  total: number;
  log: readonly { text: string; tone: "ok" | "bad" | "info" }[];
  broke: boolean;
  /** Calls tried while the door was closed. */
  tried: readonly string[];
}
export const CALLS = [
  { id: "add", code: "order.addLine(20)", legal: true },
  { id: "push", code: "order.lines.push(20)", legal: false },
  { id: "edit", code: "order.lines[0] = 99", legal: false },
  { id: "total", code: "order.total = 1", legal: false },
] as const;
export type CallId = (typeof CALLS)[number]["id"];
export type OrderAction = { type: "call"; id: CallId } | { type: "door"; closed: boolean } | { type: "reset" };

export const ORDER_START: OrderState = { closed: false, lines: [10, 30], total: 40, log: [], broke: false, tried: [] };
export const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
export const holds = (s: OrderState) => sum(s.lines) === s.total;

export function orderReducer(s: OrderState, a: OrderAction): OrderState {
  if (a.type === "reset") return ORDER_START;
  if (a.type === "door") return { ...ORDER_START, closed: a.closed, broke: s.broke, log: [{ text: a.closed ? "A new order. Its lines are private now: only its own methods can change it." : "A new order, with everything public.", tone: "info" }] };
  const call = CALLS.find((c) => c.id === a.id);
  if (!call) return s;
  const note = (next: OrderState, text: string, tone: "ok" | "bad" | "info"): OrderState => ({ ...next, log: [{ text, tone }, ...next.log].slice(0, 5), broke: next.broke || !holds(next), tried: s.closed && !s.tried.includes(a.id) ? [...s.tried, a.id] : s.tried });
  if (s.closed && !call.legal) return note(s, `${call.code} doesn't compile: there's no such door.`, "info");
  switch (a.id) {
    case "add":
      return note({ ...s, lines: [...s.lines, 20], total: s.total + 20 }, "addLine changes the line and the total together.", "ok");
    case "push":
      return note({ ...s, lines: [...s.lines, 20] }, "A line appeared, and the total never heard about it.", "bad");
    case "edit":
      return note({ ...s, lines: [99, ...s.lines.slice(1)] }, "Someone edited a line behind the order's back.", "bad");
    case "total":
      return note({ ...s, total: 1 }, "Someone typed in a total.", "bad");
  }
}
export const invariantWon = (s: OrderState) => s.broke && s.closed && CALLS.every((c) => s.tried.includes(c.id)) && holds(s);
