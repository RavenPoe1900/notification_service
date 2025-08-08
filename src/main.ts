import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './shared/infrastructure/swagger/setup.swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { rateLimitMiddleware } from './shared/infrastructure/rate-limit/rate-limit-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Middlewares de seguridad
  app.use(helmet());
  app.use(rateLimitMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <--- ¡Esto es CRÍTICO!
      whitelist: true, // Opcional: remueve propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Opcional: lanza error si hay propiedades no definidas
    }),
  );

  // Habilitar CORS de forma controlada
  app.enableCors();

  // Inicializar Swagger solo en entornos no productivos para evitar exposición accidental en producción
  setupSwagger(app);

  // Puerto de la aplicación
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(
      `Swagger documentation available at http://localhost:${PORT}/api-docs`,
    );
  });
}
bootstrap();
