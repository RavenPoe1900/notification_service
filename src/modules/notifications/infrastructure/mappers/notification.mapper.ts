import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/shared/infrastructure/mappers/base-mapper';
import { Notification } from '@prisma/client';
import { NotificationResponseDto, SystemNotificationResponseDto } from '../../application/dtos/notification-response.dto';

@Injectable()
export class NotificationMapper extends BaseMapper<
  Notification,
  NotificationResponseDto
> {
  protected getSourceType() {
    return 'Notification';
  }
  protected getDestinationType() {
    return 'NotificationResponseDto';
  }

  toDto(entity: Notification): NotificationResponseDto {
    const emailData = entity as any;
    const systemData = entity as any;

    return {
      id: entity.id,
      eventName: entity.eventName,
      channel: entity.channel,
      type: entity.type,
      status: entity.status,
      batchKey: entity.batchKey,
      emailData: emailData.emailData || undefined,
      systemData: systemData.systemData || undefined,
      createdAt: entity.createdAt,
      processedAt: entity.processedAt,
    };
  }

  toDtoArray(entities: Notification[]): NotificationResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}

@Injectable()
export class SystemNotificationMapper extends BaseMapper<
  Notification,
  SystemNotificationResponseDto
> {
  protected getSourceType() {
    return 'SystemNotification';
  }
  protected getDestinationType() {
    return 'SystemNotificationResponseDto';
  }

  toDto(entity: Notification): SystemNotificationResponseDto {
    const systemData = entity as any;

    return {
      id: entity.id,
      content: systemData.systemData?.content || '',
      userId: systemData.systemData?.userId || 0,
      createdAt: entity.createdAt,
      readAt: entity.processedAt,
      isRead: !!entity.processedAt,
    };
  }

  toDtoArray(entities: Notification[]): SystemNotificationResponseDto[] {
    return entities.map((entity) => {
      const systemData = entity as any;
      return {
        id: entity.id,
        content: systemData.systemData?.content || '',
        userId: systemData.systemData?.userId || 0,
        createdAt: entity.createdAt,
        readAt: entity.processedAt,
        isRead: !!entity.processedAt,
      };
    });
  }
}