export interface BatchEmailData {
  notificationCount: number;
  notifications: Array<{
    subject: string;
    body: string;
    index: number;
  }>;
}
