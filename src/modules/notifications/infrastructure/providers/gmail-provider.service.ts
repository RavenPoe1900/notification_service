import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailData, EmailProvider, EmailResult } from '../../domain/interfaces/email-provider.interface';

@Injectable()
export class GmailProviderService implements EmailProvider {
  private readonly logger = new Logger(GmailProviderService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.configService.get<string>('GMAIL_USER'),
          clientId: this.configService.get<string>('GMAIL_CLIENT_ID'),
          clientSecret: this.configService.get<string>('GMAIL_CLIENT_SECRET'),
          refreshToken: this.configService.get<string>('GMAIL_REFRESH_TOKEN'),
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.logger.log('Gmail transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Gmail transporter', error);
      //throw error;
    }
  }

  async sendEmail(to: string, subject: string, body: string, meta?: any): Promise<EmailResult> {
    try {
      const mailOptions = {
        from: {
          name: this.configService.get<string>('EMAIL_FROM_NAME', 'Your App'),
          address: this.configService.get<string>('EMAIL_FROM'),
        },
        to,
        subject,
        html: body,
        ...meta,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully to ${to} with message ID: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        provider: 'gmail',
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'gmail',
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
      await this.transporter.verify();
      this.logger.log('Gmail connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Gmail connection test failed', error);
      return false;
    }
  }
} 