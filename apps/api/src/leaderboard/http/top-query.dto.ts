import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class TopQueryDto {
  @IsOptional()
  @Type(() => Number) // query strings are always strings
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
