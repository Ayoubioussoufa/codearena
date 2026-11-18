import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type {
  JudgeTask,
  SubmissionStore,
} from "../ports/submission-store.port";
import type { Judgement } from "../domain/verdict.entity";

@Injectable()
export class PrismaSubmissionStore implements SubmissionStore {
  constructor(private readonly prisma: PrismaService) {}

  async claim(
    submissionId: string,
    claimant: string,
    leaseMs: number,
  ): Promise<boolean> {
    // updateMany, not findUnique-then-update: ONE statement that checks and
    // writes. Two workers racing both send it; Postgres runs them one after
    // the other on the row, and the second one's WHERE no longer matches.
    const { count } = await this.prisma.submission.updateMany({
      where: {
        id: submissionId,
        OR: [
          { verdict: "PENDING" },
          // A claim older than the lease belongs to a dead worker.
          {
            verdict: "JUDGING",
            claimedAt: { lt: new Date(Date.now() - leaseMs) },
          },
        ],
      },
      data: { verdict: "JUDGING", claimedBy: claimant, claimedAt: new Date() },
    });
    return count === 1;
  }

  async load(submissionId: string): Promise<JudgeTask | null> {
    // One query: the submission, its problem's limits, and the tests in order.
    const row = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        userId: true,
        problemId: true,
        code: true,
        language: true,
        problem: {
          select: {
            timeLimitMs: true,
            memoryLimitMb: true,
            testCases: {
              orderBy: { order: "asc" },
              select: { input: true, expected: true },
            },
          },
        },
      },
    });
    if (!row) return null;
    return {
      submissionId,
      userId: row.userId,
      problemId: row.problemId,
      code: row.code,
      language: row.language,
      tests: row.problem.testCases,
      timeLimitMs: row.problem.timeLimitMs,
      memoryLimitMb: row.problem.memoryLimitMb,
    };
  }

  async saveVerdict(
    submissionId: string,
    claimant: string,
    judgement: Judgement,
  ): Promise<boolean> {
    // Fenced: if our claim was taken over (we were too slow, and the lease
    // expired), someone else's verdict wins and ours is dropped.
    const { count } = await this.prisma.submission.updateMany({
      where: { id: submissionId, verdict: "JUDGING", claimedBy: claimant },
      data: { verdict: judgement.verdict, runtimeMs: judgement.maxTimeMs },
    });
    return count === 1;
  }

  async release(submissionId: string, claimant: string): Promise<void> {
    await this.prisma.submission.updateMany({
      where: { id: submissionId, verdict: "JUDGING", claimedBy: claimant },
      data: { verdict: "PENDING", claimedBy: null, claimedAt: null },
    });
  }

  async markSystemError(submissionId: string): Promise<void> {
    // Only if no verdict was written: never overwrite a real result.
    await this.prisma.submission.updateMany({
      where: { id: submissionId, verdict: { in: ["PENDING", "JUDGING"] } },
      data: { verdict: "SYSTEM_ERROR", claimedBy: null, claimedAt: null },
    });
  }
}
