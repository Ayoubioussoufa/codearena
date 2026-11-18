import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  NewSubmission,
  SubmissionsRepository,
} from '../ports/submissions.repository';
import type { Submission } from '../domain/submissions.entity';
import type { Submission as SubmissionRow } from '../../../generated/prisma/client';

/** The adapter's one job: a Prisma row in, a domain Submission out. */
function toDomain(row: SubmissionRow): Submission {
  return {
    id: row.id,
    problemId: row.problemId,
    userId: row.userId,
    language: row.language,
    verdict: row.verdict,
    code: row.code,
    runtimeMs: row.runtimeMs,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class PrismaSubmissionsRepository implements SubmissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async problemExists(problemId: number): Promise<boolean> {
    // A yes or a no: fetch the id only, not the whole problem.
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      select: { id: true },
    });
    return problem !== null;
  }

  async create(data: NewSubmission): Promise<Submission> {
    // verdict, runtimeMs and createdAt come from the schema's defaults.
    const row = await this.prisma.submission.create({ data });
    return toDomain(row);
  }

  async findById(id: string): Promise<Submission | null> {
    const row = await this.prisma.submission.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }
}
