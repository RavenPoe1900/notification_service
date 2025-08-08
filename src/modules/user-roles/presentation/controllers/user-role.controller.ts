import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/application/decorators/roles.decorator';
import { GenericApplicationCrudServicePort } from 'src/shared/domain/interfaces/generic-application-crud.service.port';
import { ApiResponseSwagger } from 'src/shared/infrastructure/swagger/response.swagger';
import {
  createSwagger,
  deleteSwagger,
  findOneSwagger,
  findSwagger,
  updateSwagger,
} from 'src/shared/infrastructure/swagger/http.swagger';
import { UserRoleResponseDto } from '../../application/dtos/user-role.response.dto';
import {
  UpdateUserRoleDto,
  UserRoleDto,
} from '../../application/dtos/user-role.dtos';
import { PaginationUserRoleDto } from '../../application/dtos/pagination-user-role.dto';
import { GenericPaginatedResponse } from 'src/shared/domain/types/pagination.types';
import { UserRoleService } from '../../application/services/user-role.service';
import { idWhereClause } from 'src/shared/infrastructure/prisma/constants/prisma-filter.constants';

const C = 'UserRoles';

@ApiTags(C)
@Controller({ path: 'user-roles', version: '1' })
export class UserRoleController
  implements
    GenericApplicationCrudServicePort<
      UserRoleDto,
      UpdateUserRoleDto,
      UserRoleResponseDto,
      PaginationUserRoleDto,
      number
    >
{
  constructor(private readonly service: UserRoleService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseSwagger(createSwagger(UserRoleResponseDto, C))
  async create(@Body() dto: UserRoleDto): Promise<UserRoleResponseDto> {
    return this.service.create({ data: dto });
  }

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(findSwagger(UserRoleResponseDto, C))
  async findAll(
    @Query() pagination: PaginationUserRoleDto,
  ): Promise<GenericPaginatedResponse<UserRoleResponseDto>> {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(findOneSwagger(UserRoleResponseDto, C))
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserRoleResponseDto | null> {
    return this.service.findOne(idWhereClause(id));
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponseSwagger(updateSwagger(UserRoleResponseDto, C))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserRoleResponseDto> {
    return this.service.update(idWhereClause(id), {
      ...idWhereClause(id),
      data: dto,
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponseSwagger(deleteSwagger(UserRoleResponseDto, C))
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserRoleResponseDto> {
    return this.service.remove(idWhereClause(id), idWhereClause(id));
  }
}
