import {
  IsIn,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * A judge needs a cap: the code is stored, sent to a container, and read by
 * a human on a bad day. 64 K characters is far above any real solution.
 */
export const MAX_CODE_LENGTH = 64 * 1024;

export class CreateSubmissionDto {
  @IsInt()
  @Min(1)
  problemId!: number;

  // Only what the judge can run today. Accepting PYTHON would store a
  // submission that the worker can only fail with an error, not a verdict.
  @IsIn(['JAVASCRIPT'], {
    message: 'language must be JAVASCRIPT, the only language the judge runs',
  })
  language!: 'JAVASCRIPT';

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CODE_LENGTH)
  code!: string;
}
