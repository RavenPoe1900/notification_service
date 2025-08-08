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
  // Define the time period for the request limit (15 minutes)
      windowMs: 15 * 60 * 1000, // 15 minutes
  // Maximum number of requests allowed per IP within windowMs
  max: 100,
  // Returns rate limit information in standard headers
  standardHeaders: true,
  // Disables legacy headers
  legacyHeaders: false,
  // Custom message sent when the limit is exceeded
  message: 'Too many requests, please try again later.',
  // Handler for requests that exceed the request limit
  handler: (_req, res) => {
    res.status(429).json({
      statusCode: 429,
      error: 'Too Many Requests',
      message:
        'You have exceeded the allowed request limit. Please try again later.',
    });
  },
  // Allows customizing the rate limit key to evaluate the user's IP
  keyGenerator: (req) => {
    return req.ip;
  },
  // Successful requests are not skipped; each request counts towards the limit
  skipSuccessfulRequests: false,
});
