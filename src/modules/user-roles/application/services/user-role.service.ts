import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaGenericService } from 'src/shared/infrastructure/generic/prisma-generic.service';
import { UserRoleResponseDto } from '../dtos/user-role.response.dto';
import { UserRoleMapper } from '../../infrastructure/mappers/user-role.mapper';
import { PaginationUserRoleDto } from '../dtos/pagination-user-role.dto';

@Injectable()
export class UserRoleService extends PrismaGenericService<
  UserRole,
  Prisma.UserRoleCreateArgs,
  Prisma.UserRoleFindManyArgs,
  Prisma.UserRoleFindUniqueArgs,
  Prisma.UserRoleUpdateArgs,
  Prisma.UserRoleDeleteArgs
> {
  constructor(
    prismaService: PrismaService,
    private readonly userRoleMapper: UserRoleMapper,
  ) {
    super(prismaService.userRole, {});
  }

  async create(args: Prisma.UserRoleCreateArgs): Promise<UserRoleResponseDto> {
    const userRole = await super.create(args);
    return this.userRoleMapper.toDto(userRole);
  }

  async findAll(pagination?: PaginationUserRoleDto): Promise<{ data: UserRoleResponseDto[]; pageInfo: { currentPage: number; totalPages: number; totalResults: number } }> {
    const args: Prisma.UserRoleFindManyArgs = {
      skip: pagination?.page ? (pagination.page - 1) * (pagination.perPage || 50) : 0,
      take: pagination?.perPage || 50,
    };
    const result = await super.findAll(args);
    return {
      ...result,
      data: this.userRoleMapper.toDtoArray(result.data),
    };
  }

  async findOne(args: Prisma.UserRoleFindUniqueArgs): Promise<UserRoleResponseDto | null> {
    const userRole = await super.findOne(args);
    return userRole ? this.userRoleMapper.toDto(userRole) : null;
  }

  async update(
    findArgs: Prisma.UserRoleFindUniqueArgs,
    updateArgs: Prisma.UserRoleUpdateArgs,
  ): Promise<UserRoleResponseDto> {
    const userRole = await super.update(findArgs, updateArgs);
    return this.userRoleMapper.toDto(userRole);
  }

  async remove(
    findArgs: Prisma.UserRoleFindUniqueArgs,
    deleteArgs: Prisma.UserRoleDeleteArgs,
  ): Promise<UserRoleResponseDto> {
    const userRole = await super.remove(findArgs, deleteArgs);
    return this.userRoleMapper.toDto(userRole);
  }
}
