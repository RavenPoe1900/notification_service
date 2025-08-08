import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserRoleResponseDto {
  @ApiProperty({ description: 'ID único del UserRole', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID del usuario', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Rol asignado al usuario',
    enum: Role,
    example: Role.ADMIN,
  })
  role: Role;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;
}
