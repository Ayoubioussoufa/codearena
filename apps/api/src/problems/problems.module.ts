import { Module } from '@nestjs/common';
import { ProblemsController } from './http/problems.controller';
import { ProblemsService } from './application/problems.service';
import { PROBLEMS_REPOSITORY } from './ports/problems.repository';
import { PrismaProblemsRepository } from './adapters/prisma-problems.repository';

@Module({
  controllers: [ProblemsController],
  providers: [
    ProblemsService,
    { provide: PROBLEMS_REPOSITORY, useClass: PrismaProblemsRepository },
  ],
})
export class ProblemsModule {}
