import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SUBMISSIONS_REPOSITORY,
  type NewSubmission,
  type SubmissionsRepository,
} from '../ports/submissions.repository';
import { JUDGE_QUEUE, type JudgeQueue } from '../ports/judge-queue';
import type { Submission } from '../domain/submissions.entity';

/** What the caller supplies. The user id comes from the token, never the body. */
export type SubmitInput = Omit<NewSubmission, 'userId'>;

/**
 * POST /submissions → 202 { id }: the work is accepted, not done.
 * GET /submissions/:id → the submission, for its owner only.
 */
@Injectable()
export class SubmissionsService {
  constructor(
    @Inject(SUBMISSIONS_REPOSITORY)
    private readonly repo: SubmissionsRepository,
    @Inject(JUDGE_QUEUE) private readonly queue: JudgeQueue,
  ) {}

  async submit(userId: string, input: SubmitInput): Promise<{ id: string }> {
    if (!(await this.repo.problemExists(input.problemId))) {
      throw new NotFoundException(`Problem ${input.problemId} not found`);
    }
    // The row first, then the job. If we die in between, the row waits as
    // PENDING, which we can find and re-enqueue. The other order would give
    // the worker a job pointing at a row that doesn't exist yet.
    const submission = await this.repo.create({ userId, ...input });
    await this.queue.enqueue(submission.id);
    return { id: submission.id };
  }

  async getForOwner(userId: string, id: string): Promise<Submission> {
    const submission = await this.repo.findById(id);
    // Same answer for "doesn't exist" and "not yours": a 403 would confirm
    // to a stranger that the id exists.
    if (!submission || submission.userId !== userId) {
      throw new NotFoundException('Submission not found');
    }
    return submission;
  }
}
