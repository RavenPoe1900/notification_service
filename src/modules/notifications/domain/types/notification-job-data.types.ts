import { Channel, EventName, NotificationType } from '@prisma/client';

export interface NotificationJobData {
  notificationId: number;
  eventName: EventName;
  channel: Channel; 
  type: NotificationType;     
  batchKey?: string;
  emailData: {
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
  jobData: NotificationJobData,
  recipient: string;    
  content: string;
  keyProcessor: string;
}
export interface QueueJobData {
  keyProcessor: string,
  recipient: string,
  batchKey: string,
  subject:string[];
  body: string[];
  notificationIds: number[];
  count: number;
}