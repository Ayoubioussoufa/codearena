import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @MaxLength(254) // RFC 5321 caps an address at 254 characters
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username may contain only letters, numbers, underscores and hyphens',
  })
  username!: string;

  // NIST SP 800-63B: favour LENGTH over complexity. No symbol/digit/case rules —
  // they push people towards "Password1!" and away from long passphrases.
  @IsString()
  @MinLength(12)
  // An upper bound is a DoS control, not a usability one: Argon2 is deliberately
  // expensive, so hashing a multi-megabyte "password" would burn real CPU.
  @MaxLength(128)
  password!: string;
}
