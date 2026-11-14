import { Inject, Injectable } from '@nestjs/common';
import {
  SUBMISSIONS_REPOSITORY,
  type SubmissionsRepository,
} from '../ports/submissions.repository';
import { Submission } from '../domain/submissions.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @Inject(SUBMISSIONS_REPOSITORY)
    private readonly repo: SubmissionsRepository,
  ) {}

  async create(submission: Submission): Promise<Submission> {
    return this.repo.create(submission);
  }

  async problemExists(problemId: number): Promise<boolean> {
    return this.repo.problemExists(problemId);
  }

  async findById(id: string): Promise<Submission | null> {
    return this.repo.findById(id);
  }
}
