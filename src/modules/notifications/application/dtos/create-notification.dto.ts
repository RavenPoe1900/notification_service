import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum Channel {
  EMAIL = 'EMAIL',
  SYSTEM = 'SYSTEM',
}

export enum NotificationType {
  INSTANT = 'INSTANT',
  BATCH = 'BATCH',
}

export class EmailDataDto {
  @ApiProperty({
    description: 'Email address to send the notification to',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Welcome to our platform',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Email body content',
    example: 'Thank you for joining our platform!',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'Additional metadata for the email',
    required: false,
  })
  @IsOptional()
  meta?: any;
}

export class SystemDataDto {
  @ApiProperty({
    description: 'User ID to send the system notification to',
    example: 1,
  })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'Content of the system notification',
    example: 'You have a new message',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Name of the event that occurred',
    example: 'USER_REGISTERED',
  })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty({
    description: 'Channel to deliver the notification',
    enum: Channel,
    example: Channel.EMAIL,
  })
  @IsEnum(Channel)
  channel: Channel;

  @ApiProperty({
    description: 'Type of notification processing',
    enum: NotificationType,
    example: NotificationType.INSTANT,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Email notification data (required when channel is EMAIL)',
    type: EmailDataDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailDataDto)
  emailData?: EmailDataDto;

  @ApiProperty({
    description: 'System notification data (required when channel is SYSTEM)',
    type: SystemDataDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SystemDataDto)
  systemData?: SystemDataDto;
} 