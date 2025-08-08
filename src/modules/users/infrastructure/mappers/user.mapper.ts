import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/shared/infrastructure/mappers/base-mapper';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { UserPrismaPayload } from './prisma-user.profile';

@Injectable()
export class UserMapper extends BaseMapper<UserPrismaPayload, UserResponseDto> {
  protected getSourceType(): string {
    return 'User';
  }

  protected getDestinationType(): string {
    return 'UserResponseDto';
  }

  toDto(user: UserPrismaPayload): UserResponseDto {
    return this.map(user);
  }

  toDtoArray(users: UserPrismaPayload[]): UserResponseDto[] {
    return this.mapArray(users);
  }
} 