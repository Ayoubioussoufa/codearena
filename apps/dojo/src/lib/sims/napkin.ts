/** Back-of-envelope rounds: a scenario, the napkin answer, and the arithmetic. */
import { Rng } from "../engine/rng";

export interface NapkinRound {
  scenario: string;
  ask: string;
  unit: string;
  answer: number;
  steps: string[];
}

const SECONDS = 100_000; // the napkin's day

export function compact(n: number): string {
  const units: [number, string][] = [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "k"]];
  for (const [size, suffix] of units) if (n >= size) return `${trim(n / size)}${suffix}`;
  return trim(n);
}
const trim = (x: number) => String(x >= 100 ? Math.round(x) : Number(x.toPrecision(2)));

const APPS = [
  { app: "a photo app", verb: "opens", what: "photos", per: [20, 50] },
  { app: "a news site", verb: "reads", what: "articles", per: [5, 10] },
  { app: "a chat app", verb: "sends", what: "messages", per: [20, 40] },
  { app: "a judge like CodeArena", verb: "makes", what: "submissions", per: [5, 10] },
] as const;

export function napkinRound(seed: number): NapkinRound {
  const rng = new Rng(seed * 2654435761);
  const a = rng.pick(APPS);
  const users = rng.pick([50_000, 200_000, 1_000_000, 5_000_000, 20_000_000] as const);
  const per = rng.pick(a.per);
  const daily = users * per;
  const kind = rng.int(0, 2);
  const scenario = `${compact(users)} people use ${a.app} every day, and each one ${a.verb} ${per} ${a.what}.`;
  const base = `${compact(users)} × ${per} = ${compact(daily)} ${a.what} a day`;
  if (kind === 0) {
    const qps = daily / SECONDS;
    return { scenario, ask: "Average requests per second?", unit: "req/s", answer: qps, steps: [base, `÷ 100k seconds ≈ ${compact(qps)} req/s`] };
  }
  if (kind === 1) {
    const avg = daily / SECONDS;
    return { scenario, ask: "Requests per second to build for, if the peak is 4× the average?", unit: "req/s", answer: avg * 4, steps: [base, `÷ 100k seconds ≈ ${compact(avg)} req/s on average`, `× 4 ≈ ${compact(avg * 4)} req/s at the peak`] };
  }
  const bytes = rng.pick([200, 1_000, 2_000] as const);
  const gb = (daily * bytes * 365) / 1e9;
  return {
    scenario: `${scenario} Each one is stored in ${bytes} bytes.`,
    ask: "Gigabytes stored per year, before copies and indexes?",
    unit: "GB",
    answer: gb,
    steps: [base, `× ${bytes} bytes = ${compact((daily * bytes) / 1e9)} GB a day`, `× 365 ≈ ${compact(gb)} GB a year`],
  };
}

/** How many times off a guess is: 1 is exact, 2 is double or half. */
export function timesOff(guess: number, answer: number): number {
  return guess <= 0 ? Infinity : Math.max(guess / answer, answer / guess);
}
export const NAPKIN_TOLERANCE = 2;
export const NAPKIN_STREAK = 3;

/** A slider position (0 to 100) on a logarithmic scale from 1 to 10 million. */
export const sliderToValue = (pos: number) => 10 ** ((pos / 100) * 7);
