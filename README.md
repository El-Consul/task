# Real Estate Management System

## Overview
The Real Estate Management System is a comprehensive full-stack application designed to streamline the operations of real estate agencies. It manages property units, client profiles, dynamic installment plans, and financial tracking. The system is secured using a granular, permission-based access control architecture to safely segregate duties among Administrators, Accountants, and Sales Agents.

## Tech Stack
- **Frontend**: React (Vite), React Router v6, Context API for state management, Vanilla CSS (Glassmorphism aesthetics), Lucide React (Icons).
- **Backend**: NestJS, Prisma ORM, PostgreSQL (via Supabase), Passport & JWT for secure Authentication.
- **Tools & Languages**: TypeScript across both stacks.

## Core Features

### 1. User Management & Granular Permissions
- Transitioned from standard Role-Based Access Control (RBAC) to a highly flexible Permission-Based system.
- Create, edit, and disable system accounts.
- Assign specific capabilities dynamically (e.g., `CLIENTS_MANAGE`, `PAYMENT_PLANS_VIEW`).
- The User Interface automatically adapts and hides/shows actions based on the logged-in user's permission array.

### 2. Client Management
- Manage client profiles including contact information, identification details, and assigned agents.
- Quick views to track how many payment plans a specific client holds.

### 3. Property Units (Departments)
- Track property units by code, name, and total price.
- Live status tracking (AVAILABLE, RESERVED, SOLD).

### 4. Dynamic Payment Plans
- Create robust installment-based payment plans.
- Specify down payments (deposits), start/end dates, total amounts, and payment frequencies (Monthly, Quarterly).
- Visual progress bars dynamically track the paid vs. outstanding balance.

### 5. Payment Processing & Tracking
- Dedicated financial dashboard to record transactions against pending installments.
- Overdue tracking system for late payments.
- Track payment history with references/receipt numbers.

### 6. Exports & Notifications
- Export comprehensive accounting data into Excel files (`.xlsx`).
- Notification systems built to fetch due and overdue installments.

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL (e.g., Supabase, Heroku, Local)

### 1. Backend Configuration
1. Navigate to the `backend` directory: 
   ```bash
   cd backend
   ```
2. Install dependencies: 
   ```bash
   npm install
   ```
3. Configure environment variables. Create a `.env` file in the `backend` root:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   JWT_SECRET="your-secure-jwt-key"
   PORT=3000
   ```
4. Apply database schema and generate the Prisma client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Seed the initial Administrator account:
   ```bash
   node prisma/seed.js
   ```
   *(Default Admin Login: `admin@realestate.com` / `admin123`)*

6. Start the backend development server:
   ```bash
   npm run start:dev
   ```

### 2. Frontend Configuration
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

---

## Available System Permissions
To properly manage access, administrators can assign the following system permissions to users via the dashboard:

| Permission ID | Description |
|---|---|
| `CLIENTS_VIEW` | Can view client lists and basic details. |
| `CLIENTS_MANAGE` | Can create, edit, and assign clients. |
| `DEPARTMENTS_MANAGE` | Can add and edit property units/departments. |
| `PAYMENT_PLANS_VIEW` | Can view all installment schedules. |
| `PAYMENT_PLANS_MANAGE` | Can create new installment/payment plans. |
| `PAYMENTS_VIEW` | Can view payment history and accounting exports. |
| `PAYMENTS_MANAGE` | Can explicitly record new payment transactions. |
| `USERS_MANAGE` | Can create and manage system user accounts and alter permissions. |
