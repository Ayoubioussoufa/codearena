import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";
import { JudgeService } from "./application/judge.service";

async function bootstrap() {
  // createApplicationContext, NOT create: this gives the DI container with no
  // HTTP server and nothing listening on a port. A worker that runs hostile
  // code should not also be a network service.
  const app = await NestFactory.createApplicationContext(WorkerModule);
  const logger = new Logger("Worker");

  // Outside a class there is no constructor to inject into, so ask the
  // container directly. app.get() is the manual form of @Inject.
  const judge = app.get(JudgeService);

  // Today this is a smoke test. Wednesday it becomes a queue consumer.
  const limits = {
    timeoutMs: 2000,
    memoryMb: 256,
    pids: 64,
    maxOutputBytes: 1024 * 1024,
  };
  const result = await judge.run(
    "console.log(2 + 3)",
    "TYPESCRIPT",
    limits,
    "",
  );

  logger.log(`outcome=${result.outcome} timeMs=${result.timeMs}ms`);

  await app.close();
}

void bootstrap();
