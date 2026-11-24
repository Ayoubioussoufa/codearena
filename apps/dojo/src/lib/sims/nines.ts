/** A chain of components, each with some copies: what availability do you get? */
export interface Part {
  id: string;
  name: string;
  availability: number;
}
export const PARTS: readonly Part[] = [
  { id: "lb", name: "Load balancer", availability: 0.9995 },
  { id: "auth", name: "Auth service", availability: 0.995 },
  { id: "app", name: "App server", availability: 0.99 },
  { id: "db", name: "Database", availability: 0.999 },
];
export type Copies = Record<string, number>;
export const NINES_START: Copies = Object.fromEntries(PARTS.map((p) => [p.id, 1]));
export const NINES_TARGET = 0.999;
export const NINES_BUDGET = 7;
export const MAX_COPIES = 3;

export const partAvailability = (p: Part, copies: number) => 1 - (1 - p.availability) ** copies;
export const chain = (c: Copies) => PARTS.reduce((a, p) => a * partAvailability(p, c[p.id] ?? 1), 1);
export const boxes = (c: Copies) => PARTS.reduce((n, p) => n + (c[p.id] ?? 1), 0);
export const ninesWon = (c: Copies) => chain(c) >= NINES_TARGET && boxes(c) <= NINES_BUDGET;

/** Downtime per year, in words. */
export function downtime(a: number): string {
  const minutes = (1 - a) * 365 * 24 * 60;
  if (minutes >= 1440) return `${(minutes / 1440).toFixed(1)} days`;
  if (minutes >= 60) return `${(minutes / 60).toFixed(1)} hours`;
  return `${minutes.toFixed(0)} minutes`;
}
