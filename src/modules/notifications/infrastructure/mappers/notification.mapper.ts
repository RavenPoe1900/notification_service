import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/shared/infrastructure/mappers/base-mapper';


import {
  NotificationPrismaPayload,
  SystemNotificationPrismaPayload,
} from './types/notification.prisma-types';
import { NotificationResponseDto, SystemNotificationResponseDto } from '../../application/dtos/notification-response.dto';

@Injectable()
export class NotificationMapper extends BaseMapper<
  NotificationPrismaPayload,
  NotificationResponseDto
> {
  protected getSourceType() {
    return 'Notification';
  }
  protected getDestinationType() {
    return 'NotificationResponseDto';
  }

  toDto(entity: NotificationPrismaPayload): NotificationResponseDto {
    return this.map(entity);
  }
  toDtoArray(
    entities: NotificationPrismaPayload[],
  ): NotificationResponseDto[] {
    return this.mapArray(entities);
  }
}

@Injectable()
export class SystemNotificationMapper extends BaseMapper<
  SystemNotificationPrismaPayload,
  SystemNotificationResponseDto
> {
  protected getSourceType() {
    return 'SystemNotification';
  }
  protected getDestinationType() {
    return 'SystemNotificationResponseDto';
  }

  toDto(
    entity: SystemNotificationPrismaPayload,
  ): SystemNotificationResponseDto {
    return this.map(entity);
  }
  toDtoArray(
    entities: SystemNotificationPrismaPayload[],
  ): SystemNotificationResponseDto[] {
    return this.mapArray(entities);
  }
}