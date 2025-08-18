import {
  Mapper,
  createMap,
  forMember,
  mapFrom,
  mapWith,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import {
  EmailNotificationResponseDto,
  NotificationResponseDto,
  SystemNotificationResponseDto,
} from '../../application/dtos/notification-response.dto';
import { EmailNotificationPayload, NotificationPrismaPayload, SystemNotificationPayload } from './types/notification.prisma-types';



@Injectable()
export class PrismaNotificationToDtoProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap<EmailNotificationPayload, EmailNotificationResponseDto>(
        mapper,
        'EmailNotification',
        'EmailNotificationResponseDto',
      );

      createMap<SystemNotificationPayload, SystemNotificationResponseDto>(
        mapper,
        'SystemNotification',
        'SystemNotificationResponseDto',
        forMember(d => d.id,        mapFrom(s => s.id)),
        forMember(d => d.content,   mapFrom(s => s.content)),
        forMember(d => d.isRead,    mapFrom(s => s.isRead)),
        forMember(d => d.readAt,    mapFrom(s => s.readAt)),
        forMember(d => d.createdAt, mapFrom(s => s.createdAt)),
        forMember(d => d.userId,    mapFrom(s => s.userId)),
      );

      createMap<NotificationPrismaPayload, NotificationResponseDto>(
        mapper,
        'Notification',
        'NotificationResponseDto',
        forMember(
          d => d.email,
          mapWith(
            EmailNotificationResponseDto,
            'EmailNotification',
            s => s.email,
          ),
        ),
        forMember(
          d => d.system,
          mapWith(
            SystemNotificationResponseDto,
            'SystemNotification',
            s => s.system,
          ),
        ),
      );
    };
  }
}