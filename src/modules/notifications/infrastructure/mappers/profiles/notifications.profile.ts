import {
  createMap,
  forMember,
  mapFrom,
  mapWith,
  Mapper,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import {
  NotificationResponseDto,
  EmailNotificationResponseDto,
  SystemNotificationResponseDto,
} from '../../../application/dtos/notification-response.dto';

import {
  NotificationPrismaPayload,
  EmailNotificationPayload,
  SystemNotificationPayload,
} from '../types/notification.prisma-types';

@Injectable()
export class NotificationsProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap<EmailNotificationPayload, EmailNotificationResponseDto>(
        mapper,
        'EmailNotification',              
        'EmailNotificationResponseDto',   
        forMember(d => d.id,            mapFrom(s => s.id)),
        forMember(d => d.to,            mapFrom(s => s.to)),
        forMember(d => d.subject,       mapFrom(s => s.subject)),
        forMember(d => d.body,          mapFrom(s => s.body)),
        forMember(d => d.meta,          mapFrom(s => s.meta)),
        forMember(d => d.providerUsed,  mapFrom(s => s.providerUsed)),
        forMember(d => d.providerMsgId, mapFrom(s => s.providerMsgId)),
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
            'EmailNotificationResponseDto',  
            'EmailNotification',             
            s => s.email,                   
          ),
        ),
        forMember(
          d => d.system,
          mapWith(
            'SystemNotificationResponseDto',
            'SystemNotification',
            s => s.system,                  
          ),
        ),
      );
    };
  }
}