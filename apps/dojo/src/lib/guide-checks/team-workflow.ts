/**
 * Checks for content/supplements/team-workflow.md.
 * Conventional Commits spec and commitlint's types as cited in the guide (verified 2 Nov 2026).
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const teamWorkflowChecks: GuideCheckSet = {
  name: "Team Workflow guide",
  source: {
    label: "Conventional Commits 1.0.0",
    href: "https://www.conventionalcommits.org/en/v1.0.0/",
    note: "The spec behind every commit header in CodeArena: short, and worth reading once. Part 14 of this guide lists every pipeline problem we hit and its fix.",
  },
  terms: [
    "Shift left",
    "Git hook",
    "lint-staged",
    "commitlint",
    "Branch protection",
    "Squash merge",
    "Secret rotation",
    "Lockfile",
  ],
  checks: [
    {
      id: "pipeline",
      section: "Parts 1–5 · The pipeline, commits and hooks",
      questions: [
        {
          prompt: "Hooks already lint every commit locally. Why run the same checks again in CI?",
          options: [
            "CI runs the checks faster than any laptop",
            "Anyone can skip hooks; nobody can skip CI",
            "Hooks only ever check files that were deleted",
            "CI is the only place where ESLint works",
          ],
          correct: 1,
          why: "Local layers are for speed, server layers are for trust. `--no-verify` or `HUSKY=0` skips a hook on one laptop; CI on a protected `main` runs for everyone, every time.",
        },
        {
          prompt: "Which commit header follows Conventional Commits for a bug fix in the API?",
          options: [
            "Fixed the API session refresh bug today",
            "api/fix: keep the session after a refresh",
            "FIX: api session was lost after refresh",
            "fix(api): keep the session after a refresh",
          ],
          correct: 3,
          why: "`<type>(<scope>): <subject>`, lowercase type from the allowed list (`feat`, `fix`, `docs`, `test`, `refactor`…), the scope in parentheses, then a short imperative subject. commitlint rejects the other three.",
        },
      ],
      explain: "Explain \"shift left\" with the CodeArena pipeline: which check runs at which layer, and why each one sits where it does.",
    },
    {
      id: "merging",
      section: "Parts 6–11 · CI, PRs, review, merging, protection",
      questions: [
        {
          prompt: "A PR is squash-merged. What becomes the commit message on main?",
          options: [
            "The PR title, with the PR number added",
            "The very first commit message on the branch",
            "Every one of the commit messages, joined up",
            "The PR description, copied over word for word",
          ],
          correct: 0,
          why: "Squash merging lands one commit titled with the PR title plus `(#N)`. No local hook ever sees that title, which is why CI checks the PR title itself.",
        },
        {
          prompt: "After a squash merge, `git branch -d feature` says the branch isn't fully merged. Why?",
          options: [
            "The merge failed, and the work is still pending",
            "The branch has local changes you forgot to push",
            "GitHub made a new commit, so yours look unmerged",
            "Git refuses to delete any branch that was pushed",
          ],
          correct: 2,
          why: "Squash and rebase merges create new commits, so Git can't see that your commits made it in. Check that the PR says Merged, then delete with `-D` (or let `gh pr merge --delete-branch` do it).",
        },
      ],
      explain: "List what branch protection on `main` enforces in CodeArena, and why \"nobody on the bypass list\" matters.",
    },
    {
      id: "secrets",
      section: "Part 12 · Secrets and supply chain",
      questions: [
        {
          prompt: "You committed a real API key and pushed it. What's the first move?",
          options: [
            "Delete the file and push a new commit removing it",
            "Rewrite it out of the history, then force-push to main",
            "Rotate it: issue a new key and revoke the old",
            "Make the repo private until it's all been cleaned up",
          ],
          correct: 2,
          why: "A pushed secret is public forever: clones, forks and caches keep it. Rotating makes the leaked value worthless; cleaning the history comes after. Deleting the file in a new commit leaves the key in the old one.",
        },
        {
          prompt: "Why commit the lockfile and install it frozen?",
          options: [
            "Everyone gets the same versions, byte for byte",
            "The install runs faster than without a lockfile",
            "It stops packages from running their install scripts",
            "It hides the dependency versions from any attackers",
          ],
          correct: 0,
          why: "The lockfile pins every package, direct and transitive. A frozen install (CI included) fails instead of silently resolving different versions, so \"works on my machine\" can't come from drifting dependencies.",
        },
      ],
      explain: "Explain why install scripts are a supply-chain risk, and what pnpm 10's `onlyBuiltDependencies` changes.",
    },
  ],
};
