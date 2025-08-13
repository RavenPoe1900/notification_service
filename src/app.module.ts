import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { BullModule } from '@nestjs/bullmq';

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
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          db: config.get<number>('REDIS_DB', 0),
        },
        prefix: config.get('BULL_QUEUE_PREFIX', ''),
        defaultJobOptions: {
          attempts: config.get<number>('BULL_DEFAULT_ATTEMPTS', 3),
          backoff: {
            type: 'exponential',
            delay: config.get<number>('BULL_BACKOFF_DELAY', 2000),
          },
          timeout: config.get<number>('BULL_JOB_TIMEOUT', 30000),
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    HealthModule,
    CacheModule,
    // Grouped modules
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
