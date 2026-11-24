import type { PickItem, PickLevel } from "../engines";

/* ── Blast radius: one module, five changes ── */
const FILES: readonly { id: string; label: string }[] = [
  { id: "ctrl", label: "http/auth.controller.ts" },
  { id: "dto", label: "http/dto/register.dto.ts" },
  { id: "svc", label: "application/auth.service.ts" },
  { id: "dom", label: "domain/password-policy.ts" },
  { id: "port", label: "ports/users.repository.ts" },
  { id: "prisma", label: "adapters/prisma-users.repository.ts" },
  { id: "hasher", label: "adapters/argon2-password.hasher.ts" },
  { id: "module", label: "auth.module.ts (the wiring)" },
];
const files = (why: Record<string, string>): PickItem[] => FILES.map((f) => ({ ...f, why: why[f.id] ?? "Untouched: it doesn't know." }));

export const BLAST: readonly PickLevel[] = [
  { name: "1. The ORM breaks", story: "A new major version of Prisma renames findUnique. Which files do you open?", items: files({ prisma: "The only file that speaks Prisma." }), right: ["prisma"] },
  { name: "2. A new rule", story: "Passwords must now have 12 characters instead of 8. The rule is a function in the domain, and the service already calls it.", items: files({ dom: "True on paper, so it lives here.", dto: "The DTO checks that it's a string. The length is a business rule, not a shape." }), right: ["dom"] },
  { name: "3. A new hasher", story: "Replace Argon2 with another algorithm, behind the same PasswordHasher port, in a new file that takes the old one's place.", items: files({ hasher: "Replaced by the new adapter.", module: "One line chooses which class serves the token." }), right: ["hasher", "module"] },
  { name: "4. A new field", story: "Registration now asks for a country, and it must be stored.", items: files({ dto: "The client sends it.", svc: "The use case passes it on.", port: "The need changed: create() takes one more thing.", prisma: "It must be written somewhere.", ctrl: "It already hands the whole DTO to the service." }), right: ["dto", "svc", "port", "prisma"] },
  { name: "5. A new URL", story: "POST /auth/register becomes POST /users. Only the address changes.", items: files({ ctrl: "HTTP is this layer's business, and nobody else's." }), right: ["ctrl"] },
];

/* ── Audit the arrows: which imports break the rule? ── */
export const ARROWS: readonly PickLevel[] = [
  {
    name: "The audit",
    story: "Each line is one file importing another. Flag every import that points outward, from stable code to volatile code.",
    items: [
      { id: "a", label: "domain/verdict.ts → domain/test-result.ts", why: "Inside the same layer: fine." },
      { id: "b", label: "application/submit.service.ts → @prisma/client", why: "Bad: the use case now speaks the ORM's language." },
      { id: "c", label: "adapters/prisma-problems.repository.ts → ports/problems.repository.ts", why: "Fine, and the whole trick: the adapter points at your interface." },
      { id: "d", label: "ports/problems.repository.ts → adapters/prisma-types.ts", why: "Bad: the port is now Prisma with extra steps." },
      { id: "e", label: "http/problems.controller.ts → application/problems.service.ts", why: "Fine: the outer layer calls inward." },
      { id: "f", label: "domain/contest.ts → @nestjs/common (ConflictException)", why: "Bad: a rule that would be true on paper now knows HTTP." },
      { id: "g", label: "application/submit.service.ts → ports/judge-queue.ts", why: "Fine: it states a need and uses it." },
      { id: "h", label: "application/submit.service.ts → http/dto/create-submission.dto.ts", why: "Bad: the use case depends on the shape of one HTTP request." },
      { id: "i", label: "adapters/bullmq-judge.queue.ts → bullmq", why: "Fine: that's what adapters are for." },
      { id: "j", label: "domain/rating.ts → adapters/redis-leaderboard.ts", why: "Bad: the centre reaches all the way out." },
      { id: "k", label: "ports/clock.ts → (nothing)", why: "Fine: a need, stated alone." },
      { id: "l", label: "submissions.module.ts → adapters/bullmq-judge.queue.ts", why: "Fine: wiring is the one place that knows everyone." },
    ],
    right: ["b", "d", "f", "h", "j"],
  },
];

/* ── What gets out: the adapter's return, three ways ── */
const COLUMNS: readonly { id: string; label: string }[] = [
  { id: "id", label: "id" },
  { id: "username", label: "username" },
  { id: "rating", label: "rating" },
  { id: "passwordHash", label: "passwordHash" },
  { id: "resetToken", label: "resetToken" },
];
const ROW = "// the row: { id, username, rating, passwordHash, resetToken }\n// the type promises: interface User { id; username; rating }\nasync findByName(name: string): Promise<User | null> {\n  const row = await this.prisma.user.findUnique({ where: { username: name } });\n  if (!row) return null;\n";
const cols = (out: readonly string[]): PickItem[] => COLUMNS.map((c) => ({ ...c, why: out.includes(c.id) ? "It's in the object, so it's in the JSON." : "Nobody named it, so it stayed behind." }));
export const BOUNDARY: readonly PickLevel[] = [
  { name: "1. Return the row", story: "It compiles. Which fields does the client receive?", exhibit: `${ROW}  return row;\n}`, items: cols(COLUMNS.map((c) => c.id)), right: COLUMNS.map((c) => c.id) },
  { name: "2. Leave one out", story: "It compiles too. Which fields does the client receive?", exhibit: `${ROW}  const { passwordHash, ...rest } = row;\n  return rest;\n}`, items: cols(["id", "username", "rating", "resetToken"]).map((c) => (c.id === "passwordHash" ? { ...c, why: "You remembered this one, and forgot the next. The column added next month gets out too." } : c)), right: ["id", "username", "rating", "resetToken"] },
  { name: "3. Name them", story: "And now?", exhibit: `${ROW}  return {\n    id: row.id,\n    username: row.username,\n    rating: row.rating,\n  };\n}`, items: cols(["id", "username", "rating"]), right: ["id", "username", "rating"] },
];
