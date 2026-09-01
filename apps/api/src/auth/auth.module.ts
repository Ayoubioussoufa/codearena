import { Module } from '@nestjs/common';
import { PASSWORD_HASHER } from './passwordhasher/ports/password-hasher.port';
import { Argon2Hasher } from './passwordhasher/adapters/argon2-password.hasher';

@Module({
  providers: [{ provide: PASSWORD_HASHER, useClass: Argon2Hasher }],
})
export class AuthModule {}
