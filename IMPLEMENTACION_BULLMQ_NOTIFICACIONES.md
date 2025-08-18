# Implementación de BullMQ para Notificaciones

## Resumen de la Implementación

Se ha implementado un sistema completo de notificaciones utilizando **BullMQ** para el procesamiento asíncrono de notificaciones instantáneas y por lotes, siguiendo exactamente los requisitos especificados.

## 🏗️ Arquitectura Implementada

### 1. **Procesadores de Cola (Queue Processors)**

#### **NotificationProcessor** (`src/modules/notifications/infrastructure/processors/notification.processor.ts`)
- **`handleInstantNotification`**: Procesa notificaciones instantáneas inmediatamente
- **`handleBatchNotification`**: Procesa notificaciones por lotes combinando mensajes similares
- **`handleScheduledBatch`**: Procesa lotes programados cuando se alcanza el tiempo límite

### 2. **Servicio de Cola (Queue Service)**

#### **NotificationQueueService** (`src/modules/notifications/infrastructure/services/notification-queue.service.ts`)
- **`addInstantNotification`**: Agrega notificaciones instantáneas a la cola
- **`addBatchNotification`**: Maneja la lógica de lotes con programación automática
- **`getQueueStats`**: Obtiene estadísticas de la cola
- **`cleanQueue`**: Limpia trabajos completados/fallidos
- **`pauseQueue/resumeQueue`**: Control de pausa/reanudación

### 3. **Proveedores de Email**

Se implementaron **dos proveedores** como se requería:

#### **GmailProviderService**
- Usa SMTP de Gmail con autenticación OAuth2
- Configuración: `GMAIL_USER`, `GMAIL_APP_PASSWORD`

#### **MailgunProviderService**
- Usa API de Mailgun
- Configuración: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`

## 🔄 Flujo de Procesamiento

### **Notificaciones Instantáneas**
1. Se recibe la notificación
2. Se valida la entrada según el canal (email requiere dirección válida)
3. Se crea el registro en la base de datos
4. Se agrega a la cola como trabajo `instant-notification`
5. Se procesa inmediatamente por el worker
6. Se envía el email/notificación del sistema
7. Se actualiza el estado en la base de datos (SENT/ERROR)

### **Notificaciones por Lotes**
1. Se recibe la notificación
2. Se valida la entrada según el canal
3. Se crea el registro en la base de datos con `batchKey` generado
4. Se verifica el tamaño actual del lote en la base de datos
5. Si es la primera notificación del lote, se programa un trabajo `scheduled-batch` para el tiempo límite
6. Si se alcanza el tamaño máximo del lote, se procesa inmediatamente
7. Cuando se procesa el lote:
   - **Para EMAIL**: Se combinan los mensajes similares en un solo email
   - **Para SYSTEM**: Se procesan como instantáneas (requerimiento específico)
   - Se actualizan todos los estados en la base de datos

### **Lógica de Agrupación de Lotes**
- **Criterios de similitud**: Mismo `eventName`, mismo `channel`, mismo destinatario
- **Ejemplo**: Dos notificaciones con evento "EVENT_OCCURRED", canal "EMAIL" al correo "test@test.com"
- **Configuración**: `BATCH_MAX_SIZE` (cantidad máxima) y `BATCH_MAX_WAIT_TIME` (tiempo máximo)
- **Procesamiento**: Se procesa cuando se alcanza el tamaño máximo O cuando se cumple el tiempo límite

## ⚙️ Configuración de Variables de Entorno

### **Configuración de BullMQ/Redis**
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=TuContrasenaMuySeguraYLarga
REDIS_DB=0

# BullMQ Configuration
BULL_QUEUE_PREFIX=notification_service
BULL_DEFAULT_ATTEMPTS=3
BULL_BACKOFF_DELAY=2000
BULL_JOB_TIMEOUT=30000
```

### **Configuración de Procesamiento por Lotes**
```bash
# Batch Processing
BATCH_MAX_SIZE=5                    # Máximo de notificaciones por lote
BATCH_MAX_WAIT_TIME=7200            # Tiempo máximo de espera (2 horas)
```

### **Configuración de Proveedores de Email**
```bash
# Email Provider Selection
EMAIL_PROVIDER=gmail                # Opciones: gmail, mailgun

# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Mailgun Configuration
MAILGUN_API_KEY=key-your-mailgun-api-key
MAILGUN_DOMAIN=your-verified-domain.com
```

## 📊 Endpoints de la API

### **Gestión de Notificaciones**
```http
POST /api/notifications
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "eventName": "USER_REGISTERED",
  "channel": "EMAIL",
  "type": "INSTANT",  // o "BATCH"
  "emailData": {
    "to": "user@example.com",
    "subject": "Welcome!",
    "body": "Thank you for registering..."
  }
}
```

### **Notificaciones del Sistema**
```http
GET /api/notifications/system?userId=1
Authorization: Bearer <jwt-token>

PATCH /api/notifications/system/1/read
Authorization: Bearer <jwt-token>

DELETE /api/notifications/1
Authorization: Bearer <jwt-token>
```

### **Gestión de la Cola**
```http
GET /api/notifications/queue/stats
POST /api/notifications/queue/clean
POST /api/notifications/queue/pause
POST /api/notifications/queue/resume
```

## 🧪 Ejemplos de Prueba

### **1. Notificación Instantánea por Email**
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventName": "WELCOME_EMAIL",
    "channel": "EMAIL",
    "type": "INSTANT",
    "emailData": {
      "to": "test@example.com",
      "subject": "Bienvenido a nuestra plataforma",
      "body": "<h1>¡Bienvenido!</h1><p>Gracias por registrarte en nuestra plataforma.</p>"
    }
  }'
```

### **2. Notificación por Lotes (Email)**
```bash
# Enviar primera notificación del lote
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventName": "DAILY_DIGEST",
    "channel": "EMAIL",
    "type": "BATCH",
    "emailData": {
      "to": "user@example.com",
      "subject": "Nuevo mensaje",
      "body": "Tienes un nuevo mensaje en tu bandeja de entrada."
    }
  }'

# Enviar segunda notificación similar (mismo evento, canal y destinatario)
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventName": "DAILY_DIGEST",
    "channel": "EMAIL",
    "type": "BATCH",
    "emailData": {
      "to": "user@example.com",
      "subject": "Nueva notificación",
      "body": "Tienes otra notificación importante."
    }
  }'

# Se procesarán como un lote cuando se alcance BATCH_MAX_SIZE (5) o BATCH_MAX_WAIT_TIME (2 horas)
```

### **3. Notificación del Sistema (Instantánea)**
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventName": "SYSTEM_ALERT",
    "channel": "SYSTEM",
    "type": "INSTANT",
    "systemData": {
      "userId": 1,
      "content": "Tu cuenta ha sido verificada exitosamente."
    }
  }'
```

### **4. Notificación del Sistema (Por Lotes - Se procesa como instantánea)**
```bash
# Aunque se marque como BATCH, se procesa inmediatamente como INSTANT
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventName": "SYSTEM_ALERT",
    "channel": "SYSTEM",
    "type": "BATCH",
    "systemData": {
      "userId": 1,
      "content": "Nueva actualización disponible."
    }
  }'
```

### **5. Obtener Notificaciones del Sistema**
```bash
curl -X GET http://localhost:3000/api/notifications/system \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **6. Marcar como Leída**
```bash
curl -X PATCH http://localhost:3000/api/notifications/system/1/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **7. Eliminar Notificación**
```bash
curl -X DELETE http://localhost:3000/api/notifications/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **8. Estadísticas de la Cola**
```bash
curl -X GET http://localhost:3000/api/notifications/queue/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **9. Control de la Cola**
```bash
# Pausar procesamiento
curl -X POST http://localhost:3000/api/notifications/queue/pause \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Reanudar procesamiento
curl -X POST http://localhost:3000/api/notifications/queue/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Limpiar trabajos antiguos
curl -X POST http://localhost:3000/api/notifications/queue/clean \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Lógica de Negocio Implementada

### **1. Tipos de Notificación**

#### **Instantánea (INSTANT)**
- Se procesa y entrega de forma independiente
- Se agrega inmediatamente a la cola como trabajo `instant-notification`
- Se procesa por el worker sin esperar

#### **Por Lotes (BATCH)**
- Se agrupan notificaciones similares antes de procesar
- Se procesan cuando se alcanza el tamaño máximo O el tiempo límite
- Se combinan en un solo mensaje para reducir spam

### **2. Criterios de Similitud para Lotes**
- **Evento**: Mismo `eventName` (ej: "USER_REGISTERED")
- **Canal**: Mismo `channel` (EMAIL o SYSTEM)
- **Destinatario**: Mismo identificador del receptor
  - Para EMAIL: misma dirección de correo
  - Para SYSTEM: mismo `userId`

### **3. Configuración de Lotes**
- **`BATCH_MAX_SIZE`**: Cantidad máxima de notificaciones por lote (default: 5)
- **`BATCH_MAX_WAIT_TIME`**: Tiempo máximo de espera en segundos (default: 7200 = 2 horas)

### **4. Comportamiento Especial para Sistema**
- **Requerimiento específico**: "Las notificaciones a entregar por sistema siempre se procesarán como si fuesen de tipo instantánea"
- **Implementación**: Aunque se marquen como BATCH, se procesan inmediatamente como INSTANT

### **5. Generación de Batch Key**
- Se genera automáticamente basado en: `eventName_channel_recipient`
- Ejemplo: `USER_REGISTERED_EMAIL_user@example.com`
- Garantiza que notificaciones similares se agrupen correctamente

## 🔧 Características Implementadas

### ✅ **Requisitos Cumplidos**

1. **Múltiples Proveedores de Email**: Gmail, Mailgun (dos proveedores como se requería)
2. **Configuración Flexible**: Variables de entorno para cambiar proveedores sin modificar código
3. **Notificaciones del Sistema**: 
   - Almacenamiento en base de datos
   - Endpoints para listar, eliminar, marcar como leídas/no leídas
4. **Procesamiento por Lotes**: 
   - Agrupación por evento, canal y destinatario (criterios de similitud)
   - Límite de tamaño configurable (`BATCH_MAX_SIZE`)
   - Tiempo máximo de espera configurable (`BATCH_MAX_WAIT_TIME`)
   - Combinación inteligente de mensajes en un solo email
   - Procesamiento automático cuando se alcanza el límite o tiempo
5. **Validación de Entrada**: 
   - Validación según el canal (email requiere dirección válida)
   - Mensajes de error apropiados para debugging
6. **Manejo de Errores**: 
   - Mensajes apropiados para que los clientes sepan qué pasó
   - Logging detallado para análisis de causas
7. **Trazabilidad**: 
   - Registro completo de eventos en base de datos
   - Estados de notificaciones (PENDING, SENT, ERROR)
   - Información de proveedor usado y errores

### 🎯 **Características Adicionales**

1. **Monitoreo de Cola**: Estadísticas en tiempo real
2. **Control de Cola**: Pausar/reanudar procesamiento
3. **Limpieza Automática**: Eliminación de trabajos antiguos
4. **Reintentos Automáticos**: Con backoff exponencial
5. **Logging Detallado**: Para debugging y monitoreo
6. **Templates HTML**: Para emails profesionales
7. **Type Safety**: TypeScript completo con tipos Prisma

## 🚀 Cómo Probar

### **1. Configurar Variables de Entorno**
```bash
# Copiar y configurar .env
cp .env.example .env

# Configurar al menos un proveedor de email
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Configurar Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **2. Iniciar Servicios**
```bash
# Iniciar Redis
redis-server

# Iniciar la aplicación
npm run start:dev
```

### **3. Ejecutar Pruebas**
```bash
# Usar los ejemplos de curl proporcionados arriba
# Verificar logs para ver el procesamiento
# Revisar estadísticas de la cola
```

## 📈 Beneficios de la Implementación

1. **Escalabilidad**: Procesamiento asíncrono con múltiples workers
2. **Confiabilidad**: Reintentos automáticos y manejo de errores
3. **Flexibilidad**: Fácil cambio de proveedores de email
4. **Monitoreo**: Estadísticas y logging detallado
5. **Mantenibilidad**: Código limpio con separación de responsabilidades
6. **Performance**: Procesamiento por lotes eficiente
7. **Extensibilidad**: Fácil agregar nuevos proveedores o canales 