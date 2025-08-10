import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/shared/infrastructure/mappers/base-mapper';
import { NotificationResponseDto, SystemNotificationResponseDto } from '../../application/dtos/notification-response.dto';
import { NotificationPrismaPayload, SystemNotificationPrismaPayload } from './prisma-notification.profile';

@Injectable()
export class NotificationMapper extends BaseMapper<NotificationPrismaPayload, NotificationResponseDto> {
  protected getSourceType(): string {
    return 'Notification';
  }

  protected getDestinationType(): string {
    return 'NotificationResponseDto';
  }

  toDto(notification: NotificationPrismaPayload): NotificationResponseDto {
    return this.map(notification);
  }

  toDtoArray(notifications: NotificationPrismaPayload[]): NotificationResponseDto[] {
    return this.mapArray(notifications);
  }
}

@Injectable()
export class SystemNotificationMapper extends BaseMapper<SystemNotificationPrismaPayload, SystemNotificationResponseDto> {
  protected getSourceType(): string {
    return 'SystemNotification';
  }

  protected getDestinationType(): string {
    return 'SystemNotificationResponseDto';
  }

  toDto(systemNotification: SystemNotificationPrismaPayload): SystemNotificationResponseDto {
    return this.map(systemNotification);
  }

  toDtoArray(systemNotifications: SystemNotificationPrismaPayload[]): SystemNotificationResponseDto[] {
    return this.mapArray(systemNotifications);
  }
} 