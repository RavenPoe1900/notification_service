import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  // Advanced Swagger configuration using DocumentBuilder
  const config = new DocumentBuilder()
    .setTitle('Passenger Transportation API')
    .setDescription(
      'This documentation provides a detailed description of an API for passenger transportation, similar to services like Uber, including multiple security schemes and environment configurations (development, staging, production).',
    )
    .setVersion('2.0')
    // Bearer authentication schema (JWT)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT. Ejemplo: Bearer <token>',
      },
      'access-token', // Reference name to use in @ApiBearerAuth() in endpoints
    )
    // Multiple server configuration to simulate different environments
          .addServer('http://localhost:3000', 'Development Environment')
      .addServer('https://staging.api.example.com', 'Staging Environment')
      .addServer('https://api.example.com', 'Production Environment')
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
  });
}
