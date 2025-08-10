import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from '../../application/services/notification.service';
import { CreateNotificationDto } from '../../application/dtos/create-notification.dto';
import { NotificationResponseDto, SystemNotificationResponseDto } from '../../application/dtos/notification-response.dto';
import { RequestWithUser } from 'src/shared/domain/interfaces/request-id.interface';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth('access-token')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid notification data',
  })
  async createNotification(
    @Body() createDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.createNotification(createDto);
  }

  @Get('system')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'System notifications retrieved successfully',
    type: [SystemNotificationResponseDto],
  })
  async getSystemNotifications(
    @Request() req: RequestWithUser,
  ): Promise<SystemNotificationResponseDto[]> {
    return this.notificationService.getSystemNotifications(req.user.id);
  }

  @Patch('system/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: SystemNotificationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async markAsRead(
    @Param('id') id: string,
  ): Promise<SystemNotificationResponseDto> {
    return this.notificationService.markAsRead(parseInt(id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async deleteNotification(@Param('id') id: string): Promise<void> {
    await this.notificationService.deleteNotification(parseInt(id));
  }
} 