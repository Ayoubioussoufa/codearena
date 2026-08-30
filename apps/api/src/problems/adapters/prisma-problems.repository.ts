import { Injectable } from '@nestjs/common';
import {
  FindManyParams,
  ProblemsRepository,
} from '../ports/problems.repository';
import { Problem } from '../domain/problem.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaProblemsRepository implements ProblemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: FindManyParams): Promise<Problem[]> {
    const rows = await this.prisma.problem.findMany({
      take: params.limit,
      ...(params.cursor !== undefined && {
        cursor: { id: params.cursor },
        skip: 1,
      }),
      where: {
        ...(params.difficulty && { difficulty: params.difficulty }),
        ...(params.tag && { tags: { some: { name: params.tag } } }),
        ...(params.q && {
          title: { contains: params.q, mode: 'insensitive' },
        }),
      },
      orderBy: { id: 'asc' },
      include: {
        tags: true,
        examples: { orderBy: { order: 'asc' } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      difficulty: r.difficulty,
      description: r.description,
      constraints: r.constraints,
      examples: r.examples.map((e) => ({
        input: e.input,
        output: e.output,
        explanation: e.explanation ?? undefined,
      })),
      starterCode: r.starterCode as Record<string, string>,
      acceptanceRate: r.acceptanceRate,
      totalSubmissions: r.totalSubmissions,
      tags: r.tags.map((t) => t.name),
    }));
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
