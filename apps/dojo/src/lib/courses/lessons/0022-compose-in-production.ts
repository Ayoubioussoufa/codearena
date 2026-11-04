import type { Lesson } from "../types";

const SERVICES = "https://docs.docker.com/reference/compose-file/services/";

export const lesson0022: Lesson = {
  slug: "0022-compose-in-production",
  number: 22,
  track: "ship",
  title: "Docker Compose in production",
  summary:
    "From the laptop file to the server file: pinned images, secrets out of git, one door to the internet, the socket in one place, health-gated start order, and logs that can't fill the disk.",
  minutes: 90,
  status: "ready",
  builds: "`docker-compose.prod.yml` for all seven services, checked rule by rule with `docker compose config`",
  lab: { dir: "0022-compose-in-production", writes: ["docker-compose.prod.yml", ".env.prod.example"], check: "bash check.sh" },
  reference: "ship",
  warmup: [
    { lesson: "0021-server-from-zero", question: 4 },
    { lesson: "0008-docker-hardened", question: 0 },
  ],
  words: ["image tag (pinning)", "environment interpolation", "health check", "depends_on condition", "internal network", "log rotation"],
  answers: [
    { id: "codearena", label: "Section 6: dev file vs prod file, line by line" },
    { id: "challenge", label: "Challenge: bring the data tier up for real (optional)" },
  ],
  quiz: [
    {
      prompt: "Why does only the proxy publish ports in the production file?",
      options: [
        "Docker allows only two published ports for each Compose project",
        "Published ports skip ufw, so whatever is published is public",
        "The proxy encrypts traffic, so other ports leak plain text",
        "Published ports are slower, since every packet is copied twice",
      ],
      correct: 1,
      why: "Lesson 21: Docker routes published ports before ufw's rules. Containers on the same Compose network already reach each other by service name (`postgres:5432`), so publishing anything but the proxy only opens doors to the internet.",
    },
    {
      prompt: "Why must the Docker socket be mounted into the worker, and nowhere else?",
      options: [
        "The socket accepts only one container's connection at a time",
        "Mounting the socket twice makes the Docker daemon restart itself",
        "Whoever controls the socket controls the whole host, as root",
        "Other services would then see all the worker's runner containers",
      ],
      correct: 2,
      why: "The socket is the Docker API: with it you can start a privileged container that mounts the host's filesystem. OWASP's Docker rule #1 is not to expose it, even to containers ([Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)). The worker needs it to start runners, so it's the one exception, and the reason the worker gets the most scrutiny.",
    },
    {
      prompt: "What does `${TAG:?set TAG}` do when `TAG` isn't set?",
      options: [
        "Compose refuses to run, and prints the message you wrote",
        "Compose uses an empty tag, so Docker pulls the latest",
        "Compose asks for the value on the terminal before starting",
        "Compose starts every service except the ones that need TAG",
      ],
      correct: 0,
      why: "`${VAR:?error}` means: the value if it's set and non-empty, otherwise stop with the error ([interpolation](https://docs.docker.com/reference/compose-file/interpolation/)). A deploy with a missing password or tag then fails before it starts, instead of starting broken.",
    },
    {
      prompt: "Why run migrations as a one-shot `migrate` service that `api` waits on with `service_completed_successfully`?",
      options: [
        "Prisma refuses to connect unless a migrate container is still running",
        "Migrations run faster in a container that has no other processes",
        "Compose deletes any service that exits, unless it is marked one-shot",
        "The app only starts once the database schema matches its code",
      ],
      correct: 3,
      why: `New code expecting a new column must not serve requests against the old schema. The condition makes Compose wait for the migration to exit with code 0 before starting the API, and a failed migration stops the deploy where you can see it ([depends_on](${SERVICES})).`,
    },
    {
      prompt: "Your containers log to json-file with no options. What happens over months?",
      options: [
        "They grow until the disk fills: the default size is unlimited",
        "Docker deletes them every night, keeping the last day of output",
        "They stop at one gigabyte, then the oldest lines are dropped",
        "They are kept in memory, and vanish when a container restarts",
      ],
      correct: 0,
      why: "The json-file driver's `max-size` defaults to -1, unlimited ([json-file driver](https://docs.docker.com/engine/logging/drivers/json-file/)). A chatty worker can fill a small VM's disk, and then Postgres can't write. `max-size` and `max-file` turn on rotation.",
    },
  ],
};
