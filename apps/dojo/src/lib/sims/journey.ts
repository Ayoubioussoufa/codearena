/** One request from a browser to the database and back, as a list of hops. */
export interface JourneyConfig {
  /** The servers are in the user's region. */
  near: boolean;
  /** The connection is already open: no DNS, TCP or TLS to pay. */
  warm: boolean;
  /** The answer is already in the cache. */
  hit: boolean;
}
export type JourneyNode = "browser" | "dns" | "lb" | "app" | "cache" | "db";
export interface Hop {
  from: JourneyNode;
  to: JourneyNode;
  label: string;
  ms: number;
  why: string;
}

export const JOURNEY_START: JourneyConfig = { near: false, warm: false, hit: false };
export const JOURNEY_TARGET = 100;

/** The guide's numbers: 150 ms across the world, about 20 ms in the same region. */
export const roundTrip = (c: JourneyConfig) => (c.near ? 20 : 150);

export function journey(c: JourneyConfig): Hop[] {
  const rtt = roundTrip(c);
  const hops: Hop[] = [];
  if (!c.warm) {
    hops.push(
      { from: "browser", to: "dns", label: "DNS lookup", ms: 30, why: "The name becomes an IP address. Cached for its TTL, so a returning visitor skips this." },
      { from: "browser", to: "lb", label: "TCP handshake", ms: rtt, why: "One full round trip before a single useful byte." },
      { from: "browser", to: "lb", label: "TLS handshake", ms: rtt, why: "TLS 1.3 costs one more round trip to agree on keys." },
    );
  }
  hops.push(
    { from: "browser", to: "lb", label: "Request travels", ms: rtt / 2, why: "Half a round trip: the speed of light in fibre, not your code." },
    { from: "lb", to: "app", label: "Load balancer picks a server", ms: 1, why: "Same datacenter: well under a millisecond, rounded up." },
    { from: "app", to: "cache", label: "Ask the cache", ms: 1, why: "A datacenter round trip plus a read from memory." },
  );
  if (!c.hit) {
    hops.push(
      { from: "app", to: "db", label: "Miss: query the database", ms: 25, why: "A real query: the network, an index, a few pages from disk." },
      { from: "app", to: "cache", label: "Fill the cache", ms: 1, why: "Cache-aside: the next reader gets a hit." },
    );
  }
  hops.push(
    { from: "app", to: "lb", label: "Run the app code", ms: 5, why: "Parsing, rules, JSON. Often the smallest number on this page." },
    { from: "lb", to: "browser", label: "Response travels back", ms: rtt / 2, why: "The other half of the round trip." },
  );
  return hops;
}

export const journeyTotal = (c: JourneyConfig) => journey(c).reduce((s, h) => s + h.ms, 0);
export const switchesOn = (c: JourneyConfig) => Number(c.near) + Number(c.warm) + Number(c.hit);
export const journeyWon = (c: JourneyConfig) => journeyTotal(c) < JOURNEY_TARGET && switchesOn(c) <= 2;

/** The switch that saves the most from the starting trip. */
export function bestSwitch(): keyof JourneyConfig {
  const keys = ["near", "warm", "hit"] as const;
  const total = (k: keyof JourneyConfig) => journeyTotal({ ...JOURNEY_START, [k]: true });
  return keys.reduce((best, k) => (total(k) < total(best) ? k : best), "near" as keyof JourneyConfig);
}
