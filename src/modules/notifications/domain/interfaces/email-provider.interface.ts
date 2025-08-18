export interface EmailProvider {
  sendEmail(to: string, subject: string, body: string, meta?: any): Promise<EmailResult>;
  sendBatchEmail(emails: EmailData[]): Promise<EmailResult[]>;
  testConnection(): Promise<boolean>;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  meta?: any;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
} 