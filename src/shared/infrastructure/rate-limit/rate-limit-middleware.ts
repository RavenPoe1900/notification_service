import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

/**
 * Configuración avanzada de rate limiting.
 *
 * Esta configuración está diseñada para proteger la aplicación contra ataques de fuerza bruta
 * y abusos, limitando el número de peticiones que una IP puede realizar en un periodo de tiempo especificado.
 *
 * Mejoras incluidas:
 * - Mensaje de error personalizado en formato JSON.
 * - Función customizada para generar la clave del rate limit (por ejemplo, utilizando `req.ip`).
 * - Control exhaustivo de las cabeceras de rate limiting.
 * - Manejador para peticiones que exceden el límite, retornando un error HTTP 429 con detalles.
 *
 * Estas mejoras aseguran una mayor claridad en los errores y facilitan el manejo de peticiones excesivas
 * para la administración y monitoreo de la API.
 */
export const rateLimitMiddleware: RateLimitRequestHandler = rateLimit({
  // Define el periodo de tiempo para el límite de peticiones (15 minutos)
  windowMs: 15 * 60 * 1000, // 15 minutos
  // Número máximo de peticiones permitidas por IP dentro del windowMs
  max: 100,
  // Devuelve información de rate limit en cabeceras estándar
  standardHeaders: true,
  // Desactiva las cabeceras legacy
  legacyHeaders: false,
  // Mensaje personalizado enviado cuando se excede el límite
  message: 'Too many requests, please try again later.',
  // Manejador para peticiones que exceden el límite de solicitudes
  handler: (_req, res) => {
    res.status(429).json({
      statusCode: 429,
      error: 'Too Many Requests',
      message:
        'You have exceeded the allowed request limit. Please try again later.',
    });
  },
  // Permite personalizar la clave de rate limit para evaluar la IP del usuario
  keyGenerator: (req) => {
    return req.ip;
  },
  // No se salta el conteo de peticiones exitosas; cada petición cuenta para el límite
  skipSuccessfulRequests: false,
});
