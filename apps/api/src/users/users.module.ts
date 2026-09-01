import { Module } from '@nestjs/common';
import { USERS_REPOSITORY } from './ports/users.repository';
import { PrismaUsersRepository } from './adapters/prisma-users.repository';
import { UsersService } from './application/users.service';

@Module({
  providers: [
    UsersService,
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
