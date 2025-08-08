import {
  PrismaClient,
  Role,
  Channel,
  NotificationType,
  NotificationStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding…');

  /* ------- CLEAN DB (DEV ONLY) -------- */
  await prisma.systemNotification.deleteMany();
  await prisma.emailNotification.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();

  /* ------- USERS & ROLES -------------- */
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      phone: '+11234567890',
      password: await bcrypt.hash('adminpassword123', 10),
      lastUsedRole: Role.ADMIN,
      roles: {
        createMany: {
          data: [
            { role: Role.ADMIN },
            { role: Role.USER },
          ],
        },
      },
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      phone: '+10987654321',
      password: await bcrypt.hash('userpassword123', 10),
      lastUsedRole: Role.USER,
      roles: {
        create: { role: Role.USER },
      },
    },
  });

  /* ------- REFRESH TOKENS ------------- */
  await prisma.refreshToken.createMany({
    data: [
      {
        tokenHash: await bcrypt.hash('admin_refresh_token_secret', 10),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
        userId: adminUser.id,
      },
      {
        tokenHash: await bcrypt.hash('user_refresh_token_secret', 10),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
        userId: regularUser.id,
      },
    ],
  });

  /* ------- NOTIFICATIONS -------------- */
  await prisma.notification.create({
    data: {
      eventName: 'WelcomeEmail',
      channel: Channel.EMAIL,
      type: NotificationType.INSTANT,
      status: NotificationStatus.PENDING,
      email: {
        create: {
          to: adminUser.email,
          subject: 'Welcome to Our Service!',
          body: 'Thanks for signing up; we’re excited to have you!',
          providerUsed: 'Mailgun',
          meta: { campaign: 'onboarding' },
        },
      },
    },
  });

  await prisma.notification.create({
    data: {
      eventName: 'NewFeatureAnnouncement',
      channel: Channel.SYSTEM,
      type: NotificationType.INSTANT,
      status: NotificationStatus.SENT,
      system: {
        create: {
          content: 'Check out our new amazing feature!',
          userId: regularUser.id,
        },
      },
    },
  });

  await prisma.notification.create({
    data: {
      batchKey: 'weekly_digest_2025_08_08',
      eventName: 'WeeklyDigest',
      channel: Channel.EMAIL,
      type: NotificationType.BATCH,
      status: NotificationStatus.PENDING,
      email: {
        create: {
          to: regularUser.email,
          subject: 'Your Weekly Digest',
          body: 'Here is a summary of what you missed this week.',
          providerUsed: 'Mailgun',
        },
      },
    },
  });

  await prisma.notification.create({
    data: {
      eventName: 'FailedLoginAttempt',
      channel: Channel.EMAIL,
      type: NotificationType.INSTANT,
      status: NotificationStatus.ERROR,
      errorMsg: 'Failed to send email: SMTP connection timed out.',
      email: {
        create: {
          to: 'nonexistent@example.com',
          subject: 'Login Alert',
          body: 'There was a failed login attempt on your account.',
          providerUsed: 'Mailgun',
        },
      },
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());