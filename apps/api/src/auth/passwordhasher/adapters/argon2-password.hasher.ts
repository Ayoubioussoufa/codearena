import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../ports/password-hasher.port';
import { hash, verify } from 'argon2';

@Injectable()
export class Argon2Hasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    const hashPassword = await hash(plain);
    return hashPassword;
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    const verification = await verify(hash, plain);
    return verification;
  }
}
