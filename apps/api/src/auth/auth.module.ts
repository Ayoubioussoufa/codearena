import { Module } from '@nestjs/common';
import { PASSWORD_HASHER } from './passwordhasher/ports/password-hasher.port';
import { Argon2Hasher } from './passwordhasher/adapters/argon2-password.hasher';
import { UsersModule } from '../users/users.module';
import { AuthController } from './http/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Env } from '../config/env.schema';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: PASSWORD_HASHER, useClass: Argon2Hasher },
  ],
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_TTL', { infer: true }),
        },
      }),
    }),
  ],
})
export class AuthModule {}
