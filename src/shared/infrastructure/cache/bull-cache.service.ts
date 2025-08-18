import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export interface CacheResult<T> {
  data: T;
  cached: boolean;
  timestamp: number;
}

@Injectable()
export class BullCacheService {
  private readonly logger = new Logger(BullCacheService.name);
  private readonly client: ReturnType<typeof createClient>;
  private readonly defaultTTL = parseInt(process.env.REDIS_CACHE_TTL || '3600');
  private readonly prefix = process.env.REDIS_CACHE_PREFIX || 'bull_cache';

  constructor() {
    const redisUrl = process.env.REDIS_PASSWORD 
      ? `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
      : `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis cache client error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis cache client connected');
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Redis cache service initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Redis cache service failed to connect, running without cache:', errorMessage);
    }
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.client.isOpen) {
        this.logger.debug('Redis client not connected, skipping cache');
        return null;
      }
      
      const cached = await this.client.get(this.getKey(key));
      if (cached) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return JSON.parse(cached.toString());
      }
      this.logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.debug(`Cache get error for key ${key}:`, errorMessage);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.logger.debug('Redis client not connected, skipping cache set');
        return;
      }
      
      const ttl = options?.ttl || this.defaultTTL;
      await this.client.setEx(
        this.getKey(key),
        ttl,
        JSON.stringify(value)
      );
      this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.debug(`Cache set error for key ${key}:`, errorMessage);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        this.logger.debug('Redis client not connected, skipping cache delete');
        return;
      }
      
      await this.client.del(this.getKey(key));
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.debug(`Cache delete error for key ${key}:`, errorMessage);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.client.keys(`${this.prefix}:*`);
      if (keys.length > 0) {
        await this.client.del(keys);
        this.logger.log(`Cache cleared: ${keys.length} keys removed`);
      }
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<CacheResult<T>> {
    const cached = await this.get<T>(key);
    
    if (cached) {
      return {
        data: cached,
        cached: true,
        timestamp: Date.now(),
      };
    }

    const data = await factory();
    await this.set(key, data, options);

    return {
      data,
      cached: false,
      timestamp: Date.now(),
    };
  }

  // Specific methods for Bull MQ
  async getJobResult<T>(jobId: string, queueName: string): Promise<T | null> {
    return this.get<T>(`job_result:${queueName}:${jobId}`);
  }

  async setJobResult<T>(jobId: string, queueName: string, result: T): Promise<void> {
    await this.set(`job_result:${queueName}:${jobId}`, result, { ttl: 86400 }); // 24 hours
  }

  async getQueueStatus(queueName: string): Promise<any | null> {
    return this.get(`queue_status:${queueName}`);
  }

  async setQueueStatus(queueName: string, status: any): Promise<void> {
    await this.set(`queue_status:${queueName}`, status, { ttl: 300 }); // 5 minutes
  }

  async getJobCount(queueName: string): Promise<number | null> {
    return this.get<number>(`job_count:${queueName}`);
  }

  async setJobCount(queueName: string, count: number): Promise<void> {
    await this.set(`job_count:${queueName}`, count, { ttl: 60 }); // 1 minute
  }

  // Methods to clean specific cache
  async clearJobCache(jobId: string, queueName: string): Promise<void> {
    await this.delete(`job_result:${queueName}:${jobId}`);
  }

  async clearQueueCache(queueName: string): Promise<void> {
    const keys = await this.client.keys(`${this.prefix}:queue_*:${queueName}`);
    if (keys.length > 0) {
      await this.client.del(keys);
      this.logger.log(`Queue cache cleared for: ${queueName}`);
    }
  }
} 