import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

/**
 * A Redis client the container can inject and close, the same shape as
 * PrismaService. Without the quit on shutdown, the open socket keeps the
 * worker alive after Ctrl-C.
 */
@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      host: config.getOrThrow<string>("REDIS_HOST"),
      port: config.getOrThrow<number>("REDIS_PORT"),
    });
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
