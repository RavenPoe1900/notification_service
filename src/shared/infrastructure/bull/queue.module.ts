import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MaintenanceQueueService } from './maintenance-queue.service';

/**
 * Shared queue infrastructure module.
 * Registers common BullMQ queues and scheduling services
 * that can be reused across bounded-contexts.
 */
@Module({
  imports: [
    // Single shared queue for low-frequency maintenance tasks
    BullModule.registerQueue({ name: 'maintenance' }),
  ],
  providers: [MaintenanceQueueService],
  exports: [BullModule],          // other modules can inject/use this queue
})
export class QueueModule {}