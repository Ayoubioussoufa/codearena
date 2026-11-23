/**
 * In-lesson drills: generated practice with fresh numbers and scenarios every
 * round, so you recall and apply instead of recognising. Each drill is a list
 * of generators from the dojo's exercise engine; their answers are recorded
 * under the course-recall topic, so misses come back in spaced review.
 */
import type { Generator, InputExercise } from "../engine/types";
import type { Rng } from "../engine/rng";
import { choice, numeric, text } from "../engine/helpers";

import { type Drill, lessonRef as ref } from "./drill-kit";
import { SANDBOX_DRILLS } from "./drills-sandbox";
import { BACKEND_DRILLS } from "./drills-backend";
import { DATA_DRILLS } from "./drills-data";
import { WEB_DRILLS } from "./drills-web";
import { SHIP_DRILLS } from "./drills-ship";
import { RUST_DRILLS } from "./drills-rust";
import { AI_DRILLS } from "./drills-ai";

export type { Drill };

const hex4 = (n: number) => `0x${n.toString(16).padStart(4, "0")}`;

const SIGNALS: Record<number, string> = { 6: "SIGABRT", 8: "SIGFPE", 9: "SIGKILL", 11: "SIGSEGV", 15: "SIGTERM" };
const SIGNAL_NUMBERS = Object.keys(SIGNALS).map(Number);

/* ── Lesson 1: reading a wait status ── */

const L1 = "0001-run-a-program";
const L1REF = ref(L1, "Lesson 1: the wait status");

const statusDecoder: Drill = {
  id: "wait-status",
  title: "Read the status like the kernel wrote it",
  blurb: "Raw statuses, exit codes and the shell's `$?`, with new numbers every round.",
  generators: [
    {
      id: "drill-wait-status-decode",
      title: "Decode a raw wait status",
      generate: (rng: Rng) => {
        const exited = rng.chance(0.5);
        const code = rng.int(0, 255);
        const sig = rng.pick(SIGNAL_NUMBERS);
        const core = !exited && (sig === 6 || sig === 11) && rng.chance(0.5);
        const status = exited ? code << 8 : sig | (core ? 0x80 : 0);
        const answer = exited ? `exit ${code}` : `signal ${sig}`;
        return text({
          genId: "drill-wait-status-decode",
          prompt: `\`waitpid\` filled \`status\` with \`${hex4(status)}\`. What does your \`run\` print? (\`exit N\` or \`signal S\`)`,
          answers: exited ? [answer] : [answer, `signal ${SIGNALS[sig]}`],
          placeholder: "exit N  or  signal S",
          explanation: exited
            ? `The low 7 bits are 0, so no signal killed it: it ended by itself. The exit code is the high byte: \`${hex4(status)} >> 8\` = ${code}. In code, \`WIFEXITED\` is true and \`WEXITSTATUS\` gives ${code}.`
            : `The high byte is 0 and the low 7 bits hold ${sig} (${SIGNALS[sig]}), so a signal killed it.${core ? " Bit 7 (`0x80`) is also set: the kernel wrote a core dump. It's not part of the signal number." : ""} In code, \`WIFSIGNALED\` is true and \`WTERMSIG\` gives ${sig}.`,
          docRef: L1REF,
        });
      },
    },
    {
      id: "drill-wait-status-wrap",
      title: "Exit codes keep 8 bits",
      generate: (rng: Rng) => {
        const asked = rng.int(256, 1100);
        return numeric({
          genId: "drill-wait-status-wrap",
          prompt: `A child calls \`exit(${asked})\`. What does \`WEXITSTATUS\` give the parent?`,
          answer: asked & 0xff,
          explanation: `Only 8 bits of the code travel: ${asked} mod 256 = ${asked & 0xff} (in hex, \`${asked.toString(16)}\` keeps its last two digits, \`${(asked & 0xff).toString(16).padStart(2, "0")}\`).`,
          docRef: L1REF,
        });
      },
    },
    {
      id: "drill-wait-status-shell",
      title: "What the shell's $? shows",
      generate: (rng: Rng) => {
        const exited = rng.chance(0.4);
        const code = rng.int(0, 120);
        const sig = rng.pick(SIGNAL_NUMBERS);
        return numeric({
          genId: "drill-wait-status-shell",
          prompt: exited
            ? `A program calls \`exit(${code})\`. What does \`echo $?\` print right after it?`
            : `A program is killed by ${SIGNALS[sig]} (signal ${sig}). What does \`echo $?\` print right after it?`,
          answer: exited ? code : 128 + sig,
          explanation: exited
            ? `It ended by itself, so \`$?\` is just its exit code, ${code}.`
            : `A shell squeezes "killed by signal ${sig}" into one number: 128 + ${sig} = ${128 + sig}. That's why Docker shows 137 for SIGKILL, and why \`$?\` alone can't tell a signal from a program that called \`exit(${128 + sig})\`.`,
          docRef: L1REF,
        });
      },
    },
    {
      id: "drill-wait-status-encode",
      title: "Encode a status by hand",
      generate: (rng: Rng) => {
        const exited = rng.chance(0.5);
        const code = rng.int(1, 255);
        const sig = rng.pick(SIGNAL_NUMBERS);
        const status = exited ? code << 8 : sig;
        const exercise: InputExercise = {
          kind: "input",
          genId: "drill-wait-status-encode",
          prompt: exited
            ? `A child ends with \`exit(${code})\`. What raw status, in hex, does the kernel give \`waitpid\` (Linux layout)?`
            : `A child is killed by ${SIGNALS[sig]} (${sig}), no core dump. What raw status, in hex, does the kernel give \`waitpid\` (Linux layout)?`,
          answer: hex4(status),
          accept: (raw) => {
            const cleaned = raw.trim().toLowerCase().replace(/^0x/, "");
            return /^[0-9a-f]+$/.test(cleaned) && parseInt(cleaned, 16) === status;
          },
          placeholder: "0x....",
          explanation: exited
            ? `The exit code goes in the high byte: ${code} = \`0x${code.toString(16).padStart(2, "0")}\`, shifted left by 8, so \`${hex4(status)}\`. The low byte stays 0: "no signal".`
            : `The signal number goes in the low 7 bits and the high byte stays 0: \`${hex4(status)}\`.`,
          docRef: L1REF,
        };
        return exercise;
      },
    },
  ],
};

/* ── Lesson 2: who survives the kill? ── */

const L2REF = ref("0002-time-limits", "Lesson 2: killing everything it started");
const SURVIVE_OPTIONS = {
  none: "No process survives here",
  child: "Only the child survives",
  grand: "Only the grandchild survives",
  both: "Both of them survive",
} as const;

const whoSurvives: Drill = {
  id: "who-survives",
  title: "Clocks and kills",
  blurb: "Which limit stops a program, and what survives the kill: new process trees every round.",
  generators: [
    {
      id: "drill-who-survives",
      title: "Predict the survivors",
      generate: (rng: Rng) => {
        const newGroup = rng.chance(0.75); // child called setpgid(0, 0)
        const escapes = rng.chance(0.3); // grandchild called setsid()
        const ignoresTerm = rng.chance(0.35); // the shell ignores SIGTERM
        const toGroup = rng.chance(0.6);
        const sig = rng.chance(0.65) ? "SIGKILL" : "SIGTERM";

        // Who receives the signal?
        const groupExists = newGroup;
        const childGets = toGroup ? groupExists : true;
        const grandGets = toGroup && groupExists && !escapes;
        const dies = (gets: boolean, ignores: boolean) => gets && (sig === "SIGKILL" || !ignores);
        const childDies = dies(childGets, ignoresTerm);
        const grandDies = dies(grandGets, false);
        const key = !childDies && !grandDies ? "both" : childDies && grandDies ? "none" : childDies ? "grand" : "child";

        const why: string[] = [];
        if (toGroup && !groupExists) {
          why.push("The child never called `setpgid(0, 0)`, so there's no process group 100: `kill(-100, …)` fails with ESRCH and reaches nobody.");
        } else if (toGroup) {
          why.push("`kill(-100, …)` reaches every process still in group 100.");
          why.push(escapes ? "But the grandchild called `setsid()`: it's in a new group, out of reach." : "The grandchild inherited the group, so it's reached too.");
        } else {
          why.push("`kill(100, …)` reaches only PID 100, the child. The grandchild is untouched, and becomes an orphan if its parent dies.");
        }
        if (sig === "SIGTERM" && ignoresTerm && childGets) why.push("The shell ignores SIGTERM, so it survives the signal it received. Only SIGKILL can't be ignored.");
        else if (sig === "SIGKILL") why.push("SIGKILL can't be caught or ignored: whatever it reaches dies.");

        const correct = SURVIVE_OPTIONS[key];
        return choice(rng, {
          genId: "drill-who-survives",
          prompt: [
            `Your runner forks a child, \`sh\` (PID 100), which ${newGroup ? "calls `setpgid(0, 0)` first" : "stays in your runner's process group"}.`,
            `\`sh\` starts \`sleep\` (PID 101)${escapes ? ", which calls `setsid()`" : ""}.${ignoresTerm ? " `sh` has set SIGTERM to be ignored." : ""}`,
            `At the deadline, your runner calls \`kill(${toGroup ? "-100" : "100"}, ${sig})\`. A moment later, what's still running?`,
          ].join(" "),
          correct,
          wrong: Object.values(SURVIVE_OPTIONS).filter((o) => o !== correct),
          explanation: why.join(" "),
          docRef: L2REF,
        });
      },
    },
    {
      id: "drill-two-clocks",
      title: "Which clock catches it?",
      generate: (rng: Rng) => {
        const programs = [
          { what: "`while (1);`, an infinite loop", cpu: true, wall: true },
          { what: "`sleep(60)`", cpu: false, wall: true },
          { what: "a program waiting for input that never comes", cpu: false, wall: true },
          { what: "a program that computes for 10 seconds, then prints", cpu: true, wall: true },
        ];
        const p = rng.pick(programs);
        const options = {
          both: "Both limits stop it in time",
          wall: "Only the wall-clock limit stops it",
          cpu: "Only the CPU-time limit stops it",
          none: "Neither limit would ever stop it",
        };
        const key = p.cpu && p.wall ? "both" : p.wall ? "wall" : "cpu";
        return choice(rng, {
          genId: "drill-two-clocks",
          prompt: `A judge has a 2-second CPU-time limit and a 2-second wall-clock limit. The submission is ${p.what}. Which limit stops it?`,
          correct: options[key],
          wrong: Object.values(options).filter((o) => o !== options[key]),
          explanation: p.cpu
            ? "It computes, so both its CPU time and the wall clock run out: either limit stops it, whichever is shorter."
            : "It barely uses the CPU, so its CPU time stays near zero. Only the wall clock keeps ticking: that's why a judge needs both.",
          docRef: ref("0002-time-limits", "Lesson 2: two clocks"),
        });
      },
    },
  ],
};

/* ── Lesson 3: pipes, files and caps ── */

const L3REF = ref("0003-input-output", "Lesson 3: pipes and the deadlock");
const PIPE_OPTIONS = {
  ok: "It finishes, and the output is complete",
  stuck: "It deadlocks until the judge's deadline fires",
  cut: "It finishes, but the output is truncated",
  sigpipe: "The kernel kills it with a SIGPIPE",
} as const;

const pipeOrDeadlock: Drill = {
  id: "pipe-or-deadlock",
  title: "Finishes, or deadlocks?",
  blurb: "Output sizes against a 64 KiB pipe, three ways to capture, and the file-size cap.",
  generators: [
    {
      id: "drill-pipe-deadlock",
      title: "Will the run finish?",
      generate: (rng: Rng) => {
        const sizes = [
          { label: "8 KB", bytes: 8_000 },
          { label: "60 KB", bytes: 60_000 },
          { label: "exactly 65,536 bytes", bytes: 65_536 },
          { label: "70 KB", bytes: 70_000 },
          { label: "300 KB", bytes: 300_000 },
          { label: "2 MB", bytes: 2_000_000 },
        ];
        const size = rng.pick(sizes);
        const method = rng.pick(["wait-then-read", "poll", "file"] as const);
        const how = {
          "wait-then-read": "points its stdout at a pipe, calls `waitpid` until it ends, then reads the pipe",
          poll: "points its stdout at a pipe and reads it with `poll()` while the program runs",
          file: "points its stdout at a file, then reads the file after `waitpid`",
        }[method];
        const stuck = method === "wait-then-read" && size.bytes > 65_536;
        const correct = stuck ? PIPE_OPTIONS.stuck : PIPE_OPTIONS.ok;
        return choice(rng, {
          genId: "drill-pipe-deadlock",
          prompt: `A correct program prints ${size.label} and exits. Your runner ${how}. The pipe holds 65,536 bytes. What happens?`,
          correct,
          wrong: Object.values(PIPE_OPTIONS).filter((o) => o !== correct),
          explanation:
            method === "file"
              ? "A file never fills up and never blocks the writer: no deadlock is possible, whatever the size. That's why judges like isolate redirect to files."
              : method === "poll"
                ? "You empty the pipe as data arrives, so the writer never blocks for long: it finishes whatever the size."
                : stuck
                  ? `${size.label} doesn't fit in 65,536 bytes. The program blocks in \`write\` waiting for a reader, while you block in \`waitpid\` waiting for it to end. Nobody moves until the deadline.`
                  : `${size.label} fits in the pipe's 65,536 bytes, so the program's writes all complete and it exits. Your \`waitpid\` returns, then you read everything. It works... until someone prints more.`,
          docRef: L3REF,
        });
      },
    },
    {
      id: "drill-fsize-cap",
      title: "How big is the output file?",
      generate: (rng: Rng) => {
        const cap = rng.pick([1_000, 5_000, 10_000, 65_536]);
        const tries = rng.pick([Math.floor(cap / 2), cap, cap + 1, cap * 3, 1_000_000]);
        const size = Math.min(tries, cap + 1);
        return numeric({
          genId: "drill-fsize-cap",
          prompt: `The cap is ${cap.toLocaleString("en-US")} bytes, so your runner sets \`RLIMIT_FSIZE\` to ${(cap + 1).toLocaleString("en-US")}. The program tries to write ${tries.toLocaleString("en-US")} bytes to stdout (a file). How many bytes does the file end up holding?`,
          answer: size,
          explanation:
            tries <= cap + 1
              ? `${tries.toLocaleString("en-US")} bytes fit under the limit, so they're all written.${tries === cap + 1 ? " That's one byte over the cap: your runner reports `output-limit`." : " The size isn't over the cap: no output-limit."}`
              : `The kernel lets the file grow to the limit, ${(cap + 1).toLocaleString("en-US")} bytes, and refuses the rest (SIGXFSZ, or EFBIG if the program ignores it). Size > cap, so your runner reports \`output-limit\`.`,
          docRef: ref("0003-input-output", "Lesson 3: capping the output"),
        });
      },
    },
  ],
};

/* ── Lesson 4: what does the Node runner report? ── */

const L4REF = ref("0004-runner-in-node", "Lesson 4: streams and Node's defaults");
const NODE_OUTCOMES = {
  exit: "`exit`, after the program finishes normally",
  timeout: "`timeout`, because the program is stuck",
  signal: "`signal`, because the kernel sends SIGPIPE",
  spawn: "`spawn-error`, because stderr was never opened",
} as const;
const EPIPE_OPTIONS = {
  ok: "Your runner reports `exit` with code 0",
  crash: "The whole worker process crashes with EPIPE",
  timeout: "Your runner reports `timeout` after two seconds",
  signal: "Your runner reports `signal` with a SIGPIPE",
} as const;
const ORPHAN_OPTIONS = {
  orphan: "Yes, sleep is orphaned and keeps running",
  gone: "No, the whole group was killed together",
  node: "No, Node kills every descendant by default",
  shell: "Yes, because SIGKILL cannot reach a shell",
} as const;

const nodeFacts: Drill = {
  id: "node-facts",
  title: "What does the Node runner report?",
  blurb: "Unread streams, EPIPE and kill strategies: predict the outcome of each runner.",
  generators: [
    {
      id: "drill-node-stderr",
      title: "Unread streams",
      generate: (rng: Rng) => {
        const readsBoth = rng.chance(0.4);
        const big = rng.chance(0.65);
        const size = big ? "200 KB" : "20 KB";
        const key = !readsBoth && big ? "timeout" : "exit";
        const correct = NODE_OUTCOMES[key];
        return choice(rng, {
          genId: "drill-node-stderr",
          prompt: `Your runner listens to ${readsBoth ? "`'data'` on both stdout and stderr" : "`'data'` on stdout only"}. The program writes ${size} to stderr, then exits. The deadline is 2 seconds. What does your runner report?`,
          correct,
          wrong: Object.values(NODE_OUTCOMES).filter((o) => o !== correct),
          explanation: readsBoth
            ? "Both streams are drained as data arrives, so the program never blocks."
            : big
              ? "Nobody drains stderr, so once Node's buffer and the 64 KiB pipe are full, the program blocks in `write` until the deadline: lesson 3's deadlock, through the side door."
              : "20 KB fits in the pipe even though nobody reads it, so the program's writes complete and it exits. Unread streams are a bug waiting for a bigger output.",
          docRef: L4REF,
        });
      },
    },
    {
      id: "drill-node-epipe",
      title: "EPIPE",
      generate: (rng: Rng) => {
        const listens = rng.chance(0.5);
        const correct = listens ? EPIPE_OPTIONS.ok : EPIPE_OPTIONS.crash;
        return choice(rng, {
          genId: "drill-node-epipe",
          prompt: `A program exits at once without reading its 1 MB input. Your runner writes the input to \`child.stdin\` and ${listens ? "has" : "has no"} \`'error'\` listener on \`child.stdin\`. What happens?`,
          correct,
          wrong: Object.values(EPIPE_OPTIONS).filter((o) => o !== correct),
          explanation: listens
            ? "The write fails with EPIPE, your listener swallows it, and the run ends normally with the program's own exit code."
            : "The write fails with EPIPE, which a Node stream emits as an `'error'` event. With no listener, it's thrown as an uncaught exception, and one submission kills your whole worker.",
          docRef: L4REF,
        });
      },
    },
    {
      id: "drill-node-orphan",
      title: "Kill strategies",
      generate: (rng: Rng) => {
        const strategy = rng.pick(["option", "child", "group"] as const);
        const setup = {
          option: "`spawn(\"sh\", [\"-c\", \"sleep 60; :\"], { timeout: 500 })`, Node's own timeout option",
          child: "`spawn(\"sh\", [\"-c\", \"sleep 60; :\"], { detached: true })`, then `child.kill(\"SIGKILL\")` at 500 ms",
          group: "`spawn(\"sh\", [\"-c\", \"sleep 60; :\"], { detached: true })`, then `process.kill(-child.pid, \"SIGKILL\")` at 500 ms",
        }[strategy];
        const correct = strategy === "group" ? ORPHAN_OPTIONS.gone : ORPHAN_OPTIONS.orphan;
        return choice(rng, {
          genId: "drill-node-orphan",
          prompt: `Your runner uses ${setup}. One second later, is \`sleep\` still running?`,
          correct,
          wrong: Object.values(ORPHAN_OPTIONS).filter((o) => o !== correct),
          explanation:
            strategy === "group"
              ? "`detached: true` made `sh` the leader of a new group, and the negative PID reached every process in it, `sleep` included."
              : strategy === "option"
                ? "The timeout option sends `killSignal` (SIGTERM by default) to `sh` only. `sleep` is orphaned and runs on, and it still holds the stdout pipe, so `'close'` waits for it."
                : "`child.kill` signals one process, `sh`. Its child `sleep` is orphaned and keeps running, holding the pipe open.",
          docRef: L4REF,
        });
      },
    },
  ],
};

export const DRILLS: Drill[] = [statusDecoder, whoSurvives, pipeOrDeadlock, nodeFacts, ...SANDBOX_DRILLS, ...BACKEND_DRILLS, ...DATA_DRILLS, ...WEB_DRILLS, ...SHIP_DRILLS, ...AI_DRILLS, ...RUST_DRILLS];

export function getDrill(id: string): Drill | undefined {
  return DRILLS.find((d) => d.id === id);
}

/** Every drill generator, for the spaced-review pool. */
export const DRILL_GENERATORS: Generator[] = DRILLS.flatMap((d) => d.generators);

