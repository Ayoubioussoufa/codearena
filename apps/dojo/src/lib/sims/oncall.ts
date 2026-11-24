/** Nine incidents: read the dashboard, make one move. */
import type { Situation } from "./quiz";

export interface Incident extends Situation {
  metrics: readonly { label: string; value: string; bad?: boolean }[];
}

export const ONCALL_PASS = 7;

export const INCIDENTS: readonly Incident[] = [
  {
    id: "wall", title: "The 9 o'clock wall",
    story: "Class starts, and 400 students open the same 20 problem pages.",
    metrics: [{ label: "DB CPU", value: "96%", bad: true }, { label: "Reads", value: "11k/s" }, { label: "Writes", value: "40/s" }, { label: "Distinct pages", value: "20" }],
    moves: [
      { text: "Shard the database by problem id", outcome: "Twenty pages would still hit a few shards. Weeks of work for a read problem." },
      { text: "Move to a document database", outcome: "The same reads, on a system nobody on the team knows." },
      { text: "Cache the pages, with a short TTL", outcome: "Twenty keys answer almost everything. Database CPU falls to 9%." },
      { text: "Add a message queue in front of the reads", outcome: "Readers need the answer now. You've built a waiting room." },
    ],
    best: 2, lesson: "Many reads of few things that rarely change: cache first.",
  },
  {
    id: "ghost", title: "Ghost edits",
    story: "Users save their profile, reload, and see the old one. Ten seconds later it's right.",
    metrics: [{ label: "Replica lag", value: "4.2 s", bad: true }, { label: "Primary CPU", value: "22%" }, { label: "Errors", value: "0" }, { label: "Cache", value: "none" }],
    moves: [
      { text: "Send a user's reads to the primary just after they write", outcome: "Read-your-writes. The author always sees their edit, and the replicas keep the rest." },
      { text: "Add two more replicas", outcome: "More copies, all of them late." },
      { text: "Raise the HTTP timeout", outcome: "Nothing is timing out. The answer is fast, and old." },
      { text: "Switch every read to the primary, for good", outcome: "It works today, and you've thrown away your read capacity." },
    ],
    best: 0, lesson: "Replication lag plus your own edit: read-your-writes, for that user, for a moment.",
  },
  {
    id: "double", title: "Charged twice",
    story: "Support has 31 tickets about double payments, all from people on slow phones.",
    metrics: [{ label: "Client timeouts", value: "3%", bad: true }, { label: "POST /charge", value: "40/s" }, { label: "Server errors", value: "0.01%" }, { label: "Retries", value: "automatic" }],
    moves: [
      { text: "Turn POST into GET, which is safe to retry", outcome: "Now link previews and crawlers can charge people." },
      { text: "Remove retries from the app", outcome: "Payments now fail on bad networks, and people tap the button again themselves." },
      { text: "Add more payment servers", outcome: "The servers are fine. The answers are lost on the way back." },
      { text: "Require an idempotency key, and return the first result again", outcome: "A retry finds its own first attempt. Zero new tickets." },
    ],
    best: 3, lesson: "A timeout doesn't mean it failed. Make the retry harmless.",
  },
  {
    id: "cliff", title: "The midnight cliff",
    story: "Every night at 00:00 the site stalls for 90 seconds, then recovers on its own.",
    metrics: [{ label: "DB queries at once", value: "3,100", bad: true }, { label: "Cache hits at 23:59", value: "97%" }, { label: "At 00:00", value: "4%", bad: true }, { label: "Cache filled by", value: "a nightly job, TTL 24 h" }],
    moves: [
      { text: "Double the cache's memory", outcome: "The keys didn't run out of room. They ran out of time, together." },
      { text: "Add random jitter to each key's TTL", outcome: "Expiry spreads over an hour. Midnight becomes boring." },
      { text: "Restart the database at 23:55", outcome: "A cold database meets a cold cache. Worse." },
      { text: "Add a read replica", outcome: "You've bought a machine for 90 seconds a day." },
    ],
    best: 1, lesson: "Same birth, same TTL, same death: spread the expiry.",
  },
  {
    id: "sad", title: "One sad server",
    story: "Most pages are quick. About one in six crawls.",
    metrics: [{ label: "p50", value: "40 ms" }, { label: "p99", value: "9 s", bad: true }, { label: "Servers", value: "6, round-robin" }, { label: "Server 4 disk", value: "failing", bad: true }],
    moves: [
      { text: "Add six more servers", outcome: "Now one in twelve crawls." },
      { text: "Cache every response for an hour", outcome: "Logged-in pages can't be shared, and server 4 is still in the rotation." },
      { text: "Take server 4 out, and let health checks do it next time", outcome: "p99 drops to 110 ms. The next bad disk never reaches a user." },
      { text: "Move to microservices", outcome: "Server 4 comes with you." },
    ],
    best: 2, lesson: "A good median with a terrible tail, one in N: look for one bad server, not for more servers.",
  },
  {
    id: "celebrity", title: "The celebrity",
    story: "A streamer with 4 million followers goes live on your sharded chat.",
    metrics: [{ label: "Shard 5 CPU", value: "98%", bad: true }, { label: "Other 7 shards", value: "12%" }, { label: "Shard key", value: "channel_id" }, { label: "Total load", value: "normal" }],
    moves: [
      { text: "Split that one channel's key across several shards", outcome: "Writes spread out, and readers merge the pieces. Shard 5 breathes." },
      { text: "Add eight more shards", outcome: "The channel still hashes to exactly one of them." },
      { text: "Upgrade all eight machines", outcome: "Eight bills, seven of them for idle machines." },
      { text: "Add replicas to every shard", outcome: "It's writes that burn, and every replica replays them." },
    ],
    best: 0, lesson: "One shard burning, the rest idle: the key is the problem, not the capacity.",
  },
  {
    id: "contest", title: "Contest night",
    story: "Submissions come faster than they can be judged, and users are resubmitting in panic.",
    metrics: [{ label: "Queue depth", value: "40k and rising", bad: true }, { label: "In", value: "50/s" }, { label: "Out", value: "20/s" }, { label: "Redis memory", value: "91%", bad: true }],
    moves: [
      { text: "Raise the HTTP timeout to 10 minutes", outcome: "The API answers at once already. The line is elsewhere." },
      { text: "Empty the queue and apologise", outcome: "\"Submissions must never be lost\" was requirement number one." },
      { text: "Delete the verdict cache", outcome: "Now the database has a bad night too." },
      { text: "Add workers, and cap the queue with a 503 and Retry-After", outcome: "Out passes in, memory stops climbing, and clients back off instead of piling on." },
    ],
    best: 3, lesson: "In faster than out: raise out, and bound the line before it takes the machine down.",
  },
  {
    id: "domino", title: "Domino",
    story: "The payment provider got slow. Now your whole site is down, even the help page.",
    metrics: [{ label: "Provider latency", value: "30 s", bad: true }, { label: "App threads busy", value: "100%", bad: true }, { label: "DB CPU", value: "8%" }, { label: "Calls without a timeout", value: "all of them", bad: true }],
    moves: [
      { text: "Double the number of threads", outcome: "Twice as many threads waiting 30 seconds. Four minutes of relief." },
      { text: "Give the call a short timeout and a circuit breaker", outcome: "Checkout says \"try again soon\". Everything else comes back." },
      { text: "Retry the provider three times", outcome: "Three times the load on something already drowning, and 90 seconds per request." },
      { text: "Add a database replica", outcome: "The database is at 8%. It's bored." },
    ],
    best: 1, lesson: "One slow dependency must not hold everyone's threads: time out, then stop calling.",
  },
  {
    id: "fifth", title: "The fifth cache",
    story: "You added a fifth cache server to help. The database melted within a minute.",
    metrics: [{ label: "Hit ratio before", value: "95%" }, { label: "After", value: "18%", bad: true }, { label: "Key placement", value: "hash(key) % N", bad: true }, { label: "DB CPU", value: "100%", bad: true }],
    moves: [
      { text: "Add a sixth server, to spread the load more", outcome: "N changes again, and almost every key moves again." },
      { text: "Lower the TTL so the cache fills faster", outcome: "Keys now leave sooner. The database sends its regards." },
      { text: "Go back to four, then switch to consistent hashing", outcome: "Keys return home. Next time a new node takes only its share, about one in five." },
      { text: "Make the cache write-behind", outcome: "The problem is where reads look, not how writes land." },
    ],
    best: 2, lesson: "If the number of servers is in the formula, changing it moves nearly everything.",
  },
];
