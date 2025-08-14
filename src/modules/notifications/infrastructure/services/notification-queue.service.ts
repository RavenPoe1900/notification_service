import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import {
  BatchProcessingJobData,
  NotificationJobData,
} from '../processors/notification.processor';
import { NotificationRepository } from '../../domain/interfaces/notification-repository.interface';

export type OperationResult = { success: boolean; message: string };

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue('notifications') private readonly queue: Queue,
    private readonly config: ConfigService,
    @Inject('NOTIFICATION_REPOSITORY')
    private readonly repo: NotificationRepository,
  ) {}

  /* -------- INSTANT -------- */
  async addInstantNotification(data: NotificationJobData): Promise<string> {
    // Add a job to the queue for instant notification processing
    // - Retries up to 3 times in case of failure
    // - Uses exponential backoff with a delay of 2 seconds
    // - Automatically removes completed jobs after 100 entries
    // - Automatically removes failed jobs after 50 entries
    const job = await this.queue.add('instant-notification', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    this.logger.log(`Instant notification queued: ${job.id}`);
    return job.id as string;
  }

  /* -------- BATCH -------- */
  async addBatchNotification(
    data: NotificationJobData,
    batchKey: string,
    recipient: string,
  ): Promise<{ jobId: string; scheduledJobId?: string }> {
    // Retrieve configuration for batch size and maximum wait time
    const batchSize = this.config.get<number>('BATCH_MAX_SIZE', 5);
    const maxWait = this.config.get<number>('BATCH_MAX_WAIT_TIME', 7200); // seconds

    // Check for existing notifications in the batch
    const existing = await this.repo.findByBatchKey(batchKey);
    const scheduled: { jobId?: string } = {};

    // If this is the first notification in the batch, schedule a timeout job
    if (!existing.length) {
      const timeoutJob = await this.queue.add(
        'scheduled-batch',
        { batchKey, channel: data.channel, eventName: data.eventName, recipient } as BatchProcessingJobData,
        {
          delay: maxWait * 1000, // Wait for the maximum time before processing the batch
          attempts: 1,
          removeOnComplete: 50,
          removeOnFail: 25,
        },
      );
      scheduled.jobId = timeoutJob.id as string;
      this.logger.log(`Scheduled batch ${batchKey} in ${maxWait}s`);
    }

    // If the batch size limit is reached, process the batch immediately
    if (existing.length + 1 >= batchSize) {
      // Combine content of existing notifications in the batch
      const combinedContent = existing.map((n) => {
        if (n.channel === 'EMAIL') {
          return `Email notification: ${n.eventName}`;
        } else if (n.channel === 'SYSTEM' && n.system) {
          return `System notification content: ${n.system.content}`;
        }
        return 'Unknown content';
      }).join(' ');

      const batchJob = await this.queue.add(
        'batch-notification',
        { batchKey, channel: data.channel, eventName: data.eventName, recipient, content: combinedContent } as BatchProcessingJobData,
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
      this.logger.log(`Batch ${batchKey} lanzado (size limit) – job ${batchJob.id}`);
      return { jobId: batchJob.id as string, scheduledJobId: scheduled.jobId };
    }

    // If the batch is not yet full, return pending status
    return { jobId: 'pending', scheduledJobId: scheduled.jobId };
  }

  /* -------- STATS / MAINTENANCE -------- */
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
    await this.queue.clean(24 * 60 * 60 * 1000, 'completed' as any); // 24 h
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