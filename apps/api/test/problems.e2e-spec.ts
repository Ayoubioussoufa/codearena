import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';

/** I-10: the cursor's row being deleted must not end the list early. */
describe('Problems pagination (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  let ids: number[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    prisma = app.get(PrismaService);

    // Three problems with a tag no other problem has, so the list is ours.
    for (const n of [1, 2, 3]) {
      const p = await prisma.problem.create({
        data: {
          slug: `page-${unique}-${n}`,
          title: `Paging ${n}`,
          difficulty: 'EASY',
          description: ['x'],
          constraints: [],
          starterCode: {},
          tags: {
            connectOrCreate: {
              where: { name: `paging-${unique}` },
              create: { name: `paging-${unique}` },
            },
          },
        },
      });
      ids.push(p.id);
    }
  });

  afterAll(async () => {
    await prisma.problem.deleteMany({ where: { id: { in: ids } } });
    await prisma.tag.deleteMany({ where: { name: `paging-${unique}` } });
    await app.close();
  });

  it("keeps paging after the cursor's row is deleted", async () => {
    const first = await request(app.getHttpServer())
      .get(`/problems?limit=1&tag=paging-${unique}`)
      .expect(200);
    const { nextCursor } = first.body as { nextCursor: number };
    expect(nextCursor).toBe(ids[0]);

    // Someone deletes the problem the client's cursor points at.
    await prisma.problem.delete({ where: { id: nextCursor } });
    ids = ids.slice(1);

    const second = await request(app.getHttpServer())
      .get(`/problems?limit=1&tag=paging-${unique}&cursor=${nextCursor}`)
      .expect(200);
    const { items } = second.body as { items: { id: number }[] };
    expect(items.map((p) => p.id)).toEqual([ids[0]]);
  });
});
