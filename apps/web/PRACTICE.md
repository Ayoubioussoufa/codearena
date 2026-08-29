# CodeArena — Practice Map

The app runs fully (`pnpm dev:web` from the repo root → http://localhost:3000)
with placeholder behaviour wherever a TODO is pending. Search the codebase for
`TODO(practice` to list every gap. Check items off as you go.

Palette: **blue** primary (`blue-600`/`blue-500`, `sky` accents) on **slate**
neutrals, light + dark via the `.dark` class strategy.

## Page → skill → files

| Page | Skill focus | Files with TODOs | Gaps |
|---|---|---|---|
| Home `/` | Tailwind responsive layout (grid/flex, breakpoints) | `src/app/page.tsx` | 2 |
| Login `/login` + Register `/register` | Auth forms: controlled inputs, validation, submit/loading/error | `src/components/auth/AuthForm.tsx` | 3 |
| Problems `/problems` | React hooks: useState/useEffect fetch + filter/sort | `src/app/problems/page.tsx` | whole page (yours from scratch) |
| Problem detail `/problems/[slug]` | Component composition + React context | `src/components/workspace/WorkspaceContext.tsx`, then `src/components/workspace/EditorPanel.tsx` | 2 |
| Leaderboard `/leaderboard` | Derived state + useMemo | `src/components/leaderboard/LeaderboardTable.tsx` | 2 |
| Profile `/profile` | Calendar data → UI (heatmap grid + streak derivation) | `src/components/profile/ActivityHeatmap.tsx`, `src/components/profile/StreakCards.tsx` | 2 |
| Settings `/settings` | Refs & file APIs; modal confirmation flow | `src/components/settings/AvatarUploader.tsx`, `src/components/settings/DeleteAccount.tsx` | 2 |

## Checklist

- [ ] Home #1 — stats strip: 2×2 on phones, one even row from `md:`
- [ ] Home #2 — features grid: 1 → 2 → 3 columns, equal-height cards
- [ ] Auth #1 — controlled inputs
- [ ] Auth #2 — validation + per-field errors (`<FieldError>` slots are ready)
- [ ] Auth #3 — submit → `authenticate()`, loading, API error banner, redirect
- [ ] Problems — the entire page (see the TODO header in the file)
- [ ] Workspace #1 — implement `WorkspaceProvider` (do this before #2)
- [ ] Workspace #2 — wire toolbar/editor/output through the context hook
- [ ] Leaderboard #1 — memoized ranked + sorted rows
- [ ] Leaderboard #2 — memoized summary stats
- [ ] Profile #1 — activity heatmap grid (26 weeks, intensity buckets, tooltips)
- [ ] Profile #2 — current + longest streak derived from activity
- [ ] Settings #1 — avatar upload: ref-triggered picker, validation, object-URL preview + cleanup
- [ ] Settings #2 — delete account: type-to-confirm modal, pending state, redirect

## How to verify each

- **Home** — resize the window across `sm`/`md`/`lg`; check both themes.
- **Auth** — error path triggers are documented in `src/lib/api.ts`
  (login with password `wrongpass`; register with `taken@codearena.dev`).
- **Problems** — loading state is visible because `getProblems()` takes ~700 ms;
  search + filter + sort must compose.
- **Workspace** — switch languages (edits must survive switching away/back),
  Run with empty vs. non-empty code, mash Run to check stale-result handling,
  Reset restores starter code.
- **Leaderboard** — click "Force re-render": a `console.log` inside your
  memoized computations must NOT fire; switching sort must not change ranks.
- **Profile** — the mock activity guarantees a live streak (last 12 days) and a
  38-day hot stretch mid-year, so current ≠ longest; hover cells for tooltips;
  shrink the window — the heatmap must scroll inside its card, not the page.
- **Settings** — avatar: try a >2 MB file and a non-image (both must show an
  error), then a normal image, then Remove; delete flow: the confirm button
  stays disabled until you type `amani_dev` exactly; password form rejects
  current password `wrongpass`; profile form rejects username `admin`.

## Deliberately implemented for you (reference material)

Theme system (`layout.tsx` + `ThemeToggle`), responsive navbar with mobile
menu, hero/CTA sections on the home page (reference Tailwind patterns), all
presentational workspace components (props in, callbacks out), mock API with
latency + failure triggers (`src/lib/api.ts`), full type layer
(`src/lib/types.ts`), profile page shell (`SolvedBars`, `SubmissionsTable`,
`Avatar`), settings `ProfileForm` + `PasswordForm` — complete examples of the
**React 19 `useActionState` form idiom** (a different pattern from your
AuthForm exercise; study them after finishing Auth #1–#3), contests page with
live countdowns (`Countdown` shows interval-based effects done lint-clean),
custom 404, and the problem-workspace loading skeleton.
