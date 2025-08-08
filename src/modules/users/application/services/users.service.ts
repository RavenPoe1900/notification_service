import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, User } from '@prisma/client';
import { PrismaGenericService } from 'src/shared/infrastructure/generic/prisma-generic.service';
import { UserDto } from '../dtos/user.dtos';
import { UserResponseDto } from '../dtos/user-response.dto';
import { PaginatedResponse } from 'src/shared/applications/dtos/paginationResponse.dto';
import { userSelectWithoutPassword } from '../../infrastructure/prisma/user.select';
import { BcryptHasherService } from 'src/shared/applications/security/bcrypt.service';
import { UserMapper } from '../../infrastructure/mappers/user.mapper';
import { UserPrismaPayload } from '../../infrastructure/mappers/prisma-user.profile';

@Injectable()
export class UsersService extends PrismaGenericService<
  User,
  Prisma.UserCreateArgs,
  Prisma.UserFindManyArgs,
  Prisma.UserFindUniqueArgs,
  Prisma.UserUpdateArgs,
  Prisma.UserDeleteArgs
> {
  constructor(
    prismaService: PrismaService,
    private readonly bcryptHasherService: BcryptHasherService,
    private readonly userMapper: UserMapper,
  ) {
    super(prismaService.user, {
      modelName: 'User',
      errorDictionary: {
        User: {
          unique: {
            email: 'A user with that email already exists.',
            username: 'The username is already in use.',
          },
        },
      },
    });
  }

  async createOne(dto: UserDto): Promise<UserResponseDto> {
    const args: Prisma.UserCreateArgs = {
      data: {
        password: await this.bcryptHasherService.hash(dto.password),
        email: dto.email,
        phone: dto.phone,
        lastUsedRole: dto.role,
        roles: { create: { role: dto.role } },
      },
      select: userSelectWithoutPassword,
    };
    const user = await super.create(args);
    return this.userMapper.toDto(user as UserPrismaPayload);
  }

  async findPaginated(
    params: Prisma.UserFindManyArgs,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const page = await super.findAll(params);
    return {
      ...page,
      data: this.userMapper.toDtoArray(page.data as UserPrismaPayload[]),
    };
  }

  async findById(id: number): Promise<UserResponseDto | null> {
    const user = await super.findOne({
      where: { id },
      select: userSelectWithoutPassword,
    });
    return user ? this.userMapper.toDto(user as UserPrismaPayload) : null;
  }

  async updateOne(
    id: number,
    data: Prisma.UserUpdateInput,
  ): Promise<UserResponseDto> {
    const updated = await super.update(
      { where: { id } },
      { where: { id }, data, select: userSelectWithoutPassword },
    );
    return this.userMapper.toDto(updated as UserPrismaPayload);
  }

  async removeOne(id: number): Promise<UserResponseDto> {
    const removed = await super.remove(
      { where: { id } },
      { where: { id }, select: userSelectWithoutPassword },
    );
    return this.userMapper.toDto(removed as UserPrismaPayload);
  }
}
