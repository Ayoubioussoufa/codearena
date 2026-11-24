/** Take money and record an order, with a crash at any point. */
export type Design = "inside" | "after" | "outbox";
export interface Step {
  label: string;
  effect: "begin" | "order" | "charge" | "commit" | "event" | "mark";
}
export const DESIGNS: Record<Design, { name: string; steps: readonly Step[] }> = {
  inside: {
    name: "Charge inside the transaction",
    steps: [
      { label: "BEGIN", effect: "begin" },
      { label: "insert the order", effect: "order" },
      { label: "call the card API", effect: "charge" },
      { label: "COMMIT", effect: "commit" },
    ],
  },
  after: {
    name: "Commit, then charge",
    steps: [
      { label: "BEGIN", effect: "begin" },
      { label: "insert the order", effect: "order" },
      { label: "COMMIT", effect: "commit" },
      { label: "call the card API", effect: "charge" },
    ],
  },
  outbox: {
    name: "Outbox and a worker",
    steps: [
      { label: "BEGIN", effect: "begin" },
      { label: "insert the order", effect: "order" },
      { label: "insert \"charge this\" in the outbox", effect: "event" },
      { label: "COMMIT", effect: "commit" },
      { label: "worker: call the card API", effect: "charge" },
      { label: "worker: mark the row done", effect: "mark" },
    ],
  },
};
export interface CrashResult {
  order: boolean;
  charges: number;
  verdict: "good" | "nothing" | "robbed" | "free" | "double";
  text: string;
}

/** `crash` = how many steps finished before the power went out (all = no crash). */
export function crashAt(design: Design, crash: number, idempotent: boolean): CrashResult {
  const { steps } = DESIGNS[design];
  let draftOrder = false, draftEvent = false, order = false, event = false, charges = 0, marked = false;
  for (const s of steps.slice(0, crash)) {
    if (s.effect === "order") draftOrder = true;
    if (s.effect === "event") draftEvent = true;
    if (s.effect === "commit") [order, event] = [draftOrder, draftEvent];
    if (s.effect === "charge") charges++;
    if (s.effect === "mark") marked = true;
  }
  // After a restart, the worker looks for outbox rows that aren't done.
  if (event && !marked) charges = charges === 0 ? 1 : idempotent ? 1 : 2;
  const result = (verdict: CrashResult["verdict"], text: string): CrashResult => ({ order, charges, verdict, text });
  if (charges > 1) return result("double", "The worker didn't know it had already charged, and did it again.");
  if (charges === 1 && !order) return result("robbed", "Money taken, and no order anywhere. The rollback couldn't reach the card.");
  if (charges === 0 && order) return result("free", "An order nobody will ever charge, unless someone notices.");
  if (charges === 0) return result("nothing", "Nothing happened at all. The customer can simply try again.");
  return result("good", "One order, one charge.");
}
export const survives = (design: Design, idempotent: boolean) =>
  Array.from({ length: DESIGNS[design].steps.length + 1 }, (_, i) => crashAt(design, i, idempotent)).every((r) => r.verdict === "good" || r.verdict === "nothing");
