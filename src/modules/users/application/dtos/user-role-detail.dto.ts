import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserRoleDetailDto {
  @ApiProperty({
    enum: Role,
    description: 'The specific role assigned to the user.',
    example: Role.SHIPPER,
  })
  role: Role;
}
