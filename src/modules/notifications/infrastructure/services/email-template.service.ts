import { Injectable } from '@nestjs/common';
import { EMAIL_TEMPLATES } from '../config/email-templates.config';

export interface BatchEmailData {
  notificationCount: number;
  notifications: Array<{
    subject: string;
    body: string;
    index: number;
  }>;
}

@Injectable()
export class EmailTemplateService {
  generateBatchEmailTemplate(data: BatchEmailData): string {
    const { notificationCount, notifications } = data;
    const template = EMAIL_TEMPLATES.BATCH_NOTIFICATION;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.title}</title>
        <style>
          ${template.styles}
        </style>
      </head>
      <body>
        <div class="notification-container">
          <div class="header">
            <h2>You have ${notificationCount} new notification${notificationCount > 1 ? 's' : ''}</h2>
          </div>
          
          ${notifications.map(notification => `
            <div class="notification-item">
              <h3>${notification.subject}</h3>
              <div class="notification-content">
                ${notification.body}
              </div>
            </div>
          `).join('')}
          
          <div class="footer">
            <p>${template.footerText}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateSingleEmailTemplate(subject: string, body: string): string {
    const template = EMAIL_TEMPLATES.SINGLE_NOTIFICATION;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          ${template.styles}
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="content">
            ${body}
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 