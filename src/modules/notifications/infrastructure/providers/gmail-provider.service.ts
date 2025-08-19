import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailData, EmailProvider, EmailResult } from '../../domain/interfaces/email-provider.interface';

@Injectable()
export class GmailProviderService implements EmailProvider, OnModuleInit {
  // Centralized logger for this provider
  private readonly logger = new Logger(GmailProviderService.name);

  // Nodemailer transporter instance. It remains null until initialized.
  private transporter: nodemailer.Transporter | null = null;

  // ConfigService is injected by Nest (requires ConfigModule to be imported or set as global)
  constructor(private readonly configService: ConfigService) {}

  // Lifecycle hook: initialize the transporter after Nest has constructed the provider
  async onModuleInit(): Promise<void> {
    await this.initializeTransporter();
  }

  /**
   * Initializes the Nodemailer transporter using Gmail user/password.
   * This expects GMAIL_USER and GMAIL_PASSWORD to be configured in your environment.
   *
   * Note: For Gmail, using an "App Password" (not your real account password) is recommended
   * when 2FA is enabled on the account.
   */
  private async initializeTransporter(): Promise<void> {
    try {
      const user = this.configService.get<string>('GMAIL_USER');
      const pass = this.configService.get<string>('GMAIL_PASSWORD');

      // Validate required environment variables to avoid partial or broken setup
      if (!user || !pass) {
        this.logger.error('Missing GMAIL_USER or GMAIL_PASSWORD environment variables');
        this.transporter = null;
        return;
      }

      // Create a transporter configured for Gmail with basic auth (user/password)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });

      // Verify the transporter connection/settings at startup
      await this.transporter.verify();
      this.logger.log('Gmail transporter initialized successfully ✅');
    } catch (error) {
      // Ensure transporter is marked unusable and log a clear error
      this.logger.error('Failed to initialize Gmail transporter', error as any);
      this.transporter = null;
    }
  }

  /**
   * Safe accessor for the transporter. Throws if it has not been initialized.
   * Using a getter avoids TypeScript "never" narrowing issues with private fields.
   */
  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      throw new Error('Gmail transporter not initialized');
    }
    return this.transporter;
  }

  /**
   * Sends a single email using the configured Gmail transporter.
   * It uses EMAIL_FROM if available, otherwise falls back to GMAIL_USER.
   */
  async sendEmail(to: string, subject: string, body: string, meta?: any): Promise<EmailResult> {
    try {
      const transporter = this.getTransporter();

      const fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'Your App');
      const fromAddress =
        this.configService.get<string>('EMAIL_FROM') ||
        this.configService.get<string>('GMAIL_USER');

      const mailOptions = {
        from: { name: fromName, address: fromAddress },
        to,
        subject,
        html: body,
        ...meta,
      };

      const result = await transporter.sendMail(mailOptions);

      this.logger.log(`Email sent to ${to} (messageId: ${result.messageId})`);
      return { success: true, messageId: result.messageId, provider: 'gmail' };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error as any);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'gmail',
      };
    }
  }

  /**
   * Sends a batch of emails by iterating over the list and invoking sendEmail.
   * Returns an array of results with success/error info for each item.
   */
  async sendBatchEmail(emails: EmailData[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    for (const email of emails) {
      results.push(await this.sendEmail(email.to, email.subject, email.body, email.meta));
    }
    return results;
  }

  /**
   * Verifies the current transporter connection and credentials.
   * Useful for health checks or admin diagnostics.
   */
  async testConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      this.logger.log('Gmail connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Gmail connection test failed', error as any);
      return false;
    }
  }
}

/**
 Why OAuth2 auth is generally better than user/password for Gmail:

 - Security posture: OAuth2 does not require storing or transmitting the raw account password.
   Instead, it uses tokens with scopes and limited lifetimes, reducing blast radius if leaked.

 - Revocation and rotation: OAuth2 refresh/access tokens can be individually revoked and rotated
   without changing the user’s master password, improving operational hygiene.

 - Compliance and policies: Many organizations mandate OAuth flows with least-privilege scopes,
   auditing, and better alignment with security best practices.

 - 2FA compatibility: With 2FA enabled, Gmail prefers OAuth2 flows. Basic password auth often
   requires App Passwords (a workaround) and may be restricted or deprecated over time.

 If you must use user/password, using a Gmail App Password (not your primary password) is strongly
 recommended to mitigate risk.
 */