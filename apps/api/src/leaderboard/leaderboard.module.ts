import { Module } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { LeaderboardController } from './http/leaderboard.controller';
import { LEADERBOARD_READER } from './ports/leaderboard.reader';
import { RedisLeaderboardReader } from './adapters/redis-leaderboard.reader';

@Module({
  controllers: [LeaderboardController],
  providers: [
    RedisService,
    { provide: LEADERBOARD_READER, useClass: RedisLeaderboardReader },
  ],
})
export class LeaderboardModule {}
