import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserInput, UsersRepository } from '../ports/users.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, User } from '../domain/user.entity';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async findCredentialsByEmail(
    email: string,
  ): Promise<{ id: string; passwordHash: string; role: Role } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return { id: user.id, passwordHash: user.passwordHash, role: user.role };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async create({
    email,
    username,
    passwordHash,
    role,
  }: CreateUserInput): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: { email, username, passwordHash, ...(role && { role }) },
      });
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      };
    } catch (error) {
      // Translate Prisma's vendor error into an HTTP-meaningful one. P2002 is
      // raised by BOTH unique columns, so read which constraint actually fired
      // rather than always blaming the email.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          this.describeUniqueViolation(error, email, username),
        );
      }
      throw error;
    }
  }

  /** Reads the failing constraint name out of a P2002 error. */
  private describeUniqueViolation(
    error: Prisma.PrismaClientKnownRequestError,
    email: string,
    username: string,
  ): string {
    const constraint = JSON.stringify(error.meta ?? {});
    if (constraint.includes('username'))
      return `Username "${username}" is already taken`;
    if (constraint.includes('email'))
      return `Email "${email}" is already registered`;
    return 'Email or username is already taken';
  }
}
