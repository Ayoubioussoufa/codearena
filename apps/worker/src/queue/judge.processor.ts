import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { JudgeSubmissionService } from "../application/judge-submission.service";
import { JUDGE_QUEUE_NAME, type JudgeJobData } from "./judge-job";

/**
 * The worker's inbound adapter: what a controller is to the API. It turns a
 * job into a call to the use case, and knows nothing about judging.
 */
@Processor(JUDGE_QUEUE_NAME)
export class JudgeProcessor extends WorkerHost {
  constructor(private readonly judging: JudgeSubmissionService) {
    super();
  }

  async process(job: Job<JudgeJobData>): Promise<void> {
    await this.judging.handle(job.data.submissionId);
  }
}
