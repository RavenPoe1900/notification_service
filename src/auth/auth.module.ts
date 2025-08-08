import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthController } from './presentation/controller/auth.controller';
import { AuthService } from './application/services/auth.service';
import { RefreshTokenService } from './application/services/refresh-token.service';
import { BcryptHasherService } from 'src/shared/applications/security/bcrypt.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, RefreshTokenService, BcryptHasherService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
