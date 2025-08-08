import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

type UserWithoutId = Omit<
  User,
  | 'id'
  | 'averageRatingAsShipper'
  | 'totalRatingsAsShipper'
  | 'averageRatingAsCarrier'
  | 'totalRatingsAsCarrier'
  | 'createdAt'
  | 'updatedAt'
  | 'lastUsedRole'
>;

export class UserDto implements UserWithoutId {
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
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[0-9]{7,15}$/)
  @ApiProperty({
    description: 'Phone number of the user (must be unique, optional)',
    example: '+1234567890',
    required: false,
    nullable: true,
  })
  phone: string;

  /**
   * @example SHIPPER
   * @description The role assigned to the user.
   */
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Role must be a valid enum value' })
  @ApiProperty({
    description: 'The role assigned to the user',
    enum: Role, // This tells Swagger that it's an enum
    example: Role.SHIPPER, // An example value from the enum
    required: true,
  })
  role: Role;
}

export class UpdateUserDto extends PartialType(UserDto) {}
