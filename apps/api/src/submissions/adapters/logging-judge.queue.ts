import { Injectable, Logger } from '@nestjs/common';
import type { JudgeQueue } from '../ports/judge-queue';

/** A stand-in until BullMQ arrives: the app runs today without Redis. */
@Injectable()
export class LoggingJudgeQueue implements JudgeQueue {
  private readonly logger = new Logger(LoggingJudgeQueue.name);

  enqueue(submissionId: string): Promise<void> {
    this.logger.log(`would enqueue submission ${submissionId}`);
    return Promise.resolve();
  }
}
