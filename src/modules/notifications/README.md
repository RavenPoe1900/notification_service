# Notification Service

## 📋 Overview

The notification service is built following **Domain-Driven Design (DDD)** principles and **Clean Architecture** patterns. It provides a robust, scalable solution for handling both instant and batch notifications across multiple channels (Email and System).

## 🏗️ Domain-Driven Design Architecture

### Core DDD Concepts Applied

#### 1. **Bounded Context**
The notification service operates within its own bounded context, with clear boundaries separating it from other domains like user management or authentication.

#### 2. **Ubiquitous Language**
- **Notification**: A message sent to a user through a specific channel
- **Channel**: The medium through which a notification is delivered (EMAIL, SYSTEM)
- **Batch**: A group of notifications processed together for efficiency
- **Event**: A business occurrence that triggers a notification
- **Provider**: External service responsible for delivering notifications

#### 3. **Strategic Design Patterns**

##### **Domain Layer** (`domain/`)
```
domain/
├── entities/           # Domain entities (if any)
├── value-objects/      # Value objects (if any)
├── aggregates/         # Aggregates (if any)
└── interfaces/         # Domain interfaces and contracts
    ├── email-provider.interface.ts
    └── notification-repository.interface.ts
```

**Purpose**: Contains the core business logic and domain rules.

##### **Application Layer** (`application/`)
```
application/
├── dtos/               # Data Transfer Objects
│   ├── create-notification.dto.ts
│   └── notification-response.dto.ts
├── services/           # Application services
│   └── notification.service.ts
├── commands/           # Command handlers (if using CQRS)
├── queries/            # Query handlers (if using CQRS)
└── events/             # Domain event handlers
```

**Purpose**: Orchestrates domain objects and implements use cases.

##### **Infrastructure Layer** (`infrastructure/`)
```
infrastructure/
├── config/             # Configuration files
│   └── email-templates.config.ts
├── mappers/            # Data mapping
│   ├── notification.mapper.ts
│   └── prisma-notification.profile.ts
├── prisma/             # Database access
│   └── notification.select.ts
├── providers/          # External service implementations
│   ├── gmail-provider.service.ts
│   └── mailgun-provider.service.ts
├── repositories/       # Data access implementations
│   └── notification.repository.ts
└── services/           # Infrastructure services
    ├── email-combiner.service.ts
    └── email-template.service.ts
```

**Purpose**: Implements technical concerns and external integrations.

##### **Presentation Layer** (`presentation/`)
```
presentation/
├── controllers/        # REST API controllers
│   └── notification.controller.ts
├── guards/             # Authentication/authorization
├── interceptors/       # Request/response interceptors
└── pipes/              # Validation pipes
```

**Purpose**: Handles HTTP requests and user interface concerns.

### DDD Tactical Patterns

#### **Domain Services**
- `NotificationService`: Orchestrates notification creation and processing
- `EmailCombinerService`: Handles batch email logic
- `EmailTemplateService`: Manages email template generation

#### **Repository Pattern**
- `NotificationRepository`: Abstract interface for data access
- `PrismaNotificationRepository`: Concrete implementation using Prisma

#### **Factory Pattern**
- Email provider factory in the module configuration
- Template factory for different email types

#### **Specification Pattern**
- Batch processing specifications (size, time limits)
- Email validation specifications

## 📁 Complete Project Structure

```
src/modules/notifications/
├── application/                           # Application Layer (Use Cases)
│   ├── dtos/
│   │   ├── create-notification.dto.ts     # Input DTOs for creating notifications
│   │   └── notification-response.dto.ts   # Response DTOs with full details
│   └── services/
│       └── notification.service.ts        # Main application service
├── domain/                               # Domain Layer (Business Logic)
│   ├── entities/                         # Domain entities (future use)
│   ├── value-objects/                    # Value objects (future use)
│   ├── aggregates/                       # Aggregates (future use)
│   └── interfaces/                       # Domain contracts
│       ├── email-provider.interface.ts   # Email provider abstraction
│       └── notification-repository.interface.ts # Repository contract
├── infrastructure/                       # Infrastructure Layer (Technical Concerns)
│   ├── config/
│   │   └── email-templates.config.ts     # Email template configuration
│   ├── mappers/
│   │   ├── notification.mapper.ts        # DTO mapping classes
│   │   └── prisma-notification.profile.ts # AutoMapper profiles
│   ├── prisma/
│   │   └── notification.select.ts        # Prisma query configurations
│   ├── providers/
│   │   ├── gmail-provider.service.ts     # Gmail implementation
│   │   └── mailgun-provider.service.ts   # Mailgun implementation
│   ├── repositories/
│   │   └── notification.repository.ts    # Prisma repository implementation
│   └── services/
│       ├── email-combiner.service.ts     # Email batch logic
│       └── email-template.service.ts     # HTML template generation
├── presentation/                         # Presentation Layer (User Interface)
│   └── controllers/
│       └── notification.controller.ts    # REST API endpoints
├── notifications.module.ts               # Module configuration
└── README.md                            # This documentation
```

## ⚙️ Environment Configuration

### Required Environment Variables

#### **Database Configuration**
```bash
# PostgreSQL connection with PostGIS extension
DATABASE_URL="postgresql://username:password@localhost:5432/notification_db?schema=public"
```
- **Purpose**: Primary database connection for storing notifications
- **Required**: ✅ Yes
- **Format**: Standard PostgreSQL connection string
- **Notes**: Must include PostGIS extension for geospatial features

#### **Email Provider Configuration**
```bash
# Choose between "gmail" or "mailgun"
EMAIL_PROVIDER="gmail"
```
- **Purpose**: Determines which email service to use
- **Default**: "gmail"
- **Required**: ❌ No (has default)
- **Options**: "gmail", "mailgun"

#### **Gmail Configuration** (when `EMAIL_PROVIDER="gmail"`)
```bash
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"
```
- **Purpose**: Gmail SMTP credentials for sending emails
- **Required**: ✅ Yes (when using Gmail)
- **Notes**: 
  - Use App Password, not regular password
  - Enable 2FA on Gmail account
  - Generate App Password in Google Account settings

#### **Mailgun Configuration** (when `EMAIL_PROVIDER="mailgun"`)
```bash
MAILGUN_API_KEY="key-your-mailgun-api-key"
MAILGUN_DOMAIN="your-verified-domain.com"
```
- **Purpose**: Mailgun API credentials for sending emails
- **Required**: ✅ Yes (when using Mailgun)
- **Notes**: 
  - Domain must be verified in Mailgun
  - API key starts with "key-"

#### **Batch Processing Configuration**
```bash
BATCH_MAX_SIZE="5"                        # Maximum notifications per batch
BATCH_MAX_WAIT_TIME="7200"                # Maximum wait time in seconds
```
- **Purpose**: Controls notification batching behavior
- **Default**: 5 notifications, 7200 seconds (2 hours)
- **Required**: ❌ No (has defaults)
- **Notes**: 
  - `BATCH_MAX_SIZE`: Triggers processing when reached
  - `BATCH_MAX_WAIT_TIME`: Triggers processing after time limit

#### **JWT Authentication Configuration**
```bash
JWT_SECRET="your-super-secure-jwt-secret-key-min-32-chars"
JWT_EXPIRES_IN="15m"                      # Access token expiration
JWT_REFRESH_EXPIRES_IN="7d"               # Refresh token expiration
```
- **Purpose**: JWT configuration for API authentication
- **Required**: ✅ Yes (for protected endpoints)
- **Notes**: 
  - `JWT_SECRET`: Minimum 32 characters recommended
  - Use strong, random secret in production

#### **Application Configuration**
```bash
NODE_ENV="development"                    # Environment mode
PORT="3000"                               # Application port
```
- **Purpose**: Basic application settings
- **Default**: "development", 3000
- **Required**: ❌ No (has defaults)
- **Options**: "development", "production", "test"

#### **Optional Configuration**
```bash
# Logging level
LOG_LEVEL="info"                          # debug, info, warn, error

# Rate limiting
RATE_LIMIT_TTL="60"                       # Time window in seconds
RATE_LIMIT_LIMIT="100"                    # Max requests per window

# Cache configuration
REDIS_URL="redis://localhost:6379"        # Redis connection (optional)
```

### Complete .env Example

```bash
# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL="postgresql://notification_user:secure_password@localhost:5432/notification_db?schema=public"

# =============================================================================
# EMAIL PROVIDER CONFIGURATION
# =============================================================================
EMAIL_PROVIDER="gmail"

# Gmail Configuration (when EMAIL_PROVIDER="gmail")
GMAIL_USER="notifications@yourcompany.com"
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"

# Mailgun Configuration (when EMAIL_PROVIDER="mailgun")
# MAILGUN_API_KEY="key-your-mailgun-api-key"
# MAILGUN_DOMAIN="your-verified-domain.com"

# =============================================================================
# BATCH PROCESSING CONFIGURATION
# =============================================================================
BATCH_MAX_SIZE="5"
BATCH_MAX_WAIT_TIME="7200"

# =============================================================================
# JWT AUTHENTICATION CONFIGURATION
# =============================================================================
JWT_SECRET="your-super-secure-jwt-secret-key-minimum-32-characters-long"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="info"

# =============================================================================
# OPTIONAL CONFIGURATION
# =============================================================================
# Rate limiting
RATE_LIMIT_TTL="60"
RATE_LIMIT_LIMIT="100"

# Cache (optional)
# REDIS_URL="redis://localhost:6379"
```

## 🚀 Development Setup

### Prerequisites

- **Node.js**: v16.0.0 or higher
- **PostgreSQL**: v12 or higher with PostGIS extension
- **Redis**: v6 or higher (optional, for caching)
- **Gmail Account**: For email provider (or Mailgun account)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notification_service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Install PostGIS extension
   sudo apt-get install postgresql-12-postgis-3  # Ubuntu/Debian
   
   # Create database
   createdb notification_db
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed database (optional)
   npx prisma db seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test specific file
npm run test -- notification.service.spec.ts
```

## 📊 API Endpoints

### Notification Management

```http
POST /notifications
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "eventName": "USER_REGISTERED",
  "channel": "EMAIL",
  "type": "INSTANT",
  "emailData": {
    "to": "user@example.com",
    "subject": "Welcome!",
    "body": "Thank you for registering..."
  }
}
```

### System Notifications

```http
GET /notifications/system?userId=1
Authorization: Bearer <jwt-token>

PATCH /notifications/system/1/read
Authorization: Bearer <jwt-token>
```

## 🔧 Architecture Benefits

### **Domain-Driven Design Benefits**
- **Clear Boundaries**: Each layer has specific responsibilities
- **Business Focus**: Domain logic is isolated and testable
- **Flexibility**: Easy to change implementations without affecting business logic
- **Maintainability**: Clear separation makes code easier to understand and modify

### **Clean Architecture Benefits**
- **Independence**: Business logic doesn't depend on external frameworks
- **Testability**: Each layer can be tested independently
- **Framework Independence**: Can easily switch frameworks or databases
- **Scalability**: Easy to add new features or modify existing ones

## 🛠️ Best Practices

### **Code Organization**
1. **Domain Layer**: Keep business logic pure and framework-independent
2. **Application Layer**: Orchestrate domain objects, don't contain business logic
3. **Infrastructure Layer**: Handle technical concerns and external integrations
4. **Presentation Layer**: Focus on user interface and request handling

### **Type Safety**
1. **Use Prisma Payloads**: Instead of `any` types, use typed Prisma payloads
2. **DTO Validation**: Validate all input DTOs with class-validator
3. **Interface Contracts**: Define clear interfaces for all dependencies

### **Error Handling**
1. **Domain Exceptions**: Create specific exceptions for domain errors
2. **Global Exception Filter**: Handle exceptions consistently across the application
3. **Logging**: Log errors with appropriate context and severity

### **Testing Strategy**
1. **Unit Tests**: Test domain logic and application services
2. **Integration Tests**: Test repository and external service integrations
3. **E2E Tests**: Test complete user workflows

### **Performance**
1. **Batch Processing**: Use batch processing for multiple notifications
2. **Caching**: Cache frequently accessed data
3. **Database Optimization**: Use proper indexes and query optimization

## 🔍 Monitoring and Observability

### **Health Checks**
```http
GET /health
GET /health/detailed
```

### **Logging**
- **Structured Logging**: All logs include context and correlation IDs
- **Log Levels**: Appropriate log levels for different environments
- **Error Tracking**: Integration with error tracking services

### **Metrics**
- **Notification Count**: Track notifications by type and status
- **Processing Time**: Monitor batch processing performance
- **Error Rates**: Track failed notifications and errors

## 📈 Future Enhancements

### **Planned Features**
- **Webhook Support**: Send notifications via webhooks
- **SMS Integration**: Add SMS notification channel
- **Push Notifications**: Mobile push notification support
- **Template Engine**: Advanced template system with variables
- **Analytics Dashboard**: Real-time notification analytics

### **Scalability Improvements**
- **Message Queue**: Use Redis/Bull for better batch processing
- **Microservices**: Split into smaller, focused services
- **Event Sourcing**: Implement event sourcing for audit trails
- **CQRS**: Separate read and write models for better performance 