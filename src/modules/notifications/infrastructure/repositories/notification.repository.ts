import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { NotificationRepository, CreateNotificationData } from '../../domain/interfaces/notification-repository.interface';
import { notificationArgs, systemNotificationArgs } from '../prisma/notification.select';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(notificationData: CreateNotificationData): Promise<any> {
    const { eventName, channel, type, batchKey, emailData, systemData } = notificationData;

    return this.prisma.notification.create({
      data: {
        eventName,
        channel: channel as any,
        type: type as any,
        batchKey,
        email: emailData ? {
          create: {
            to: emailData.to,
            subject: emailData.subject,
            body: emailData.body,
            meta: emailData.meta,
            providerUsed: 'pending',
          },
        } : undefined,
        system: systemData ? {
          create: {
            content: systemData.content,
            userId: systemData.userId,
          },
        } : undefined,
      },
      ...notificationArgs,
    });
  }

  async findById(id: number): Promise<any> {
    return this.prisma.notification.findUnique({
      where: { id },
      ...notificationArgs,
    });
  }

  async findByBatchKey(batchKey: string): Promise<any[]> {
    return this.prisma.notification.findMany({
      where: { batchKey: batchKey as any },
      ...notificationArgs,
    });
  }

  async updateStatus(id: number, status: string, errorMsg?: string): Promise<any> {
    return this.prisma.notification.update({
      where: { id },
      data: {
        status: status as any,
        errorMsg,
        processedAt: status === 'SENT' ? new Date() : undefined,
      },
      ...notificationArgs,
    });
  }

  async findPendingBatchNotifications(): Promise<any[]> {
    return this.prisma.notification.findMany({
      where: {
        type: 'BATCH' as any,
        status: 'PENDING' as any,
        batchKey: { not: null } as any,
      },
      ...notificationArgs,
    });
  }

  async findSystemNotificationsByUserId(userId: number): Promise<any[]> {
    return this.prisma.systemNotification.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        id: 'desc',
      },
      ...systemNotificationArgs,
    });
  }

  async markAsRead(id: number): Promise<any> {
    return this.prisma.systemNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      ...systemNotificationArgs,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
} 