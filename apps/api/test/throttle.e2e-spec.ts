import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

/**
 * Rate limiting, on its own, with the real ThrottlerGuard in place.
 *
 * Kept separate from auth.e2e-spec.ts deliberately: that suite needs many
 * logins, and a shared limiter there would make unrelated assertions fail for
 * a reason that has nothing to do with what they test.
 */
describe('Rate limiting (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows 5 login attempts per minute and rejects the 6th with 429', async () => {
    const body = {
      email: 'throttle-probe@test.com',
      password: 'wrong-password',
    };
    const codes: number[] = [];

    for (let i = 0; i < 6; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(body);
      codes.push(res.status);
    }

    // The first five are rejected on credentials; only the sixth is rejected
    // on rate. That ordering matters: throttling runs BEFORE authentication,
    // so the 6th never reaches Argon2 at all.
    expect(codes.slice(0, 5).every((c) => c === 401)).toBe(true);
    expect(codes[5]).toBe(429);
  });

  it('does not rate-limit /problems', async () => {
    // @SkipThrottle() on the controller. A public read endpoint is a capacity
    // question, not a credential-guessing one.
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer()).get('/problems?limit=1').expect(200);
    }
  });
});
