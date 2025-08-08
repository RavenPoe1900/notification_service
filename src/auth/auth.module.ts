import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthController } from './presentation/controller/auth.controller';
import { AuthService } from './application/services/auth.service';
import { BcryptHasherService } from 'src/shared/applications/security/bcrypt.service';

@Module({
  imports: [UsersModule],
  providers: [AuthService, BcryptHasherService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
