import type { Notification as PrismaNotification } from '@prisma/client';

export type OperationResult = { success: boolean; message: string };

export type Notification = PrismaNotification & {
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
};
