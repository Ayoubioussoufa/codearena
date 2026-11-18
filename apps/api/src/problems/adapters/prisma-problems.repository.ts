import { Injectable } from '@nestjs/common';
import {
  FindManyParams,
  ProblemsRepository,
} from '../ports/problems.repository';
import { Problem, ProblemSummary } from '../domain/problem.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaProblemsRepository implements ProblemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: FindManyParams): Promise<ProblemSummary[]> {
    const rows = await this.prisma.problem.findMany({
      where: {
        // Keyset: "ids after this one". Prisma's `cursor` looks the cursor's
        // row up first, so a deleted row ended the list early (I-10).
        ...(params.cursor !== undefined && { id: { gt: params.cursor } }),
        ...(params.difficulty && { difficulty: params.difficulty }),
        ...(params.tag && { tags: { some: { name: params.tag } } }),
        ...(params.q && {
          title: { contains: params.q, mode: 'insensitive' },
        }),
      },
      orderBy: { id: 'asc' },
      take: params.limit,
      // Only what the list page shows (I-15).
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        acceptanceRate: true,
        totalSubmissions: true,
        tags: { select: { name: true } },
      },
    });
    return rows.map((r) => ({ ...r, tags: r.tags.map((t) => t.name) }));
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const row = await this.prisma.problem.findUnique({
      where: { slug },
      include: {
        tags: true,
        examples: { orderBy: { order: 'asc' } },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      difficulty: row.difficulty,
      description: row.description,
      constraints: row.constraints,
      examples: row.examples.map((e) => ({
        input: e.input,
        output: e.output,
        explanation: e.explanation ?? undefined,
      })),
      starterCode: row.starterCode as Record<string, string>,
      acceptanceRate: row.acceptanceRate,
      totalSubmissions: row.totalSubmissions,
      tags: row.tags.map((t) => t.name),
    };
  }
}
