import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  // Configuración avanzada de Swagger utilizando DocumentBuilder
  const config = new DocumentBuilder()
    .setTitle('Passenger Transportation API')
    .setDescription(
      'This documentation provides a detailed description of an API for passenger transportation, similar to services like Uber, including multiple security schemes and environment configurations (development, staging, production).',
    )
    .setVersion('2.0')
    // Esquema de autenticación Bearer (JWT)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT. Ejemplo: Bearer <token>',
      },
      'access-token', // Nombre de referencia para usar en @ApiBearerAuth() en los endpoints
    )
    // Configuración de múltiples servidores para simular diferentes entornos
    .addServer('http://localhost:3000', 'Entorno de Desarrollo')
    .addServer('https://staging.api.example.com', 'Entorno de Staging')
    .addServer('https://api.example.com', 'Entorno de Producción')
    .build();

  // Creación del documento Swagger basado en la configuración anterior
  const document = SwaggerModule.createDocument(app, config);

  // Registro de Swagger en una ruta personalizada con opciones avanzadas
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Permite persistir tokens de autenticación en la UI de Swagger
      displayRequestDuration: true, // Muestra la duración de cada petición
      docExpansion: 'none', // Colapsa por defecto las secciones de la documentación
    },
  });
}
