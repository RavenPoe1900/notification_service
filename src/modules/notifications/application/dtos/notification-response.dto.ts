import { ApiProperty } from '@nestjs/swagger';

export class EmailNotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the email notification',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Recipient email address',
    example: 'user@example.com',
  })
  to: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Welcome to our platform',
  })
  subject: string;

  @ApiProperty({
    description: 'Email body content',
    example: 'Thank you for registering...',
  })
  body: string;

  @ApiProperty({
    description: 'Additional metadata for the email',
    required: false,
  })
  meta?: any;

  @ApiProperty({
    description: 'Email provider used to send the email',
    example: 'gmail',
  })
  providerUsed: string;

  @ApiProperty({
    description: 'Provider message ID for tracking',
    required: false,
  })
  providerMsgId?: string;
}

export class SystemNotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the system notification',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Content of the system notification',
    example: 'You have a new message',
  })
  content: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'When the notification was read',
    example: '2025-01-01T12:00:00.000Z',
    required: false,
  })
  readAt?: Date;

  @ApiProperty({
    description: 'When the notification was created',
    example: '2025-01-01T12:00:00.000Z',
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'User ID who should receive this notification',
    example: 1,
  })
  userId: number;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the notification',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Batch key for grouped notifications',
    example: 'USER_REGISTERED_EMAIL_user@example.com',
    required: false,
  })
  batchKey?: string;

  @ApiProperty({
    description: 'Name of the event that occurred',
    example: 'USER_REGISTERED',
  })
  eventName: string;

  @ApiProperty({
    description: 'Channel used to deliver the notification',
    example: 'EMAIL',
  })
  channel: string;

  @ApiProperty({
    description: 'Type of notification processing',
    example: 'INSTANT',
  })
  type: string;

  @ApiProperty({
    description: 'Current status of the notification',
    example: 'SENT',
  })
  status: string;

  @ApiProperty({
    description: 'Error message if the notification failed',
    required: false,
  })
  errorMsg?: string;

  @ApiProperty({
    description: 'When the notification was created',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the notification was processed',
    example: '2025-01-01T12:00:01.000Z',
    required: false,
  })
  processedAt?: Date;

  @ApiProperty({
    description: 'Email notification details',
    type: EmailNotificationResponseDto,
    required: false,
  })
  email?: EmailNotificationResponseDto;

  @ApiProperty({
    description: 'System notification details',
    type: SystemNotificationResponseDto,
    required: false,
  })
  system?: SystemNotificationResponseDto;
} 