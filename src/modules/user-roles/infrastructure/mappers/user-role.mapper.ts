import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UserRoleResponseDto } from '../../application/dtos/user-role.response.dto';

@Injectable()
export class UserRoleMapper {
  toDto(userRole: UserRole): UserRoleResponseDto {
    return {
      id: userRole.id,
      userId: userRole.userId,
      role: userRole.role,
      createdAt: userRole.createdAt,
    };
  }

  toDtoArray(userRoles: UserRole[]): UserRoleResponseDto[] {
    return userRoles.map(userRole => this.toDto(userRole));
  }
} 