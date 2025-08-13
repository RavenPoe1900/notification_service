import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { BullModule } from '@nestjs/bullmq';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';

import { NotificationController } from './presentation/controllers/notification.controller';
import { NotificationService } from './application/services/notification.service';

import { PrismaNotificationRepository } from './infrastructure/repositories/notification.repository';

import { NotificationsProfile } from './infrastructure/mappers/profiles/notifications.profile';

import { GmailProviderService } from './infrastructure/providers/gmail-provider.service';
import { MailgunProviderService } from './infrastructure/providers/mailgun-provider.service';
import { EmailTemplateService } from './infrastructure/services/email-template.service';
import { EmailCombinerService } from './infrastructure/services/email-combiner.service';
import { NotificationQueueService } from './infrastructure/services/notification-queue.service';
import { NotificationProcessor } from './infrastructure/processors/notification.processor';
import { NotificationMapper, SystemNotificationMapper } from './infrastructure/mappers/notification.mapper';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: 'notifications' }),
    AutomapperModule.forRoot({ strategyInitializer: classes() }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationsProfile,
    NotificationMapper,
    SystemNotificationMapper,

    PrismaService,
    NotificationService,

    NotificationQueueService,
    NotificationProcessor,

    EmailTemplateService,
    EmailCombinerService,
    {
      provide: 'EMAIL_PROVIDER',
      useFactory: (cfg: ConfigService) =>
        cfg.get('EMAIL_PROVIDER', 'gmail') === 'mailgun'
          ? new MailgunProviderService(cfg)
          : new GmailProviderService(cfg),
      inject: [ConfigService],
    },
    GmailProviderService,
    MailgunProviderService,

    {
      provide: 'NOTIFICATION_REPOSITORY',
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}