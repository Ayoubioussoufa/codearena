import { User, Role } from '../domain/user.entity';

/** What a caller must supply to create a user. `role` is optional — the
 *  database applies its own default when it's absent. */
export type CreateUserInput = Omit<User, 'id' | 'role'> & {
  passwordHash: string;
  role?: User['role'];
};

export interface UsersRepository {
  findByEmail(email: string): Promise<User | null>;
  findCredentialsByEmail(
    email: string,
  ): Promise<{ id: string; passwordHash: string; role: Role } | null>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}

export const USERS_REPOSITORY = Symbol('UsersRepository');
