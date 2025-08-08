# Bull MQ Setup - Documentation

## What is Bull MQ?

Bull MQ is a Node.js library for handling job queues using Redis as backend. It's especially useful for:

- **Asynchronous processing** of heavy tasks
- **Sending notifications** (emails, SMS, push)
- **Scheduled jobs** (delayed execution)
- **Automatic retries** with exponential backoff
- **Real-time monitoring** of queues
- **Horizontal scalability**

## Current Configuration

Your project already has Bull MQ configured with Redis:

### Environment Variables (.env)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=TuContrasenaMuySeguraYLarga
REDIS_DB=0

BULL_QUEUE_PREFIX=notification_service
BULL_DEFAULT_ATTEMPTS=3
BULL_BACKOFF_DELAY=2000
BULL_JOB_TIMEOUT=30000
```

### Configuration (src/config/bull-config.ts)
```typescript
export const bullConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
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
```

## How to Use Bull MQ

### 1. Register in your AppModule
```typescript
import { BullModule } from '@nestjs/bull';
import { bullConfig } from './config/bull-config';

@Module({
  imports: [
    BullModule.forRoot(bullConfig),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
})
export class AppModule {}
```

### 2. Create a Service
```typescript
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue('notifications') private readonly queue: Queue,
  ) {}

  async sendNotification(data: any) {
    const job = await this.queue.add('send-notification', data);
    return job.id;
  }
}
```

### 3. Create a Processor
```typescript
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('notifications')
export class NotificationProcessor {
  @Process('send-notification')
  async handleSendNotification(job: Job) {
    console.log('Processing job:', job.data);
    // Your logic here
  }
}
```

## Common Use Cases

### Sending Emails
```typescript
// Add job to queue
await this.queue.add('send-email', {
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Welcome to our platform'
});
```

### File Processing
```typescript
// Process large files
await this.queue.add('process-file', {
  filePath: '/path/to/file',
  userId: 123
});
```

### Scheduled Tasks
```typescript
// Execute in 5 minutes
await this.queue.add('scheduled-task', data, {
  delay: 5 * 60 * 1000
});
```

## Monitoring

Bull MQ includes a web dashboard to monitor queues:
- Waiting jobs
- Active jobs
- Completed jobs
- Failed jobs
- Real-time metrics

## Bull MQ Advantages

1. **Reliability**: Automatic retries
2. **Scalability**: Multiple workers
3. **Monitoring**: Built-in dashboard
4. **Persistence**: Redis as backend
5. **Flexibility**: Different queue types
6. **Performance**: Asynchronous processing

## Next Steps

1. Integrate Bull MQ in your `app.module.ts`
2. Create services for your specific use cases
3. Implement processors to handle jobs
4. Configure monitoring and metrics 