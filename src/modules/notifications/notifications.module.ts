import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';

import { NotificationController } from './presentation/controllers/notification.controller';
import { NotificationService } from './application/services/notification.service';
import { PrismaNotificationRepository } from './infrastructure/repositories/notification.repository';
import { GmailProviderService } from './infrastructure/providers/gmail-provider.service';
import { MailgunProviderService } from './infrastructure/providers/mailgun-provider.service';
import { NotificationMapper, SystemNotificationMapper } from './infrastructure/mappers/notification.mapper';
import { PrismaNotificationToDtoProfile } from './infrastructure/mappers/prisma-notification.profile';
import { EmailTemplateService } from './infrastructure/services/email-template.service';
import { EmailCombinerService } from './infrastructure/services/email-combiner.service';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    PrismaService,
    NotificationMapper,
    SystemNotificationMapper,
    PrismaNotificationToDtoProfile,
    EmailTemplateService,
    EmailCombinerService,
    {
      provide: 'NOTIFICATION_REPOSITORY',
      useClass: PrismaNotificationRepository,
    },
    {
      provide: 'EMAIL_PROVIDER',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get('EMAIL_PROVIDER', 'gmail');
        return provider === 'mailgun' ? new MailgunProviderService(configService) : new GmailProviderService(configService);
      },
      inject: [ConfigService],
    },
    GmailProviderService,
    MailgunProviderService,
  ],
  exports: [NotificationService],
})
export class NotificationsModule {} 