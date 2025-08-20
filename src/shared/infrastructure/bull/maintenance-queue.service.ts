import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { BaseQueueService } from './base-queue.service';

/**
 * Handles scheduling of maintenance jobs (like token cleanup).
 */
@Injectable()
export class MaintenanceQueueService extends BaseQueueService {
  constructor(
    @InjectQueue('maintenance') queue: Queue,
    private readonly config: ConfigService,
  ) {
    super(queue, MaintenanceQueueService.name);
    this.scheduleTokenCleanup();
  }

  /** Register or update the repeatable job that deletes stale refresh tokens */
  private async scheduleTokenCleanup(): Promise<void> {
    const minutes = this.config.get<number>('REFRESH_CLEANUP_EVERY', 60);
    const everyMs = minutes * 60 * 1000;

    await this.upsertRepeatableJob('token-cleanup', { every: everyMs });
  }
}