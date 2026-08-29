/**
 * Auth & security — code-writing exercises. Imported by auth.ts.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";

const DOC = { slug: "phase-1-auth-data-frontend", label: "Phase 1 §B/§C — Tokens, hashing & validation" };

const zodSchema: Generator = {
  id: "auth-code-zod",
  title: "✍️ Write the register schema (Zod)",
  generate: () =>
    codeTask({
      genId: "auth-code-zod",
      prompt:
        "Write the Zod schema for POST /auth/register: `username` string 3–20 chars, `email` a valid email, `password` string of at least 8 chars.",
      language: "typescript",
      starter: `const registerSchema = z.object({\n  // fields\n});`,
      solution: `const registerSchema = z.object({\n  username: z.string().min(3).max(20),\n  email: z.string().email(),\n  password: z.string().min(8),\n});`,
      checks: [
        { re: "z\\.object\\(", label: "an object schema" },
        { re: "username\\s*:\\s*z\\.string\\(\\)[\\s\\S]*?min\\(3\\)", label: "username: min 3" },
        { re: "max\\(20\\)", label: "username: max 20" },
        { re: "email\\s*:\\s*z\\.string\\(\\)\\.email\\(\\)|z\\.email\\(\\)", label: "email validated as an email" },
        { re: "password\\s*:\\s*z\\.string\\(\\)[\\s\\S]*?min\\(8\\)", label: "password: min 8 chars" },
      ],
      explanation:
        "This schema runs **at the edge** — in a Nest 'pipe' or route handler, before any of your logic — and its `.parse(body)` hands back a *typed* value. Past that boundary, 'password is at least 8 chars' is a fact the compiler relies on, not a hope. The same rules also live in your AuthForm in the browser for nice UX, but the server re-parses regardless (the frontend is an untrusted client). One schema → one inferred type (`z.infer`) → zero drift between your validation and your types.",
      docRef: DOC,
    }),
};

const hashFlow: Generator = {
  id: "auth-code-hash",
  title: "✍️ Store a password correctly",
  generate: () =>
    codeTask({
      genId: "auth-code-hash",
      prompt:
        "Write the core of the register handler: hash the incoming password with bcrypt (work factor 10–14) and create the user storing ONLY the hash (field `passwordHash`). Never a fast hash, never plaintext.",
      language: "typescript",
      starter: `async function register(input) {\n  // hash + create\n}`,
      solution: `async function register(input) {\n  const passwordHash = await bcrypt.hash(input.password, 12);\n  return prisma.user.create({\n    data: { email: input.email, passwordHash },\n  });\n}`,
      checks: [
        { re: "bcrypt\\.hash\\(", label: "hashes with bcrypt" },
        { re: "bcrypt\\.hash\\([^,]+,\\s*1[0-4]\\b", label: "explicit work factor 10–14" },
        { re: "await\\s+bcrypt", label: "awaits the (deliberately slow) hash" },
        { re: "passwordHash", label: "stores the hash field, not the password" },
        { re: "md5|sha1|sha256", flags: "i", expect: false, label: "no fast hashes anywhere" },
      ],
      explanation:
        "bcrypt's work factor is the whole defense: cost 12 ≈ 250ms per guess, which turns a leaked table from \"cracked overnight on a GPU\" into \"economically pointless\" — SHA-256 exists to be fast, which is exactly the wrong property here. The salt is generated and embedded in the hash automatically. Naming the column `passwordHash` isn't cosmetic either: it makes `data: { password }` look as wrong as it is at every call site.",
      docRef: DOC,
    }),
};

const refreshCookie: Generator = {
  id: "auth-code-cookie",
  title: "✍️ Set the refresh-token cookie",
  generate: () =>
    codeTask({
      genId: "auth-code-cookie",
      prompt:
        "Write the `res.cookie(…)` call that stores the refresh token so that (1) page JavaScript can never read it, (2) it only travels over HTTPS, (3) cross-site requests won't carry it, and (4) it's only sent to the refresh endpoint path.",
      language: "typescript",
      starter: `res.cookie("refreshToken", token, {\n  // flags\n});`,
      solution: `res.cookie("refreshToken", token, {\n  httpOnly: true,\n  secure: true,\n  sameSite: "strict",\n  path: "/auth/refresh",\n});`,
      checks: [
        { re: "httpOnly\\s*:\\s*true", label: "`httpOnly: true` — invisible to document.cookie (XSS can't steal it)" },
        { re: "secure\\s*:\\s*true", label: "`secure: true` — HTTPS only" },
        { re: "sameSite\\s*:\\s*[\"'](strict|lax)[\"']", label: "`sameSite` — blocks cross-site sends (CSRF)" },
        { re: "path\\s*:\\s*[\"']/auth", label: "scoped to the refresh path" },
        { re: "localStorage", expect: false, label: "not localStorage" },
      ],
      explanation:
        "Each flag closes one attack lane: `httpOnly` takes the token out of XSS's reach entirely; `secure` stops plaintext leaks on the wire; `sameSite` means a hostile page can't make the browser attach it (the CSRF counter for cookie storage); and `path` shrinks the blast radius to a single endpoint instead of riding on every request. This is the standard split from the guide: long-lived refresh token in a locked-down cookie, short-lived access token in memory.",
      docRef: DOC,
    }),
};

export const authCodeGens: Generator[] = [zodSchema, hashFlow, refreshCookie];
