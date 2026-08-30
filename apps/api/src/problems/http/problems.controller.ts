import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProblemsService } from '../application/problems.service';
import { ListProblemsDto } from './list-problems.dto';

const DISPLAY: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problems: ProblemsService) {}

  @Get()
  async list(@Query() query: ListProblemsDto) {
    const { items, nextCursor } = await this.problems.list(query);
    return {
      items: items.map((i) => ({ ...i, difficulty: DISPLAY[i.difficulty] })),
      nextCursor,
    };
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const p = await this.problems.getBySlug(slug);
    return { ...p, difficulty: DISPLAY[p.difficulty] };
  }
}
