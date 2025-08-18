// users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import {
  createSwagger,
  deleteSwagger,
  findSwagger,
  updateSwagger,
} from 'src/shared/infrastructure/swagger/http.swagger';
import { ApiResponseSwagger } from 'src/shared/infrastructure/swagger/response.swagger';
import { UpdateUserDto, UserDto } from '../../application/dtos/user.dtos';
import { PaginationUserDto } from '../../application/dtos/pagination-user.dto';
import { PaginatedResponse } from 'src/shared/applications/dtos/paginationResponse.dto';
import { Roles } from 'src/auth/application/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { GenericApplicationCrudServicePort } from 'src/shared/domain/interfaces/generic-application-crud.service.port';
import { findOneSwagger } from 'src/shared/domain/swagger/http.swagger';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController implements
GenericApplicationCrudServicePort<
  UserDto,
  UpdateUserDto,
  UserResponseDto,
  PaginationUserDto,
  number
>{
  constructor(private readonly service: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseSwagger(createSwagger(UserResponseDto, 'Users'))
  create(@Body() dto: UserDto): Promise<UserResponseDto> {
    return this.service.createOne(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(findSwagger(UserResponseDto, 'Users'))
  findAll(
    @Query() pagination: PaginationUserDto,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    return this.service.findPaginated(pagination as any);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(findOneSwagger(UserResponseDto, 'Users'))
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto | null> {
    return this.service.findById(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponseSwagger(updateSwagger(UserResponseDto, 'Users'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.service.updateOne(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponseSwagger(deleteSwagger(UserResponseDto, 'Users'))
  remove(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.service.removeOne(+id);
  }
}
