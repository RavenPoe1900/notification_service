import { Prisma } from '@prisma/client';
import {
  notificationSelect,
  systemNotificationSelect,
} from '../../prisma/notification.select';

export const notificationArgs =
  Prisma.validator<Prisma.NotificationDefaultArgs>()({
    select: notificationSelect,
  });

export const systemNotificationArgs =
  Prisma.validator<Prisma.SystemNotificationDefaultArgs>()({
    select: systemNotificationSelect,
  });

export type NotificationPrismaPayload =
  Prisma.NotificationGetPayload<typeof notificationArgs>;

export type SystemNotificationPrismaPayload =
  Prisma.SystemNotificationGetPayload<typeof systemNotificationArgs>;

export type EmailNotificationPayload = {
  id: number;
  to: string;
  subject: string;
  body: string;
  meta?: any;
  providerUsed: string;
  providerMsgId?: string;
};

export type SystemNotificationPayload = {
  id: number;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  userId: number;
};