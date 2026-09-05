import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { RegisterDto } from '../http/dto/register.dto';
import { LoginDto } from '../http/dto/login.dto';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../passwordhasher/ports/password-hasher.port';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';

@Injectable()
export class AuthService {
  private readonly dummyHash: Promise<string>;
  constructor(
    private readonly users: UsersService,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    private readonly jwt: JwtService,
  ) {
    this.dummyHash = this.hasher.hash(randomBytes(32).toString('hex'));
  }

  async register(dto: RegisterDto) {
    const { email, username, password } = dto;
    const passwordHash = await this.hasher.hash(password);
    return await this.users.createUser({ email, username, passwordHash });
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.users.getCredentialsByEmail(email);
    const result = await this.hasher.verify(
      user?.passwordHash ?? (await this.dummyHash),
      password,
    );

    if (!user || !result)
      throw new UnauthorizedException('Invalid email or password');

    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, role: user.role }),
    };
  }
}
