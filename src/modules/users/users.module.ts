import { Module } from '@nestjs/common';
import { UsersService } from './application/services/users.service';
import { PrismaService } from 'nestjs-prisma';
import { UsersController } from './presentation/controllers/users.controller';
import { PrismaUserToDtoProfile } from './infrastructure/mappers/prisma-user.profile';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { BcryptHasherService } from 'src/shared/applications/security/bcrypt.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    PrismaUserToDtoProfile,
    UserMapper,
    BcryptHasherService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
