import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { EmailProvider, EmailResult } from '../../domain/interfaces/email-provider.interface';
import type { Notification } from '../../domain/types/notification.types';

@Injectable()
export class MailgunProviderService implements EmailProvider {
  private readonly logger = new Logger(MailgunProviderService.name);
  private mailgun: any;
  private domain: string;

  constructor(private readonly configService: ConfigService) {
    this.initializeMailgun();
  }

  private initializeMailgun() {
    try {
      const apiKey = this.configService.get<string>('MAILGUN_API_KEY');
      const domain = this.configService.get<string>('MAILGUN_DOMAIN');
      const region = this.configService.get<string>('MAILGUN_REGION') ?? 'us';

      if (!apiKey || !domain) {
        throw new Error('Mailgun API key and domain are required');
      }

      this.domain = domain;
      this.mailgun = new Mailgun(formData).client({
        username: 'api',
        key: apiKey,
        url: region === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net',
      });

      this.logger.log('Mailgun client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Mailgun client', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, body: string, meta?: any): Promise<EmailResult> {
    try {
      if (!to) {
        return { success: false, error: 'Recipient (to) is required', provider: 'mailgun' };
      }

      const fromEmail = this.configService.get<string>('EMAIL_FROM');
      if (!fromEmail) {
        return { success: false, error: 'EMAIL_FROM is not configured', provider: 'mailgun' };
      }

      const messageData = {
        from: `${this.configService.get<string>('EMAIL_FROM_NAME', 'Your App')} <${fromEmail}>`,
        to,
        subject,
        html: body,
        ...meta,
      };

      const result = await this.mailgun.messages.create(this.domain, messageData);
      this.logger.log(`Email sent successfully to ${to} with message ID: ${result.id}`);

      return {
        success: true,
        messageId: result.id,
        provider: 'mailgun',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email to ${to}`, error);
      return {
        success: false,
        error: msg,
        provider: 'mailgun',
      };
    }
  }

  async sendBatchEmail(emails: Notification[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    for (const email of emails) {
      const result = await this.sendEmail(email.email.to, email.email.subject, email.email.body, email.email.meta);
      results.push(result);
    }
    return results;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.mailgun.domains.get(this.domain);
      this.logger.log('Mailgun connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Mailgun connection test failed', error);
      return false;
    }
  }
}