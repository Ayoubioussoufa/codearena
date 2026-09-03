import { Module } from '@nestjs/common';
import { PASSWORD_HASHER } from './passwordhasher/ports/password-hasher.port';
import { Argon2Hasher } from './passwordhasher/adapters/argon2-password.hasher';
import { UsersModule } from '../users/users.module';
import { AuthController } from './http/auth.controller';
import { AuthService } from './application/auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: PASSWORD_HASHER, useClass: Argon2Hasher },
  ],
  imports: [UsersModule],
})
export class AuthModule {}
