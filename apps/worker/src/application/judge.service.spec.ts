import { Test } from "@nestjs/testing";
import { JudgeService } from "./judge.service";
import { FakeCodeRunner } from "../adapters/fake-code.runner";
import { CODE_RUNNER, RunLimits } from "../ports/code-runner.port";
import { RunResult } from "../domain/run-result.entity";

const limits: RunLimits = {
  timeoutMs: 1000,
  memoryMb: 256,
  pids: 64,
  maxOutputBytes: 1024,
};

const timeout: RunResult = {
  outcome: "TIMEOUT",
  stdout: "",
  stderr: "",
  timeMs: 1000,
};

describe("JudgeService", () => {
  let runner: FakeCodeRunner;
  let judge: JudgeService;

  beforeEach(async () => {
    runner = new FakeCodeRunner();
    const moduleRef = await Test.createTestingModule({
      providers: [JudgeService, { provide: CODE_RUNNER, useValue: runner }],
    }).compile();
    judge = moduleRef.get(JudgeService);
  });

  it("passes a scripted timeout through untouched", async () => {
    runner.willReturn(timeout);

    const result = await judge.run("while(true){}", "JAVASCRIPT", limits, "");

    expect(result).toBe(timeout);
  });

  it("does not let a timeout expose an exit code", async () => {
    runner.willReturn(timeout);

    const result = await judge.run("while(true){}", "JAVASCRIPT", limits, "");

    if (result.outcome !== "TIMEOUT") {
      throw new Error(`expected TIMEOUT, got ${result.outcome}`);
    }
    // @ts-expect-error a timeout has no exit code, so this must not compile
    expect(result.exitCode).toBeUndefined();
  });
});
