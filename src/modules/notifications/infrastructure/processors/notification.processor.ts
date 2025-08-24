import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Queue, Job, RedisClient } from 'bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { NotificationStatus } from '@prisma/client';
import { EmailProviderFactory } from '../email/email-provider.factory';
import { NotificationCommonService } from '../../application/services/notification-common.service';
import { EmailTemplateService } from '../services/email-template.service';
import type {
  NotificationJobData,
  BatchProcessingJobData,
  QueueJobData,
} from '../../domain/types/notification-job-data.types';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost implements OnModuleInit{
  private readonly logger = new Logger(NotificationProcessor.name);
  private redisClient: RedisClient; 
  constructor(
    private readonly emailFactory: EmailProviderFactory,
    private readonly notificationCommon: NotificationCommonService,
    private readonly emailTemplateService: EmailTemplateService,
    @InjectQueue('notifications') private readonly queue: Queue,
  ) {
    super();
  }

  async onModuleInit() {
    this.redisClient = await this.queue.client;
  }

  override async process(job: Job<unknown>): Promise<void> {
    switch (job.name) {
      case 'instant-notification':
        return this.handleInstant(job as Job<NotificationJobData>);
      case 'batch-notification':
        return this.handleBatch(job as Job<BatchProcessingJobData>);
      case 'scheduled-batch':
        return this.handleScheduled(job as Job<BatchProcessingJobData>);
      case 'process-pending-batches':
        return this.processPendingBatches(job as Job<BatchProcessingJobData>);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async processPendingBatches(job: Job<BatchProcessingJobData>): Promise<void> {
    const globalLockKey = 'lock:processPendingBatches';
    const lockAcquired = await this.redisClient.set(globalLockKey, '1', 'EX', 30, 'NX');
    
    if (!lockAcquired) {
      this.logger.warn('Process pending batches already running, skipping');
      return;
    }
    
    try {
      const getAllQueueJobData: Record<string, QueueJobData> = await this.getAllQueueJobData();
      const batchPromises = Object.keys(getAllQueueJobData).map(async (key) => {
        const queueData = getAllQueueJobData[key];
        const newKey = queueData.keyProcessor + "processPendingBatches";
        
        const batchJobData: BatchProcessingJobData = {
          ...job.data,
          keyProcessor: newKey,
          batchKey: queueData.batchKey,
          recipient: queueData.recipient
        };
        
        await this.renameKeyToFinished(queueData.keyProcessor, newKey);
        return this.queue.add('batch-notification', batchJobData, { priority: 1 });
      });
      await Promise.all(batchPromises);
    } finally {
      await this.redisClient.del(globalLockKey);
    }
  }

  private async handleInstant(job: Job<NotificationJobData>): Promise<void> {
    const { notificationId, channel, emailData } = job.data;
    try {
      if (channel === 'EMAIL') {
        if (!emailData?.to) {
          throw new Error('Instant email missing recipient');
        }
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
    const { batchKey, recipient, keyProcessor } = job.data;
    try {
      const queueJobData: QueueJobData | null = await this.getKeyValue(keyProcessor);
      if (!queueJobData) {
        throw new Error('No data found for batch key');
      }

      const content = this.emailTemplateService.generateBatchEmailTemplate({
        notificationCount: queueJobData.count,
        notifications: queueJobData.subject.map((subject, i) => ({
          subject,
          body: queueJobData.body[i] ?? '',
          index: i,
        })),
      });
      const provider = this.emailFactory.getProvider();
      await provider.sendEmail(recipient, `Batch: ${batchKey}`, content);
      await Promise.all(queueJobData.notificationIds.map(n =>
        this.notificationCommon.updateStatus(n, NotificationStatus.SENT),
      ));
      this.deleteKey(job.data.keyProcessor);
    } catch (err) {
      const batch = await this.notificationCommon.findByBatchKey(batchKey);
      await Promise.all(batch.map(n =>
        this.notificationCommon.updateStatus(
          n.id,
          NotificationStatus.ERROR,
          (err as Error).message,
        ),
      ));
    }
  }

  private async handleScheduled(job: Job<BatchProcessingJobData>): Promise<void> {
    const { batchKey, jobData, recipient } = job.data;
    this.logger.log(`Timed batch triggered for ${batchKey}`);

    const key: string = this.makeUniqueKey(jobData.eventName, jobData.channel, jobData.emailData.to);
    
    const lockKey = `lock:${key}`;
    const lockAcquired = await this.redisClient.set(lockKey, '1', 'EX', 10, 'NX');
    
    if (!lockAcquired) {
      this.logger.warn(`Could not acquire lock for ${key}, retrying later`);
      throw new Error('Retry later');
    }
    
    try {
      let queueJobData: QueueJobData | null = await this.getKeyValue(key);
      if(!queueJobData) {
        queueJobData ={
          recipient: recipient,
          batchKey: batchKey,
          keyProcessor: key,
          subject: [jobData.emailData?.subject ?? 'No subject'],
          body: [jobData.emailData?.body ?? jobData.systemData?.content ?? ''],
          notificationIds:[jobData.notificationId],
          count: 1
        }
        await this.setKeyValue(key,queueJobData);
      }
      else {
        const numericValue = Number(queueJobData.count);
        queueJobData.subject.push(jobData.emailData?.subject ?? 'No subject');
        queueJobData.body.push(jobData.emailData?.body ?? jobData.systemData?.content ?? '');
        queueJobData.notificationIds.push(jobData.notificationId);
        queueJobData.count = queueJobData.count+1
        if(numericValue < Number(process.env.BATCH_MAX_SIZE)){
          await this.setKeyValue(key,queueJobData);
        } 
        else{
          const newKey = key + "handleScheduled";
          job.data.keyProcessor = newKey;
          await this.renameKeyToFinished(key, newKey);
          await this.queue.add('batch-notification', job.data, { priority: 1 });
        }
      }
    } finally {
      await this.redisClient.del(lockKey);
    }
  }

  async renameKeyToFinished(key: string, finishedKey: string): Promise<void> {
    const value = await this.redisClient.get(key);
    
    if (value) {
      await this.redisClient.set(finishedKey, value);
      await this.redisClient.del(key);
    }
  }

  makeUniqueKey(eventName: string, channel: string, email: string): string {
    return `${eventName}::${channel}::${email.toLowerCase()}`;
  }

  parseUniqueKey(key: string): UniqueKeyParts {
    const [eventName, channel, email] = key.split('::');
    return { eventName, channel, email };
  }

  async setKeyValue(key: string, value: QueueJobData): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value));
  }

  async getKeyValue(key: string): Promise<QueueJobData | null> {
    const value = await this.redisClient.get(key);
    if (!value) return null;
    return JSON.parse(value) as QueueJobData;
  }

  async getAllQueueJobData(): Promise<Record<string, QueueJobData>> {
    const pattern = '*::*::*';
    const keys = await this.redisClient.keys(pattern);
    const result: Record<string, QueueJobData> = {};

    for (const key of keys) {
      const value = await this.redisClient.get(key);
      if (value) {
        try {
          result[key] = JSON.parse(value) as QueueJobData;
        } catch (err) {
          console.warn(`Failed to parse data for key: ${key}`, err);
        }
      }
    }
    return result;
  }

  async deleteKey(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async deleteAllKeys(): Promise<void> {
    const pattern = '*::*::*';
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
  }
}