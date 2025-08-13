import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { NotificationRepository } from '../../domain/interfaces/notification-repository.interface';
import { CreateNotificationDto, Channel, NotificationType } from '../dtos/create-notification.dto';
import { NotificationResponseDto, SystemNotificationResponseDto } from '../dtos/notification-response.dto';
import { NotificationMapper, SystemNotificationMapper } from '../../infrastructure/mappers/notification.mapper';
import { NotificationQueueService } from '../../infrastructure/services/notification-queue.service';
import { NotificationJobData } from '../../infrastructure/processors/notification.processor';

export type OperationResult = { success: boolean; message: string };

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('NOTIFICATION_REPOSITORY') private readonly notificationRepository: NotificationRepository,
    private readonly notificationMapper: NotificationMapper,
    private readonly systemNotificationMapper: SystemNotificationMapper,
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  async createNotification(createDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    // Validate input based on channel
    this.validateNotificationData(createDto);

    // Ensure system notifications are always processed as instant
    if (createDto.channel === Channel.SYSTEM) {
      createDto.type = NotificationType.INSTANT;
    }

    // Generate batch key for batch notifications
    const batchKey = createDto.type === NotificationType.BATCH 
      ? this.generateBatchKey(createDto.eventName, createDto.channel, createDto.emailData?.to)
      : undefined;

    // Create notification in database
    const notification = await this.notificationRepository.create({
      eventName: createDto.eventName,
      channel: createDto.channel,
      type: createDto.type,
      batchKey,
      emailData: createDto.emailData,
      systemData: createDto.systemData,
    });

    // Prepare job data for queue processing
    const jobData: NotificationJobData = {
      notificationId: notification.id,
      eventName: createDto.eventName,
      channel: createDto.channel,
      type: createDto.type,
      batchKey,
      emailData: createDto.emailData,
      systemData: createDto.systemData,
    };

    // Process based on type using BullMQ
    if (createDto.type === NotificationType.INSTANT) {
      // Add instant notification to queue for immediate processing
      await this.notificationQueueService.addInstantNotification(jobData);
      this.logger.log(`Instant notification ${notification.id} added to queue`);
    } else {
      // Add batch notification to queue
      const recipient = createDto.emailData?.to || createDto.systemData?.userId.toString() || '';
      const result = await this.notificationQueueService.addBatchNotification(jobData, batchKey!, recipient);
      this.logger.log(`Batch notification ${notification.id} added to queue. Job ID: ${result.jobId}`);
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
    // Fetch system notifications for a specific user
    const notifications = await this.notificationRepository.findSystemNotificationsByUserId(userId);
    return this.systemNotificationMapper.toDtoArray(notifications);
  }

  async markAsRead(notificationId: number): Promise<SystemNotificationResponseDto> {
    // Mark a specific notification as read
    const notification = await this.notificationRepository.markAsRead(notificationId);
    return this.systemNotificationMapper.toDto(notification);
  }

  async deleteNotification(notificationId: number): Promise<OperationResult> {
    // Delete a specific notification
    await this.notificationRepository.delete(notificationId);
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