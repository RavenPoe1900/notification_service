import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { EmailProvider, EmailData, EmailResult } from '../../domain/interfaces/email-provider.interface';

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
      const region = this.configService.get<string>('MAILGUN_REGION', 'us');

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
      this.logger.error('Failed to initialize Mailgun client', error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, body: string, meta?: any): Promise<EmailResult> {
    try {
      const messageData = {
        from: `${this.configService.get<string>('EMAIL_FROM_NAME', 'Your App')} <${this.configService.get<string>('EMAIL_FROM')}>`,
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
      this.logger.error(`Failed to send email to ${to}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'mailgun',
      };
    }
  }

  async sendBatchEmail(emails: EmailData[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(email.to, email.subject, email.body, email.meta);
      results.push(result);
    }
    
    return results;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test by getting domain info
      await this.mailgun.domains.get(this.domain);
      this.logger.log('Mailgun connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Mailgun connection test failed', error);
      return false;
    }
  }
} 