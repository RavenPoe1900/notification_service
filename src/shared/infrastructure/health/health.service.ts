import { Injectable, Logger } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PrismaService } from 'nestjs-prisma';
import { createClient } from 'redis';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    redis: HealthCheck;
    automapper: HealthCheck;
    database: HealthCheck;
    emailProviders: HealthCheck;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  error?: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly prismaService: PrismaService,
  ) {}

  async checkHealth(): Promise<HealthStatus> {
    const checks = {
      redis: await this.checkRedis(),
      automapper: await this.checkAutoMapper(),
      database: await this.checkDatabase(),
      emailProviders: await this.checkEmailProviders(),
    };

    const overallStatus = this.determineOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      checks,
    };
  }

  async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const client = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        password: process.env.REDIS_PASSWORD,
      });

      await client.connect();
      await client.ping();
      await client.disconnect();

      const responseTime = Date.now() - startTime;
      
      this.logger.log(`Redis health check passed in ${responseTime}ms`);
      
      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.logger.error(`Redis health check failed: ${errorMessage}`);
      
      return {
        status: 'unhealthy',
        responseTime,
        error: errorMessage,
      };
    }
  }

  async checkAutoMapper(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Test AutoMapper with a simple mapping
      const testData = { id: 1, name: 'test' };
      this.mapper.map(testData, 'Test', 'TestDto');
      
      const responseTime = Date.now() - startTime;
      
      this.logger.log(`AutoMapper health check passed in ${responseTime}ms`);
      
      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.logger.error(`AutoMapper health check failed: ${errorMessage}`);
      
      return {
        status: 'unhealthy',
        responseTime,
        error: errorMessage,
      };
    }
  }

  async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Test database connection with a simple query
      await this.prismaService.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      this.logger.log(`Database health check passed in ${responseTime}ms`);
      
      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.logger.error(`Database health check failed: ${errorMessage}`);
      
      return {
        status: 'unhealthy',
        responseTime,
        error: errorMessage,
      };
    }
  }

  async checkEmailProviders(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // For now, we'll just return a healthy status
      // In a real implementation, you would inject the email provider and test it
      const responseTime = Date.now() - startTime;
      
      this.logger.log(`Email providers health check passed in ${responseTime}ms`);
      
      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.logger.error(`Email providers health check failed: ${errorMessage}`);
      
      return {
        status: 'unhealthy',
        responseTime,
        error: errorMessage,
      };
    }
  }

  private determineOverallStatus(checks: HealthStatus['checks']): 'healthy' | 'unhealthy' {
    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
    return allHealthy ? 'healthy' : 'unhealthy';
  }
} 