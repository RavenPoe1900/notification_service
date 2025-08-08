export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};

export const bullConfig = {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: parseInt(process.env.BULL_DEFAULT_ATTEMPTS || '3'),
    backoff: {
      type: 'exponential',
      delay: parseInt(process.env.BULL_BACKOFF_DELAY || '2000'),
    },
    timeout: parseInt(process.env.BULL_JOB_TIMEOUT || '30000'),
  },
  prefix: process.env.BULL_QUEUE_PREFIX || 'notification_service',
}; 