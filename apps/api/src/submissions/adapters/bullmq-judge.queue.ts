import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import {
  JUDGE_QUEUE_NAME,
  type JudgeJobData,
  type JudgeQueue,
} from '../ports/judge-queue';

@Injectable()
export class BullmqJudgeQueue implements JudgeQueue {
  constructor(
    @InjectQueue(JUDGE_QUEUE_NAME)
    private readonly queue: Queue<JudgeJobData>,
  ) {}

  async enqueue(submissionId: string): Promise<void> {
    // The payload is a pointer, never the code: the worker reads the row,
    // which is the truth, and 64 KB of user code never sits in Redis.
    // jobId = submissionId: BullMQ ignores an add whose id already exists,
    // so enqueuing the same submission twice makes one job.
    await this.queue.add(
      'judge',
      { submissionId },
      {
        jobId: submissionId,
        // Keep some history to look at, but don't let Redis fill up.
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );
  }
}
