import { NotFoundException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import type { Submission } from '../domain/submissions.entity';
import type {
  NewSubmission,
  SubmissionsRepository,
} from '../ports/submissions.repository';
import type { JudgeQueue } from '../ports/judge-queue';

/** A repository in memory. Problem 1 exists; nothing else does. */
class FakeRepo implements SubmissionsRepository {
  readonly rows: Submission[] = [];

  problemExists(problemId: number): Promise<boolean> {
    return Promise.resolve(problemId === 1);
  }

  create(data: NewSubmission): Promise<Submission> {
    const row: Submission = {
      ...data,
      id: `sub-${this.rows.length + 1}`,
      verdict: 'PENDING',
      runtimeMs: null,
      createdAt: new Date(),
    };
    this.rows.push(row);
    return Promise.resolve(row);
  }

  findById(id: string): Promise<Submission | null> {
    return Promise.resolve(this.rows.find((r) => r.id === id) ?? null);
  }
}

/** Records every id it's given, and whether the row existed at that moment. */
class FakeQueue implements JudgeQueue {
  readonly ids: string[] = [];
  readonly rowExistedWhenEnqueued: boolean[] = [];

  constructor(private readonly repo: FakeRepo) {}

  enqueue(submissionId: string): Promise<void> {
    this.ids.push(submissionId);
    this.rowExistedWhenEnqueued.push(
      this.repo.rows.some((r) => r.id === submissionId),
    );
    return Promise.resolve();
  }
}

describe('SubmissionsService', () => {
  const input = {
    problemId: 1,
    language: 'JAVASCRIPT' as const,
    code: 'console.log(1)',
  };

  let repo: FakeRepo;
  let queue: FakeQueue;
  let service: SubmissionsService;

  // Fresh fakes for every test: no test can leak rows into the next one.
  beforeEach(() => {
    repo = new FakeRepo();
    queue = new FakeQueue(repo);
    service = new SubmissionsService(repo, queue);
  });

  describe('submit', () => {
    it('stores one PENDING submission and enqueues exactly its id', async () => {
      const { id } = await service.submit('alice', input);

      expect(repo.rows).toHaveLength(1);
      expect(repo.rows[0]).toMatchObject({
        id,
        userId: 'alice',
        verdict: 'PENDING',
      });
      expect(queue.ids).toEqual([id]);
    });

    it('rejects an unknown problem, and stores and queues nothing', async () => {
      await expect(
        service.submit('alice', { ...input, problemId: 999 }),
      ).rejects.toThrow(NotFoundException);

      expect(repo.rows).toHaveLength(0);
      expect(queue.ids).toHaveLength(0);
    });

    it('writes the row before it enqueues the job', async () => {
      await service.submit('alice', input);

      expect(queue.rowExistedWhenEnqueued).toEqual([true]);
    });
  });

  describe('getForOwner', () => {
    it("returns the owner's submission", async () => {
      const { id } = await service.submit('alice', input);

      await expect(service.getForOwner('alice', id)).resolves.toMatchObject({
        id,
      });
    });

    it("answers 404, not 403, for someone else's submission", async () => {
      const { id } = await service.submit('alice', input);

      await expect(service.getForOwner('bob', id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('answers 404 for an id that does not exist', async () => {
      await expect(service.getForOwner('alice', 'nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
