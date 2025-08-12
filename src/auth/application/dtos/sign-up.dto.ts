import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/modules/users/application/dtos/user.dtos';

/**
 * @description
 * Interface defining the minimal user data required for login.
 */
type UserContract = Omit<UserDto, 'role' | 'phone'>;

/**
 * @description
 * DTO used to authenticate a user via email and password.
 *
 * @example
 * {
 *   "email": "user@example.com",
 *   "password": "P@ssw0rd!"
 * }
 */
export class SignUpDto implements UserContract {
  /**
   * @example user@example.com
   * @description The unique email address of the user.
   */
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @ApiProperty({
    description: 'Email address of the user (must be unique)',
    example: 'user@example.com',
    required: true,
  })
  readonly email: string;

  /**
   * @example P@ssw0rd!
   * @description The password for the user. Must meet the following criteria:
   * - At least 8 characters long
   * - At most 20 characters long
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   */
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[^A-Za-z0-9])/, {
    message: 'Password must contain at least one special character',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @ApiProperty({
    description:
      'The password for the user. Must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
    example: 'P@ssw0rd!',
  })
  readonly password: string;
}
