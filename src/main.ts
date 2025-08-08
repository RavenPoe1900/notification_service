import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './shared/infrastructure/swagger/setup.swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { rateLimitMiddleware } from './shared/infrastructure/rate-limit/rate-limit-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Security middlewares
  app.use(helmet());
  app.use(rateLimitMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <--- This is CRITICAL!
              whitelist: true, // Optional: removes undefined properties in the DTO
        forbidNonWhitelisted: true, // Optional: throws error if there are undefined properties
    }),
  );

  // Enable CORS in a controlled manner
  app.enableCors();

  // Initialize Swagger only in non-production environments to avoid accidental exposure in production
  setupSwagger(app);

  // Application port
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(
      `Swagger documentation available at http://localhost:${PORT}/api-docs`,
    );
  });
}
bootstrap();
