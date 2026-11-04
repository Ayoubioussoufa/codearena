/**
 * Drills for the sandbox track, lessons 5 to 10.
 */
import type { Rng } from "../engine/rng";
import { choice, numeric } from "../engine/helpers";
import { type Drill, lessonRef, pickFrom } from "./drill-kit";

/* ── Lesson 5: namespaces ── */

const L5 = lessonRef("0005-namespaces", "Lesson 5: namespaces");

const NS_RESOURCES = [
  { what: "which hostname `hostname` prints", ns: "uts", why: "The UTS namespace (named after the old `utsname` structure) holds the hostname and domain name." },
  { what: "which processes `ps` lists, and what number each has", ns: "pid", why: "A PID namespace has its own numbering, starting at 1, and only shows its own processes." },
  { what: "which network interfaces exist, and where packets can go", ns: "net", why: "A network namespace has its own interfaces, routes and firewall; a new one has only a loopback." },
  { what: "which filesystems are mounted where", ns: "mnt", why: "A mount namespace has its own mount table: mounting `/proc` or a tmpfs inside doesn't touch the host's." },
  { what: "who counts as root, and which user IDs exist", ns: "user", why: "A user namespace maps IDs: 0 inside can be 1000 outside, with root's powers only over the namespace's own resources." },
  { what: "which System V message queues and shared memory exist", ns: "ipc", why: "An IPC namespace isolates System V IPC objects and POSIX message queues." },
] as const;
const NS_NAMES = {
  uts: "the UTS namespace",
  pid: "the PID namespace",
  net: "the network namespace",
  mnt: "the mount namespace",
  user: "the user namespace",
  ipc: "the IPC namespace",
} as const;

const PID1_OPTIONS = {
  ignored: "Nothing happens: the signal is ignored",
  dies: "It dies, and everything inside too",
  others: "The kernel kills every other process",
  handler: "Its handler runs, exactly as usual",
} as const;

const namespacesDrill: Drill = {
  id: "namespaces",
  title: "What can the box see?",
  blurb: "Which namespace hides what, how PID 1 behaves, and how user IDs map: new cases every round.",
  generators: [
    {
      id: "drill-ns-which",
      title: "Which namespace hides it?",
      generate: (rng: Rng) => {
        const r = rng.pick(NS_RESOURCES);
        const others = rng.sample(
          (Object.keys(NS_NAMES) as (keyof typeof NS_NAMES)[]).filter((k) => k !== r.ns),
          3,
        );
        return choice(rng, {
          genId: "drill-ns-which",
          prompt: `Your box should have its own view of ${r.what}. Which namespace gives it that?`,
          correct: NS_NAMES[r.ns],
          wrong: others.map((k) => NS_NAMES[k]),
          explanation: `${r.why} See [namespaces(7)](https://man7.org/linux/man-pages/man7/namespaces.7.html).`,
          docRef: L5,
        });
      },
    },
    {
      id: "drill-ns-pid1",
      title: "PID 1's rules",
      generate: (rng: Rng) => {
        const cases = [
          { s: "receives SIGTERM from another process in the same namespace", k: "ignored", why: "Inside its namespace, init only receives signals it has a handler for. A shell with no handler ignores it." },
          { s: "receives SIGTERM forwarded by `docker run` from the host", k: "ignored", why: "From an ancestor namespace, signals other than SIGKILL and SIGSTOP still need a handler: this is I-17's hang." },
          { s: "receives SIGKILL from the host", k: "dies", why: "SIGKILL from an ancestor namespace is forced through, and when init dies the kernel kills the whole namespace." },
          { s: "exits normally while three background processes are still running", k: "others", why: "When the init of a PID namespace ends, the kernel sends SIGKILL to every other process in it: nothing outlives PID 1." },
          { s: "exits while a process inside has called `setsid()`", k: "others", why: "`setsid()` changes the session and process group, not the PID namespace. When PID 1 ends, it's killed with the rest: lesson 2's hole, closed." },
          { s: "has installed a handler for SIGTERM, and receives SIGTERM", k: "handler", why: "With a handler installed, init receives the signal like any process. That's why real container inits (like `tini`) handle SIGTERM." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(PID1_OPTIONS, c.k);
        return choice(rng, {
          genId: "drill-ns-pid1",
          prompt: `Inside a box, PID 1 is a shell with no signal handlers of its own (unless the case says otherwise). It ${c.s}. What happens?`,
          correct,
          wrong,
          explanation: `${c.why} See [pid_namespaces(7)](https://man7.org/linux/man-pages/man7/pid_namespaces.7.html).`,
          docRef: L5,
        });
      },
    },
    {
      id: "drill-ns-uidmap",
      title: "Reading a uid_map",
      generate: (rng: Rng) => {
        const outsideStart = rng.pick([1000, 1001, 100000, 231072]);
        const range = outsideStart >= 100000 ? 65536 : 1;
        const inside = range === 1 ? 0 : rng.pick([0, 1, 1000, 65534]);
        return numeric({
          genId: "drill-ns-uidmap",
          prompt: `A box's \`/proc/<pid>/uid_map\` reads \`0 ${outsideStart} ${range}\`. A process inside runs as uid ${inside} and creates a file. Which uid owns that file, seen from the host?`,
          answer: outsideStart + inside,
          explanation: `Each line is \"inside-start outside-start count\": uid ${inside} inside is ${outsideStart} + ${inside} = ${outsideStart + inside} outside. The kernel stores the outside uid on disk, so the host sees the file as owned by ${outsideStart + inside}.`,
          docRef: L5,
        });
      },
    },
  ],
};

/* ── Lesson 6: cgroups ── */

const L6 = lessonRef("0006-cgroups", "Lesson 6: cgroups");
const V2 = "https://docs.kernel.org/admin-guide/cgroup-v2.html";

const COUNTER_OPTIONS = {
  oom: "the oom_kill line of memory.events",
  pids: "the max line of pids.events",
  cpu: "the usage_usec line of cpu.stat",
  procs: "the PID list in cgroup.procs",
} as const;
const LIMIT_OPTIONS = {
  memory: "The OOM killer sends it SIGKILL",
  pids: "Its next fork fails with EAGAIN",
  cpu: "It keeps running, but more slowly",
  pause: "The kernel pauses it until restart",
} as const;

const cgroupsDrill: Drill = {
  id: "cgroups",
  title: "Limits, counters, and the CPU arithmetic",
  blurb: "What each limit does when it's hit, which file tells you, and how much CPU a quota buys.",
  generators: [
    {
      id: "drill-cg-cpu",
      title: "cpu.max arithmetic",
      generate: (rng: Rng) => {
        const period = rng.pick([100000, 50000]);
        const pct = rng.pick([10, 20, 25, 50, 75]);
        const quota = (period * pct) / 100;
        const wall = rng.pick([1, 2, 4, 10]);
        const cpuMs = wall * 1000 * (pct / 100);
        return numeric({
          genId: "drill-cg-cpu",
          prompt: `\`cpu.max\` reads \`${quota} ${period}\`. A single-threaded program spins for ${wall} s of wall-clock time. About how many milliseconds of CPU time does it get?`,
          answer: cpuMs,
          tolerance: cpuMs * 0.05,
          explanation: `Quota ÷ period = ${quota} ÷ ${period} = ${pct}% of one CPU. Over ${wall} s that's about ${cpuMs} ms; the rest of the time it's throttled, not killed. See [cgroup v2](${V2}), "CPU".`,
          docRef: L6,
        });
      },
    },
    {
      id: "drill-cg-counter",
      title: "Which file tells you?",
      generate: (rng: Rng) => {
        const qs = [
          { q: "how many processes the OOM killer killed in the box", k: "oom" },
          { q: "how many times a fork was refused by the limit", k: "pids" },
          { q: "how much CPU time the box used in total", k: "cpu" },
          { q: "which processes are in the box right now", k: "procs" },
        ] as const;
        const c = rng.pick(qs);
        const { correct, wrong } = pickFrom(COUNTER_OPTIONS, c.k);
        return choice(rng, {
          genId: "drill-cg-counter",
          prompt: `After a run, your runner wants to report ${c.q}. Which file holds that fact?`,
          correct,
          wrong,
          explanation: `Limits are files you write (\`memory.max\`, \`pids.max\`, \`cpu.max\`); results are files you read: \`memory.events\` counts \`oom_kill\`, \`pids.events\` counts refusals under \`max\`, \`cpu.stat\` sums \`usage_usec\`, and \`cgroup.procs\` lists members ([cgroup v2](${V2})).`,
          docRef: L6,
        });
      },
    },
    {
      id: "drill-cg-limit",
      title: "What happens at the limit?",
      generate: (rng: Rng) => {
        const qs = [
          { q: "touches more memory than `memory.max` allows (swap off)", k: "memory", why: "The memory controller can't reclaim enough, so the OOM killer kills a process in the cgroup." },
          { q: "tries to start more processes than `pids.max` allows", k: "pids", why: "The pids controller just refuses: `fork` returns -1 with EAGAIN, and nothing is killed." },
          { q: "wants more CPU than `cpu.max` allows", k: "cpu", why: "The CPU controller throttles: the program waits for the next period. It's slower, never killed, so a CPU limit is not a time limit." },
        ] as const;
        const c = rng.pick(qs);
        const { correct, wrong } = pickFrom(LIMIT_OPTIONS, c.k);
        return choice(rng, {
          genId: "drill-cg-limit",
          prompt: `A program in a cgroup ${c.q}. What happens to it?`,
          correct,
          wrong,
          explanation: `${c.why} See [cgroup v2](${V2}).`,
          docRef: L6,
        });
      },
    },
  ],
};

/* ── Lesson 7: capabilities, seccomp, and every wall so far ── */

const L7 = lessonRef("0007-root-capabilities-seccomp", "Lesson 7: capabilities and seccomp");
const CAPS = "https://man7.org/linux/man-pages/man7/capabilities.7.html";

const CAP_ACTIONS = [
  { act: "mount a filesystem", cap: "CAP_SYS_ADMIN" },
  { act: "change a file's owner", cap: "CAP_CHOWN" },
  { act: "listen on port 80", cap: "CAP_NET_BIND_SERVICE" },
  { act: "send raw packets, as `ping` does", cap: "CAP_NET_RAW" },
  { act: "send a signal to another user's process", cap: "CAP_KILL" },
  { act: "load a kernel module", cap: "CAP_SYS_MODULE" },
  { act: "set the system clock", cap: "CAP_SYS_TIME" },
  { act: "trace another process with ptrace", cap: "CAP_SYS_PTRACE" },
] as const;

const FILTER_OPTIONS = {
  allow: "the call succeeds as normal",
  errno: "the call fails with EPERM",
  kill: "the process dies with SIGSYS",
  retry: "the kernel retries the call",
} as const;

const LAYERS = {
  pids: "the pids cgroup",
  memory: "the memory cgroup",
  net: "the network namespace",
  mnt: "the mount namespace",
  seccomp: "the seccomp filter",
  nnp: "the no_new_privs flag",
  wall: "the wall-clock deadline",
} as const;

const privilegesDrill: Drill = {
  id: "privileges",
  title: "Powers, filters, and which wall stops what",
  blurb: "Capabilities by name, what a filter's answer does, and every wall from lessons 2 to 7, mixed.",
  generators: [
    {
      id: "drill-priv-cap",
      title: "Which capability?",
      generate: (rng: Rng) => {
        const a = rng.pick(CAP_ACTIONS);
        const others = rng.sample(CAP_ACTIONS.filter((x) => x.cap !== a.cap).map((x) => x.cap), 3);
        return choice(rng, {
          genId: "drill-priv-cap",
          prompt: `A process wants to ${a.act}. Which capability does it need?`,
          correct: a.cap,
          wrong: others,
          explanation: `${a.cap} is the slice of root's power for that. Your guard drops every one of them, the bounding set included, so even uid 0 can't. See [capabilities(7)](${CAPS}).`,
          docRef: L7,
        });
      },
    },
    {
      id: "drill-priv-filter",
      title: "What the filter's answer does",
      generate: (rng: Rng) => {
        const cases = [
          { ret: "SECCOMP_RET_ALLOW", k: "allow", why: "ALLOW lets the system call through untouched." },
          { ret: "SECCOMP_RET_ERRNO | EPERM", k: "errno", why: "ERRNO makes the call return -1 with the errno you chose, without running it. The program can react, for example with a PermissionError." },
          { ret: "SECCOMP_RET_KILL_PROCESS", k: "kill", why: "KILL_PROCESS kills the whole process with SIGSYS (signal 31) at once. The program never sees the call return." },
        ] as const;
        const c = rng.pick(cases);
        const sys = rng.pick(["socket", "mount", "ptrace", "unshare", "reboot"]);
        const { correct, wrong } = pickFrom(FILTER_OPTIONS, c.k);
        return choice(rng, {
          genId: "drill-priv-filter",
          prompt: `Your filter answers \`${c.ret}\` for \`${sys}\`. A submission calls \`${sys}\`. What happens?`,
          correct,
          wrong,
          explanation: `${c.why} See [seccomp(2)](https://man7.org/linux/man-pages/man2/seccomp.2.html).`,
          docRef: L7,
        });
      },
    },
    {
      id: "drill-priv-layer",
      title: "Which wall stops it?",
      generate: (rng: Rng) => {
        const attacks = [
          { a: "a fork bomb", k: "pids", why: "`pids.max` makes the next `fork` fail (lesson 6)." },
          { a: "allocating and touching 8 GB", k: "memory", why: "`memory.max` gets the OOM killer to kill it (lesson 6)." },
          { a: "sending your hidden test cases to its author's server", k: "net", why: "A new network namespace has only a loopback: nowhere to send anything (lesson 5)." },
          { a: "reading files from your home directory", k: "mnt", why: "Its own mount namespace and root filesystem: your home isn't in its world (lesson 5)." },
          { a: "calling `kexec_load` to boot a new kernel", k: "seccomp", why: "The filter refuses the system call before the kernel even looks at permissions (lesson 7)." },
          { a: "running a setuid binary to gain privileges", k: "nnp", why: "With `no_new_privs`, `execve` can't grant privileges, setuid bits included (lesson 7)." },
          { a: "`sleep(3600)`, using no CPU at all", k: "wall", why: "No limit on resources trips; only the wall-clock deadline stops a sleeper (lesson 2)." },
        ] as const;
        const c = rng.pick(attacks);
        const others = rng.sample(
          (Object.keys(LAYERS) as (keyof typeof LAYERS)[]).filter((k) => k !== c.k),
          3,
        );
        return choice(rng, {
          genId: "drill-priv-layer",
          prompt: `A submission tries ${c.a}. Which layer of your sandbox stops it?`,
          correct: LAYERS[c.k],
          wrong: others.map((k) => LAYERS[k]),
          explanation: c.why,
          docRef: L7,
        });
      },
    },
  ],
};

/* ── Lesson 8: docker run flags ── */

const L8 = lessonRef("0008-docker-hardened", "Lesson 8: the hardened run");

const FLAGS = [
  { flag: "--network=none", stops: "sending your hidden tests to its author", layer: "net", why: "A new network namespace with only a loopback: nothing can leave (lesson 5)." },
  { flag: "--pids-limit=64", stops: "a fork bomb", layer: "pids", why: "It writes `pids.max`: the 65th process can't be created (lesson 6)." },
  { flag: "--memory=128m", stops: "allocating all the host's memory", layer: "memory", why: "It writes `memory.max`; with `--memory-swap` equal to it, there's no swap to spill into (lesson 6)." },
  { flag: "--read-only", stops: "writing a program to disk and running it later", layer: "ro", why: "The root filesystem is mounted read-only; only the `--tmpfs` you allow is writable, and you mount it `noexec` (lesson 5)." },
  { flag: "--cap-drop=ALL", stops: "root mounting a filesystem or tracing processes", layer: "caps", why: "It empties the bounding set, so no capability survives `exec` (lesson 7)." },
  { flag: "--security-opt=no-new-privileges", stops: "a setuid binary handing it root", layer: "nnp", why: "It sets `no_new_privs`: `execve` can never grant privileges again (lesson 7)." },
  { flag: "--user=65534:65534", stops: "an escape landing as root on the host", layer: "uid", why: "Docker has no user namespace by default, so uid 0 inside is uid 0 outside. Run as `nobody` instead (lessons 5 and 7)." },
] as const;
const FLAG_LAYERS = {
  net: "a network namespace",
  pids: "the pids cgroup",
  memory: "the memory cgroup",
  ro: "a read-only mount",
  caps: "the bounding set",
  nnp: "the no_new_privs flag",
  uid: "a non-root uid",
} as const;

const dockerFlagsDrill: Drill = {
  id: "docker-flags",
  title: "Every flag, every layer",
  blurb: "Which docker run flag stops an attack, and which layer you built by hand it really is.",
  generators: [
    {
      id: "drill-docker-flag",
      title: "Which flag stops it?",
      generate: (rng: Rng) => {
        const f = rng.pick(FLAGS);
        const others = rng.sample(FLAGS.filter((x) => x.flag !== f.flag).map((x) => x.flag), 3);
        return choice(rng, {
          genId: "drill-docker-flag",
          prompt: `Which \`docker run\` flag stops a submission from ${f.stops}?`,
          correct: f.flag,
          wrong: others,
          explanation: `\`${f.flag}\`. ${f.why} See the [docker run reference](https://docs.docker.com/reference/cli/docker/container/run/).`,
          docRef: L8,
        });
      },
    },
    {
      id: "drill-docker-layer",
      title: "Which layer is that flag?",
      generate: (rng: Rng) => {
        const f = rng.pick(FLAGS);
        const others = rng.sample(
          (Object.keys(FLAG_LAYERS) as (keyof typeof FLAG_LAYERS)[]).filter((k) => k !== f.layer),
          3,
        );
        return choice(rng, {
          genId: "drill-docker-layer",
          prompt: `You've built every layer by hand. Which one is \`${f.flag}\`, underneath?`,
          correct: FLAG_LAYERS[f.layer],
          wrong: others.map((k) => FLAG_LAYERS[k]),
          explanation: f.why,
          docRef: L8,
        });
      },
    },
  ],
};

/* ── Lesson 9: verdicts ── */

const L9 = lessonRef("0009-facts-to-verdicts", "Lesson 9: the judge loop");
const VERDICTS = ["AC", "WA", "TLE", "MLE", "OLE", "RE"] as const;

const verdictsDrill: Drill = {
  id: "verdicts",
  title: "Facts in, verdict out",
  blurb: "Random runner facts and outputs: name the verdict, and say whether two outputs match.",
  generators: [
    {
      id: "drill-verdict",
      title: "Which verdict?",
      generate: (rng: Rng) => {
        const cases = [
          { facts: "`outcome: \"exit\"`, `exitCode: 0`, and the output's tokens match", v: "AC", why: "It ended normally with code 0, and the tokens match: Accepted." },
          { facts: "`outcome: \"exit\"`, `exitCode: 0`, but one token differs", v: "WA", why: "It ended normally, so the output is compared, and it doesn't match: Wrong Answer." },
          { facts: "`outcome: \"timeout\"`", v: "TLE", why: "Your deadline stopped it: Time Limit Exceeded, whatever it printed." },
          { facts: "`outcome: \"memory-limit\"` (the OOM killer, `OOMKilled: true`)", v: "MLE", why: "The cgroup's memory limit killed it: Memory Limit Exceeded." },
          { facts: "`outcome: \"output-limit\"`", v: "OLE", why: "It printed past the cap: Output Limit Exceeded." },
          { facts: "`outcome: \"exit\"`, `exitCode: 1` (a Python traceback on stderr)", v: "RE", why: "A non-zero exit is a Runtime Error; its output isn't even read." },
          { facts: "`outcome: \"exit\"`, `exitCode: 139`, and the output is right", v: "RE", why: "139 is 128 + 11, a segfault. How it ended is checked before what it printed: Runtime Error." },
        ] as const;
        const c = rng.pick(cases);
        const others = rng.sample(VERDICTS.filter((v) => v !== c.v), 3);
        return choice(rng, {
          genId: "drill-verdict",
          prompt: `On test ${rng.int(1, 12)}, the runner reports ${c.facts}. What's the verdict?`,
          correct: c.v,
          wrong: [...others],
          explanation: `${c.why} The order to decide in: limits first (TLE, MLE, OLE), then how it ended (RE), and only then the output (WA or AC).`,
          docRef: L9,
        });
      },
    },
    {
      id: "drill-tokens",
      title: "Do the outputs match?",
      generate: (rng: Rng) => {
        const words = rng.sample(["3", "17", "YES", "NO", "-2", "0", "42", "abc", "1e9", "7"], rng.int(1, 3));
        const sep = () => rng.pick([" ", "  ", "\t", "\n"]);
        const render = (ws: string[]) => ws.join(sep()) + rng.pick(["", "\n", "\n\n", "\r\n", "  "]);
        const same = rng.chance(0.5);
        const actualWords = same ? words : [...words.slice(0, -1), words[words.length - 1] === "7" ? "8" : "7"];
        const expected = render(words);
        const actual = render(actualWords);
        const show = (x: string) => "`" + JSON.stringify(x) + "`";
        return choice(rng, {
          genId: "drill-tokens",
          prompt: `Expected ${show(expected)}, the program printed ${show(actual)}. With a token checker, do they match?`,
          correct: same ? "Yes, the tokens are equal" : "No, a token is different",
          wrong: [same ? "No, a token is different" : "Yes, the tokens are equal"],
          explanation: `Split both on any whitespace (spaces, tabs, newlines, \\r) and compare the sequences: [${words.join(", ")}] against [${actualWords.join(", ")}].`,
          docRef: L9,
        });
      },
    },
  ],
};

/* ── Lesson 10: tests that would notice ── */

const L10 = lessonRef("0010-attack-your-sandbox", "Lesson 10: attack your own sandbox");
const PROTECTIONS = {
  pids: "the pids limit",
  memory: "the memory limit",
  net: "the network namespace",
  ro: "the read-only root",
  user: "the non-root user",
} as const;

const mutantsDrill: Drill = {
  id: "mutants",
  title: "Would your test notice?",
  blurb: "A weak assertion passes whether a wall is there or not. Spot which wall it can't see.",
  generators: [
    {
      id: "drill-mutant-blind",
      title: "Which protection can't it see?",
      generate: (rng: Rng) => {
        const cases = [
          { t: "the fork bomb's test only checks that the run ended with exit 0", k: "pids", why: "The bomb's parent exits 0 whether it made 60 processes or 500. Assert on the number it managed to create." },
          { t: "the 512 MB test only checks that the outcome isn't `timeout`", k: "memory", why: "Without a memory limit, the allocation succeeds quickly and exits 0: still not a timeout. Assert `memory-limit`, and that it never printed \"allocated\"." },
          { t: "the network test lists `/sys/class/net` and only checks the exit code is 0", k: "net", why: "Listing a directory exits 0 either way. Assert that the only interface is `lo`." },
          { t: "the escape test only checks that writing to `/etc` failed", k: "ro", why: "`nobody` can't write `/etc` even on a writable root. Check the root mount's `ro` option, or that a script in `/tmp` can't run." },
          { t: "the identity test only checks that `/etc/passwd` starts with `root:`", k: "user", why: "That's true in any image, as any user. Print `os.getuid()` and assert 65534." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(PROTECTIONS, c.k);
        return choice(rng, {
          genId: "drill-mutant-blind",
          prompt: `In your adversarial suite, ${c.t}. Which protection could go missing without this test failing?`,
          correct,
          wrong: rng.sample(wrong, 3),
          explanation: `${c.why} A test that passes with and without a protection can't protect it.`,
          docRef: L10,
        });
      },
    },
  ],
};

export const SANDBOX_DRILLS: Drill[] = [namespacesDrill, cgroupsDrill, privilegesDrill, dockerFlagsDrill, verdictsDrill, mutantsDrill];
