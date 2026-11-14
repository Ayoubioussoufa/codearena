import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmissionsRepository } from '../ports/submissions.repository';
import { Submission } from '../domain/submissions.entity';

@Injectable()
export class PrismaSubmissionsRepository implements SubmissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(submissions: Submission): Promise<Submission> {
    const rows = await this.prisma.submission.create({
      data: {
        problemId: submissions.problemId,
        userId: submissions.userId,
        language: submissions.language,
        code: submissions.code,
        runtimeMs: submissions.runtimeMs,
        createdAt: submissions.createdAt,
      },
    });

    return {
      id: rows.id,
      problemId: rows.problemId,
      userId: rows.userId,
      language: rows.language,
      verdict: rows.verdict,
      code: rows.code,
      runtimeMs: rows.runtimeMs !== null ? rows.runtimeMs : null,
      createdAt: rows.createdAt,
    };
  }

  async problemExists(problemId: number): Promise<boolean> {
    const count = await this.prisma.problem.count({
      where: { id: problemId },
    });
    return count > 0;
  }

  async findById(id: string): Promise<Submission | null> {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return null;
    }

    return {
      id: submission.id,
      problemId: submission.problemId,
      userId: submission.userId,
      language: submission.language,
      verdict: submission.verdict,
      code: submission.code,
      runtimeMs: submission.runtimeMs !== null ? submission.runtimeMs : null,
      createdAt: submission.createdAt,
    };
  }
}
