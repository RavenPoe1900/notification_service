# Health Check Guide

## 🏥 Endpoints de Health Check

Tu aplicación ahora incluye endpoints de health check para monitorear el estado de todos los servicios:

### **Health Check General**
```bash
GET /api/health
```

**Respuesta:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-07T18:30:00.000Z",
  "uptime": 1800000,
  "version": "1.0.0",
  "checks": {
    "redis": {
      "status": "healthy",
      "responseTime": 15
    },
    "automapper": {
      "status": "healthy", 
      "responseTime": 2
    },
    "database": {
      "status": "healthy",
      "responseTime": 25
    }
  }
}
```

### **Health Check Individual**

#### Redis
```bash
GET /api/health/redis
```

#### AutoMapper
```bash
GET /api/health/automapper
```

#### Database
```bash
GET /api/health/database
```

## 🔍 Qué verifica cada endpoint

### **Redis Health Check**
- ✅ Conexión a Redis
- ✅ Autenticación
- ✅ Ping/Pong
- ⏱️ Tiempo de respuesta

### **AutoMapper Health Check**
- ✅ Configuración de AutoMapper
- ✅ Mapeo de prueba
- ⏱️ Tiempo de respuesta

### **Database Health Check**
- ✅ Conexión a PostgreSQL
- ✅ Query de prueba
- ⏱️ Tiempo de respuesta

## 📊 Estados de Respuesta

### **Healthy**
```json
{
  "status": "healthy",
  "responseTime": 15
}
```

### **Unhealthy**
```json
{
  "status": "unhealthy",
  "responseTime": 5000,
  "error": "Connection timeout"
}
```

## 🚀 Uso en Producción

### **Monitoreo Automático**
```bash
# Verificar cada 30 segundos
watch -n 30 curl -s http://localhost:3000/api/health
```

### **Alertas**
```bash
# Script para alertas
curl -s http://localhost:3000/api/health | jq -r '.status'
```

### **Load Balancer**
```bash
# Health check para load balancer
curl -f http://localhost:3000/api/health
```

## 🔧 Configuración

### **Variables de Entorno**
```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=TuContrasenaMuySeguraYLarga

# Database (ya configurado)
DATABASE_URL=postgresql://...

# Versión de la aplicación
npm_package_version=1.0.0
```

## 📈 Métricas

### **Tiempos de Respuesta Esperados**
- **Redis**: < 50ms
- **AutoMapper**: < 10ms  
- **Database**: < 100ms

### **Alertas Recomendadas**
- ⚠️ **Warning**: > 500ms
- 🚨 **Critical**: > 2000ms
- 🔴 **Error**: Status unhealthy

## 🛠️ Troubleshooting

### **Redis no responde**
```bash
# Verificar Redis
redis-cli ping
```

### **Database no responde**
```bash
# Verificar PostgreSQL
psql -h localhost -U postgres -c "SELECT 1"
```

### **AutoMapper falla**
```bash
# Verificar logs
npm run start:dev
```

## 🎯 Beneficios

1. **Monitoreo en tiempo real** de todos los servicios
2. **Detección temprana** de problemas
3. **Métricas de performance** automáticas
4. **Integración fácil** con sistemas de monitoreo
5. **Documentación automática** en Swagger

¡Tu aplicación ahora tiene health checks completos! 🎉 