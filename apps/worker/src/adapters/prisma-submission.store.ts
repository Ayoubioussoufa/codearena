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

  async load(submissionId: string): Promise<JudgeTask | null> {
    // One query: the submission, its problem's limits, and the tests in order.
    const row = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
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
      code: row.code,
      language: row.language,
      tests: row.problem.testCases,
      timeLimitMs: row.problem.timeLimitMs,
      memoryLimitMb: row.problem.memoryLimitMb,
    };
  }

  async saveVerdict(submissionId: string, judgement: Judgement): Promise<void> {
    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { verdict: judgement.verdict, runtimeMs: judgement.maxTimeMs },
    });
  }
}
