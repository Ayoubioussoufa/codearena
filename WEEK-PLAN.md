# Study Plan — Jul 19 → mid-Aug 2026, with the road to October

**Pacing philosophy:** *accelerate through basics and re-learning, decelerate
on new concepts.* React/Tailwind: push hard. NestJS, hexagonal architecture,
advanced TS, sandboxing: slow on purpose — type every example, do every
exercise. Depth on new material is the investment; speed on familiar material
is how you afford it.

**Hours:** weekdays ~3–4 h · weekend days 7–8 h.

**Daily skeleton (every day):**
1. ① Dojo `/practice/review` warm-up — 15 min, clears the SRS queue. Never cut.
2. ② Main block — the day's focus below.
3. ③ **Java + Spring Boot — 30 min** (`java-spring-boot.md` supplement, one
   section + its dojo drills). Small daily dose; it compounds and feeds the
   Java problem-solving in travel week.
4. ④ DSA — **reduced to 1 problem/day weekdays, 2/day weekends** (deep, not
   rushed: pattern section first, re-derive the template from memory). Volume
   is deliberately parked for travel week, which is a DSA immersion.

Servers: `pnpm dev:web` (:3000) · `pnpm dev:dojo` (:3002).

---

## Kickstart — TODAY, Sunday 19 (7–8 h)

- [ ] `tailwind-responsive-design.md` supplement (≈1 h).
- [ ] **Home #1 + #2** — verify by resizing, both themes (≈1.5 h).
- [ ] Forms/state sections of `react-fundamentals.md` (≈1 h).
- [ ] **Auth #1** controlled inputs + **Auth #2** validation (≈2.5 h).
- [ ] Java ③: supplement intro section. DSA ④: Arrays & Hashing section + #1–2.

---

# WEEK 1 — Mon 20 → Sun 26 Jul · ACCELERATE (all 14 web gaps)

Goal: the **entire** `apps/web` practice map done and verified by Sunday.

- **Mon 20** — **Auth #3** (submit/loading/error; triggers `wrongpass`,
  `taken@codearena.dev`) → then study the finished `useActionState` forms
  (`ProfileForm`/`PasswordForm`) and compare. DSA: A&H #3.
- **Tue 21** — **Problems page part 1**: fetch, visible loading (~700 ms),
  render list. DSA: A&H #4.
- **Wed 22** — **Problems page part 2**: search + filter + sort, composing.
  Verify + tick. DSA: A&H #5.
- **Thu 23** — **Workspace #1 + #2**: `WorkspaceProvider`, wire
  toolbar/editor/output. Verify: language-switch survival, empty/non-empty
  Run, mashed Run, Reset. DSA: A&H #6.
- **Fri 24** — **Leaderboard #1 + #2** (useMemo): "Force re-render" must not
  fire your logs; sort switch must not change ranks. DSA: A&H #7.
- **Sat 25 · 7–8 h** — **Profile #1** (26-week heatmap, buckets, tooltips,
  scrolls inside its card) + **Profile #2** (streaks; current ≠ longest by
  design). Evening: Phase 0 Part A on-ramp (1 h, read + type only).
  DSA: A&H #8–9.
- **Sun 26 · 7–8 h** — **Settings #1** (avatar: ref picker, size/type
  validation, object-URL cleanup) + **Settings #2** (type-to-confirm
  `amani_dev`). **Full verification sweep of all 14 gaps**, tick
  `PRACTICE.md`. `/practice/mixed` session. Retro. DSA: A&H #10 → done.

**✅ Done Sun 26:** all 14 `PRACTICE.md` items verified (both themes) · both
React/Tailwind supplements read · Arrays & Hashing complete · Java supplement
~⅓ in · review queue 7/7.

---

# WEEK 2 — Mon 27 Jul → Sun 2 Aug · DECELERATE (Phase 0 guide: NestJS & friends)

All new concepts. Guide rule is law: type every example, never copy-paste, do
the exercises. DSA this week: Two Pointers, 1/day.

- **Mon 27 – Tue 28 — Part A: TypeScript type-level programming** (generics,
  conditional/mapped, narrowing). Exercises Tue.
- **Wed 29 – Thu 30 — Part B: NestJS** — modules/providers/DI. THE core new
  concept; two full days, build the mini-app alongside the text.
- **Fri 31 — Part C: Architecture** — hexagonal, repositories, SOLID, DDD.
  After reading, redraw the diagrams from memory.
- **Sat 1 · 7–8 h — Part D + worked example** — monorepo, Docker, Compose,
  then the complete mini NestJS app end-to-end, typed out.
- **Sun 2 · 7–8 h — Self-quiz cold + remaining exercises + mastery
  checklist.** Gaps found → Monday's first job.

**✅ Done Sun 2 Aug:** Phase 0 worked, not skimmed (quiz + exercises) ·
mastery gaps listed · Two Pointers complete (20 DSA total) · Java ~⅔ in.

---

# WEEK 3 — Mon 3 → Sun 9 Aug · BUILD Phase 0, STUDY Phase 1

Understanding → ability: build the real `apps/api` skeleton, then load
Phase 1 knowledge before travel. DSA this week: Sliding Window, 1/day.

- **Mon 3** — Close Phase 0 mastery-checklist gaps (morning). Scaffold
  `apps/api`: NestJS app in the monorepo, module layout mirroring bounded
  contexts, strict TS config, Docker Compose service wired.
- **Tue 4** — Domain core: entities + repository **ports** (interfaces) for
  the first two contexts (users, problems), in-memory adapters, DI wiring.
  Unit tests against the ports.
- **Wed 5** — First HTTP slice end-to-end: controller → service → repo for
  problems list/detail; DTO validation; e2e smoke test hitting the running
  container.
- **Thu 6** — Hexagonal audit: dependencies point inward only; swap an
  adapter to prove the ports seal. Compose healthchecks. **Phase 0 build
  done-check against its mastery checklist.**
- **Fri 7** — Buffer for spillover. Then **Phase 1 guide** starts: relational
  DBs, transactions/ACID, indexes & EXPLAIN (slow pace — new concepts).
- **Sat 8 · 7–8 h** — Phase 1 guide: cursor pagination, N+1, the complete
  Prisma-schema worked example **typed out**; then password hashing, JWT,
  refresh-token rotation, XSS/CSRF.
- **Sun 9 · 7–8 h** — Phase 1 guide: Zod validation, TanStack Query
  server-state; self-quiz + exercises. **Pack the travel kit** (see below).
  Retro; firm up travel-week problem list.

**✅ Done Sun 9 Aug:** `apps/api` Phase-0 skeleton running in Docker with one
tested end-to-end slice · Phase 1 guide worked (quiz + exercises) · Sliding
Window complete (30 DSA total) · Java supplement finished → switch the daily
30 min to writing small Spring Boot code.

---

# WEEK 4 — Mon 10 → Sun 16 Aug · TRAVEL — DSA + System Design immersion

Solely DSA and system design; laptop-only, works offline except the AI
teacher. **Travel kit (prep Sun 9):** dojo runs locally (`pnpm dev:dojo`);
progress is in the browser's localStorage — use the same browser/profile all
week; `ANTHROPIC_API_KEY` set if you want teacher mocks on hotel wifi.

Daily shape (adjust to travel reality, ~4–6 h):
- **DSA block (2–3 h):** 3–4 problems/day in the dojo (TS), registry order:
  **Stack → Monotonic Stack & Queue → Binary Search**. Pattern section
  before each category; re-derive templates from memory.
- **Java re-solve (45 min):** redo 1–2 of the day's problems **in Java** in a
  scratch file — same logic, Java idioms (collections, streams). This is the
  "solving in Java and TypeScript" goal, and it cashes in the daily 30-min
  Java habit.
- **System design block (1.5–2 h):** one section/day of
  `system-design-fundamentals.md` + its dojo drills; every other day a
  **teacher mock** (`system-design` interview mode) on the section just
  studied.
- Review queue daily, as always.

**✅ Done Sun 16 Aug:** Stack + Monotonic + Binary Search complete (**60 DSA
problems**, 6/20 categories) · system-design supplement fully worked + ≥3
mock interviews · ≥8 problems re-solved in Java.

---

# THE ROAD TO OCTOBER (calibration — revisit every Sunday retro)

**Mid-Aug → end Aug (weeks 5–6): finish "frontend/backend".**
- Week 5: **build Phase 1** — Prisma + Postgres for real, auth end-to-end
  (hashing, JWT + refresh rotation), wire `apps/web` to the real API with
  TanStack Query.
- Week 6: **Phase 2 guide (slow — sandboxing/queues are new) + build** the
  untrusted-code runner, BullMQ pipeline, WebSocket streaming.
- **Milestone Sun 30 Aug: a working product** — sign up, browse problems,
  submit code, sandboxed execution, results streamed. That, deployed, is the
  hirable core. **Phases 3–6 (rating math, reco, contests, analytics) are
  deliberately demoted to stretch/September material** — trying to cram them
  before September would break the depth rule.

**September: hirability layer.**
- **Cloud:** deploy the stack (containers → a cloud host, CI/CD, domain,
  HTTPS, monitoring basics). A deployed URL beats two more phases.
- **Security:** harden what's live — run a security review of your own auth
  and sandbox (Phase 2/6 guide material applied, not re-studied).
- **LLM:** one shipped AI feature (Phase 7 territory — e.g. an AI hint
  endpoint on problems), built on the Claude API like the dojo teacher.
- Ongoing: DSA continues at cruise (Linked List → Trees → DFS/BFS…),
  1–2/day; pick one or two Phase 3–6 topics *if* ahead of schedule.
- Late Sept: pivot the daily 30-min slot to `morocco-internship-playbook.md`
  + `cs-fundamentals.md` + `aptitude-reasoning.md`; CV + portfolio pass.

**October: applications + interviews.** Teacher mock modes
(amazon-behavioral, coding-interview, system-design) 3×/week; apply in
volume; keep DSA warm via `/practice/review` — the SRS queue you've fed since
July is now the payoff.

---

**Rules of the road**
- A day collapses → push the main block, cut DSA first, never the review
  warm-up (nor, now, the 30-min Java slot — small habits die quietly).
- New material = slow lane, by design. Familiar material = fast lane, no
  guilt. If a "new" topic feels fast, it's fine to accelerate — the limit is
  comprehension, not the calendar.
- Don't snack on later guides or interview supplements early; they're
  scheduled, not forbidden.
