import { execFileSync } from "node:child_process";
import { DockerCodeRunner } from "./docker-code.runner";
import { RunLimits } from "../ports/code-runner.port";

const limits: RunLimits = {
  timeoutMs: 1000,
  memoryMb: 128,
  pids: 64,
  maxOutputBytes: 64 * 1024,
};

const leftovers = () =>
  execFileSync("docker", [
    "ps",
    "-a",
    "--filter",
    "name=codearena-run-",
    "--format",
    "{{.Names}}",
  ])
    .toString()
    .trim();

describe("DockerCodeRunner", () => {
  const runner = new DockerCodeRunner();

  afterEach(() => {
    expect(leftovers()).toBe("");
  });

  it("runs a program and reports its output", async () => {
    const facts = await runner.run(
      "console.log(2 + 3)",
      "JAVASCRIPT",
      limits,
      "",
    );

    expect(facts).toMatchObject({
      outcome: "EXIT",
      exitCode: 0,
      stdout: "5\n",
    });
  });

  it("passes stdin to the program", async () => {
    const code = `console.log(require("fs").readFileSync(0, "utf8").trim() * 2)`;

    const facts = await runner.run(code, "JAVASCRIPT", limits, "21\n");

    expect(facts.stdout).toBe("42\n");
  });

  it("survives a program that never reads a large stdin", async () => {
    const facts = await runner.run(
      "process.exit(0)",
      "JAVASCRIPT",
      limits,
      "x".repeat(1024 * 1024),
    );

    expect(facts).toMatchObject({ outcome: "EXIT", exitCode: 0 });
  });

  it("reports a non-zero exit code", async () => {
    const facts = await runner.run("process.exit(3)", "JAVASCRIPT", limits, "");

    expect(facts).toMatchObject({ outcome: "EXIT", exitCode: 3 });
  });

  it("stops an infinite loop at the limit (I-17)", async () => {
    const facts = await runner.run("while (true) {}", "JAVASCRIPT", limits, "");

    expect(facts.outcome).toBe("TIMEOUT");
  });

  it("stops a program that prints forever", async () => {
    const facts = await runner.run(
      `while (true) console.log("x".repeat(1000))`,
      "JAVASCRIPT",
      limits,
      "",
    );

    expect(facts.outcome).toBe("OUTPUT_LIMIT");
    expect(facts.stdout.length).toBeLessThanOrEqual(limits.maxOutputBytes);
  });

  it("reports the OOM killer as a memory limit", async () => {
    const code = `const kept = []; while (true) kept.push(new Array(1e6).fill(1.5));`;

    const facts = await runner.run(code, "JAVASCRIPT", limits, "");

    expect(facts.outcome).toBe("MEMORY_LIMIT");
  });

  it("reports the time without the container's start-up", async () => {
    const facts = await runner.run("console.log(1)", "JAVASCRIPT", limits, "");

    expect(facts.timeMs).toBeLessThan(500);
  });
});
