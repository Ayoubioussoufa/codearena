/**
 * The stations of the system design guide: one playable sim per idea, each
 * with a goal. The logic lives next to this file as pure functions, so
 * scripts/check-sims.ts can prove that every goal can be reached and that
 * none is already met before you touch anything.
 */
export interface SimMeta {
  id: string;
  title: string;
  /** What you must achieve to stamp the station. Plain text. */
  goal: string;
  /** The one sentence to remember, shown once the goal is met. */
  takeaway: string;
}

export const SIMS = [
  {
    id: "journey",
    title: "One request, hop by hop",
    goal: "Predict the best switch, then get the trip under 100 ms with only two switches on. Play it to the end.",
    takeaway: "Distance is charged on every round trip, so cut round trips and move closer before you tune code.",
  },
  {
    id: "napkin",
    title: "Napkin duel",
    goal: "Estimate within 2× of the answer, three times in a row.",
    takeaway: "Requests per day ÷ 100k is the QPS. The right power of ten is the whole job.",
  },
  {
    id: "latency",
    title: "Which is slower?",
    goal: "Six right in a row.",
    takeaway: "Memory is nanoseconds, SSD is microseconds, disk seeks and oceans are milliseconds.",
  },
  {
    id: "nines",
    title: "Buying nines",
    goal: "Reach 99.9% with at most 7 boxes.",
    takeaway: "Duplicate the weakest link in the chain: in series availabilities multiply, in parallel failures do.",
  },
  {
    id: "cache",
    title: "The smallest cache that works",
    goal: "70% hits or better, at most 5 stale reads per 1,000, with room for 40 keys or fewer.",
    takeaway: "A cache works because traffic is skewed, and it stays honest because writes delete the old copy.",
  },
  {
    id: "stampede",
    title: "Stampede!",
    goal: "One set of fixes that survives both scenarios with at most 40 database queries at once.",
    takeaway: "Single-flight protects one hot key; jitter protects many keys that expire together. You need both ideas.",
  },
  {
    id: "balancer",
    title: "Seat the guests",
    goal: "p95 under 300 ms, no failed request and no lost session, with one slow server and one that dies.",
    takeaway: "Balance on how busy a server is, check its health, and keep no session in its memory.",
  },
  {
    id: "scaledb",
    title: "Read pressure, write pressure",
    goal: "Solve the three levels within budget, every database node at 70% or less.",
    takeaway: "Every replica replays every write: replicas help reads, only shards help writes and storage.",
  },
  {
    id: "cap",
    title: "Cut the cable",
    goal: "Witness all three: a refused request (CP), two sides that disagree (AP), and a write lost when they reconnect.",
    takeaway: "During a partition you choose which failure the user sees: an error, or a wrong answer.",
  },
  {
    id: "queue",
    title: "Contest night",
    goal: "p95 wait of 30 s or less, at most 2% turned away, within 150 worker-minutes.",
    takeaway: "A queue buys time, not capacity: scale workers on depth, and bound the line so it can't sink you.",
  },
  {
    id: "ratelimit",
    title: "Break the rate limiter",
    goal: "Get 18 or more requests through a fixed window within 2 seconds, then try the same on the other two.",
    takeaway: "A fixed window lets twice the limit through at its edge; a token bucket lets through only the burst you chose.",
  },
  {
    id: "ring",
    title: "Add a server, keep your keys",
    goal: "See modulo move more than 60% of the keys, then add a node moving 30% or less, with the fullest node at most 1.35× the average.",
    takeaway: "On a ring, a new node takes only its neighbours' keys, and virtual nodes make the shares even.",
  },
  {
    id: "judge",
    title: "Sabotage your own judge",
    goal: "Name what saves the submission in all seven disasters, right the first time.",
    takeaway: "Every step needs an answer to: what if it dies here, and what if it runs twice?",
  },
  {
    id: "oncall",
    title: "The on-call shift",
    goal: "Make the best first move in at least 7 of the 9 incidents.",
    takeaway: "Read the numbers, name the pressure, apply one tool, then ask what breaks next.",
  },
] as const satisfies readonly SimMeta[];

export type SimId = (typeof SIMS)[number]["id"];

export function getSim(id: string): (SimMeta & { id: SimId }) | undefined {
  return SIMS.find((s) => s.id === id);
}

export const simIndex = (id: SimId): number => SIMS.findIndex((s) => s.id === id);

/** Titles you earn, by how many stations you've stamped. */
export function rankFor(cleared: number): string {
  if (cleared >= SIMS.length) return "Architect";
  if (cleared >= 10) return "Staff engineer";
  if (cleared >= 6) return "Senior engineer";
  if (cleared >= 3) return "Engineer";
  if (cleared >= 1) return "Intern with a pager";
  return "First day";
}
