# Backend Architecture Design

**Version**: 1.0.0
**Date**: 2026-03-01
**Phase**: Phase 4 - Backend Development

---

## 1. Overview

### 1.1 Architecture Goals

The MultiLanguageManager backend is designed to provide:

- **RESTful API**: Clean, stateless API endpoints
- **High Performance**: Efficient data retrieval and processing
- **Security**: Authentication, authorization, rate limiting
- **Scalability**: Database indexing and caching strategy
- **Reliability**: Error handling, retry logic, logging

### 1.2 Technology Stack

```
Server Framework: Node.js 18+ with Express.js 4.18+
Database: PostgreSQL 14+ (production) / SQLite (development)
ORM: Prisma ORM
Authentication: JWT (JSON Web Tokens)
File Processing: xlsx library for Excel parsing
Validation: express-validator
Logging: winston / morgan
Testing: Jest + Supertest
```

### 1.3 Architecture Pattern

```
┌─────────────────────────────────────────────────────┐
│                  Client Layer                   │
│  (React Frontend / Mobile Apps)            │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              API Gateway Layer              │
│  • CORS Configuration                   │
│  • Security Headers                    │
│  • Rate Limiting                       │
│  • Request Logging                     │
└──────────────────────┬──────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐      ┌─────────────────┐
│  Controllers   │      │  Middleware     │
│  (Business     │      │  (Auth, Valid.,│
│   Logic)       │      │   Rate Limit)   │
└────────┬────────┘      └─────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Service Layer                │
│  • ProjectService                 │
│  • EntryService                  │
│  • ExportService                 │
│  • ApiKeyService                │
│  • AuthService                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Data Access Layer           │
│  • Prisma ORM                   │
│  • Database Queries               │
│  • Caching Strategy              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Database Layer              │
│  • PostgreSQL                   │
│  • Indexes                      │
│  • Relations                    │
└─────────────────────────────────────┘
```

---

## 2. Project Structure

```
backend/
├── src/
│   ├── server.ts              # Express server entry point
│   ├── app.ts                # Express app configuration
│   │
│   ├── config/               # Configuration files
│   │   ├── database.ts       # Database connection
│   │   ├── jwt.ts           # JWT configuration
│   │   ├── cors.ts          # CORS settings
│   │   └── logger.ts        # Winston logger setup
│   │
│   ├── middleware/           # Custom middleware
│   │   ├── auth.ts         # JWT authentication
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   ├── errorHandler.ts  # Global error handler
│   │   └── validator.ts     # Request validation
│   │
│   ├── controllers/          # Route controllers
│   │   ├── projectController.ts
│   │   ├── entryController.ts
│   │   ├── exportController.ts
│   │   ├── apiKeyController.ts
│   │   └── authController.ts
│   │
│   ├── services/             # Business logic
│   │   ├── projectService.ts
│   │   ├── entryService.ts
│   │   ├── exportService.ts
│   │   ├── apiKeyService.ts
│   │   └── authService.ts
│   │
│   ├── models/               # Prisma models
│   │   ├── project.prisma
│   │   ├── entry.prisma
│   │   ├── export.prisma
│   │   └── apiKey.prisma
│   │
│   ├── routes/               # Route definitions
│   │   ├── index.ts         # Route aggregation
│   │   ├── projectRoutes.ts
│   │   ├── entryRoutes.ts
│   │   ├── exportRoutes.ts
│   │   ├── apiKeyRoutes.ts
│   │   └── authRoutes.ts
│   │
│   ├── validators/           # Request validators
│   │   ├── projectValidator.ts
│   │   ├── entryValidator.ts
│   │   └── apiKeyValidator.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── excelParser.ts    # Excel parsing
│   │   ├── fileHandler.ts   # File upload handling
│   │   └── response.ts      # Standardized responses
│   │
│   └── types/              # TypeScript types
│       ├── express.d.ts      # Express extensions
│       └── api.ts           # API interfaces
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
│
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                 # End-to-end tests
│
├── .env                   # Environment variables
├── .env.example           # Example environment config
├── package.json            # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # Backend documentation
```

---

## 3. API Design

### 3.1 REST Principles

**Base URL**: `/api/v1`

**HTTP Methods**:
- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT` - Update resources (full replacement)
- `PATCH` - Update resources (partial)
- `DELETE` - Delete resources

**Standard Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

**Error Response Format**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

### 3.2 API Endpoints

**Projects**:
```
GET    /api/v1/projects                    - List all projects
GET    /api/v1/projects/:id               - Get project by ID
POST   /api/v1/projects                    - Create project
PUT    /api/v1/projects/:id               - Update project
DELETE /api/v1/projects/:id               - Delete project
```

**Text Entries**:
```
GET    /api/v1/projects/:projectId/entries              - List entries
GET    /api/v1/projects/:projectId/entries/:uuid     - Get entry by UUID
POST   /api/v1/projects/:projectId/entries              - Create entry
PUT    /api/v1/projects/:projectId/entries/:uuid     - Update entry
DELETE /api/v1/projects/:projectId/entries/:uuid     - Delete entry
POST   /api/v1/projects/:projectId/entries/bulk         - Bulk update entries
POST   /api/v1/projects/:projectId/entries/bulk-delete   - Bulk delete entries
POST   /api/v1/projects/:projectId/upload                - Upload Excel file
```

**Export**:
```
POST   /api/v1/projects/:projectId/export      - Create export
GET    /api/v1/projects/:projectId/exports     - List exports
GET    /api/v1/projects/:projectId/exports/:id/download - Download export
DELETE /api/v1/projects/:projectId/exports/:id - Delete export
```

**API Keys**:
```
GET    /api/v1/api-keys                     - List API keys
POST   /api/v1/api-keys                     - Create API key
DELETE /api/v1/api-keys/:id                - Revoke API key
GET    /api/v1/api-keys/:id/usage        - Get key usage
```

**Authentication**:
```
POST   /api/v1/auth/register                - Register user
POST   /api/v1/auth/login                   - Login
POST   /api/v1/auth/logout                  - Logout
GET    /api/v1/auth/me                     - Get current user
```

**Health**:
```
GET    /api/v1/health                      - Health check
```

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
┌───────────┐
│   Login    │
└─────┬─────┘
      │
      ▼
┌─────────────────┐
│ Validate User  │
│  Credentials  │
└─────┬─────┘
      │
      ▼
┌─────────────────┐
│ Generate JWT   │
│   Token       │
└─────┬─────┘
      │
      ▼
┌─────────────────┐
│ Return Token   │
│  + Refresh Token│
└─────────────────┘

Subsequent Requests:
┌───────────┐
│   Request  │
│  + Token   │
└─────┬─────┘
      │
      ▼
┌─────────────────┐
│ Validate Token │
└─────┬─────┘
      │
      ▼
┌─────────────────┐
│  Allow/ Deny   │
└─────────────────┘
```

### 4.2 Rate Limiting

**Strategy**: Token Bucket Algorithm

**Configuration**:
```javascript
{
  endpoints: {
    '/api/v1/': 1000,    // 1000 requests per hour
    '/api/v1/auth': 5,      // 5 login attempts per minute
    '/api/v1/upload': 10,   // 10 uploads per hour
  },
  windowMs: 3600000,         // 1 hour
  standardHeaders: true,
  handler: rateLimitExceededHandler
}
```

### 4.3 API Key Security

- **Encryption**: API keys stored as bcrypt hashes
- **Masking**: Only show first 8 and last 4 characters
- **Rotation**: Support for key rotation without breaking changes
- **Scoping**: Keys can be scoped to specific projects
- **Expiration**: Optional expiration time support
- **Audit Trail**: Log all API key usage

### 4.4 CORS Configuration

```javascript
{
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400  // 24 hours
}
```

---

## 5. Performance Optimization

### 5.1 Database Indexing

```prisma
model Project {
  id           String @id @default(uuid())
  name         String @unique
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([name, createdAt])  // Composite index
  @@index([createdAt])           // Sort by date
}

model Entry {
  uuid         String @id @default(uuid())
  projectId    String
  cn           String?
  en           String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([projectId, uuid])   // Fast project lookup
  @@index([cn, en])             // Text search index
  @@index([createdAt])           // Sort by date
}
```

### 5.2 Caching Strategy

**Redis Cache** (optional for production):
- Projects list: 5 minutes
- Entries list: 2 minutes
- API keys: 10 minutes
- Export results: 30 minutes

**Cache Invalidation**:
- On project CRUD: Invalidate project cache
- On entry CRUD: Invalidate entry cache
- On export creation: Invalidate export cache

### 5.3 Pagination

**Default**: 50 items per page

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

## 6. Error Handling

### 6.1 Error Types

```typescript
enum ErrorCode {
  // General
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Projects
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  PROJECT_ALREADY_EXISTS = 'PROJECT_ALREADY_EXISTS',

  // Entries
  ENTRY_NOT_FOUND = 'ENTRY_NOT_FOUND',
  ENTRY_ALREADY_EXISTS = 'ENTRY_ALREADY_EXISTS',
  INVALID_ENTRY_UUID = 'INVALID_ENTRY_UUID',

  // API Keys
  API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  INVALID_API_KEY = 'INVALID_API_KEY',

  // File Upload
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_PARSE_ERROR = 'FILE_PARSE_ERROR',

  // Auth
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
}
```

### 6.2 HTTP Status Codes

```
200 - OK                      # Request succeeded
201 - Created                 # Resource created
204 - No Content             # Delete succeeded
400 - Bad Request             # Validation error
401 - Unauthorized            # Invalid/missing token
403 - Forbidden               # Valid token, insufficient permissions
404 - Not Found               # Resource not found
429 - Too Many Requests       # Rate limit exceeded
500 - Internal Server Error     # Unexpected error
```

### 6.3 Error Response Structure

```typescript
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: ErrorCode;
    statusCode: number;
    details?: any;
    timestamp: string;
    path: string;
  };
}
```

---

## 7. Logging Strategy

### 7.1 Log Levels

```
error:   # Critical errors that need immediate attention
warn:    # Warning messages for potential issues
info:    # General information about API operations
http:     # HTTP request logging (via Morgan)
```

### 7.2 Request Logging

**Format**: Combined Morgan format

```
:remote-addr :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
```

**Log Fields**:
- Remote address
- User agent
- Request method
- Request URL
- HTTP version
- Status code
- Response time
- Request ID (for tracing)

### 7.3 Application Logging

**Winston Configuration**:
```javascript
{
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ]
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Coverage Target**: 80%+

**Test Directories**:
- `tests/unit/services/` - Service layer logic
- `tests/unit/middleware/` - Middleware functions
- `tests/unit/validators/` - Validation logic
- `tests/unit/utils/` - Utility functions

### 8.2 Integration Tests

**Test Scenarios**:
- API endpoint CRUD operations
- Authentication flow
- Rate limiting enforcement
- File upload processing
- Error handling

**Test Database**: In-memory SQLite for speed

### 8.3 E2E Tests

**Test Scenarios**:
- User registration → Login → Create Project → Upload → Export
- API key generation → Use → Revoke
- Bulk operations on entries
- Concurrent requests (rate limiting)

---

## 9. Deployment Strategy

### 9.1 Environment Configuration

```bash
# Development
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=dev-secret-key-change-in-production
LOG_LEVEL=debug

# Production
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/multilang"
JWT_SECRET=${JWT_SECRET}
LOG_LEVEL=info
CORS_ORIGIN=https://multilang.example.com
```

### 9.2 Docker Configuration

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_PASSWORD=...
      - POSTGRES_DB=multilang
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### 9.3 CI/CD Pipeline

**GitHub Actions**:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        run: |
          # Deploy commands
```

---

## 10. Monitoring & Observability

### 10.1 Health Checks

**Endpoint**: `GET /api/v1/health`

**Response**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-03-01T12:00:00Z",
  "database": {
    "status": "connected",
    "latency": 5
  },
  "services": {
    "database": "ok",
    "redis": "not configured"
  }
}
```

### 10.2 Metrics to Track

**Application Metrics**:
- Request rate per endpoint
- Average response time
- Error rate
- Active API keys
- Database connection pool usage
- Memory and CPU usage

**Business Metrics**:
- Total projects
- Total entries
- Exports generated
- API key usage
- User registrations

### 10.3 Alerting

**Alert Conditions**:
- Error rate > 5% for 5 minutes
- Response time > 2s for 95th percentile
- Database connection failures
- Rate limit breaches
- Disk usage > 80%

---

## 11. Development Workflow

### 11.1 Local Development Setup

```bash
# Clone repository
git clone <repo-url>
cd MultiLanguageManager/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

### 11.2 Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Apply migrations
npx prisma migrate dev

# Reset database (dev only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### 11.3 Development Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc && npx prisma generate",
    "start": "node dist/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "migrate": "npx prisma migrate dev",
    "migrate:deploy": "npx prisma migrate deploy",
    "seed": "npx prisma db seed"
  }
}
```

---

## 12. Next Steps

### 12.1 Phase 4.1 - Backend Foundation
- [ ] Initialize project structure
- [ ] Set up Express server
- [ ] Configure Prisma ORM
- [ ] Create database schema
- [ ] Set up logging
- [ ] Create middleware base

### 12.2 Phase 4.2 - API Implementation
- [ ] Implement Projects CRUD
- [ ] Implement Entries CRUD
- [ ] Implement Bulk operations
- [ ] Implement Export endpoints
- [ ] Implement API Keys management
- [ ] Implement file upload
- [ ] Add request validation

### 12.3 Phase 4.3 - Authentication & Security
- [ ] Implement JWT authentication
- [ ] Implement rate limiting
- [ ] Configure CORS
- [ ] Add security headers
- [ ] Implement API key middleware

### 12.4 Phase 4.4 - Integration
- [ ] Connect frontend to backend
- [ ] Replace mock data with API calls
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Test end-to-end flows

---

**Document Version**: 1.0.0
**Last Updated**: 2026-03-01
**Next Phase**: Backend Foundation Implementation
