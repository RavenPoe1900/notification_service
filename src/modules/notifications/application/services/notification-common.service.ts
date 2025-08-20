import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { NotificationStatus, NotificationType } from '@prisma/client';
import type { Notification } from '../../domain/types/notification.types';

@Injectable()
export class NotificationCommonService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatus(notificationId: number, status: NotificationStatus, errorMsg?: string) {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status,
        errorMsg: errorMsg ?? null,
      },
    });
  }

  // Importante: incluye relaciones y filtra por tipo y estado
  async findByBatchKey(batchKey: string) {
    return this.prisma.notification.findMany({
      where: {
        batchKey,
        type: NotificationType.BATCH,
        status: NotificationStatus.PENDING,
      },
      include: {
        email: true,
        system: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async findPendingBatchNotifications(email: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        type: NotificationType.BATCH,
        status: NotificationStatus.PENDING,
        email:{
          is:{
            to: email
          }
        }
      },
      include: {
        email: true,
        system: true,
      },
      orderBy: { id: 'asc' },
    });
  }
}