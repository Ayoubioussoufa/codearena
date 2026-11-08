import { execFile, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Injectable } from "@nestjs/common";
import { CodeRunner, RunLimits } from "../ports/code-runner.port";
import { Language, RunResult } from "../domain/run-result.entity";

const IMAGE = "node:24.22.2-alpine3.24";

/**
 * Starting a container takes a few hundred milliseconds, and users shouldn't
 * pay for that. The deadline allows for it, and `timeMs` is measured by Docker
 * from the moment the program started, so start-up never counts against them.
 */
const START_UP_GRACE_MS = 1000;

const dockerCommand = promisify(execFile);
const docker = (...args: string[]) => dockerCommand("docker", args);
/** For clean-up: the container may already be gone, and that's fine. */
const dockerIgnoringErrors = (...args: string[]) =>
  docker(...args).catch(() => undefined);

type StopReason = "TIMEOUT" | "OUTPUT_LIMIT";

type Execution = {
  stopReason: StopReason | null;
  stdout: string;
  stderr: string;
};

type ContainerState = {
  oomKilled: boolean;
  exitCode: number;
  timeMs: number;
};

@Injectable()
export class DockerCodeRunner implements CodeRunner {
  async run(
    code: string,
    language: Language,
    limits: RunLimits,
    stdin: string,
  ): Promise<RunResult> {
    if (language !== "JAVASCRIPT") {
      throw new Error(`No runner for ${language} yet`);
    }

    const name = `codearena-run-${randomUUID()}`;
    const folder = await writeCodeFolder(code);
    try {
      const args = dockerRunArgs(name, folder, limits);
      const execution = await execute(name, args, limits, stdin);
      const state = await inspect(name);
      return toFacts(execution, state, limits);
    } finally {
      // I-17: whatever happened above, nothing is left behind.
      await dockerIgnoringErrors("rm", "-f", name);
      await rm(folder, { recursive: true, force: true });
    }
  }
}

/** The program runs as `nobody`, so the folder must be readable by everyone. */
async function writeCodeFolder(code: string): Promise<string> {
  const folder = await mkdtemp(join(tmpdir(), "codearena-"));
  const file = join(folder, "main.js");
  await writeFile(file, code);
  await chmod(folder, 0o755);
  await chmod(file, 0o644);
  return folder;
}

function dockerRunArgs(name: string, folder: string, limits: RunLimits) {
  return [
    "run",
    "-i",
    "--name",
    name,
    "--network",
    "none",
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=16m",
    "--memory",
    `${limits.memoryMb}m`,
    "--memory-swap",
    `${limits.memoryMb}m`,
    "--pids-limit",
    `${limits.pids}`,
    "--cpus",
    "1",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--user",
    "65534:65534",
    "--log-driver",
    "none",
    "--mount",
    `type=bind,src=${folder},dst=/code,readonly`,
    IMAGE,
    "node",
    `--max-old-space-size=${limits.memoryMb}`,
    "/code/main.js",
  ];
}

function execute(
  name: string,
  args: string[],
  limits: RunLimits,
  stdin: string,
): Promise<Execution> {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args);
    const stdout = cappedOutput(limits.maxOutputBytes);
    const stderr = cappedOutput(limits.maxOutputBytes);
    let stopReason: StopReason | null = null;

    // Stops the container through the daemon. Killing `child` would only kill
    // the docker client and leave the container running: that's I-17.
    const stop = (reason: StopReason) => {
      if (stopReason !== null) return;
      stopReason = reason;
      void dockerIgnoringErrors("kill", name);
    };

    const deadline = setTimeout(
      () => stop("TIMEOUT"),
      limits.timeoutMs + START_UP_GRACE_MS,
    );

    const collect = (output: CappedOutput) => (chunk: Buffer) => {
      output.add(chunk);
      if (output.overflowed()) stop("OUTPUT_LIMIT");
    };
    child.stdout.on("data", collect(stdout));
    child.stderr.on("data", collect(stderr));

    // A program that exits without reading its input closes this pipe, and
    // that's its right. Without this handler, the EPIPE crashes the worker.
    child.stdin.on("error", () => undefined);
    child.stdin.end(stdin);

    // `spawn` failed: Docker isn't installed. Your failure, not the user's.
    child.on("error", (error) => {
      clearTimeout(deadline);
      reject(error);
    });
    child.on("close", () => {
      clearTimeout(deadline);
      resolve({
        stopReason,
        stdout: stdout.text(),
        stderr: stderr.text(),
      });
    });
  });
}

type CappedOutput = ReturnType<typeof cappedOutput>;

/** Keeps at most `maxBytes`, so a flood can't fill the worker's memory. */
function cappedOutput(maxBytes: number) {
  const chunks: Buffer[] = [];
  let bytes = 0;
  let overflowed = false;
  return {
    add(chunk: Buffer) {
      const room = maxBytes - bytes;
      if (chunk.length > room) overflowed = true;
      const kept = chunk.subarray(0, Math.max(room, 0));
      chunks.push(kept);
      bytes += kept.length;
    },
    overflowed: () => overflowed,
    text: () => Buffer.concat(chunks).toString("utf8"),
  };
}

/** Throws if the container doesn't exist: Docker failed, not the program. */
async function inspect(name: string): Promise<ContainerState> {
  const format =
    "{{.State.OOMKilled}} {{.State.ExitCode}} {{.State.StartedAt}} {{.State.FinishedAt}}";
  const { stdout } = await docker("inspect", "-f", format, name);
  const [oomKilled, exitCode, startedAt, finishedAt] = stdout.trim().split(" ");
  return {
    oomKilled: oomKilled === "true",
    exitCode: Number(exitCode),
    timeMs: Date.parse(finishedAt!) - Date.parse(startedAt!),
  };
}

function toFacts(
  { stopReason, stdout, stderr }: Execution,
  { oomKilled, exitCode, timeMs }: ContainerState,
  limits: RunLimits,
): RunResult {
  const output = { stdout, stderr, timeMs };
  // Limits first: a killed program's exit code only says that it was killed.
  if (stopReason !== null) return { ...output, outcome: stopReason };
  if (oomKilled) return { ...output, outcome: "MEMORY_LIMIT" };
  if (timeMs > limits.timeoutMs) return { ...output, outcome: "TIMEOUT" };
  if (exitCode > 128) {
    return { ...output, outcome: "SIGNAL", signal: `${exitCode - 128}` };
  }
  return { ...output, outcome: "EXIT", exitCode };
}
