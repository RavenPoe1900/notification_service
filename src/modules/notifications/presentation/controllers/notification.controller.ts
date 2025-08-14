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
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from '../../application/services/notification.service';
import { CreateNotificationDto } from '../../application/dtos/create-notification.dto';
import { NotificationResponseDto, SystemNotificationResponseDto } from '../../application/dtos/notification-response.dto';
import { RequestWithUser } from 'src/shared/domain/interfaces/request-id.interface';
import { OperationResult } from 'src/shared/domain/interfaces/operation-result.interface';
import { ApiResponseSwagger } from 'src/shared/infrastructure/swagger/response.swagger';
import { createSwagger, deleteSwagger, findSwagger, updateSwagger } from 'src/shared/infrastructure/swagger/http.swagger';
import { OperationResultDto } from 'src/shared/applications/dtos/operation-result.dto';

/**
 * Controller for managing notifications.
 * Provides endpoints to create, retrieve, update, and delete notifications,
 * as well as manage notification queues.
 */
@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth('access-token')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponseSwagger(createSwagger(NotificationResponseDto, 'Notifications'))
  async createNotification(
    @Body() createDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.createNotification(createDto);
  }

  @Get('system')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve system notifications for a user' })
  @ApiResponseSwagger(findSwagger(SystemNotificationResponseDto, 'Notifications'))
  async getSystemNotifications(
    @Request() req: RequestWithUser,
  ): Promise<SystemNotificationResponseDto[]> {
    return this.notificationService.getSystemNotifications(req.user.id);
  }

  @Patch('system/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a system notification as read' })
  @ApiResponseSwagger(updateSwagger(SystemNotificationResponseDto, 'Notifications'))
  async markAsRead(
    @Param('id') id: string,
  ): Promise<SystemNotificationResponseDto> {
    return this.notificationService.markAsRead(parseInt(id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponseSwagger(deleteSwagger(SystemNotificationResponseDto, 'Notifications'))
  async deleteNotification(@Param('id') id: string): Promise<OperationResult> {
    return this.notificationService.deleteNotification(parseInt(id));
  }

  @Get('queue/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve queue statistics' })
  @ApiResponseSwagger(findSwagger(OperationResultDto, 'Notifications'))
  async getQueueStats() {
    return this.notificationService.getQueueStats();
  }

  @Post('queue/clean')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean the notification queue' })
  @ApiResponseSwagger(updateSwagger(OperationResultDto, 'Notifications'))
  async cleanQueue(): Promise<OperationResult> {
    return this.notificationService.cleanQueue();
  }

  @Post('queue/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause the notification queue' })
  @ApiResponseSwagger(updateSwagger(OperationResultDto, 'Notifications'))
  async pauseQueue(): Promise<OperationResult> {
    return this.notificationService.pauseQueue();
  }

  @Post('queue/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume the notification queue' })
  @ApiResponseSwagger(updateSwagger(OperationResultDto, 'Notifications'))
  async resumeQueue(): Promise<OperationResult> {
    return this.notificationService.resumeQueue();
  }
}