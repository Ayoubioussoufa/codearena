import { Injectable } from "@nestjs/common";
import { CodeRunner } from "../ports/code-runner.port";
import { RunResult } from "../domain/run-result.entity";

/**
 * A CodeRunner that never runs anything.
 *
 * Exists to prove the wiring without Docker: the module can bind CODE_RUNNER
 * to this in a test and to the real adapter in production, and nothing that
 * injects the port can tell the difference. That swap is the point of having
 * a port at all.
 *
 * It declares NO parameters, which still satisfies the interface — a function
 * taking fewer arguments is assignable to one taking more. A fake that ignores
 * its input should say so rather than accept and discard it.
 */
@Injectable()
export class FakeCodeRunner implements CodeRunner {
  private facts: RunResult = {
    outcome: "EXIT",
    exitCode: 0,
    stdout: "",
    stderr: "",
    timeMs: 1,
  };

  /** Scripts the facts that the next run() calls return. */
  willReturn(facts: RunResult): void {
    this.facts = facts;
  }

  run(): Promise<RunResult> {
    // Not `async`: this does no asynchronous work, and saying otherwise would
    // be a lie the linter is right to catch. The real adapter awaits Docker.
    return Promise.resolve(this.facts);
  }
}
