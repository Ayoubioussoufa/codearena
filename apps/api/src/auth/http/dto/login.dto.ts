import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * Deliberately NOT `RegisterDto` minus a field.
 *
 * Login must not restate the password rules: a user whose password predates a
 * rule change still has to be able to log in, and echoing the policy here would
 * tell an attacker the shape of what they're guessing. Anything non-empty is
 * accepted, and the credential check decides.
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
