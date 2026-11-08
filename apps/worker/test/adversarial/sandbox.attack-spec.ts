import { execFileSync } from "node:child_process";
import { DockerCodeRunner } from "../../src/adapters/docker-code.runner";
import { JudgeService } from "../../src/application/judge.service";
import { RunLimits } from "../../src/ports/code-runner.port";

/**
 * Hostile programs against the real sandbox. A verdict alone proves nothing:
 * a fork bomb's parent exits normally with or without --pids-limit. So each
 * program checks what it managed to do, and prints "contained" only if the
 * wall held. Expecting that word means ACCEPTED = the attack failed.
 */
const limits: RunLimits = {
  timeoutMs: 2000,
  memoryMb: 256,
  pids: 64,
  maxOutputBytes: 64 * 1024,
};

const judge = new JudgeService(new DockerCodeRunner());

const attack = (code: string) =>
  judge.judge(
    code,
    "JAVASCRIPT",
    [{ input: "", expected: "contained" }],
    limits,
  );

const docker = (...args: string[]) =>
  execFileSync("docker", args).toString().trim();

describe("the sandbox contains", () => {
  afterEach(() => {
    // The host is untouched: Docker answers, and no container is left.
    expect(docker("version", "-f", "{{.Server.Version}}")).not.toBe("");
    expect(
      docker(
        "ps",
        "-a",
        "--filter",
        "name=codearena-run-",
        "--format",
        "{{.Names}}",
      ),
    ).toBe("");
  });

  // Contained by --pids-limit: the kernel refuses new processes at pids.max.
  it("a fork bomb", async () => {
    const code = `
      const { spawn } = require("child_process");
      let started = 0;
      for (let i = 0; i < 200; i++) {
        const child = spawn("sleep", ["10"], { stdio: "ignore" });
        child.on("error", () => {});
        if (child.pid !== undefined) started++;
      }
      console.log(started < 64 ? "contained" : "BREACHED " + started);
      process.exit(0);
    `;

    await expect(attack(code)).resolves.toMatchObject({ verdict: "ACCEPTED" });
  });

  // Contained by the wall-clock deadline and `docker kill`: a CPU limit alone
  // never stops a program. Passing means the container is gone too (I-17).
  it("an infinite loop", async () => {
    await expect(attack("while (true) {}")).resolves.toMatchObject({
      verdict: "TIME_LIMIT",
      failedTest: 1,
    });
  });

  // Contained by --memory = --memory-swap: the cgroup's OOM killer stops it
  // long before 4 GB. fill(1) touches every page, so the memory is really used.
  it("a 4 GB allocation", async () => {
    const code = `
      const kept = [];
      for (let mb = 0; mb < 4096; mb += 64) {
        kept.push(Buffer.alloc(64 * 1024 * 1024, 1));
      }
      console.log("BREACHED allocated 4 GB");
    `;

    await expect(attack(code)).resolves.toMatchObject({
      verdict: "MEMORY_LIMIT",
    });
  });

  // Contained by --network none: the only interface is loopback, so the
  // program has no route out to send the hidden tests anywhere.
  it("a network call", async () => {
    const code = `
      const interfaces = Object.keys(require("os").networkInterfaces());
      const onlyLoopback = interfaces.every((name) => name === "lo");
      fetch("http://1.1.1.1", { signal: AbortSignal.timeout(1000) })
        .then(() => console.log("BREACHED reached the internet"))
        .catch(() => console.log(onlyLoopback ? "contained" : "BREACHED " + interfaces));
    `;

    await expect(attack(code)).resolves.toMatchObject({ verdict: "ACCEPTED" });
  });

  // Contained by --read-only (nothing on / can change), the read-only /code
  // mount, and noexec on /tmp (a dropped program can't run).
  it("a filesystem escape", async () => {
    const code = `
      const fs = require("fs");
      const { execFileSync } = require("child_process");
      const breaches = [];
      const root = fs.readFileSync("/proc/mounts", "utf8").split("\\n")
        .find((line) => line.split(" ")[1] === "/");
      if (!root.split(" ")[3].startsWith("ro")) breaches.push("root is writable");
      try {
        fs.writeFileSync("/code/main.js", "overwritten");
        breaches.push("rewrote its own code");
      } catch {}
      fs.writeFileSync("/tmp/dropped.sh", "#!/bin/sh\\necho ran\\n", { mode: 0o755 });
      try {
        execFileSync("/tmp/dropped.sh");
        breaches.push("ran a dropped program");
      } catch {}
      console.log(breaches.length === 0 ? "contained" : "BREACHED " + breaches);
    `;

    await expect(attack(code)).resolves.toMatchObject({ verdict: "ACCEPTED" });
  });

  // Contained by the mount namespace (it reads Alpine's /etc/passwd, not the
  // host's, whose root line ends in /bin/bash), --user, and --cap-drop ALL.
  it("reading /etc/passwd", async () => {
    const code = `
      const fs = require("fs");
      const breaches = [];
      const rootLine = fs.readFileSync("/etc/passwd", "utf8").split("\\n")[0];
      if (!rootLine.endsWith("/bin/sh")) breaches.push("host passwd: " + rootLine);
      if (process.getuid() !== 65534) breaches.push("uid " + process.getuid());
      const status = fs.readFileSync("/proc/self/status", "utf8");
      const bounding = status.match(/CapBnd:\\s+(\\w+)/)[1];
      if (BigInt("0x" + bounding) !== 0n) breaches.push("capabilities " + bounding);
      console.log(breaches.length === 0 ? "contained" : "BREACHED " + breaches);
    `;

    await expect(attack(code)).resolves.toMatchObject({ verdict: "ACCEPTED" });
  });
});
