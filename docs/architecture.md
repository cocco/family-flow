# Family Flow - System Architecture

## 1. System Overview

Family Flow follows a **decoupled architecture** with separate frontend and backend projects that communicate via a well-documented REST API. This allows for independent development, testing, and deployment of each component while maintaining simplicity and lightweight operation.

### Architecture Principles
- **Simplicity First:** Minimal complexity to ensure easy maintenance and family-friendly usage
- **Role-Based Access:** Clear separation between parent and child capabilities
- **Lightweight:** Fast loading and minimal resource usage
- **Mobile-First:** Responsive design prioritizing mobile devices

## 2. Technical Requirements

- **Platform:** Web application with mobile-first responsive design
- **Tech Stack:**
  - **Frontend:** React with TypeScript for type safety
  - **Backend:** Node.js with Express.js framework
  - **Database:** SQLite for development, PostgreSQL for production
  - **Authentication:** JWT-based authentication with role-based access control
  - **Styling:** Tailwind CSS for consistent, responsive design
- **Hosting:** 
  - Frontend: Vercel or Netlify
  - Backend: Railway, Render, or similar Node.js hosting
  - Database: Built-in SQLite or managed PostgreSQL
- **Documentation:** Comprehensive setup guides and API documentation

## 3. System Architecture

### 3.1 High-Level Architecture
```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│                 │◄───────────────────►│                 │
│   React Client  │                     │   Node.js API   │
│   (Frontend)    │                     │   (Backend)     │
│                 │                     │                 │
└─────────────────┘                     └─────────────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────┐
                                        │                 │
                                        │   SQLite/       │
                                        │   PostgreSQL    │
                                        │   Database      │
                                        └─────────────────┘
```

### 3.2 Frontend Architecture
- **Component Structure:**
  - `App.js` - Main application with routing
  - `components/auth/` - Login/logout components
  - `components/chores/` - Monthly chores management
  - `components/tasks/` - Bonus tasks management
  - `components/dashboard/` - Parent and child dashboards
  - `components/common/` - Shared UI components
- **State Management:** React Context API for user session and app state
- **Routing:** React Router for navigation between views

### 3.3 Backend Architecture
- **API Structure:**
  - `routes/auth.js` - Authentication endpoints
  - `routes/users.js` - User management
  - `routes/chores.js` - Monthly chores CRUD operations
  - `routes/tasks.js` - Bonus tasks management
  - `routes/allowances.js` - Allowance tracking
- **Middleware:** Authentication, CORS, request validation
- **Services:** Business logic separation from route handlers

## 4. Database Design

### 4.1 Entity Relationship Diagram
```
Users (1) ──── (N) Chores
  │
  └── (N) TaskReservations ──── (N) BonusTasks
  │
  └── (N) Allowances
```

### 4.2 Database Schema

#### Users Table
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

#### Chores Table
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

#### Bonus Tasks Table
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

#### Task Reservations Table
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

## 5. API Design

### 5.1 Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### 5.2 User Management
- `GET /api/users` - Get all family members (parent only)
- `POST /api/users` - Create new child account (parent only)
- `PUT /api/users/:id` - Update user info
- `DELETE /api/users/:id` - Delete user (parent only)

### 5.3 Chores Management
- `GET /api/chores` - Get chores (filtered by user role)
- `POST /api/chores` - Create monthly chores (parent only)
- `PUT /api/chores/:id` - Update chore
- `PUT /api/chores/:id/complete` - Mark chore as completed (child)
- `PUT /api/chores/:id/approve` - Approve completed chore (parent)
- `DELETE /api/chores/:id` - Delete chore (parent only)

### 5.4 Bonus Tasks Management
- `GET /api/tasks` - Get available bonus tasks
- `POST /api/tasks` - Create bonus task (parent only)
- `PUT /api/tasks/:id` - Update bonus task (parent only)
- `POST /api/tasks/:id/reserve` - Reserve task (child)
- `PUT /api/tasks/:id/complete` - Mark task as completed (child)
- `PUT /api/tasks/:id/approve` - Approve completed task (parent)
- `DELETE /api/tasks/:id` - Delete task (parent only)

### 5.5 Allowance Tracking
- `GET /api/allowances/:childId` - Get allowance summary for child
- `GET /api/allowances` - Get all allowances (parent only)

## 6. User Interface Design

### 6.1 Parent Dashboard
- Family overview with all children's progress
- Quick actions to create chores and bonus tasks
- Pending approvals notification area
- Monthly allowance summaries

### 6.2 Child Dashboard
- Personal chores checklist
- Available bonus tasks browser
- Reserved tasks status
- Earnings tracker

### 6.3 Responsive Design
- Mobile-first approach with touch-friendly interfaces
- Progressive Web App (PWA) capabilities for app-like experience
- Offline-first design for core functionality

## 7. Security Considerations

### 7.1 Authentication & Authorization
- JWT tokens with appropriate expiration
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Session management and logout functionality

### 7.2 Data Protection
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- XSS protection through proper output encoding
- CSRF protection for state-changing operations

### 7.3 Privacy
- Minimal data collection
- Family data isolation
- No third-party analytics or tracking

## 8. Deployment Architecture

### 8.1 Development Environment
- Local SQLite database
- Hot-reloading for both frontend and backend
- Environment variables for configuration

### 8.2 Production Environment
- Frontend deployed to Vercel/Netlify with CDN
- Backend deployed to Railway/Render with auto-scaling
- PostgreSQL managed database
- Environment-based configuration
- HTTPS enforcement
- Automated backups

### 8.3 CI/CD Pipeline
- GitHub Actions for automated testing
- Automated deployment on main branch push
- Database migration management
- Health checks and monitoring

## 9. Performance Considerations

### 9.1 Frontend Optimization
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

### 9.2 Backend Optimization
- Database indexing on frequently queried fields
- API response caching where appropriate
- Connection pooling
- Query optimization

### 9.3 Scalability
- Horizontal scaling capability
- Database read replicas for future growth
- CDN for static assets
- Load balancing for high availability