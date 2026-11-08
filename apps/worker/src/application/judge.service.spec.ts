import { Test } from "@nestjs/testing";
import { JudgeService } from "./judge.service";
import { FakeCodeRunner } from "../adapters/fake-code.runner";
import { CODE_RUNNER, RunLimits } from "../ports/code-runner.port";
import { RunResult } from "../domain/run-result.entity";
import { TestCase } from "../domain/verdict.entity";

const limits: RunLimits = {
  timeoutMs: 1000,
  memoryMb: 256,
  pids: 64,
  maxOutputBytes: 1024,
};

const tests: TestCase[] = [
  { input: "in1", expected: "out1\n" },
  { input: "in2", expected: "out2\n" },
  { input: "in3", expected: "out3\n" },
];

const output = { stdout: "", stderr: "", timeMs: 10 };
const passes = (test: number, timeMs = 10): RunResult => ({
  ...output,
  outcome: "EXIT",
  exitCode: 0,
  stdout: `out${test}\n`,
  timeMs,
});

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

  describe("judge", () => {
    const judgeTests = () => judge.judge("code", "JAVASCRIPT", tests, limits);

    it("accepts when every test passes, and reports the slowest", async () => {
      runner.willReturnInOrder([passes(1, 12), passes(2, 40), passes(3, 7)]);

      await expect(judgeTests()).resolves.toEqual({
        verdict: "ACCEPTED",
        failedTest: null,
        maxTimeMs: 40,
      });
    });

    it("sends each test's input to the runner, in order", async () => {
      runner.willReturnInOrder([passes(1), passes(2), passes(3)]);

      await judgeTests();

      expect(runner.inputs).toEqual(["in1", "in2", "in3"]);
    });

    it.each<[string, RunResult, string]>([
      [
        "a wrong answer",
        { ...output, outcome: "EXIT", exitCode: 0, stdout: "no" },
        "WRONG_ANSWER",
      ],
      ["a timeout", { ...output, outcome: "TIMEOUT" }, "TIME_LIMIT"],
      [
        "the OOM killer",
        { ...output, outcome: "MEMORY_LIMIT" },
        "MEMORY_LIMIT",
      ],
      [
        "too much output",
        { ...output, outcome: "OUTPUT_LIMIT" },
        "OUTPUT_LIMIT",
      ],
      [
        "a non-zero exit",
        { ...output, outcome: "EXIT", exitCode: 1 },
        "RUNTIME_ERROR",
      ],
      [
        "a signal",
        { ...output, outcome: "SIGNAL", signal: "11" },
        "RUNTIME_ERROR",
      ],
    ])(
      "turns %s on test 2 into a verdict and stops",
      async (_name, facts, verdict) => {
        runner.willReturnInOrder([passes(1), facts]);

        const judgement = await judgeTests();

        expect(judgement).toMatchObject({ verdict, failedTest: 2 });
        expect(runner.inputs).toHaveLength(2);
      },
    );

    it("calls a crash after the right output a runtime error", async () => {
      const crash: RunResult = {
        ...output,
        outcome: "EXIT",
        exitCode: 139,
        stdout: "out1\n",
      };
      runner.willReturnInOrder([crash]);

      await expect(judgeTests()).resolves.toMatchObject({
        verdict: "RUNTIME_ERROR",
        failedTest: 1,
      });
    });

    it("lets an infrastructure failure through as an error", async () => {
      runner.willReturnInOrder([passes(1), new Error("Docker is down")]);

      await expect(judgeTests()).rejects.toThrow("Docker is down");
    });

    it("refuses a problem with no tests", async () => {
      await expect(
        judge.judge("code", "JAVASCRIPT", [], limits),
      ).rejects.toThrow("no tests");
    });
  });
});
