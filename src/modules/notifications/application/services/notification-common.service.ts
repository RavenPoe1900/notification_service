import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { PrismaGenericService } from 'src/shared/infrastructure/generic/prisma-generic.service';
import type { Notification } from '../../domain/types/notification.types';
import { Prisma, NotificationStatus } from '@prisma/client';
import { NotificationType } from '../dtos/create-notification.dto';
import { notificationArgs } from '../../infrastructure/prisma/notification.select';
import { NotificationResponseDto } from '../dtos/notification-response.dto';
import { NotificationMapper } from '../../infrastructure/mappers/notification.mapper';

@Injectable()
export class NotificationCommonService extends PrismaGenericService<
  Notification,
  Prisma.NotificationCreateArgs,
  Prisma.NotificationFindManyArgs,
  Prisma.NotificationFindUniqueArgs,
  Prisma.NotificationUpdateArgs,
  Prisma.NotificationDeleteArgs
> {
  constructor(
    prismaService: PrismaService,
    private readonly notificationMapper: NotificationMapper,
    ) {
    super(prismaService.notification, {
      modelName: 'Notification',
      errorDictionary: {
        Notification: {
          unique: {
            eventName: 'A notification with this event name already exists.',
          },
        },
      },
    });
  }

  async findPendingBatchNotifications(): Promise<Notification[]> {
    const result = await super.findAll({
      filter: {
        type: NotificationType.BATCH,
        status: NotificationStatus.PENDING,
        batchKey: { not: null },
      },
    });
    return result.data;
  }

 async findByBatchKey(batchKey: string): Promise<NotificationResponseDto[]> {
    const find = (await super.findAll({
      where: { batchKey: batchKey as any },
      ...notificationArgs,
    })).data;

    return this.notificationMapper.toDtoArray(find);
  }

  async updateStatus(notificationId: number, status: NotificationStatus, errorMsg?: string): Promise<void> {
    await super.update(
      { where: { id: notificationId } },
      {
        where: { id: notificationId },
        data: {
          status,
          errorMsg,
          processedAt: status === NotificationStatus.SENT ? new Date() : undefined,
        },
      },
    );
  }
}
