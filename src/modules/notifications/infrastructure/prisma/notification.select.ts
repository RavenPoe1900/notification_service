import { Prisma } from '@prisma/client';

export const notificationArgs = Prisma.validator<Prisma.NotificationDefaultArgs>()({
  select: {
    id: true,
    batchKey: true,
    eventName: true,
    channel: true,
    type: true,
    status: true,
    errorMsg: true,
    createdAt: true,
    processedAt: true,
    email: {
      select: {
        id: true,
        to: true,
        subject: true,
        body: true,
        meta: true,
        providerUsed: true,
        providerMsgId: true,
      },
    },
    system: {
      select: {
        id: true,
        content: true,
        isRead: true,
        readAt: true,
        userId: true,
      },
    },
  },
});

export const systemNotificationArgs = Prisma.validator<Prisma.SystemNotificationDefaultArgs>()({
  select: {
    id: true,
    content: true,
    isRead: true,
    readAt: true,
    userId: true,
    notification: {
      select: {
        id: true,
        eventName: true,
        channel: true,
        type: true,
        status: true,
        createdAt: true,
      },
    },
  },
});

export const notificationSelect: Prisma.NotificationSelect = {
  id: true,
  batchKey: true,
  eventName: true,
  channel: true,
  type: true,
  status: true,
  errorMsg: true,
  createdAt: true,
  processedAt: true,
  email: {
    select: {
      id: true,
      to: true,
      subject: true,
      body: true,
      meta: true,
      providerUsed: true,
      providerMsgId: true,
    },
  },
  system: {
    select: {
      id: true,
      content: true,
      isRead: true,
      readAt: true,
      userId: true,
    },
  },
} satisfies Prisma.NotificationSelect;

export const systemNotificationSelect: Prisma.SystemNotificationSelect = {
  id: true,
  content: true,
  isRead: true,
  readAt: true,
  userId: true,
  notification: {
    select: {
      id: true,
      eventName: true,
      channel: true,
      type: true,
      status: true,
      createdAt: true,
    },
  },
} satisfies Prisma.SystemNotificationSelect; 