import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AutomapperModule } from '@automapper/nestjs';
import { jwtConfig } from './config/jwt-config';
import { MODULES } from './config/config-modules';
import { prismaConfig } from './config/prisma-config';
import { PrismaModule } from 'nestjs-prisma';
import { PassportModule } from '@nestjs/passport';
import { pojos } from '@automapper/pojos';
import { RolesGuard } from './auth/presentation/guards/roles.guard';
import { AuthGuard } from './auth/presentation/guards/auth.guard';
import { HealthModule } from './shared/infrastructure/health/health.module';
import { CacheModule } from './shared/infrastructure/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register(jwtConfig),
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    PrismaModule.forRoot(prismaConfig),
    PassportModule,
    HealthModule,
    CacheModule,
    // Módulos agrupados
    ...MODULES,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
