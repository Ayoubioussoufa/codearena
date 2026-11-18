import { Logger } from "@nestjs/common";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { JudgeSubmissionService } from "../application/judge-submission.service";
import { JUDGE_QUEUE_NAME, type JudgeJobData } from "./judge-job";

@Processor(JUDGE_QUEUE_NAME)
export class JudgeProcessor extends WorkerHost {
  private readonly logger = new Logger(JudgeProcessor.name);

  constructor(private readonly judging: JudgeSubmissionService) {
    super();
  }

  async process(job: Job<JudgeJobData>): Promise<void> {
    await this.judging.handle(job.data.submissionId);
  }

  /** Runs after every failed attempt. Only the last one ends the submission. */
  @OnWorkerEvent("failed")
  async onFailed(job: Job<JudgeJobData> | undefined, error: Error) {
    if (!job) return;
    const attempts = job.opts.attempts ?? 1;
    this.logger.warn(
      `Job ${job.id}: attempt ${job.attemptsMade}/${attempts} failed: ${error.message}`,
    );
    if (job.attemptsMade >= attempts) {
      await this.judging.giveUp(job.data.submissionId);
    }
  }
}
