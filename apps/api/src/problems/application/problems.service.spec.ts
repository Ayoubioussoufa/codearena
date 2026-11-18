import { NotFoundException } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import type { Problem } from '../domain/problem.entity';
import type { ProblemsRepository } from '../ports/problems.repository';

const sample: Problem = {
  id: 1,
  slug: 'two-sum',
  title: 'Two Sum',
  difficulty: 'EASY',
  description: ['...'],
  constraints: [],
  examples: [],
  starterCode: {},
  acceptanceRate: 50,
  totalSubmissions: 100,
  tags: ['arrays'],
};

// The fake. No database — just an object with the right shape.
const fakeRepo: ProblemsRepository = {
  // No `async`: there's nothing to await. The interface only asks for a
  // Promise, and Promise.resolve() supplies one directly.
  findMany: () => Promise.resolve([sample]),
  findBySlug: (slug: string) =>
    Promise.resolve(slug === 'two-sum' ? sample : null),
};

describe('ProblemsService', () => {
  const service = new ProblemsService(fakeRepo);

  it('returns the problem when the slug exists', async () => {
    await expect(service.getBySlug('two-sum')).resolves.toEqual(sample);
  });

  it('throws NotFoundException when the slug does not exist', async () => {
    await expect(service.getBySlug('nope')).rejects.toThrow(NotFoundException);
  });

  it('returns null nextCursor when the page is not full', async () => {
    const result = await service.list({ limit: 20 });
    expect(result.nextCursor).toBeNull();
  });

  describe('pages (I-11)', () => {
    // Five problems, ids 1..5. The fake honours cursor and limit like the
    // real adapter: ids above the cursor, in order, at most `limit`.
    const ids = [1, 2, 3, 4, 5];
    const pagedRepo: ProblemsRepository = {
      findMany: ({ cursor, limit }) =>
        Promise.resolve(
          ids
            .filter((id) => cursor === undefined || id > cursor)
            .slice(0, limit)
            .map((id) => ({ ...sample, id })),
        ),
      findBySlug: () => Promise.resolve(null),
    };
    const paged = new ProblemsService(pagedRepo);

    it('returns a cursor when another page exists', async () => {
      const page = await paged.list({ limit: 2 });

      expect(page.items.map((p) => p.id)).toEqual([1, 2]);
      expect(page.nextCursor).toBe(2);
    });

    it('returns no cursor after a full last page, so the client stops', async () => {
      const page = await paged.list({ limit: 5 });

      expect(page.items).toHaveLength(5);
      expect(page.nextCursor).toBeNull();
    });
  });
});
