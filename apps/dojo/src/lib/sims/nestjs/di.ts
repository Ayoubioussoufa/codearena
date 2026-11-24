/** Boot order: construct every class once, after everything it needs. */
import { at, type Trace } from "../engines";

export interface DiClass {
  name: string;
  needs: readonly string[];
}
const APPS: readonly { name: string; classes: readonly DiClass[] }[] = [
  {
    name: "1. A chain",
    classes: [
      { name: "AuthController", needs: ["AuthService"] },
      { name: "AuthService", needs: ["UsersService"] },
      { name: "PrismaService", needs: [] },
      { name: "UsersService", needs: ["PrismaService"] },
    ],
  },
  {
    name: "2. A diamond",
    classes: [
      { name: "SubmissionsController", needs: ["SubmissionsService"] },
      { name: "SubmissionsService", needs: ["PrismaService", "JudgeQueue"] },
      { name: "LeaderboardReader", needs: ["RedisService"] },
      { name: "PrismaService", needs: ["ConfigService"] },
      { name: "JudgeQueue", needs: ["RedisService"] },
      { name: "RedisService", needs: ["ConfigService"] },
      { name: "ConfigService", needs: [] },
    ],
  },
  {
    name: "3. Something's wrong",
    classes: [
      { name: "UsersController", needs: ["UsersService"] },
      { name: "UsersService", needs: ["PrismaService", "MailService"] },
      { name: "MailService", needs: ["ConfigService", "UsersService"] },
      { name: "PrismaService", needs: ["ConfigService"] },
      { name: "ConfigService", needs: [] },
    ],
  },
];

export interface DiState {
  classes: readonly DiClass[];
  built: readonly string[];
  gaveUp: boolean;
}
export const STUCK = "stuck";
const ready = (s: DiState) => s.classes.filter((c) => !s.built.includes(c.name) && c.needs.every((n) => s.built.includes(n)));

export const diTrace: Trace<DiState> = {
  levels: APPS.map((a) => a.name),
  start: (level) => ({ classes: at(APPS, level).classes, built: [], gaveUp: false }),
  moves: (s) => [...s.classes.map((c) => ({ id: c.name, label: c.name })), { id: STUCK, label: "It can't boot" }],
  correct(s) {
    if (diTrace.done(s)) return [];
    const r = ready(s).map((c) => c.name);
    return r.length > 0 ? r : [STUCK];
  },
  apply: (s, move) => (move === STUCK ? { ...s, gaveUp: true } : { ...s, built: [...s.built, move] }),
  why(s, move) {
    if (move === STUCK) return `Not so fast: ${ready(s)[0]?.name ?? "something"} has everything it needs.`;
    if (s.built.includes(move)) return `${move} already exists. Providers are singletons by default: everyone gets that same one.`;
    const missing = (s.classes.find((c) => c.name === move)?.needs ?? []).filter((n) => !s.built.includes(n));
    return `${move}'s constructor needs ${missing.join(" and ")} first.`;
  },
  say: (s) =>
    s.gaveUp
      ? "Right. Each waits for the other, so Nest stops with an error. Move what they share into a third class."
      : s.built.length === s.classes.length
        ? `Booted: ${s.classes.length} classes, ${s.classes.length} objects.`
        : `${s.built.length} of ${s.classes.length} built. What can be constructed now?`,
  done: (s) => s.gaveUp || s.built.length === s.classes.length,
};
