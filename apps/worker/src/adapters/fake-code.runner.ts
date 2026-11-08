import { Injectable } from "@nestjs/common";
import { CodeRunner, RunLimits } from "../ports/code-runner.port";
import { Language, RunResult } from "../domain/run-result.entity";

/**
 * A CodeRunner that never runs anything.
 *
 * Exists to prove the wiring without Docker: the module can bind CODE_RUNNER
 * to this in a test and to the real adapter in production, and nothing that
 * injects the port can tell the difference. That swap is the point of having
 * a port at all.
 */
@Injectable()
export class FakeCodeRunner implements CodeRunner {
  /** Every stdin received, so a test can check what ran, and in what order. */
  readonly inputs: string[] = [];

  private queue: (RunResult | Error)[] = [];

  private facts: RunResult = {
    outcome: "EXIT",
    exitCode: 0,
    stdout: "",
    stderr: "",
    timeMs: 1,
  };

  /** Scripts the facts that every run() returns. */
  willReturn(facts: RunResult): void {
    this.facts = facts;
  }

  /** Scripts one result per run(), in order. An Error makes that run throw. */
  willReturnInOrder(results: (RunResult | Error)[]): void {
    this.queue = [...results];
  }

  run(
    code: string,
    language: Language,
    limits: RunLimits,
    stdin: string,
  ): Promise<RunResult> {
    this.inputs.push(stdin);
    const next = this.queue.shift() ?? this.facts;
    // Not `async`: this does no asynchronous work, and saying otherwise would
    // be a lie the linter is right to catch. The real adapter awaits Docker.
    return next instanceof Error ? Promise.reject(next) : Promise.resolve(next);
  }
}
