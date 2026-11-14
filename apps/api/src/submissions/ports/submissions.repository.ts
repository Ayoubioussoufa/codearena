import { Submission } from '../domain/submissions.entity';

export type NewSubmission = Pick<
  Submission,
  'userId' | 'problemId' | 'language' | 'code'
>;

export interface SubmissionsRepository {
  problemExists(problemId: number): Promise<boolean>;
  create(data: NewSubmission): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
}

export const SUBMISSIONS_REPOSITORY = Symbol('SubmissionsRepository');
