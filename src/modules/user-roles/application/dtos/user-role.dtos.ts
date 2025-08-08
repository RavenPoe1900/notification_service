import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role, UserRole } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';


type UserRoleWithoutId = Omit<UserRole, 'id' | 'createdAt' | 'deletedAt'>;

export class UserRoleDto implements UserRoleWithoutId {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  @IsInt({ message: 'El userId debe ser un entero' })
  userId: number;

  @ApiProperty({
    description: 'Rol asignado al usuario',
    enum: Object.values(Role),
    example: 'ADMIN',
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(Role, { message: 'El rol debe ser un valor válido del enum Role' })
  role: Role;
}

export class UpdateUserRoleDto extends PartialType(UserRoleDto) {}
