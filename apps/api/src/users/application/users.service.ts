import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  type CreateUserInput,
  type UsersRepository,
} from '../ports/users.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  async createUser(input: CreateUserInput): Promise<User> {
    // Fast path: a friendly 409 for the overwhelmingly common case. This does
    // NOT prevent duplicates — two concurrent requests can both pass it. The
    // unique constraint is the real guarantee, and the adapter turns its
    // rejection into the same 409.
    const [userByEmail, userByUsername] = await Promise.all([
      this.users.findByEmail(input.email),
      this.users.findByUsername(input.username),
    ]);
    if (userByUsername) throw new ConflictException('Username already taken');
    if (userByEmail) throw new ConflictException('Email already taken');

    return this.users.create(input);
  }

  getById(id: string) {
    return this.users.findById(id);
  }

  getCredentialsByEmail(email: string) {
    return this.users.findCredentialsByEmail(email);
  }
}
