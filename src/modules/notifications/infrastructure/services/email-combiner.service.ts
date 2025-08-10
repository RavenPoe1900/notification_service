import { Injectable } from '@nestjs/common';
import { EmailTemplateService, BatchEmailData } from './email-template.service';

export interface EmailNotification {
  subject: string;
  body: string;
  to: string;
}

@Injectable()
export class EmailCombinerService {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  combineEmailSubjects(notifications: EmailNotification[]): string {
    if (notifications.length === 0) {
      return 'No notifications';
    }

    const subjects = notifications.map(n => n.subject);
    const uniqueSubjects = [...new Set(subjects)];
    
    if (uniqueSubjects.length === 1) {
      return uniqueSubjects[0];
    }
    
    return `Multiple notifications (${notifications.length})`;
  }

  combineEmailBodies(notifications: EmailNotification[]): string {
    if (notifications.length === 0) {
      return '';
    }

    if (notifications.length === 1) {
      return this.emailTemplateService.generateSingleEmailTemplate(
        notifications[0].subject,
        notifications[0].body
      );
    }

    const batchData: BatchEmailData = {
      notificationCount: notifications.length,
      notifications: notifications.map((notification, index) => ({
        subject: notification.subject,
        body: notification.body,
        index: index + 1,
      })),
    };

    return this.emailTemplateService.generateBatchEmailTemplate(batchData);
  }

  getRecipientEmail(notifications: EmailNotification[]): string {
    if (notifications.length === 0) {
      throw new Error('No notifications provided');
    }

    // All notifications in a batch should have the same recipient
    const recipient = notifications[0].to;
    
    // Validate that all notifications have the same recipient
    const allSameRecipient = notifications.every(n => n.to === recipient);
    if (!allSameRecipient) {
      throw new Error('All notifications in a batch must have the same recipient');
    }

    return recipient;
  }
} 