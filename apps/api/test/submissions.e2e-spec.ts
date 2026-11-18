import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { JUDGE_QUEUE } from '../src/submissions/ports/judge-queue';

describe('Submissions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let problemId: number;
  const queued: string[] = [];

  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const password = 'correct-horse-battery';
  const alice = {
    email: `sub-a-${unique}@test.com`,
    username: `suba${unique}`.slice(0, 20),
  };
  const bob = {
    email: `sub-b-${unique}@test.com`,
    username: `subb${unique}`.slice(0, 20),
  };
  let aliceToken: string;
  let bobToken: string;

  const http = () => request(app.getHttpServer());

  const tokenFor = async (user: { email: string; username: string }) => {
    await http()
      .post('/auth/register')
      .send({ ...user, password })
      .expect(201);
    const res = await http()
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      // Same reason as in auth.e2e-spec.ts: the limit is tested elsewhere.
      .overrideProvider(ThrottlerStorage)
      .useValue({
        increment: () =>
          Promise.resolve({
            totalHits: 1,
            timeToExpire: 60,
            isBlocked: false,
            timeToBlockExpire: 0,
          }),
      })
      // This suite is about HTTP. The queue gets its own test; here a fake
      // records the ids, so the suite needs no Redis.
      .overrideProvider(JUDGE_QUEUE)
      .useValue({
        enqueue: (id: string) => {
          queued.push(id);
          return Promise.resolve();
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    // Configured EXACTLY like main.ts.
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    prisma = app.get(PrismaService);

    // CI migrates the database but doesn't seed it: bring our own problem.
    const problem = await prisma.problem.create({
      data: {
        slug: `e2e-problem-${unique}`,
        title: 'E2E problem',
        difficulty: 'EASY',
        description: ['Print 1.'],
        constraints: [],
        starterCode: {},
      },
    });
    problemId = problem.id;

    aliceToken = await tokenFor(alice);
    bobToken = await tokenFor(bob);
  });

  afterAll(async () => {
    // Users cascade to their submissions; then the problem has none left.
    await prisma.user.deleteMany({
      where: { email: { in: [alice.email, bob.email] } },
    });
    await prisma.problem.delete({ where: { id: problemId } });
    await app.close();
  });

  const submit = (token: string, body: object) =>
    http()
      .post('/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  const valid = () => ({
    problemId,
    language: 'JAVASCRIPT',
    code: 'console.log(1)',
  });

  it('refuses a submission without a token', async () => {
    await http().post('/submissions').send(valid()).expect(401);
  });

  it('accepts a valid submission with 202, stores it PENDING, and queues its id', async () => {
    const res = await submit(aliceToken, valid()).expect(202);
    const { id } = res.body as { id: string };

    const row = await prisma.submission.findUnique({ where: { id } });
    expect(row).toMatchObject({ verdict: 'PENDING', problemId });
    expect(queued).toContain(id);
  });

  it('lets the owner read it, and answers 404 to anyone else', async () => {
    const res = await submit(aliceToken, valid()).expect(202);
    const { id } = res.body as { id: string };

    await http()
      .get(`/submissions/${id}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);
    await http()
      .get(`/submissions/${id}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .expect(404);
  });

  it('refuses code over the cap with 400, and names the field', async () => {
    const res = await submit(aliceToken, {
      ...valid(),
      code: 'x'.repeat(70_000),
    }).expect(400);

    const { message } = res.body as { message: string[] };
    expect(message).toEqual(
      expect.arrayContaining([expect.stringContaining('code')]),
    );
  });

  it('answers 413, not 500, for a body over the parser limit', async () => {
    await submit(aliceToken, { ...valid(), code: 'x'.repeat(200_000) }).expect(
      413,
    );
  });

  it('answers 404 for a problem that does not exist, and queues nothing', async () => {
    const before = queued.length;
    await submit(aliceToken, { ...valid(), problemId: 999_999 }).expect(404);
    expect(queued).toHaveLength(before);
  });
});
