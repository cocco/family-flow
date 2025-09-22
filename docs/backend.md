## Contents
- [1. Backend Architecture](#1-backend-architecture)
- [2. Database Design](#2-database-design)
  - [2.1 Entity Relationship Diagram](#21-entity-relationship-diagram)
  - [2.2 Database Schema](#22-database-schema)
- [3. API Design](#3-api-design)
  - [3.1 Authentication Endpoints](#31-authentication-endpoints)
  - [3.2 User Management](#32-user-management)
  - [3.3 Chores Management](#33-chores-management)
  - [3.4 Bonus Tasks Management](#34-bonus-tasks-management)
  - [3.5 Allowance Tracking](#35-allowance-tracking)
  - [3.6 Notification System](#36-notification-system)

## 1. Backend Architecture

*See [architecture.md §3 System Architecture](architecture.md#3-system-architecture) and [§4 Security Considerations](architecture.md#4-security-considerations) for high-level guidance.*
- See architecture.md section 2 for tech stack
- **API Structure:**
  - `routes/auth.js` - Authentication endpoints
  - `routes/users.js` - User management
  - `routes/chores.js` - Monthly chores CRUD operations
  - `routes/tasks.js` - Bonus tasks management
  - `routes/allowances.js` - Allowance tracking
- **Middleware:** JWT authentication, CORS, request validation
- **Services:** Business logic separation from route handlers
- **Error Handling:** Centralized error handling with appropriate HTTP status codes
- **Security:** See architecture.md section 4; implemented via validation middleware and parameterized queries

## 2. Database Design

### 2.1 Entity Relationship Diagram
```
Users (1) ──── (N) Chores
  │
  └── (N) TaskReservations ──── (N) BonusTasks
  │
  └── (N) Allowances
```

### 2.2 Database Schema

#### 2.2.1 Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('parent', 'child') NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  monthly_allowance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2.2 Chores Table
```sql
CREATE TABLE chores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  approved_by INTEGER NULL,
  approved_at TIMESTAMP NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

#### 2.2.3 Bonus Tasks Table
```sql
CREATE TABLE bonus_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  reward_amount DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 2.2.4 Task Reservations Table
```sql
CREATE TABLE task_reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  child_id INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  approved_by INTEGER NULL,
  approved_at TIMESTAMP NULL,
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES bonus_tasks(id),
  FOREIGN KEY (child_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

## 3. API Design

### 3.1 Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### 3.2 User Management
- `GET /api/users` - Get all family members (parent only)
- `POST /api/users` - Create new child account (parent only)
- `PUT /api/users/:id` - Update user info
- `DELETE /api/users/:id` - Delete user (parent only)

### 3.3 Chores Management
- `GET /api/chores` - Get chores (filtered by user role)
- `POST /api/chores` - Create monthly chores (parent only)
- `PUT /api/chores/:id` - Update chore
- `PUT /api/chores/:id/complete` - Mark chore as completed (child)
- `PUT /api/chores/:id/approve` - Approve completed chore (parent)
- `DELETE /api/chores/:id` - Delete chore (parent only)

### 3.4 Bonus Tasks Management
- `GET /api/tasks` - Get available bonus tasks
- `POST /api/tasks` - Create bonus task (parent only)
- `PUT /api/tasks/:id` - Update bonus task (parent only)
- `POST /api/tasks/:id/reserve` - Reserve task (child)
- `PUT /api/tasks/:id/complete` - Mark task as completed (child)
- `PUT /api/tasks/:id/approve` - Approve completed task (parent)
- `DELETE /api/tasks/:id` - Delete task (parent only)

### 3.5 Allowance Tracking
- `GET /api/allowances/:childId` - Get allowance summary for child
- `GET /api/allowances/:childId/monthly` - Get monthly allowance breakdown with bonus tasks
- `GET /api/allowances` - Get all allowances (parent only)
- `POST /api/allowances/:childId/calculate` - Recalculate allowance for child (parent only)

### 3.6 Notification System
- `GET /api/notifications` - Get user's notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/task-completed` - Notify parents when child completes task
- `POST /api/notifications/task-available` - Notify children when new bonus tasks are added