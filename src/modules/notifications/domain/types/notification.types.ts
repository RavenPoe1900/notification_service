import type { Channel, EventName, NotificationStatus, NotificationType, Notification as PrismaNotification } from '@prisma/client';

export type OperationResult = { success: boolean; message: string };

export type Notification = PrismaNotification & {
  id: number;
  batchKey?: string | null;
  eventName: EventName;
  channel: Channel;
  type: NotificationType;
  status: NotificationStatus;
  errorMsg?: string | null;
  deletedAt?: Date | null;
  createdAt: Date;
  processedAt?: Date | null;

  email?: EmailNotification | null;
  system?: SystemNotification | null;
}

export interface EmailNotification {
  id: number;
  to: string;
  subject: string;
  body: string;
  meta?: any | null;
  providerUsed: string;
  providerMsgId?: string | null;
  deletedAt?: Date | null;
  notificationId: number;
}

export interface SystemNotification {
  id: number;
  content: string;
  isRead: boolean;
  readAt?: Date | null;
  deletedAt?: Date | null;
  notificationId: number;
  userId: number;
}