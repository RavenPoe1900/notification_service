export const EMAIL_TEMPLATES = {
  BATCH_NOTIFICATION: {
    title: 'Multiple Notifications',
    styles: `
      .notification-container {
        max-width: 600px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .header {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 8px 8px 0 0;
        border-bottom: 2px solid #007bff;
      }
      .header h2 {
        margin: 0;
        color: #007bff;
        font-size: 24px;
      }
      .notification-item {
        margin-bottom: 20px;
        padding: 15px;
        border-left: 4px solid #007bff;
        background-color: #ffffff;
        border-radius: 0 8px 8px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .notification-item h3 {
        margin: 0 0 10px 0;
        color: #495057;
        font-size: 18px;
      }
      .notification-content {
        color: #6c757d;
      }
      .footer {
        margin-top: 30px;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 8px;
        text-align: center;
        font-size: 14px;
        color: #6c757d;
      }
    `,
    footerText: 'This is an automated notification. Please do not reply to this email.',
  },
  SINGLE_NOTIFICATION: {
    styles: `
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        padding: 20px;
      }
      .content {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    `,
  },
} as const; 