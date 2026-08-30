import { Problem, Difficulty } from '../domain/problem.entity';

export interface FindManyParams {
  cursor?: number;
  limit: number;
  difficulty?: Difficulty;
  tag?: string;
  q?: string;
}

export interface ProblemsRepository {
  findMany(params: FindManyParams): Promise<Problem[]>;
  findBySlug(slug: string): Promise<Problem | null>;
}

export const PROBLEMS_REPOSITORY = Symbol('ProblemsRepository');
