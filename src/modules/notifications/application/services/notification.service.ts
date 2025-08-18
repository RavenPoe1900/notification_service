// src/application/services/notification.service.ts
import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateNotificationDto,
  Channel,
  NotificationType,
} from '../dtos/create-notification.dto';
import { NotificationResponseDto, SystemNotificationResponseDto } from '../dtos/notification-response.dto';
import { PrismaService } from 'nestjs-prisma';
import { NotificationStatus, Prisma } from '@prisma/client';
import { PrismaGenericService } from 'src/shared/infrastructure/generic/prisma-generic.service';
import type { Notification } from '../../domain/types/notification.types';
import { NotificationJobData } from '../../domain/types/notification-job-data.types';
import {
  NotificationMapper,
  SystemNotificationMapper,
} from '../../infrastructure/mappers/notification.mapper';
import { NotificationQueueService } from '../../infrastructure/services/notification-queue.service';
import { OperationResultDto } from 'src/shared/applications/dtos/operation-result.dto';
import { NotificationCommonService } from './notification-common.service';

@Injectable()
export class NotificationService extends PrismaGenericService<
  Notification,
  Prisma.NotificationCreateArgs,
  Prisma.NotificationFindManyArgs,
  Prisma.NotificationFindUniqueArgs,
  Prisma.NotificationUpdateArgs,
  Prisma.NotificationDeleteArgs
> {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationMapper: NotificationMapper,
    private readonly systemNotificationMapper: SystemNotificationMapper,
    private readonly notificationQueueService: NotificationQueueService,
    private readonly notificationCommonService: NotificationCommonService,
    prismaService: PrismaService,
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

  /* ───────────────────── CREAR ───────────────────── */
  async createNotification(
    createDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    this.validateNotificationData(createDto);

    // SYSTEM siempre instantánea
    if (createDto.channel === Channel.SYSTEM) {
      createDto.type = NotificationType.INSTANT;
    }

    const batchKey =
      createDto.type === NotificationType.BATCH
        ? this.generateBatchKey(
            createDto.eventName,
            createDto.channel,
            createDto.emailData?.to,
          )
        : undefined;

    const args: Prisma.NotificationCreateArgs = {
      data: {
        eventName: createDto.eventName,
        channel: createDto.channel,
        type: createDto.type,
        batchKey,
        status: NotificationStatus.PENDING,

        email: createDto.emailData
          ? {
              create: {
                to: createDto.emailData.to,
                subject: createDto.emailData.subject,
                body: createDto.emailData.body,
                meta: createDto.emailData.meta,
                providerUsed: process.env.EMAIL_PROVIDER,
              },
            }
          : undefined,

        system: createDto.systemData
          ? {
              create: {
                userId: createDto.systemData.userId,
                content: createDto.systemData.content,
                isRead: false,
              },
            }
          : undefined,
      },
    };

    const notification = await super.create(args);

    const jobData: NotificationJobData = {
      notificationId: notification.id,
      eventName: createDto.eventName,
      channel: createDto.channel,
      type: createDto.type,
      batchKey,
      emailData: createDto.emailData,
      systemData: createDto.systemData,
    };

    /* Encolar según tipo */
    if (createDto.type === NotificationType.INSTANT) {
      await this.notificationQueueService.addInstantNotification(jobData);
      this.logger.log(`Instant notification ${notification.id} added to queue`);
    } else {
      const recipient =
        createDto.emailData?.to || createDto.systemData?.userId.toString() || '';
      await this.notificationQueueService.addBatchNotification(
        jobData,
        batchKey!,
        recipient,
      );
    }

    return this.notificationMapper.toDto(notification);
  }

  /* ───────────────────── READ / UNREAD ───────────────────── */
  async markAsRead(notificationId: number): Promise<SystemNotificationResponseDto> {
    const notification = await super.update(
      { where: { id: notificationId } },
      {
        where: { id: notificationId },
        data: { system: { update: { isRead: true, readAt: new Date() } } },
        include: { system: true },
      },
    );

    return this.systemNotificationMapper.toDto(notification);
  }

  async markAsUnread(
    notificationId: number,
  ): Promise<SystemNotificationResponseDto> {
    const notification = await super.update(
      { where: { id: notificationId } },
      {
        where: { id: notificationId },
        data: { system: { update: { isRead: false, readAt: null } } },
        include: { system: true },
      },
    );

    return this.systemNotificationMapper.toDto(notification);
  }

  /* ───────────────────── VALIDACIÓN ───────────────────── */
  private validateNotificationData(createDto: CreateNotificationDto): void {
    // Regla: SYSTEM nunca BATCH
    if (
      createDto.channel === Channel.SYSTEM &&
      createDto.type === NotificationType.BATCH
    ) {
      throw new BadRequestException(
        'SYSTEM channel notifications cannot be of type BATCH',
      );
    }

    // Email requerido para EMAIL
    if (createDto.channel === Channel.EMAIL && !createDto.emailData) {
      throw new BadRequestException('Email data is required for EMAIL channel');
    }

    // System requerido para SYSTEM
    if (createDto.channel === Channel.SYSTEM && !createDto.systemData) {
      throw new BadRequestException('System data is required for SYSTEM channel');
    }

    // Validación email + campos
    if (createDto.channel === Channel.EMAIL && createDto.emailData) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(createDto.emailData.to)) {
        throw new BadRequestException('Invalid email address format');
      }
      if (!createDto.emailData.subject?.trim()) {
        throw new BadRequestException('Email subject is required');
      }
      if (!createDto.emailData.body?.trim()) {
        throw new BadRequestException('Email body is required');
      }
    }
  }

  private generateBatchKey(
    eventName: string,
    channel: string,
    recipient?: string,
  ): string {
    return `${eventName}_${channel}_${recipient || 'system'}`;
  }

  /* ───────────────────── LISTAR (pag.) ───────────────────── */
  async getSystemNotifications(
    userId: number,
    {
      page = 1,
      pageSize = 20,
      onlyUnread,
    }: { page?: number; pageSize?: number; onlyUnread?: boolean } = {},
  ): Promise<SystemNotificationResponseDto[]> {
    const where: Prisma.NotificationWhereInput = {
      system: { userId, deletedAt: null, ...(onlyUnread ? { isRead: false } : {}) },
    };

    const notifications = await super.findAll({
      filter: where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    return this.systemNotificationMapper.toDtoArray(notifications.data);
  }

  /* ───────────────────── OTROS helpers ───────────────────── */
  protected get prismaService(): PrismaService {
    return (this as any).model as PrismaService;
  }

  async updateStatus(
    notificationId: number,
    status: NotificationStatus,
    errorMsg?: string,
  ): Promise<void> {
    await this.notificationCommonService.updateStatus(
      notificationId,
      status,
      errorMsg,
    );
  }

  async findPendingBatchNotifications(): Promise<Notification[]> {
    return this.notificationCommonService.findPendingBatchNotifications();
  }

  async findByBatchKey(batchKey: string): Promise<NotificationResponseDto[]> {
    return this.notificationCommonService.findByBatchKey(batchKey);
  }

  async deleteNotification(notificationId: number): Promise<OperationResultDto> {
    await super.remove({ where: { id: notificationId } }, { where: { id: notificationId } });
    return { success: true, message: 'Notification deleted successfully' };
  }

  /* Stats / mantenimiento delegados a NotificationQueueService */
  async getQueueStats() {
    return this.notificationQueueService.getQueueStats();
  }
  async cleanQueue()  { return this.notificationQueueService.cleanQueue(); }
  async pauseQueue()  { return this.notificationQueueService.pauseQueue(); }
  async resumeQueue() { return this.notificationQueueService.resumeQueue(); }
}