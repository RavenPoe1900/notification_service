import { NotificationPrismaPayload, SystemNotificationPrismaPayload } from "../../infrastructure/mappers/types/notification.prisma-types";

export interface NotificationRepository {
  create(notification: CreateNotificationData): Promise<NotificationPrismaPayload>;
  findById(id: number): Promise<NotificationPrismaPayload | null>;
  findByBatchKey(batchKey: string): Promise<NotificationPrismaPayload[]>;
  updateStatus(id: number, status: string, errorMsg?: string): Promise<NotificationPrismaPayload>;
  findPendingBatchNotifications(): Promise<NotificationPrismaPayload[]>;
  findSystemNotificationsByUserId(userId: number): Promise<SystemNotificationPrismaPayload[]>;
  markAsRead(id: number): Promise<SystemNotificationPrismaPayload>;
  delete(id: number): Promise<void>;
}

export interface CreateNotificationData {
  eventName: string;
  channel: string;
  type: string;
  batchKey?: string;
  emailData?: {
    to: string;
    subject: string;
    body: string;
    meta?: any;
  };
  systemData?: {
    userId: number;
    content: string;
  };
} 