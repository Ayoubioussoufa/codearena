import { Module } from '@nestjs/common';
import { SubmissionsController } from './http/submissions.controller';
import { SubmissionsService } from './application/submissions.service';
import { SUBMISSIONS_REPOSITORY } from './ports/submissions.repository';
import { PrismaSubmissionsRepository } from './adapters/prisma-submissions.repository';

@Module({
  controllers: [SubmissionsController],
  providers: [
    SubmissionsService,
    { provide: SUBMISSIONS_REPOSITORY, useClass: PrismaSubmissionsRepository },
  ],
})
export class SubmissionsModule {}
