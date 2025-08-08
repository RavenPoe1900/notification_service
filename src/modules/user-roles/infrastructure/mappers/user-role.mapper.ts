import { Injectable } from '@nestjs/common';
import { UserRoleResponseDto } from '../../application/dtos/user-role.response.dto';

@Injectable()
export class UserRoleMapper {
  toDto(userRole: any): UserRoleResponseDto {
    return {
      id: userRole.id,
      userId: userRole.userId,
      role: userRole.role,
      createdAt: userRole.createdAt,
      deletedAt: userRole.deletedAt,
    };
  }

  toDtoArray(userRoles: any[]): UserRoleResponseDto[] {
    return userRoles.map(userRole => this.toDto(userRole));
  }
} 