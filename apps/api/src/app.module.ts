import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { validateEnv } from './config/env.schema';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { ProblemsModule } from './problems/problems.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // ttl is in MILLISECONDS. A loose app-wide ceiling; /auth/* is tightened
    // per-route with @Throttle, and /problems opts out with @SkipThrottle.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // One Redis connection for every queue in the app, from the validated env.
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: config.getOrThrow<number>('REDIS_PORT'),
        },
      }),
    }),
    PrismaModule,
    ProblemsModule,
    AuthModule,
    UsersModule,
    SubmissionsModule,
  ],
  controllers: [HealthController],
  providers: [
    // ORDER IS EXECUTION ORDER.
    // Throttle first: reject the 6th login WITHOUT spending 45ms in Argon2.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Then authenticate — "who are you?" — attaching request.user.
    { provide: APP_GUARD, useClass: AuthGuard },
    // Then authorize — "may you?" — which reads the user the previous one set.
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
