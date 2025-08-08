import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * @description
 * DTO used to change user.
 *
 * @example
 * {
 *   "role": SHIPPER,
 * }
 */
export class ChangeUserDto {
  /**
   * @example SHIPPER
   * @description The role of the user logging in. Only allowed values are: SHIPPER or CARRIER.
   */
  @IsOptional()
  @ApiProperty({
    description: 'User role.',
    example: 'SHIPPER',
    enum: Role,
    required: true,
  })
  readonly role: Role;
}
