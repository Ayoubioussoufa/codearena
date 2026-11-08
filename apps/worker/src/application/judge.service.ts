import { Inject, Injectable } from "@nestjs/common";
import { CODE_RUNNER, CodeRunner, RunLimits } from "../ports/code-runner.port";
import { Language, RunResult } from "../domain/run-result.entity";
import { compareTokens } from "../domain/token-checker";
import { Judgement, TestCase, Verdict } from "../domain/verdict.entity";

@Injectable()
export class JudgeService {
  constructor(@Inject(CODE_RUNNER) private readonly code: CodeRunner) {}

  async run(
    code: string,
    language: Language,
    limits: RunLimits,
    stdin: string,
  ): Promise<RunResult> {
    return await this.code.run(code, language, limits, stdin);
  }

  /**
   * Runs the tests in order and stops at the first failure. If the runner
   * throws (Docker is down), this throws too: that's our failure, and the
   * queue will retry it. Turning it into a verdict would blame the user.
   */
  async judge(
    code: string,
    language: Language,
    tests: TestCase[],
    limits: RunLimits,
  ): Promise<Judgement> {
    if (tests.length === 0) {
      throw new Error("A problem with no tests can't accept anything");
    }

    let maxTimeMs = 0;
    for (const [index, test] of tests.entries()) {
      const facts = await this.run(code, language, limits, test.input);
      maxTimeMs = Math.max(maxTimeMs, facts.timeMs);

      const failure = failureOf(facts, test.expected);
      if (failure !== null) {
        return { verdict: failure, failedTest: index + 1, maxTimeMs };
      }
    }
    return { verdict: "ACCEPTED", failedTest: null, maxTimeMs };
  }
}

/**
 * Limits first, then how it ended, and only then what it printed: a program
 * that prints the right answer and then crashes gets RUNTIME_ERROR.
 */
function failureOf(facts: RunResult, expected: string): Verdict | null {
  switch (facts.outcome) {
    case "TIMEOUT":
      return "TIME_LIMIT";
    case "MEMORY_LIMIT":
      return "MEMORY_LIMIT";
    case "OUTPUT_LIMIT":
      return "OUTPUT_LIMIT";
    case "SIGNAL":
      return "RUNTIME_ERROR";
    case "EXIT":
      if (facts.exitCode !== 0) return "RUNTIME_ERROR";
      return compareTokens(expected, facts.stdout) ? null : "WRONG_ANSWER";
  }
}
