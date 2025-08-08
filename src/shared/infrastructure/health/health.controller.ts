import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health check completed successfully',
  })
  async checkHealth() {
    return this.healthService.checkHealth();
  }

  @Get('redis')
  @ApiOperation({ summary: 'Check Redis connection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Redis connection is healthy',
  })
  async checkRedis() {
    return this.healthService.checkRedis();
  }

  @Get('automapper')
  @ApiOperation({ summary: 'Check AutoMapper configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'AutoMapper is properly configured',
  })
  async checkAutoMapper() {
    return this.healthService.checkAutoMapper();
  }

  @Get('database')
  @ApiOperation({ summary: 'Check database connection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Database connection is healthy',
  })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }
} 