import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  // Advanced Swagger configuration using DocumentBuilder
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription(
      'This API allows clients to send and process notification requests via different channels (Email or System). It supports both instant and batch notifications, with advanced configurations for email providers and database management for system notifications.',
    )
    .setVersion('1.0')
    // Bearer authentication schema (JWT)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the JWT token. Example: Bearer <token>',
      },
      'access-token', // Reference name to use in @ApiBearerAuth() in endpoints
    )
    // Multiple server configuration to simulate different environments
    .addServer('http://localhost:3000', 'Development Environment')
    .addServer('https://staging.api.example.com', 'Staging Environment')
    .addServer('https://api.example.com', 'Production Environment')
    .addTag('Notifications', 'Endpoints for managing notifications, including creation, retrieval, and queue management.')
    .addTag('Auth', 'Endpoints for user authentication and authorization.')
    .addTag('Health', 'Endpoints for monitoring the health of the application, including database, Redis, and other services.')
    .build();

  // Creation of the Swagger document based on the previous configuration
  const document = SwaggerModule.createDocument(app, config);

  // Swagger registration on a custom route with advanced options
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Allows persisting authentication tokens in Swagger UI
      displayRequestDuration: true, // Shows the duration of each request
      docExpansion: 'none', // Collapses documentation sections by default
    },
    customSiteTitle: 'Notification Service API Docs', // Custom title for the Swagger UI page
  });
}
