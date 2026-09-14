import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JudgeService } from "./application/judge.service";
import { CODE_RUNNER } from "./ports/code-runner.port";
import { FakeCodeRunner } from "./adapters/fake-code.runner";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [JudgeService, { provide: CODE_RUNNER, useClass: FakeCodeRunner }],
})
export class WorkerModule {}
