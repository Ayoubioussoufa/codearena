/**
 * The stations: one playable sim per idea, each with a goal, grouped in routes
 * of one guide each. The logic lives next to this file as pure functions, so
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

const SYSTEM_DESIGN = [
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

const NESTJS = [
  {
    id: "di",
    title: "Be the container",
    goal: "Boot all three apps without building anything too early or twice.",
    takeaway: "The container builds dependencies first, once each, and shares them. A cycle has no first.",
  },
  {
    id: "modules",
    title: "Module borders",
    goal: "Boot the app with exactly one UsersService.",
    takeaway: "A provider is private: its module exports it, yours imports that module. Copying it makes a second one.",
  },
  {
    id: "providers",
    title: "Which provider?",
    goal: "9 of 10.",
    takeaway: "useClass builds, useValue hands over, useFactory computes, useExisting renames.",
  },
  {
    id: "leak",
    title: "The leaking singleton",
    goal: "See one user get another's data, then fix it with a single instance.",
    takeaway: "A singleton is shared by every request: pass what belongs to a request as an argument.",
  },
  {
    id: "routes",
    title: "First match wins",
    goal: "Send all six requests to the right handler.",
    takeaway: "Specific routes come before parameters, and wildcards come last.",
  },
  {
    id: "validation",
    title: "The bouncer",
    goal: "Refuse the sneaky role with a message, and let limit arrive as the number 20, sent or not.",
    takeaway: "whitelist drops what you didn't declare, forbidNonWhitelisted says so, transform delivers the DTO you validated.",
  },
  {
    id: "pipeline",
    title: "Where does it stop?",
    goal: "Walk all seven requests to their status without a mistake.",
    takeaway: "Middleware, guards, interceptors, pipes, handler, interceptors back out, and a filter if anything threw.",
  },
  {
    id: "placement",
    title: "Which stage?",
    goal: "10 of 12.",
    takeaway: "Ask what the code needs to know and when: that decides its stage.",
  },
  {
    id: "clinic",
    title: "The bug clinic",
    goal: "7 of 8 right the first time.",
    takeaway: "Read the message literally: Nest usually names the class, the argument and the module.",
  },
] as const satisfies readonly SimMeta[];

const ARCHITECTURE = [
  {
    id: "blast",
    title: "Blast radius",
    goal: "Pick exactly the files each change touches, five times.",
    takeaway: "Good structure makes one reason to change touch one place.",
  },
  {
    id: "arrows",
    title: "Audit the arrows",
    goal: "Flag every import that breaks the rule, and none that doesn't.",
    takeaway: "Dependencies point inward: an adapter may know your port, never the other way round.",
  },
  {
    id: "boundary",
    title: "What gets out?",
    goal: "For each version of the code, pick exactly the fields that reach the client.",
    takeaway: "TypeScript checks names on fresh literals, not on variables or spreads: only naming each field is a boundary.",
  },
  {
    id: "invariant",
    title: "One door",
    goal: "Break the invariant through an open door, then try all four calls on the closed one.",
    takeaway: "An invariant holds only if every change goes through one place: the aggregate root.",
  },
  {
    id: "whereto",
    title: "Where does it go?",
    goal: "14 of 16.",
    takeaway: "Outside technology? A rule on paper? Steps of one action? A need without a how? First yes wins.",
  },
  {
    id: "errors",
    title: "Error relay",
    goal: "Carry all five errors to the right answer without a mistake.",
    takeaway: "Each layer catches what it understands, says it in the next layer's words, and lets the rest through.",
  },
  {
    id: "outbox",
    title: "Charge and commit",
    goal: "Find the crash that takes money with no order, the one that ships for free, and a design that survives all of them.",
    takeaway: "Database work inside the transaction, network calls outside, and an outbox plus an idempotency key in between.",
  },
  {
    id: "worthit",
    title: "Worth a port?",
    goal: "7 of 8.",
    takeaway: "A port earns its place by a second implementation, a boundary you don't control, or shapes you don't want to spread.",
  },
  {
    id: "whichtest",
    title: "Which test?",
    goal: "8 of 9.",
    takeaway: "Rules need no setup, use cases need fakes, adapters need the real thing, and a few journeys need everything.",
  },
  {
    id: "villains",
    title: "Name the villain",
    goal: "7 of 8 right the first time.",
    takeaway: "Once it has a name you'll see it coming, and each one has a known cure.",
  },
] as const satisfies readonly SimMeta[];

const GIT = [
  {
    id: "places",
    title: "Four places",
    goal: "Reach the goal of all five levels.",
    takeaway: "Working tree, index, local repo, remote: every command moves changes between two of them.",
  },
  {
    id: "graph",
    title: "Shape the history",
    goal: "Reach the shape asked for in all five levels.",
    takeaway: "Merge ties two lines together, rebase writes new commits on a new base, revert adds the opposite.",
  },
  {
    id: "conflict",
    title: "Peace talks",
    goal: "Settle all three conflicts without a mistake.",
    takeaway: "Edit to what the code should be, git add to say it's settled, then finish the merge or the rebase.",
  },
  {
    id: "undo",
    title: "Undo what, exactly?",
    goal: "10 of 12.",
    takeaway: "Ask where the change is and whether anyone has it: not pushed, reset; pushed, revert.",
  },
  {
    id: "lease",
    title: "The force push",
    goal: "Tick all four: a lost commit, a lease that saves it, a lease that's fooled, and one that isn't.",
    takeaway: "--force-with-lease trusts your note of the remote: a background fetch updates the note, so name the hash.",
  },
  {
    id: "bisect",
    title: "Find the breaking commit",
    goal: "Find it in 6 tests or fewer, twice.",
    takeaway: "Halve the range each time: 64 commits take 6 tests, and 1,000 take 10.",
  },
  {
    id: "sync",
    title: "Two mains",
    goal: "Finish all three evenings without a mistake.",
    takeaway: "A merge on GitHub tells your machine nothing: fetch to look, pull to catch up, then clean up.",
  },
  {
    id: "rescue",
    title: "I lost my work!",
    goal: "6 of 7 right the first time.",
    takeaway: "Anything committed can be found again. Only what Git never saw is gone.",
  },
  {
    id: "danger",
    title: "Gone or not?",
    goal: "9 of 10.",
    takeaway: "Commits are recoverable, the working tree isn't.",
  },
] as const satisfies readonly SimMeta[];

const DSA = [
  {
    id: "pattern",
    title: "Name that pattern",
    goal: "12 of 14.",
    takeaway: "The words of the statement give the pattern away before you write a line.",
  },
  {
    id: "budget",
    title: "What does n allow?",
    goal: "9 of 10.",
    takeaway: "10⁷ operations are safe and 10⁹ are not: n tells you the complexity they want.",
  },
  {
    id: "hashing",
    title: "Have I seen it?",
    goal: "Clear every level without a mistake.",
    takeaway: "Look for the complement before you store, and one pass is enough.",
  },
  {
    id: "pointers",
    title: "Two fingers",
    goal: "Clear every level without a mistake.",
    takeaway: "Sorted order says which finger to move: too small, move left; too big, move right.",
  },
  {
    id: "window",
    title: "Grow or shrink?",
    goal: "Clear every level without a mistake.",
    takeaway: "Grow while the window is legal, shrink until it is again: each end only moves forward.",
  },
  {
    id: "reverse",
    title: "Don't drop the list",
    goal: "Clear every level without a mistake.",
    takeaway: "Save the next node before you cut the arrow that leads to it.",
  },
  {
    id: "nextgreater",
    title: "The waiting line",
    goal: "Clear every level without a mistake.",
    takeaway: "The stack holds those still waiting: whoever is bigger answers everyone smaller at the top.",
  },
  {
    id: "bsearch",
    title: "Halve it",
    goal: "Clear every level without a mistake.",
    takeaway: "Keep the answer inside [lo, hi], and throw away only what you've proved is wrong.",
  },
  {
    id: "queens",
    title: "Be the backtracker",
    goal: "Clear every level without a mistake.",
    takeaway: "Choose, go deeper, undo: the first safe choice, and a step back when there is none.",
  },
  {
    id: "tree",
    title: "Four walks",
    goal: "Clear every level without a mistake.",
    takeaway: "Preorder visits on the way in, inorder between, postorder on the way out, level order with a queue.",
  },
  {
    id: "bfs",
    title: "Ripples",
    goal: "Clear every level without a mistake.",
    takeaway: "BFS finishes distance d before touching d + 1: that's why its first arrival is the shortest.",
  },
  {
    id: "heap",
    title: "Bubble and sink",
    goal: "Clear every level without a mistake.",
    takeaway: "Insert at the end and bubble up; extract the root, move the last one there, sink it below the smaller child.",
  },
  {
    id: "dijkstra",
    title: "Settle the closest",
    goal: "Clear every level without a mistake.",
    takeaway: "The closest unsettled node can't get any closer, as long as no edge is negative.",
  },
  {
    id: "topo",
    title: "What can I take now?",
    goal: "Clear every level without a mistake.",
    takeaway: "Take whatever has no prerequisite left; if nothing does, there's a cycle.",
  },
  {
    id: "intervals",
    title: "Fill the day",
    goal: "Clear every level without a mistake.",
    takeaway: "To fit the most meetings, always take the one that ends first.",
  },
  {
    id: "dp",
    title: "Fill the table",
    goal: "Clear every level without a mistake.",
    takeaway: "Each cell is the best of a few cells you already filled, plus one.",
  },
] as const satisfies readonly SimMeta[];

export type SimId = (typeof SYSTEM_DESIGN | typeof NESTJS | typeof ARCHITECTURE | typeof GIT | typeof DSA)[number]["id"];
export type Sim = SimMeta & { id: SimId };

export interface Route {
  name: string;
  /** The guide whose page holds the map and every station, in this order. */
  guide: string;
  sims: readonly Sim[];
  /** Titles you earn, from none cleared to all of them. */
  ranks: readonly [string, string, string, string, string, string];
}

export const ROUTES: readonly Route[] = [
  { name: "System design", guide: "system-design-fundamentals", sims: SYSTEM_DESIGN, ranks: ["First day", "Intern with a pager", "Engineer", "Senior engineer", "Staff engineer", "Architect"] },
  { name: "NestJS", guide: "nestjs", sims: NESTJS, ranks: ["Hello World", "Module tourist", "Provider", "Guard on duty", "Pipeline whisperer", "The container itself"] },
  { name: "Backend architecture", guide: "backend-architecture", sims: ARCHITECTURE, ranks: ["One big file", "Folder maker", "Boundary drawer", "Port authority", "Keeper of the arrows", "Guardian of the core"] },
  { name: "Git", guide: "git-workflow", sims: GIT, ranks: ["Final_v2_REAL.zip", "Committer", "Brancher", "Rebaser", "Reflog diver", "Keeper of the history"] },
  { name: "DSA", guide: "dsa-patterns", sims: DSA, ranks: ["Brute force", "Two pointers", "Log n thinker", "Graph walker", "State of the DP", "O(1)"] },
];

export const SIMS: readonly Sim[] = ROUTES.flatMap((r) => r.sims);

export function getSim(id: string): Sim | undefined {
  return SIMS.find((s) => s.id === id);
}

export function routeOf(id: SimId): Route {
  return ROUTES.find((r) => r.sims.some((s) => s.id === id)) as Route;
}

export function rankFor(route: Route, cleared: number): string {
  if (cleared >= route.sims.length) return route.ranks[5];
  if (cleared === 0) return route.ranks[0];
  const share = cleared / route.sims.length;
  return route.ranks[share >= 0.7 ? 4 : share >= 0.45 ? 3 : share >= 0.2 ? 2 : 1];
}
