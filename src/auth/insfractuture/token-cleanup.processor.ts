import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { RefreshTokenService } from '../application/services/refresh-token.service';

/**
 * BullMQ processor that removes expired or revoked refresh-tokens.
 * Runs whenever the 'token-cleanup' repeatable job is triggered.
 */
@Processor('maintenance')
@Injectable()
export class TokenCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(TokenCleanupProcessor.name);

  constructor(private readonly refreshTokenService: RefreshTokenService) {
    super();
  }

  // BullMQ invokes this method for each job execution
  override async process(_job: Job): Promise<void> {
    const removed = await this.refreshTokenService.cleanupExpiredTokens();
    this.logger.log(`🧹 Removed ${removed} expired / revoked refresh tokens`);
  }
}