import { randomUUID } from "node:crypto";
import { hostname } from "node:os";
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
 * How long a claim protects a submission. It must outlast the slowest legal
 * run: 20 tests × (a 5 s limit + 1 s grace + start-up) is about 2 minutes,
 * so 5 minutes leaves room. Too short, and a slow run gets judged twice.
 */
export const LEASE_MS = 5 * 60_000;

/**
 * One job: claim the submission, judge it, store the verdict.
 *
 * Delivering the same job twice judges once: the claim lets one caller in.
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
    // Unique per attempt, readable in the database when you debug.
    const claimant = `${hostname()}:${process.pid}:${randomUUID().slice(0, 8)}`;

    if (!(await this.store.claim(submissionId, claimant, LEASE_MS))) {
      // Already judged, being judged, or deleted. Not an error: a second
      // delivery is supposed to end here.
      this.logger.log(`Submission ${submissionId} not claimable, skipped`);
      return;
    }

    try {
      const task = await this.store.load(submissionId);
      if (!task) return; // deleted between the claim and the load

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

      if (await this.store.saveVerdict(submissionId, claimant, judgement)) {
        this.logger.log(`Submission ${submissionId}: ${judgement.verdict}`);
      } else {
        this.logger.warn(
          `Submission ${submissionId}: lost the claim, verdict dropped`,
        );
      }
    } catch (error) {
      // Our failure. Give the claim back so the retry can take it now,
      // instead of waiting for the lease to expire.
      await this.store.release(submissionId, claimant);
      throw error;
    }
  }

  /** After the last retry: the user sees SYSTEM_ERROR, not PENDING forever. */
  async giveUp(submissionId: string): Promise<void> {
    await this.store.markSystemError(submissionId);
    this.logger.error(
      `Submission ${submissionId}: SYSTEM_ERROR after the last retry`,
    );
  }
}
