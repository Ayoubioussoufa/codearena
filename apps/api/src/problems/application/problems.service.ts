import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PROBLEMS_REPOSITORY,
  type ProblemsRepository,
  type FindManyParams,
} from '../ports/problems.repository';
import { Problem } from '../domain/problem.entity';

@Injectable()
export class ProblemsService {
  constructor(
    @Inject(PROBLEMS_REPOSITORY)
    private readonly repo: ProblemsRepository,
  ) {}

  async list(params: FindManyParams) {
    // Ask for one more than the page: if it comes back, a next page exists.
    // A full last page no longer costs the client an empty request (I-11).
    const rows = await this.repo.findMany({
      ...params,
      limit: params.limit + 1,
    });
    const items = rows.slice(0, params.limit);
    const nextCursor =
      rows.length > params.limit ? items[items.length - 1]!.id : null;
    return { items, nextCursor };
  }

  async getBySlug(slug: string): Promise<Problem> {
    const problem = await this.repo.findBySlug(slug);
    if (!problem) {
      throw new NotFoundException(`Problem ${slug} not found`);
    }
    return problem;
  }
}
