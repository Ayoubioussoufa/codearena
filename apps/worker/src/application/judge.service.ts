import { Inject, Injectable } from "@nestjs/common";
import { CODE_RUNNER, CodeRunner, RunLimits } from "../ports/code-runner.port";
import { Language, RunResult } from "../domain/run-result.entity";

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
}
