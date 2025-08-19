import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

/**
 * Schedules repeatable maintenance jobs on application bootstrap.
 * Currently only 'token-cleanup', but other jobs can be added here.
 */
@Injectable()
export class MaintenanceQueueService {
  private readonly logger = new Logger(MaintenanceQueueService.name);

  constructor(
    @InjectQueue('maintenance') private readonly queue: Queue,
    private readonly config: ConfigService,
  ) {
    this.scheduleTokenCleanup();
  }

  /** Register / update the repeatable job that deletes stale refresh-tokens. */
  private async scheduleTokenCleanup(): Promise<void> {
    const minutes = this.config.get<number>('REFRESH_CLEANUP_EVERY', 60);
    const everyMs = minutes * 60 * 1000;

    // Idempotent – BullMQ deduplicates repeatable jobs with same key
    await this.queue.add(
      'token-cleanup',
      {},                                   // no payload required
      {
        repeat: { every: everyMs },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    this.logger.log(`⏰ Scheduled 'token-cleanup' every ${minutes} minutes`);
  }
}