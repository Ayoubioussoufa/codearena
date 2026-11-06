import { Test } from "@nestjs/testing";
import { JudgeService } from "./judge.service";
import { FakeCodeRunner } from "../adapters/fake-code.runner";
import { CODE_RUNNER } from "../ports/code-runner.port";

describe("JudgeService", () => {
  it("returns what the bound runner returns", async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JudgeService,
        { provide: CODE_RUNNER, useClass: FakeCodeRunner },
      ],
    }).compile();
    const judgeService = moduleRef.get(JudgeService);
    const code = 'console.log("Hello, World!");';
    const language = "TYPESCRIPT";
    const limits = { timeoutMs: 1000, memoryMb: 256, pids: 1 };
    const result = await judgeService.run(code, language, limits);
    expect(result).toEqual({
      verdict: "ACCEPTED",
      runtimeMs: 1,
      stdout: "",
      stderr: "",
    });
  });
});
