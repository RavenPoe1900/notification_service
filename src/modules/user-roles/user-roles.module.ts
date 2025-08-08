import { Module } from '@nestjs/common';
import { UserRoleService } from './application/services/user-role.service';
import { UserRoleController } from './presentation/controllers/user-role.controller';
import { UserRoleMapper } from './infrastructure/mappers/user-role.mapper';

@Module({
  controllers: [UserRoleController],
  providers: [UserRoleService, UserRoleMapper],
  exports: [UserRoleService],
})
export class UserRoleModule {}
