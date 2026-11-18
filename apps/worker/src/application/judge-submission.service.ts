import { Inject, Injectable, Logger } from "@nestjs/common";
import { JudgeService } from "./judge.service";
import {
  SUBMISSION_STORE,
  type SubmissionStore,
} from "../ports/submission-store.port";
import type { RunLimits } from "../ports/code-runner.port";

/** The sandbox's fixed walls. Time and memory come from the problem. */
const PIDS = 64;
const MAX_OUTPUT_BYTES = 1024 * 1024;

/**
 * One job: load the submission, judge it, store the verdict.
 *
 * A wrong answer is a successful job: it resolves. Only OUR failures throw
 * (Docker down, database down), and a throw tells BullMQ to retry.
 */
@Injectable()
export class JudgeSubmissionService {
  private readonly logger = new Logger(JudgeSubmissionService.name);

  constructor(
    @Inject(SUBMISSION_STORE) private readonly store: SubmissionStore,
    private readonly judge: JudgeService,
  ) {}

  async handle(submissionId: string): Promise<void> {
    const task = await this.store.load(submissionId);
    if (!task) {
      // Deleted since it was queued. Nothing to judge, and retrying won't help.
      this.logger.warn(`Submission ${submissionId} not found, skipped`);
      return;
    }

    const limits: RunLimits = {
      timeoutMs: task.timeLimitMs,
      memoryMb: task.memoryLimitMb,
      pids: PIDS,
      maxOutputBytes: MAX_OUTPUT_BYTES,
    };
    const judgement = await this.judge.judge(
      task.code,
      task.language,
      task.tests,
      limits,
    );
    await this.store.saveVerdict(submissionId, judgement);
    this.logger.log(`Submission ${submissionId}: ${judgement.verdict}`);
  }
}
