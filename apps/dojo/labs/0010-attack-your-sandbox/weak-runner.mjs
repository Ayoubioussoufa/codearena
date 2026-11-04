// A deliberately WEAKENED runner, used only to test your attack suite: each
// "mutant" drops one protection. If your suite still passes against a mutant,
// your suite can't see that protection, and wouldn't notice it going missing.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const HARDENING = {
  network: ["--network", "none"],
  readonly: ["--read-only", "--tmpfs", "/tmp:rw,noexec,nosuid,size=16m"],
  memory: ["--memory", "128m", "--memory-swap", "128m"],
  pids: ["--pids-limit", "64"],
  caps: ["--cap-drop", "ALL", "--security-opt", "no-new-privileges"],
  user: ["--user", "65534:65534"],
};
export const MUTANTS = Object.keys(HARDENING);

/** A runner with one protection removed (or none, with mutant = null). */
export function weakRunner(mutant) {
  return async function runInDocker({ source, input = "", timeoutMs }) {
    const name = `lab10-${randomBytes(6).toString("hex")}`;
    const dir = mkdtempSync(join(tmpdir(), "lab10-"));
    chmodSync(dir, 0o755);
    writeFileSync(join(dir, "main.py"), source, { mode: 0o644 });
    const flags = Object.entries(HARDENING).flatMap(([k, f]) => (k === mutant ? [] : f));
    const args = ["run", "-i", "--name", name, "--cpus", "1", ...flags, "-v", `${dir}:/code:ro`, "python:3.12-alpine", "python3", "/code/main.py"];
    try {
      return await new Promise((resolve) => {
        const child = spawn("docker", args);
        let stdout = "", stderr = "", timedOut = false;
        child.stdout.on("data", (d) => { if (stdout.length < 100000) stdout += d; });
        child.stderr.on("data", (d) => { if (stderr.length < 100000) stderr += d; });
        child.stdin.on("error", () => {});
        child.stdin.end(input);
        const timer = setTimeout(() => { timedOut = true; spawnSync("docker", ["kill", name], { stdio: "ignore" }); }, timeoutMs);
        child.on("close", (code) => {
          clearTimeout(timer);
          const oom = spawnSync("docker", ["inspect", "-f", "{{.State.OOMKilled}}", name], { encoding: "utf8" }).stdout.trim() === "true";
          resolve({ outcome: timedOut ? "timeout" : oom ? "memory-limit" : "exit", exitCode: timedOut || oom ? null : code, stdout, stderr, timeMs: 0 });
        });
      });
    } finally {
      spawnSync("docker", ["rm", "-f", name], { stdio: "ignore" });
      rmSync(dir, { recursive: true, force: true });
    }
  };
}
