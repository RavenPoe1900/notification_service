import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { EmailProviderFactory } from '../email/email-provider.factory';
import { NotificationCommonService } from '../../application/services/notification-common.service';
import { NotificationStatus } from '@prisma/client';
import { EmailTemplateService } from '../services/email-template.service';

import type {
  NotificationJobData,
  BatchProcessingJobData,
} from '../../domain/types/notification-job-data.types';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly emailFactory: EmailProviderFactory,
    private readonly notificationCommon: NotificationCommonService,
    private readonly emailTemplateService: EmailTemplateService,
    @InjectQueue('notifications') private readonly queue: Queue,
  ) {
    super();
  }

  override async process(job: Job<unknown>): Promise<void> {
    switch (job.name) {
      case 'instant-notification':
        return this.handleInstant(job as Job<NotificationJobData>);
      case 'batch-notification':
        return this.handleBatch(job as Job<BatchProcessingJobData>);
      case 'scheduled-batch':
        return this.handleScheduled(job as Job<BatchProcessingJobData>);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleInstant(job: Job<NotificationJobData>): Promise<void> {
    const { notificationId, channel, emailData } = job.data;
    try {
      if (channel === 'EMAIL' && emailData) {
        const provider = this.emailFactory.getProvider();
        const result = await provider.sendEmail(
          emailData.to,
          emailData.subject,
          emailData.body,
          emailData.meta,
        );
        if (!result.success) throw new Error(result.error);
      }
      await this.notificationCommon.updateStatus(notificationId, NotificationStatus.SENT);
    } catch (err) {
      await this.notificationCommon.updateStatus(
        notificationId,
        NotificationStatus.ERROR,
        (err as Error).message,
      );
      throw err;
    }
  }

  private async handleBatch(job: Job<BatchProcessingJobData>): Promise<void> {
    const { batchKey, recipient, channel, content } = job.data;
    try {
      if (channel === 'EMAIL') {
        const provider = this.emailFactory.getProvider();
        await provider.sendEmail(recipient, `Batch: ${batchKey}`, content);
      }
      const batch = await this.notificationCommon.findByBatchKey(batchKey);
      await Promise.all(batch.map(n =>
        this.notificationCommon.updateStatus(n.id, NotificationStatus.SENT),
      ));
    } catch (err) {
      const batch = await this.notificationCommon.findByBatchKey(batchKey);
      await Promise.all(batch.map(n =>
        this.notificationCommon.updateStatus(
          n.id,
          NotificationStatus.ERROR,
          (err as Error).message,
        ),
      ));
      throw err;
    }
  }

  private async handleScheduled(job: Job<BatchProcessingJobData>): Promise<void> {
    const { batchKey } = job.data;
    this.logger.log(`Timed batch triggered for ${batchKey}`);

    const pending = await this.notificationCommon.findByBatchKey(batchKey);
    if (!pending.length) return;

    let content: string;
    if (pending[0].channel === 'EMAIL') {
      content = this.emailTemplateService.generateBatchEmailTemplate({
        notificationCount: pending.length,
        notifications: pending.map((n, i) => ({
          subject: n.email?.subject ?? 'No subject',
          body: n.email?.body ?? n.system?.content ?? '',
          index: i,
        })),
      });
    } else {
      content = `<ul>${pending.map(n => `<li>${n.system?.content}</li>`).join('')}</ul>`;
    }

    await this.queue.add('batch-notification', {
      batchKey,
      eventName: pending[0].eventName,
      channel: pending[0].channel,
      recipient: pending[0].email?.to ?? String(pending[0].system?.userId),
      content,
    } as BatchProcessingJobData);
  }
}