import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SubmissionsService } from '../application/submissions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-payload';
import { CreateSubmissionDto } from './dto/create-submission.dto';

/** Judging is the most expensive thing we do, so it's the most worth spamming. */
const SUBMIT_RATE_LIMIT = { default: { limit: 10, ttl: 60_000 } };

// No @Public(): the global AuthGuard makes every route here require a token.
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED) // 202: accepted, not done. The verdict comes later.
  @Throttle(SUBMIT_RATE_LIMIT)
  submit(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubmissionDto) {
    return this.submissions.submit(user.sub, dto);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const s = await this.submissions.getForOwner(user.sub, id);
    // The response is a contract: list the fields on purpose.
    return {
      id: s.id,
      problemId: s.problemId,
      language: s.language,
      verdict: s.verdict,
      runtimeMs: s.runtimeMs,
      code: s.code,
      createdAt: s.createdAt,
    };
  }
}
