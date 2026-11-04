/**
 * Drills for the shipping track, lessons 21 to 25.
 */
import type { Rng } from "../engine/rng";
import { choice, numeric } from "../engine/helpers";
import { type Drill, lessonRef, pickFrom } from "./drill-kit";

/* ── Lesson 21: a server from zero ── */

const L21 = lessonRef("0021-server-from-zero", "Lesson 21: a server from zero");
const FIX = {
  pw: "Turn off password logins entirely",
  root: "Forbid root logins over SSH",
  allow: "Allow only the deploy user",
  deny: "Deny incoming traffic by default",
  limit: "Rate-limit new connections to SSH",
  bind: "Bind the database to localhost",
} as const;

const serverDrill: Drill = {
  id: "server",
  title: "Close the door",
  blurb: "Which setting stops each threat, and the order that doesn't lock you out.",
  generators: [
    {
      id: "drill-server-fix",
      title: "Threat → setting",
      generate: (rng: Rng) => {
        const cases = [
          { s: "Your sshd log shows thousands of guesses at the passwords of `admin` and `ubuntu`", k: "pw", why: "`PasswordAuthentication no` (and `KbdInteractiveAuthentication no`): only keys, and keys can't be guessed." },
          { s: "The provider put your public key in root's `authorized_keys`", k: "root", why: "`PermitRootLogin no`. The default, `prohibit-password`, still lets root in with a key." },
          { s: "An old `ops` account still has a key nobody remembers adding", k: "allow", why: "`AllowUsers deploy`: every other account is refused, whatever keys it holds." },
          { s: "A scanner finds the Redis you started for a quick test, on 6379", k: "deny", why: "A default-deny firewall: only 22, 80 and 443 get in. Then remove the test service anyway." },
          { s: "One address opens 200 SSH connections a minute", k: "limit", why: "`ufw limit 22/tcp` denies an address after 6 new connections in 30 seconds." },
          { s: "Compose publishes Postgres with `5432:5432`, and ufw doesn't stop it", k: "bind", why: "Docker's published ports bypass ufw. Don't publish it (containers reach it on the Compose network), or bind it to `127.0.0.1:5432:5432`." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(FIX, c.k);
        return choice(rng, { genId: "drill-server-fix", prompt: `${c.s}. What stops it?`, correct, wrong: rng.shuffle(wrong).slice(0, 3), explanation: c.why, docRef: L21 });
      },
    },
    {
      id: "drill-server-order",
      title: "Which first?",
      generate: (rng: Rng) => {
        const pairs = [
          { first: "Test it with sshd -t", then: "Restart the sshd service now", why: "A typo in sshd_config can stop sshd from starting, and you're connected through it. `sshd -t` checks the file first." },
          { first: "Log in as deploy elsewhere", then: "Close the root session now", why: "Keep the working session open until a second terminal proves the new login works. Otherwise a mistake locks you out." },
          { first: "Allow port 22 in ufw", then: "Run ufw enable right away", why: "Enabling a default-deny firewall before allowing SSH drops your own connection." },
          { first: "Install the key for deploy", then: "Turn off password logins entirely", why: "Turn passwords off only once a key login works, or no way in is left." },
        ] as const;
        const p = rng.pick(pairs);
        return choice(rng, {
          genId: "drill-server-order",
          prompt: `You're hardening a server over SSH. Which must come first: "${p.then}" or "${p.first}"?`,
          correct: p.first, wrong: [p.then], explanation: p.why, docRef: L21,
        });
      },
    },
  ],
};

/* ── Lesson 22: Compose in production ── */

const L22 = lessonRef("0022-compose-in-production", "Lesson 22: Docker Compose in production");
const RISK = {
  open: "The whole internet can reach it",
  root: "It hands root on the host",
  disk: "It can fill the disk eventually",
  drift: "It runs code nobody chose deliberately",
  leak: "It puts a secret into git",
  order: "It starts before the schema's ready",
} as const;

const composeDrill: Drill = {
  id: "compose",
  title: "What's wrong with this line?",
  blurb: "Spot the production risk in a Compose line, the way a reviewer would.",
  generators: [
    {
      id: "drill-compose-risk",
      title: "Name the risk",
      generate: (rng: Rng) => {
        const cases = [
          { line: "postgres:\n  ports: [\"5432:5432\"]", k: "open", why: "Published ports bypass ufw. Other containers reach `postgres:5432` over the Compose network; nothing else should." },
          { line: "api:\n  volumes: [\"/var/run/docker.sock:/var/run/docker.sock\"]", k: "root", why: "The socket is the Docker API, which is root on the host. Only the worker needs it." },
          { line: "worker:\n  logging: { driver: json-file }", k: "disk", why: "No `max-size`: json-file's default is unlimited." },
          { line: "api:\n  image: ghcr.io/you/codearena-api:latest", k: "drift", why: "`latest` changes under you: two servers, or one server on two days, can run different code. Pin a tag, like the commit's SHA." },
          { line: "api:\n  environment: { JWT_SECRET: \"s3cr3t-prod\" }", k: "leak", why: "The compose file is in git, so the secret is too, forever. Use `${JWT_SECRET:?}` and a `.env.prod` that never leaves the server." },
          { line: "api:\n  depends_on: [postgres]", k: "order", why: "The short form waits only for the container to start, not for Postgres to be ready, nor for migrations. Use conditions: `service_healthy`, `service_completed_successfully`." },
          { line: "redis:\n  ports: [\"6379:6379\"]", k: "open", why: "Redis without a password, published on every interface, is a classic way servers get compromised." },
          { line: "proxy:\n  image: caddy", k: "drift", why: "No tag means `latest`. Pin `caddy:2.8.4-alpine` and upgrade on purpose." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(RISK, c.k);
        return choice(rng, {
          genId: "drill-compose-risk",
          prompt: `In a production Compose file: \`${c.line.replace(/\n\s*/g, " ")}\`. What's the risk?`,
          correct, wrong: rng.shuffle(wrong).slice(0, 3), explanation: c.why, docRef: L22,
        });
      },
    },
  ],
};

/* ── Lesson 23: HTTPS ── */

const L23 = lessonRef("0023-https", "Lesson 23: HTTPS from first principles");
const TLS_OUTCOME = {
  ok: "It connects, padlock and all",
  untrusted: "It refuses: an untrusted issuer",
  name: "It refuses: the wrong name",
  expired: "It refuses: the certificate expired",
} as const;

const httpsDrill: Drill = {
  id: "https",
  title: "Will the browser connect?",
  blurb: "Trust, names and dates: what a TLS client checks, and what it says when a check fails.",
  generators: [
    {
      id: "drill-https-connect",
      title: "Connect or refuse?",
      generate: (rng: Rng) => {
        const cases = [
          { s: "A Let's Encrypt certificate for `codearena.app` and `www.codearena.app`; you visit `https://www.codearena.app`", k: "ok", why: "A trusted issuer, a matching SAN, valid dates." },
          { s: "A certificate from your own lab CA, which this laptop doesn't trust; you visit the right name", k: "untrusted", why: "The chain doesn't end at a root in the trust store: UNABLE_TO_VERIFY_LEAF_SIGNATURE in Node, a full-page warning in a browser." },
          { s: "A Let's Encrypt certificate for `codearena.app` only; you visit `https://api.codearena.app`", k: "name", why: "The hostname must match a SAN entry; `api.` isn't one. Add it, or use a wildcard (which needs the DNS-01 challenge)." },
          { s: "A Let's Encrypt certificate whose renewal failed silently 95 days ago", k: "expired", why: "Certificates expire, which is the point: 90 days limits the damage of a stolen key. Monitor renewal, or let Caddy handle it." },
          { s: "A self-signed certificate for the right name, on a public site", k: "untrusted", why: "Self-signed means it vouches for itself: no trusted issuer. Fine for a lab, never for users." },
          { s: "A trusted certificate for `codearena.app`; you visit the server by its IP address", k: "name", why: "The client checks the name it dialled. An IP is a different name, and isn't in the SAN." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(TLS_OUTCOME, c.k);
        return choice(rng, { genId: "drill-https-connect", prompt: `${c.s}. What happens?`, correct, wrong, explanation: c.why, docRef: L23 });
      },
    },
    {
      id: "drill-https-who",
      title: "Who holds what?",
      generate: (rng: Rng) => {
        const items = [
          { thing: "the server's private key", who: "Only the server itself", why: "It never leaves the machine: not to the CA, not to the browser. The CA signs a CSR that holds only the public key." },
          { thing: "the server's certificate", who: "Every client that connects", why: "It's public: the server sends it in every handshake." },
          { thing: "the root CA's private key", who: "Only the certificate authority", why: "It's kept offline; roots sign intermediates, and intermediates sign your certificate." },
          { thing: "the root CA's certificate", who: "Every browser's trust store", why: "That's what \"trusted\" means: it ships with the browser or the operating system." },
        ] as const;
        const it = rng.pick(items);
        return choice(rng, {
          genId: "drill-https-who",
          prompt: `Who holds ${it.thing}?`,
          correct: it.who, wrong: items.filter((x) => x.who !== it.who).map((x) => x.who), explanation: it.why, docRef: L23,
        });
      },
    },
  ],
};

/* ── Lesson 24: CI/CD ── */

const L24 = lessonRef("0024-ci-cd", "Lesson 24: from merge to deploy");
const CI = {
  injection: "Untrusted text becomes shell code",
  supply: "Moved tags run other code",
  token: "The token is too powerful",
  mitm: "Anyone can impersonate the server",
  pr: "A pull request can deploy",
  drift: "Nobody knows which code runs",
} as const;

const ciDrill: Drill = {
  id: "ci",
  title: "Review the workflow",
  blurb: "Spot what a security reviewer would flag in a deploy workflow.",
  generators: [
    {
      id: "drill-ci-risk",
      title: "What's the risk?",
      generate: (rng: Rng) => {
        const cases = [
          { line: "run: ./deploy.sh ${{ inputs.tag }}", k: "injection", why: "The expression is pasted into the script text before bash parses it. Pass it via `env:` and use `\"$TAG\"`." },
          { line: "run: echo \"Deploying ${{ github.event.head_commit.message }}\"", k: "injection", why: "A commit message is attacker-controlled text; inside `${{ }}` in a script, it can run commands." },
          { line: "uses: some-org/deploy-action@v2", k: "supply", why: "Tags can be repointed, as in the 2025 tj-actions compromise. Pin the full commit SHA (or adopt GitHub's workflow lockfiles)." },
          { line: "permissions: write-all", k: "token", why: "Every step, and every action it runs, gets a token that can write everywhere. Start from `contents: read` and grant per job." },
          { line: "ssh -o StrictHostKeyChecking=no deploy@$HOST", k: "mitm", why: "Without checking the host key, anyone who can redirect the connection receives your deploy. Store the server's key in a known_hosts secret." },
          { line: "on: [push, pull_request]   # with a deploy job", k: "pr", why: "A pull request runs the workflow with its own changes: it could change what gets deployed, or try to read secrets. Deploy only from main." },
          { line: "tags: ghcr.io/you/codearena-api:latest", k: "drift", why: "A moving tag answers \"what's running?\" with \"whatever was last pushed\". Tag with `${{ github.sha }}`." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(CI, c.k);
        return choice(rng, { genId: "drill-ci-risk", prompt: `In a deploy workflow: \`${c.line}\`. What's the risk?`, correct, wrong: rng.shuffle(wrong).slice(0, 3), explanation: c.why, docRef: L24 });
      },
    },
  ],
};

/* ── Lesson 25: observability ── */

const L25 = lessonRef("0025-observability", "Lesson 25: seeing production");
const SIGNAL = {
  log: "Search the structured logs for it",
  metric: "Graph and alert on a metric",
  ready: "Fail readiness, but keep it alive",
  restore: "Restore last night's dump somewhere safe",
} as const;

const observeDrill: Drill = {
  id: "observe",
  title: "Which tool answers it?",
  blurb: "Logs, metrics, health checks or backups: pick the one that answers each production question.",
  generators: [
    {
      id: "drill-observe-tool",
      title: "Which tool?",
      generate: (rng: Rng) => {
        const cases = [
          { q: "A user reports an error at 14:02 and sends the request id from the error page", k: "log", why: "One request, one story: filter the logs by `requestId`. Metrics aggregate; they can't tell you about one request." },
          { q: "You want to know when the 95th-percentile latency of `POST /submissions` goes above one second", k: "metric", why: "A histogram metric, an alert on its quantile. Logs could compute it, but slowly and expensively." },
          { q: "Redis restarted and the API can't enqueue for twenty seconds", k: "ready", why: "Stop sending it traffic until Redis is back; restarting the API wouldn't fix Redis." },
          { q: "Someone ran a migration that dropped a column with data in it", k: "restore", why: "Restore into a scratch database, then copy the lost data back. Never restore over production blindly." },
          { q: "The error rate doubled after the last deploy", k: "metric", why: "Rates over time are what metrics are for; then the logs tell you which errors." },
          { q: "You need every failed login for one account last week", k: "log", why: "Events about a specific user are log material. As a metric label, user ids would explode cardinality." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(SIGNAL, c.k);
        return choice(rng, { genId: "drill-observe-tool", prompt: `${c.q}. What do you reach for?`, correct, wrong, explanation: c.why, docRef: L25 });
      },
    },
    {
      id: "drill-observe-label",
      title: "A good label?",
      generate: (rng: Rng) => {
        const cases = [
          { l: "`route=\"/submissions/:id\"`", ok: true, why: "A handful of values: one per route." },
          { l: "`path=\"/submissions/8812\"`", ok: false, why: "One value per submission: unbounded." },
          { l: "`status=\"500\"`", ok: true, why: "A few dozen possible values at most." },
          { l: "`user_id=\"42\"`", ok: false, why: "One series per user: Prometheus's own example of what never to do." },
          { l: "`verdict=\"WRONG_ANSWER\"`", ok: true, why: "A small, fixed set of verdicts." },
          { l: "`request_id=\"edge-7f3a\"`", ok: false, why: "A new value on every request: it belongs in logs." },
          { l: "`language=\"PYTHON\"`", ok: true, why: "Three languages: bounded." },
        ] as const;
        const c = rng.pick(cases);
        return choice(rng, {
          genId: "drill-observe-label",
          prompt: `Is ${c.l} a good Prometheus label?`,
          correct: c.ok ? "Yes, its values are bounded" : "No, its values are unbounded",
          wrong: [c.ok ? "No, its values are unbounded" : "Yes, its values are bounded"],
          explanation: `${c.why} See [naming and labels](https://prometheus.io/docs/practices/naming/).`,
          docRef: L25,
        });
      },
    },
  ],
};

/* ── Lesson 26: STAR stories ── */

const L26 = lessonRef("0026-star-stories", "Lesson 26: telling the story");
const WEAK = {
  we: "It hides your part behind 'we'",
  number: "It claims a result without evidence",
  filler: "It's filler that says nothing concrete",
  vague: "It names no step you took",
} as const;
const STAR = ["Situation", "Task", "Action", "Result"] as const;

const starDrill: Drill = {
  id: "star",
  title: "Sharpen the story",
  blurb: "Place each sentence in its STAR part, and spot what an interviewer would mark down.",
  generators: [
    {
      id: "drill-star-weak",
      title: "What's weak?",
      generate: (rng: Rng) => {
        const cases = [
          { line: "We decided as a team to add a pids limit to the containers.", k: "we", why: "Whose idea, whose code? Say \"I proposed…\" or \"I wrote…\", and credit others by name where it's due." },
          { line: "After my changes, the judge became way faster.", k: "number", why: "How much faster, measured how? \"From 4.1 to 1.3 seconds per submission, measured over 500 runs.\"" },
          { line: "Basically, I did a lot of stuff on the backend side of things.", k: "filler", why: "Every word is padding. Name the thing you did." },
          { line: "I worked on the queue and improved how it handled jobs.", k: "vague", why: "Which step? \"I moved the claim into one UPDATE with a WHERE on the status, so two workers can't both win.\"" },
          { line: "We fixed the race condition in the refresh tokens.", k: "we", why: "Was it you? Then: \"I found the race with a concurrent test, and fixed it with one conditional UPDATE.\"" },
          { line: "The site ended up being much more reliable.", k: "number", why: "Reliable by what measure? Uptime, errors per day, a restore you timed?" },
          { line: "I handled the deployment part of the project.", k: "vague", why: "\"Handled\" hides the steps. Which ones did you build, and which decision was yours?" },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(WEAK, c.k);
        return choice(rng, { genId: "drill-star-weak", prompt: `In a STAR answer: "${c.line}" What would an interviewer mark down?`, correct, wrong, explanation: c.why, docRef: L26 });
      },
    },
    {
      id: "drill-star-part",
      title: "Which part?",
      generate: (rng: Rng) => {
        const cases = [
          { line: "CodeArena runs strangers' code on my server, so one escape would expose everything on it.", k: 0, why: "The Situation: the context that explains why the work mattered at all." },
          { line: "I had to make sure a submission could never touch the host, the network or another user's run.", k: 1, why: "The Task: your goal, and what success would mean." },
          { line: "I dropped every capability, set a seccomp profile, and wrote an attack test for each wall.", k: 2, why: "The Action: what you did, concretely. It should take most of the time." },
          { line: "All six attacks are contained, and each test fails if its wall is removed.", k: 3, why: "The Result: an outcome the interviewer could check, with numbers." },
          { line: "Users complained that the history page took several seconds past page 50.", k: 0, why: "The Situation: the context that made it worth fixing." },
          { line: "I replaced OFFSET with a keyset cursor, and proved it with EXPLAIN before and after.", k: 2, why: "The Action: what you did, with the evidence you gathered." },
        ] as const;
        const c = rng.pick(cases);
        const correct = STAR[c.k];
        return choice(rng, { genId: "drill-star-part", prompt: `"${c.line}" Which STAR part is this?`, correct, wrong: STAR.filter((p) => p !== correct), explanation: c.why, docRef: L26 });
      },
    },
  ],
};

/* ── Lesson 27: your system, out loud ── */

const L27 = lessonRef("0027-your-system-out-loud", "Lesson 27: your system, out loud");

const estimateDrill: Drill = {
  id: "estimate",
  title: "Back of the envelope",
  blurb: "The estimates a design interview expects in your head: rates, peaks, Little's law, storage.",
  generators: [
    {
      id: "drill-estimate",
      title: "Estimate it",
      generate: (rng: Rng) => {
        const dau = rng.pick([5000, 10000, 20000, 50000, 100000]);
        const per = rng.pick([2, 4, 5, 10]);
        const peakX = rng.pick([3, 5, 10]);
        const secs = rng.pick([2, 4, 6, 10]);
        const kb = rng.pick([2, 5, 10]);
        const day = dau * per;
        const avg = day / 86400;
        const qs = [
          { q: `${dau.toLocaleString("en")} daily users make ${per} submissions each. How many submissions per second on average? (One decimal is enough.)`, a: avg, how: `${day.toLocaleString("en")} a day ÷ 86,400 seconds ≈ ${avg.toFixed(2)}. A day has about 100,000 seconds: dividing by 10^5 gets you close in your head.` },
          { q: `${dau.toLocaleString("en")} daily users make ${per} submissions each, and the peak hour runs at ${peakX}× the average rate. How many submissions per second at peak?`, a: avg * peakX, how: `${avg.toFixed(2)} on average × ${peakX} ≈ ${(avg * peakX).toFixed(1)} per second.` },
          { q: `At peak, ${(avg * peakX).toFixed(1)} submissions arrive per second, and each holds a runner slot for ${secs} seconds. How many slots are busy at once?`, a: avg * peakX * secs, how: `Little's law: rate × time in the system = ${(avg * peakX).toFixed(1)} × ${secs} ≈ ${Math.round(avg * peakX * secs)}.` },
          { q: `${day.toLocaleString("en")} submissions a day, ${kb} KB each. How many GB of new data per year?`, a: (day * kb * 365) / 1e6, how: `${day.toLocaleString("en")} × ${kb} KB × 365 = ${((day * kb * 365) / 1e6).toFixed(0)} GB (1 GB ≈ 10^6 KB).` },
        ];
        const c = rng.pick(qs);
        return numeric({ genId: "drill-estimate", prompt: `${c.q} Type digits only, without commas.`, answer: c.a, tolerance: Math.max(0.05, c.a * 0.1), display: c.a < 10 ? c.a.toFixed(2) : String(Math.round(c.a)), explanation: `${c.how} Within 10% counts: estimates are about the order of magnitude.`, docRef: L27 });
      },
    },
  ],
};

export const SHIP_DRILLS: Drill[] = [serverDrill, composeDrill, httpsDrill, ciDrill, observeDrill, starDrill, estimateDrill];
