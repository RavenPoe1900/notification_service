import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateNotificationDto, Channel, NotificationType } from '../dtos/create-notification.dto';
import { NotificationResponseDto, SystemNotificationResponseDto } from '../dtos/notification-response.dto';
import { NotificationMapper, SystemNotificationMapper } from '../../infrastructure/mappers/notification.mapper';
import { NotificationQueueService } from '../../infrastructure/services/notification-queue.service';
import { PrismaService } from 'nestjs-prisma';
import { NotificationStatus, Prisma } from '@prisma/client';
import { PrismaGenericService } from 'src/shared/infrastructure/generic/prisma-generic.service';
import type { Notification, OperationResult } from '../../domain/types/notification.types';
import { NotificationJobData } from '../../domain/types/notification-job-data.types';
import { notificationArgs } from '../../infrastructure/prisma/notification.select';

@Injectable()
export class NotificationService extends PrismaGenericService<
    Notification,
    Prisma.NotificationCreateArgs,
    Prisma.NotificationFindManyArgs,
    Prisma.NotificationFindUniqueArgs,
    Prisma.NotificationUpdateArgs,
    Prisma.NotificationDeleteArgs
  >  {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationMapper: NotificationMapper,
    private readonly systemNotificationMapper: SystemNotificationMapper,
    private readonly notificationQueueService: NotificationQueueService,
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

  async createNotification(createDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    this.validateNotificationData(createDto);

    if (createDto.channel === Channel.SYSTEM) {
      createDto.type = NotificationType.INSTANT;
    }

    const batchKey = createDto.type === NotificationType.BATCH 
      ? this.generateBatchKey(createDto.eventName, createDto.channel, createDto.emailData?.to)
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
                providerUsed: process.env.EMAIL_PROVIDER
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

    if (createDto.type === NotificationType.INSTANT) {
      await this.notificationQueueService.addInstantNotification(jobData);
      this.logger.log(`Instant notification ${notification.id} added to queue`);
    } else {
      const recipient = createDto.emailData?.to || createDto.systemData?.userId.toString() || '';
      await this.notificationQueueService.addBatchNotification(jobData, batchKey!, recipient);
    }

    return this.notificationMapper.toDto(notification);
  }

  private validateNotificationData(createDto: CreateNotificationDto): void {
    // Validate that email data is provided for EMAIL channel
    if (createDto.channel === Channel.EMAIL && !createDto.emailData) {
      throw new BadRequestException('Email data is required for EMAIL channel');
    }

    // Validate that system data is provided for SYSTEM channel
    if (createDto.channel === Channel.SYSTEM && !createDto.systemData) {
      throw new BadRequestException('System data is required for SYSTEM channel');
    }

    // Validate email format if email data is provided
    if (createDto.channel === Channel.EMAIL && createDto.emailData) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(createDto.emailData.to)) {
        throw new BadRequestException('Invalid email address format');
      }
    }
  }

  private generateBatchKey(eventName: string, channel: string, recipient?: string): string {
    return `${eventName}_${channel}_${recipient || 'system'}`;
  }

  async getSystemNotifications(userId: number): Promise<SystemNotificationResponseDto[]> {
    const notifications = await super.findAll({
      filter: {
        system: {
          userId,
          deletedAt: null,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
    return this.systemNotificationMapper.toDtoArray(notifications.data);
  }

  protected get prismaService(): PrismaService {
    return (this as any).model as PrismaService;
  }

  async markAsRead(notificationId: number): Promise<SystemNotificationResponseDto> {
    const systemNotification = await this.prismaService.systemNotification.update({
      where: { notificationId },
      data: { isRead: true, readAt: new Date() },
    });
    return {
      id: systemNotification.id,
      content: systemNotification.content,
      isRead: systemNotification.isRead,
      readAt: systemNotification.readAt,
      userId: systemNotification.userId,
      createdAt: new Date(), // Placeholder for missing field
    };
  }

  async updateStatus(notificationId: number, status: NotificationStatus, errorMsg?: string): Promise<void> {
    await super.update(
      { where: { id: notificationId } },
      { 
        where: { id: notificationId },
        data: { 
        status: status,
        errorMsg, 
        processedAt: status === NotificationStatus.SENT ? new Date() : undefined 
      } }
    );
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

  async deleteNotification(notificationId: number): Promise<OperationResult> {
    const findArgs = { where: { id: notificationId } };
    const deleteArgs = { where: { id: notificationId } };

    await super.remove(findArgs, deleteArgs);
    return { success: true, message: 'Notification deleted successfully' };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return this.notificationQueueService.getQueueStats();
  }

  /**
   * Clean queue (remove old completed/failed jobs)
   */
  async cleanQueue(): Promise<OperationResult> {
    return this.notificationQueueService.cleanQueue();
  }

  /**
   * Pause queue processing
   */
  async pauseQueue(): Promise<OperationResult> {
    return this.notificationQueueService.pauseQueue();
  }

  /**
   * Resume queue processing
   */
  async resumeQueue(): Promise<OperationResult> {
    return this.notificationQueueService.resumeQueue();
  }
}