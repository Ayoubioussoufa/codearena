import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SubmissionsController } from './http/submissions.controller';
import { SubmissionsService } from './application/submissions.service';
import { SUBMISSIONS_REPOSITORY } from './ports/submissions.repository';
import { JUDGE_QUEUE, JUDGE_QUEUE_NAME } from './ports/judge-queue';
import { PrismaSubmissionsRepository } from './adapters/prisma-submissions.repository';
import { BullmqJudgeQueue } from './adapters/bullmq-judge.queue';

@Module({
  imports: [BullModule.registerQueue({ name: JUDGE_QUEUE_NAME })],
  controllers: [SubmissionsController],
  providers: [
    SubmissionsService,
    { provide: SUBMISSIONS_REPOSITORY, useClass: PrismaSubmissionsRepository },
    { provide: JUDGE_QUEUE, useClass: BullmqJudgeQueue },
  ],
})
export class SubmissionsModule {}
