import { Module } from '@nestjs/common';
import { BullCacheService } from './bull-cache.service';

@Module({
  providers: [BullCacheService],
  exports: [BullCacheService],
})
export class CacheModule {} 