import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { validateEnv } from "./config/env.schema";
import { PrismaService } from "./prisma/prisma.service";
import { JudgeService } from "./application/judge.service";
import { JudgeSubmissionService } from "./application/judge-submission.service";
import { CODE_RUNNER } from "./ports/code-runner.port";
import { SUBMISSION_STORE } from "./ports/submission-store.port";
import { DockerCodeRunner } from "./adapters/docker-code.runner";
import { PrismaSubmissionStore } from "./adapters/prisma-submission.store";
import { JudgeProcessor } from "./queue/judge.processor";
import { JUDGE_QUEUE_NAME } from "./queue/judge-job";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow<string>("REDIS_HOST"),
          port: config.getOrThrow<number>("REDIS_PORT"),
        },
      }),
    }),
    BullModule.registerQueue({ name: JUDGE_QUEUE_NAME }),
  ],
  providers: [
    PrismaService,
    JudgeService,
    JudgeSubmissionService,
    // Listed here, or Nest never finds it and no job is ever processed.
    JudgeProcessor,
    { provide: CODE_RUNNER, useClass: DockerCodeRunner },
    { provide: SUBMISSION_STORE, useClass: PrismaSubmissionStore },
  ],
})
export class WorkerModule {}
