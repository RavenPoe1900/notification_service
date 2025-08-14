import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailProvider } from '../../domain/interfaces/email-provider.interface';
import { EmailCombinerService } from '../services/email-combiner.service';
import { NotificationJobData, BatchProcessingJobData } from '../../domain/types/notification-job-data.types';
import { NotificationService } from '../../application/services/notification.service';

/* ---------- Processor principal ---------- */
@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject('EMAIL_PROVIDER')
    private readonly emailProvider: EmailProvider,
    private readonly emailCombinerService: EmailCombinerService,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  /* --------------------------------------------------------
   * Método requerido por WorkerHost.
   * BullMQ envía aquí TODOS los jobs de la cola "notifications".
   * ------------------------------------------------------ */
  override async process(job: Job<any>): Promise<void> {
    switch (job.name) {
      case 'instant-notification':
        await this.handleInstant(job as Job<NotificationJobData>);
        break;

      case 'batch-notification':
        await this.handleBatch(job as Job<BatchProcessingJobData>);
        break;

      case 'scheduled-batch':
        await this.handleScheduled(job as Job<BatchProcessingJobData>);
        break;

      default:
        this.logger.warn(`Job con nombre desconocido: ${job.name}`);
    }
  }

  /* ========== LÓGICA DE NEGOCIO (idéntica a tu versión previa) ========== */

  private async handleInstant(job: Job<NotificationJobData>) {
    const { notificationId, channel, emailData } = job.data;
    this.logger.log(`Processing instant notification ${notificationId} via ${channel}`);

    try {
      if (channel === 'EMAIL' && emailData) {
        const result = await this.emailProvider.sendEmail(
          emailData.to,
          emailData.subject,
          emailData.body,
          emailData.meta,
        );

        if (result.success) {
          await this.notificationService.updateStatus(notificationId, 'SENT');
          this.logger.log(`Email sent successfully for notification ${notificationId}`);
        } else {
          await this.notificationService.updateStatus(notificationId, 'ERROR', result.error);
          this.logger.error(`Failed to send email for notification ${notificationId}: ${result.error}`);
          throw new Error(result.error);
        }
      } else if (channel === 'SYSTEM') {
        await this.notificationService.updateStatus(notificationId, 'SENT');
        this.logger.log(`System notification ${notificationId} marked as sent`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.notificationService.updateStatus(notificationId, 'ERROR', message);
      this.logger.error(`Failed to process instant notification ${notificationId}`, error);
      throw error;
    }
  }

  private async handleBatch(job: Job<BatchProcessingJobData>) {
    const { batchKey, channel } = job.data;
    this.logger.log(`Processing batch notifications for key: ${batchKey}`);

    try {
      const batch = await this.notificationService.findByBatchKey(batchKey);
      if (!batch.length) {
        this.logger.warn(`No notifications found for batch key: ${batchKey}`);
        return;
      }

      if (channel === 'EMAIL') {
        const emails = batch
          .filter(n => n.email)
          .map(n => ({ subject: n.email.subject, body: n.email.body, to: n.email.to }));

        if (!emails.length) {
          this.logger.warn(`No email notifications in batch: ${batchKey}`);
          return;
        }

        const subject = this.emailCombinerService.combineEmailSubjects(emails);
        const body = this.emailCombinerService.combineEmailBodies(emails);
        const to = this.emailCombinerService.getRecipientEmail(emails);

        const result = await this.emailProvider.sendEmail(to, subject, body);

        for (const n of batch) {
          await this.notificationService.updateStatus(
            n.id,
            result.success ? 'SENT' : 'ERROR',
            result.success ? undefined : result.error,
          );
        }
        this.logger.log(`Batch email processed for ${batch.length} notifications`);
      } else if (channel === 'SYSTEM') {
        for (const n of batch) {
          await this.notificationService.updateStatus(n.id, 'SENT');
        }
        this.logger.log(`Batch system notifications processed as instant (${batch.length})`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed processing batch key ${batchKey}`, error);

      const batch = await this.notificationService.findByBatchKey(batchKey);
      for (const n of batch) {
        await this.notificationService.updateStatus(n.id, 'ERROR', message);
      }
      throw error;
    }
  }

  /** El job programado por tiempo límite simplemente re-dispara la lógica de batch */
  private async handleScheduled(job: Job<BatchProcessingJobData>) {
    this.logger.log(`Scheduled batch triggered for key: ${job.data.batchKey}`);
    await this.handleBatch(job);
  }
}