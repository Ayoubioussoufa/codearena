import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { RegisterDto } from '../http/dto/register.dto';
import { LoginDto } from '../http/dto/login.dto';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../passwordhasher/ports/password-hasher.port';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async register(dto: RegisterDto) {
    const { email, username, password } = dto;
    const passwordHash = await this.hasher.hash(password);
    return await this.users.createUser({ email, username, passwordHash });
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.users.getCredentialsByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const result = await this.hasher.verify(user.passwordHash, password);
    if (!result) throw new UnauthorizedException('Invalid email or password');
    return { id: user.id };
  }
}
