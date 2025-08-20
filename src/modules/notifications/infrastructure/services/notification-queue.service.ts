import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { NotificationJobData, BatchProcessingJobData } from '../../domain/types/notification-job-data.types';
import { OperationResultDto } from 'src/shared/applications/dtos/operation-result.dto';

@Injectable()
export class NotificationQueueService implements OnModuleInit{
  constructor(
    @InjectQueue('notifications') private readonly queue: Queue,
  ) {}

  async addInstantNotification(jobData: NotificationJobData) {
    await this.queue.add('instant-notification', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async addBatchNotification(
    jobData: NotificationJobData,
    batchKey: string,
    recipient: string
  ) {
    const payload: BatchProcessingJobData = {
      batchKey,
      jobData: jobData,
      recipient,
      content: '',
      keyProcessor: '',
    };

    await this.queue.add('scheduled-batch', payload, {
      delay: 0,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async onModuleInit() {
    await this.queue.add(
      'process-pending-batches',
      {},
      {
        repeat: {
          every: parseInt(process.env.BATCH_MAX_WAIT_TIME) * 60000,
        },
        jobId: 'recurring-batch-processor',
      },
    );
  }

  async getQueueStats() {
    return this.queue.getJobCounts();
  }

  // FIX: devolver OperationResultDto para que el controller compile
  async cleanQueue(): Promise<OperationResultDto> {
    await this.queue.clean(1000, 100, 'completed');
    await this.queue.clean(1000, 100, 'failed');
    return { success: true, message: 'Queue cleaned' };
  }

  async pauseQueue(): Promise<OperationResultDto> {
    await this.queue.pause();
    return { success: true, message: 'Queue paused' };
  }

  async resumeQueue(): Promise<OperationResultDto> {
    await this.queue.resume();
    return { success: true, message: 'Queue resumed' };
  }
}