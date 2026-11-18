import { Module } from '@nestjs/common';
import { SubmissionsController } from './http/submissions.controller';
import { SubmissionsService } from './application/submissions.service';
import { SUBMISSIONS_REPOSITORY } from './ports/submissions.repository';
import { JUDGE_QUEUE } from './ports/judge-queue';
import { PrismaSubmissionsRepository } from './adapters/prisma-submissions.repository';
import { LoggingJudgeQueue } from './adapters/logging-judge.queue';

@Module({
  controllers: [SubmissionsController],
  providers: [
    SubmissionsService,
    { provide: SUBMISSIONS_REPOSITORY, useClass: PrismaSubmissionsRepository },
    { provide: JUDGE_QUEUE, useClass: LoggingJudgeQueue },
  ],
})
export class SubmissionsModule {}
