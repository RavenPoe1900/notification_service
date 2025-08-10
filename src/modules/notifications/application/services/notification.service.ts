import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationRepository } from '../../domain/interfaces/notification-repository.interface';
import { EmailProvider } from '../../domain/interfaces/email-provider.interface';
import { CreateNotificationDto, Channel, NotificationType } from '../dtos/create-notification.dto';
import { NotificationResponseDto, SystemNotificationResponseDto } from '../dtos/notification-response.dto';
import { NotificationMapper, SystemNotificationMapper } from '../../infrastructure/mappers/notification.mapper';
import { EmailCombinerService } from '../../infrastructure/services/email-combiner.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('NOTIFICATION_REPOSITORY') private readonly notificationRepository: NotificationRepository,
    @Inject('EMAIL_PROVIDER') private readonly emailProvider: EmailProvider,
    private readonly configService: ConfigService,
    private readonly notificationMapper: NotificationMapper,
    private readonly systemNotificationMapper: SystemNotificationMapper,
    private readonly emailCombinerService: EmailCombinerService,
  ) {}

  async createNotification(createDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    // Validate input based on channel
    this.validateNotificationData(createDto);

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

    // Process based on type
    if (createDto.type === NotificationType.INSTANT) {
      await this.processInstantNotification(notification);
    } else {
      await this.processBatchNotification(notification);
    }

    return this.notificationMapper.toDto(notification);
  }

  private validateNotificationData(createDto: CreateNotificationDto): void {
    if (createDto.channel === Channel.EMAIL && !createDto.emailData) {
      throw new BadRequestException('Email data is required for EMAIL channel');
    }

    if (createDto.channel === Channel.SYSTEM && !createDto.systemData) {
      throw new BadRequestException('System data is required for SYSTEM channel');
    }

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

  private async processInstantNotification(notification: any): Promise<void> {
    try {
      if (notification.channel === 'EMAIL' && notification.email) {
        const result = await this.emailProvider.sendEmail(
          notification.email.to,
          notification.email.subject,
          notification.email.body,
          notification.email.meta,
        );

        if (result.success) {
          await this.notificationRepository.updateStatus(notification.id, 'SENT');
          // Update email notification with provider info
          // This would require additional repository method
        } else {
          await this.notificationRepository.updateStatus(notification.id, 'ERROR', result.error);
        }
      } else if (notification.channel === 'SYSTEM') {
        // System notifications are always processed as instant
        await this.notificationRepository.updateStatus(notification.id, 'SENT');
      }
    } catch (error) {
      this.logger.error(`Failed to process instant notification ${notification.id}`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.notificationRepository.updateStatus(notification.id, 'ERROR', errorMessage);
    }
  }

  private async processBatchNotification(notification: any): Promise<void> {
    try {
      // Check if batch is ready to process
      const batchNotifications = await this.notificationRepository.findByBatchKey(notification.batchKey);
      
      const maxSize = this.configService.get<number>('BATCH_MAX_SIZE', 5);
      const maxWaitTime = this.configService.get<number>('BATCH_MAX_WAIT_TIME', 7200); // 2 hours
      
      const oldestNotification = batchNotifications[0];
      const timeSinceFirst = Date.now() - oldestNotification.createdAt.getTime();
      
      if (batchNotifications.length >= maxSize || timeSinceFirst >= maxWaitTime * 1000) {
        await this.processBatch(batchNotifications);
      }
    } catch (error) {
      this.logger.error(`Failed to process batch notification ${notification.id}`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.notificationRepository.updateStatus(notification.id, 'ERROR', errorMessage);
    }
  }

  private async processBatch(notifications: any[]): Promise<void> {
    if (notifications.length === 0) return;

    const firstNotification = notifications[0];
    
    if (firstNotification.channel === 'EMAIL') {
      // Extract email notifications
      const emailNotifications = notifications
        .filter(n => n.email)
        .map(n => ({
          subject: n.email.subject,
          body: n.email.body,
          to: n.email.to,
        }));

      if (emailNotifications.length === 0) {
        this.logger.warn('No email notifications found in batch');
        return;
      }

      // Combine email content using the service
      const combinedSubject = this.emailCombinerService.combineEmailSubjects(emailNotifications);
      const combinedBody = this.emailCombinerService.combineEmailBodies(emailNotifications);
      const recipientEmail = this.emailCombinerService.getRecipientEmail(emailNotifications);
      
      const result = await this.emailProvider.sendEmail(
        recipientEmail,
        combinedSubject,
        combinedBody,
      );

      // Update all notifications in batch
      for (const notification of notifications) {
        if (result.success) {
          await this.notificationRepository.updateStatus(notification.id, 'SENT');
        } else {
          await this.notificationRepository.updateStatus(notification.id, 'ERROR', result.error);
        }
      }
    }
  }



  async getSystemNotifications(userId: number): Promise<SystemNotificationResponseDto[]> {
    const notifications = await this.notificationRepository.findSystemNotificationsByUserId(userId);
    return this.systemNotificationMapper.toDtoArray(notifications);
  }

  async markAsRead(notificationId: number): Promise<SystemNotificationResponseDto> {
    const notification = await this.notificationRepository.markAsRead(notificationId);
    return this.systemNotificationMapper.toDto(notification);
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.notificationRepository.delete(notificationId);
  }
} 