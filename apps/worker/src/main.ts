import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";

async function bootstrap() {
  // createApplicationContext, NOT create: the DI container with no HTTP
  // server. A worker that runs hostile code should not also be a network
  // service.
  const app = await NestFactory.createApplicationContext(WorkerModule);

  // SIGTERM or Ctrl-C → app.close() → the BullMQ worker closes: it takes no
  // new job and lets the active one finish. Without this, a deploy kills a
  // job mid-run, and it comes back later as "stalled".
  app.enableShutdownHooks();

  new Logger("Worker").log("Waiting for jobs on the judge queue");
}

void bootstrap();
