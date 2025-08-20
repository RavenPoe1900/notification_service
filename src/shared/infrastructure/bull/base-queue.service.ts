import { Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

/**
 * Base service with utility methods for repeatable jobs in BullMQ.
 */
export abstract class BaseQueueService {
  protected readonly logger: Logger;

  constructor(protected readonly queue: Queue, context: string) {
    this.logger = new Logger(context);
  }

  /**
   * Creates or updates a repeatable job ensuring idempotency.
   * - If it exists with a different config, removes and re-adds.
   * - If it exists with the same config, does nothing.
   */
  protected async upsertRepeatableJob(
    name: string,
    options: { every: number },
    payload: object = {},
  ): Promise<void> {
    const repeatables = await this.queue.getRepeatableJobs();
    const match = repeatables.find(j => j.name === name);

    if (match) {
      const matchEvery = Number(match.every); // ensure numeric comparison
      if (matchEvery !== options.every) {
        // prefer removeJobScheduler in newer BullMQ versions
        if (typeof (this.queue as any).removeJobScheduler === 'function') {
          await (this.queue as any).removeJobScheduler({ key: match.key });
        } else {
          // fallback for older BullMQ
          await (this.queue as any).removeRepeatableByKey(match.key);
        }
        this.logger.log(
          `♻️ Removed old repeatable job '${name}' (${matchEvery}ms)`,
        );
      }
    }

    const isDifferent = !match || Number(match.every) !== options.every;

    if (isDifferent) {
      await this.queue.add(name, payload, {
        repeat: options,
        removeOnComplete: true,
        removeOnFail: true,
      });
      this.logger.log(
        `⏰ Scheduled '${name}' every ${options.every / 1000}s`,
      );
    } else {
      this.logger.log(
        `⚠️ Job '${name}' already exists with same config, skipped`,
      );
    }
  }
}