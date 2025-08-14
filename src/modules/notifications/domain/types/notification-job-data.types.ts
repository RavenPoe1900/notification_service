import { Channel, NotificationType } from '@prisma/client';

export interface NotificationJobData {
  notificationId: number;
  eventName: string;
  channel: Channel; 
  type: NotificationType;     
  batchKey?: string;
  emailData?: {
    to: string;
    subject: string;
    body: string;
    meta?: any;
  };
  systemData?: {
    userId: number;
    content: string;
  };
}

export interface BatchProcessingJobData {
  batchKey: string;
  channel: Channel; 
  eventName: string;
  recipient: string;    
}
