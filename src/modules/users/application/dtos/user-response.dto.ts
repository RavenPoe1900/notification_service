import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRoleDetailDto } from './user-role-detail.dto';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user.',
    example: 101,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The user's email address.",
    format: 'email',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "The user's phone number.",
    nullable: true,
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    type: [UserRoleDetailDto],
    description: 'List of roles assigned to the user.',
  })
  @IsArray()
  roles: UserRoleDetailDto[];

  @ApiProperty({
    enum: Role,
    description: 'The last role the user actively used.',
    nullable: true,
    example: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role)
  lastUsedRole?: Role;

  @ApiProperty({
    description:
      'The average rating received by the user when acting as a shipper.',
    nullable: true,
    example: 4.75,
  })
  @IsOptional()
  @IsNumber()
  averageRatingAsShipper?: number;

  @ApiProperty({
    description:
      'The total number of ratings received by the user as a shipper.',
    example: 20,
  })
  @IsNumber()
  totalRatingsAsShipper: number;

  @ApiProperty({
    description:
      'The average rating received by the user when acting as a carrier.',
    nullable: true,
    example: 4.92,
  })
  @IsOptional()
  @IsNumber()
  averageRatingAsCarrier?: number;

  @ApiProperty({
    description:
      'The total number of ratings received by the user as a carrier.',
    example: 55,
  })
  @IsNumber()
  totalRatingsAsCarrier: number;

  @ApiProperty({
    description: 'The timestamp when the user account was created.',
    format: 'date-time',
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the user account was last updated.',
    format: 'date-time',
    example: '2025-07-14T14:30:00Z',
  })
  updatedAt: Date;
}
