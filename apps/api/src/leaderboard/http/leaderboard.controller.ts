import { Controller, Get, Inject, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-payload';
import {
  LEADERBOARD_READER,
  type LeaderboardReader,
} from '../ports/leaderboard.reader';
import { TopQueryDto } from './top-query.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    @Inject(LEADERBOARD_READER) private readonly board: LeaderboardReader,
  ) {}

  @Public()
  @Get()
  top(@Query() query: TopQueryDto) {
    return this.board.top(query.limit);
  }

  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    // 200 with null, not 404: "not ranked yet" is a normal answer.
    return { standing: await this.board.standingOf(user.sub) };
  }
}
