import { Problem, ProblemSummary, Difficulty } from '../domain/problem.entity';

export interface FindManyParams {
  cursor?: number;
  limit: number;
  difficulty?: Difficulty;
  tag?: string;
  q?: string;
}

export interface ProblemsRepository {
  /** Ids above `cursor`, in id order, at most `limit` of them. */
  findMany(params: FindManyParams): Promise<ProblemSummary[]>;
  findBySlug(slug: string): Promise<Problem | null>;
}

export const PROBLEMS_REPOSITORY = Symbol('ProblemsRepository');
