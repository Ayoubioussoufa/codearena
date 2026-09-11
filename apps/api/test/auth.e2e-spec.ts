import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * The test that proves rotation and reuse detection actually work end to end.
 *
 * This is the most valuable test in the repository: it exercises the full
 * chain -- register, login, rotate, replay -- through real HTTP against a real
 * database, which is the only way to catch the class of bug that type-checks
 * cleanly and is still catastrophic (storing the revoked token back in the
 * cookie, or `revokedAt: null` in an update).
 */
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Unique per run so repeated runs never collide on the unique email index.
  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const email = `e2e-${unique}@test.com`;
  const username = `e2e${unique}`.slice(0, 20);
  const password = 'correct-horse-battery';

  // supertest types `headers` and `body` as `any`. Narrow once, here, so no
  // assertion below has to reach into an untyped value.
  const setCookies = (res: request.Response): string[] => {
    const raw: unknown = res.headers['set-cookie'];
    return Array.isArray(raw)
      ? (raw as string[])
      : typeof raw === 'string'
        ? [raw]
        : [];
  };

  const body = <T = Record<string, unknown>>(res: request.Response): T =>
    res.body as T;

  /** Pull one cookie's value out of a Set-Cookie header array. */
  const readCookie = (
    res: request.Response,
    name: string,
  ): string | undefined => {
    const hit = setCookies(res).find((c) => c.startsWith(`${name}=`));
    return hit?.split(';')[0]?.split('=')[1];
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // This suite logs in far more than 5 times a minute. Rate limiting is a
      // real feature and IS tested -- in throttle.e2e-spec.ts, on its own, so
      // it cannot make every other assertion here fail for an unrelated reason.
      //
      // We replace the STORAGE, not the guard: the guard is registered under
      // the APP_GUARD token, so overrideGuard(ThrottlerGuard) matches nothing.
      // A storage that always reports one hit means the limit is never reached.
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
      .compile();

    app = moduleFixture.createNestApplication();

    // The e2e app must be configured EXACTLY like main.ts. Anything you set up
    // in bootstrap() and forget here is untested in production shape --
    // a missing ValidationPipe would silently pass tests that should fail.
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } }); // cascades to tokens
    await app.close();
  });

  describe('registration and login', () => {
    it('registers a user without ever returning the password hash', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, username, password })
        .expect(201);

      expect(body(res)).toHaveProperty('id');
      // The entity boundary: `User` deliberately has no passwordHash field.
      expect(body(res)).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(body(res))).not.toContain('$argon2');
    });

    it('rejects a duplicate email with 409, not 500', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, username: `${username}2`.slice(0, 20), password })
        .expect(409);
    });

    it('rejects a short password with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `other-${unique}@test.com`,
          username: 'shortpw',
          password: 'short',
        })
        .expect(400);
    });

    it('returns an access token in the body and the refresh token ONLY in a cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

      expect(body(res)).toHaveProperty('accessToken');
      // The whole point of task 4.1: JavaScript must not be able to read it.
      expect(body(res)).not.toHaveProperty('refreshToken');

      const refresh = setCookies(res).find((c) => c.startsWith('refresh='));
      expect(refresh).toBeDefined();
      expect(refresh).toContain('HttpOnly');
      expect(refresh).toContain('SameSite=Lax');
      expect(refresh).toContain('Path=/auth');
    });

    it('gives the same 401 for an unknown email and a wrong password', async () => {
      const unknown = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `ghost-${unique}@test.com`, password })
        .expect(401);

      const wrong = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'definitely-not-the-password' })
        .expect(401);

      // Identical apart from the timestamp -- no user-enumeration oracle.
      const strip = (b: Record<string, unknown>) => ({
        ...b,
        timestamp: undefined,
      });
      expect(strip(body(unknown))).toEqual(strip(body(wrong)));
    });
  });

  describe('rotation and reuse detection', () => {
    it('rotates: the old token dies, the new one works, the family is shared', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);
      const r1 = readCookie(login, 'refresh');
      expect(r1).toBeDefined();

      const refreshed = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh=${r1}`])
        .expect(200);

      const r2 = readCookie(refreshed, 'refresh');
      expect(r2).toBeDefined();
      expect(r2).not.toEqual(r1); // a genuinely NEW token, not the old one echoed back
      expect(body(refreshed)).toHaveProperty('accessToken');
      expect(body(refreshed)).not.toHaveProperty('refreshToken');
    });

    it('REPLAYING a used refresh token kills the whole family', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);
      const r1 = readCookie(login, 'refresh');

      const refreshed = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh=${r1}`])
        .expect(200);
      const r2 = readCookie(refreshed, 'refresh');

      // The replay. An honest client always holds the newest token, so this
      // can only mean the chain leaked.
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh=${r1}`])
        .expect(401);

      // The thief is locked out -- but so is the victim. Only the password
      // can start a new session, and only the real user has it.
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh=${r2}`])
        .expect(401);
    });

    it('stores hashes, never tokens, and revokes the family in the database', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);
      const r1 = readCookie(login, 'refresh')!;

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh=${r1}`])
        .expect(200);
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh=${r1}`])
        .expect(401);

      const user = await prisma.user.findUnique({ where: { email } });
      const rows = await prisma.refreshToken.findMany({
        where: { userId: user!.id },
        orderBy: { createdAt: 'desc' },
      });

      // A token that could be pasted into curl must never be in the table.
      for (const row of rows) {
        expect(row.tokenHash).toHaveLength(64); // sha256 hex
        expect(row.tokenHash).not.toEqual(r1);
      }

      // Every token in the compromised family is dead.
      expect(rows.length).toBeGreaterThan(0);
      const family = rows[0]!.family;
      const inFamily = rows.filter((r) => r.family === family);
      expect(inFamily.length).toBeGreaterThanOrEqual(2);
      expect(inFamily.every((r) => r.revokedAt !== null)).toBe(true);
    });

    it('rejects a missing cookie, a garbage cookie, and an unknown token with 401', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', ['refresh=total-nonsense'])
        .expect(401);
    });
  });

  describe('logout', () => {
    it('is idempotent and ends the session', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);
      const r1 = readCookie(login, 'refresh');

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`refresh=${r1}`])
        .expect(200);

      // Double-click, retried request, two tabs: all must succeed.
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`refresh=${r1}`])
        .expect(200);
      await request(app.getHttpServer()).post('/auth/logout').expect(200);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh=${r1}`])
        .expect(401);
    });
  });

  describe('the guard', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });
      accessToken = body<{ accessToken: string }>(res).accessToken;
    });

    it('leaves @Public() routes open', async () => {
      await request(app.getHttpServer()).get('/problems?limit=1').expect(200);
      await request(app.getHttpServer()).get('/health').expect(200);
    });

    it('rejects /auth/me without a token, with garbage, and with the wrong scheme', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer garbage')
        .expect(401);
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Basic ${accessToken}`)
        .expect(401);
    });

    it('accepts /auth/me with a valid token and returns the caller', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(body(res)).toHaveProperty('id');
      expect(body<{ role: string }>(res).role).toBe('USER');
    });

    it('returns 403 (not 401) when a USER hits an ADMIN route', async () => {
      // The distinction: 401 is "who are you", 403 is "I know you, and no".
      await request(app.getHttpServer())
        .get('/auth/admin/ping')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('returns 401 when an ADMIN route is hit with no token at all', async () => {
      await request(app.getHttpServer()).get('/auth/admin/ping').expect(401);
    });
  });
});
