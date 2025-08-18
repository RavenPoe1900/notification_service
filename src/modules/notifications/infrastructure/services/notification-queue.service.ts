import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import {
  BatchProcessingJobData,
  NotificationJobData,
} from '../../domain/types/notification-job-data.types';
import { OperationResult } from '../../domain/types/notification.types';
import { NotificationCommonService } from '../../application/services/notification-common.service';
import { EmailTemplateService } from './email-template.service';
import { buildBatchContent } from 'src/shared/utils/notification-content.util';

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);
  private previousMaxWait: number | null = null;

  constructor(
    @InjectQueue('notifications') private readonly queue: Queue,
    private readonly config: ConfigService,
    private readonly notificationCommonService: NotificationCommonService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    this.scheduleBatchProcessing();
  }

  private async scheduleBatchProcessing(): Promise<void> {
    const maxWait = this.config.get<number>('BATCH_MAX_WAIT_TIME', 7200);

    if (this.previousMaxWait && this.previousMaxWait !== maxWait) {
      await this.queue.removeRepeatable('scheduled-batch-processing', {
        every: this.previousMaxWait * 1000,
      });
    }

    await this.queue.add(
      'scheduled-batch-processing',
      {},
      {
        repeat: { every: maxWait * 1000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    this.previousMaxWait = maxWait;
    this.logger.log(
      `Scheduled recurring job to process batch notifications every ${maxWait}s`,
    );
  }

  async addInstantNotification(data: NotificationJobData): Promise<string> {
    const job = await this.queue.add('instant-notification', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    this.logger.log(`Instant notification queued: ${job.id}`);
    return job.id as string;
  }

  async addBatchNotification(
    data: NotificationJobData,
    batchKey: string,
    recipient: string,
  ): Promise<{ jobId: string; scheduledJobId?: string }> {
    const batchSize = this.config.get<number>('BATCH_MAX_SIZE', 5);
    const maxWait = this.config.get<number>('BATCH_MAX_WAIT_TIME', 7200);

    const existing = await this.notificationCommonService.findByBatchKey(batchKey);
    const scheduled: { jobId?: string } = {};

    // Primera notificación → programar timeout
    if (!existing.length) {
      const timeoutJob = await this.queue.add(
        'scheduled-batch',
        { batchKey, channel: data.channel, eventName: data.eventName, recipient } as BatchProcessingJobData,
        {
          delay: maxWait * 1000,
          attempts: 1,
          removeOnComplete: 50,
          removeOnFail: 25,
        },
      );
      scheduled.jobId = timeoutJob.id as string;
      this.logger.log(`Scheduled batch ${batchKey} in ${maxWait}s`);
    }

    // Si alcanzó tamaño máximo
    if (existing.length + 1 >= batchSize) {
      const notificationsToCombine = [...existing, data];

      let htmlCombined: string;
      if (data.channel === 'EMAIL') {
        htmlCombined = this.emailTemplateService.generateBatchEmailTemplate({
          notificationCount: notificationsToCombine.length,
          notifications: notificationsToCombine.map((n, i) => ({
            subject: n.emailData?.subject ?? 'No subject',
            body: n.emailData?.body ?? '',
            index: i,
          })),
        });
      } else {
        htmlCombined = buildBatchContent(notificationsToCombine);
      }

      const batchJob = await this.queue.add(
        'batch-notification',
        {
          batchKey,
          channel: data.channel,
          eventName: data.eventName,
          recipient,
          content: htmlCombined,
        } as BatchProcessingJobData,
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
      this.logger.log(
        `Batch ${batchKey} launched (size limit) – job ${batchJob.id}`,
      );
      return { jobId: batchJob.id as string, scheduledJobId: scheduled.jobId };
    }

    // Todavía en espera
    return { jobId: 'pending', scheduledJobId: scheduled.jobId };
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive(),
      this.queue.getCompleted(),
      this.queue.getFailed(),
    ]);
    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  async cleanQueue(): Promise<OperationResult> {
    await this.queue.clean(24 * 60 * 60 * 1000, 'completed' as any);
    await this.queue.clean(24 * 60 * 60 * 1000, 'failed' as any);
    this.logger.log('Queue cleaned');
    return { success: true, message: 'Queue cleaned successfully' };
  }

  async pauseQueue(): Promise<OperationResult> {
    await this.queue.pause();
    this.logger.log('Queue paused');
    return { success: true, message: 'Queue paused successfully' };
  }

  async resumeQueue(): Promise<OperationResult> {
    await this.queue.resume();
    this.logger.log('Queue resumed');
    return { success: true, message: 'Queue resumed successfully' };
  }
}