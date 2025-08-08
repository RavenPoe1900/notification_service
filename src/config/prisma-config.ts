import { loggingMiddleware } from 'nestjs-prisma';
import { Logger } from '@nestjs/common';

export const prismaConfig = {
  isGlobal: true,
  prismaServiceOptions: {
    middlewares: [
      loggingMiddleware({
        logger: new Logger('PrismaMiddleware'),
        logLevel: 'log',
      }),
    ],
  },
};