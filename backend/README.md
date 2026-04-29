# Real Estate Client & Payment System - Backend

## Phase 1: Schema & Project Structure

### Project Structure
```
backend/
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── config/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   │   └── login.dto.ts
│   │   │   ├── guards/
│   │   │   │   └── local-auth.guard.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── departments/
│   │   │   ├── departments.controller.ts
│   │   │   ├── departments.module.ts
│   │   │   └── departments.service.ts
│   │   ├── clients/
│   │   │   ├── clients.controller.ts
│   │   │   ├── clients.module.ts
│   │   │   └── clients.service.ts
│   │   ├── audit-logs/
│   │   │   ├── audit-logs.controller.ts
│   │   │   ├── audit-logs.module.ts
│   │   │   └── audit-logs.service.ts
│   ├── app.module.ts
│   ├── main.ts
│   └── prisma/
│       └── schema.prisma
├── test/
│   ├── app.e2e-spec.ts
│   └── tsconfig.e2e.json
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### Database Schema Summary

**Tables Created:**
1. **users** - User accounts with RBAC (ADMIN, ACCOUNTANT, SALES_AGENT)
2. **departments** - Department codes for client validation
3. **clients** - Client registration with department assignment
4. **payment_plans** - Payment plan definitions
5. **installments** - Auto-generated installment schedules
6. **payments** - Payment records with receipts
7. **notifications** - Email/SMS notification tracking
8. **audit_logs** - Complete audit trail for all operations

**Key Features:**
- Soft deletes (`deletedAt` fields)
- Comprehensive indexing for performance
- Foreign key relationships with cascading
- JSON fields for flexible metadata
- Decimal precision for financial data

### Setup Instructions

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

#### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

#### 4. Run Database Migrations
```bash
npm run prisma:migrate
```

#### 5. Start Development Server
```bash
npm run start:dev
```

### Available Scripts
- `npm run start:dev` - Start in development mode with watch
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run prisma:studio` - Open Prisma Studio GUI
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### API Endpoints (Phase 1)

#### Auth
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout user

#### Users (ADMIN only)
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Soft delete user

#### Departments
- `GET /departments` - List active departments
- `GET /departments/:id` - Get department details
- `GET /departments/code/:code` - Validate department code
- `POST /departments` - Create department (ADMIN)
- `PATCH /departments/:id` - Update department (ADMIN)
- `DELETE /departments/:id` - Deactivate department (ADMIN)

#### Clients
- `GET /clients` - List clients (with filters)
- `GET /clients/:id` - Get client details
- `POST /clients` - Register client (dept validation)
- `PATCH /clients/:id` - Update client
- `DELETE /clients/:id` - Soft delete client (ADMIN)
- `PATCH /clients/:id/status` - Update client status

#### Audit Logs (ADMIN only)
- `GET /audit-logs` - List audit logs with filters
- `GET /audit-logs/:id` - Get specific log entry

### Security Features
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- SQL injection protection via Prisma

---

**Phase 1 Complete!** ✅

All schema definitions, project structure, authentication module, user management, department validation, client registration, and audit logging are implemented.

**Proceed to Phase 2?** (Payment Plans, Installments, Payments, and full CRUD APIs)
