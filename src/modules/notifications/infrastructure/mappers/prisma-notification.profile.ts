import {
  createMap,
  forMember,
  mapWith,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';

import { Prisma } from '@prisma/client';
import { NotificationResponseDto, SystemNotificationResponseDto, EmailNotificationResponseDto } from '../../application/dtos/notification-response.dto';
import { notificationSelect, systemNotificationSelect } from '../prisma/notification.select';

export const notificationArgs = Prisma.validator<Prisma.NotificationDefaultArgs>()({
  select: notificationSelect,
});

export const systemNotificationArgs = Prisma.validator<Prisma.SystemNotificationDefaultArgs>()({
  select: systemNotificationSelect,
});

/* Typed aliases that will always reflect the SELECT */
export type NotificationPrismaPayload = Prisma.NotificationGetPayload<
  typeof notificationArgs
>;

export type SystemNotificationPrismaPayload = Prisma.SystemNotificationGetPayload<
  typeof systemNotificationArgs
>;

/* --- Plain types for relations --- */
type EmailNotificationPayload = {
  id: number;
  to: string;
  subject: string;
  body: string;
  meta?: any;
  providerUsed: string;
  providerMsgId?: string;
};

type SystemNotificationPayload = {
  id: number;
  content: string;
  isRead: boolean;
  readAt?: Date;
  userId: number;
};

@Injectable()
export class PrismaNotificationToDtoProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      /* ───── Sub-maps (relations) ───── */
      createMap<EmailNotificationPayload, EmailNotificationResponseDto>(
        mapper,
        'EmailNotification',
        EmailNotificationResponseDto,
      );

      createMap<SystemNotificationPayload, SystemNotificationResponseDto>(
        mapper,
        'SystemNotification',
        SystemNotificationResponseDto,
      );

      /* ───── Main map Prisma → DTO ───── */
      createMap<NotificationPrismaPayload, NotificationResponseDto>(
        mapper,
        'Notification',
        NotificationResponseDto,

        forMember(
          (d) => d.email,
          mapWith(EmailNotificationResponseDto, 'EmailNotification', (s) => s.email),
        ),

        forMember(
          (d) => d.system,
          mapWith(SystemNotificationResponseDto, 'SystemNotification', (s) => s.system),
        ),
      );
    };
  }
} 