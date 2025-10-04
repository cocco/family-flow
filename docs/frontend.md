## Contents
- [1. User Interface Design](#1-user-interface-design)
  - [1.1 Parent Dashboard](#11-parent-dashboard)
  - [1.2 Child Dashboard](#12-child-dashboard)
  - [1.3 Responsive Design](#13-responsive-design)
- [2. Frontend Architecture](#2-frontend-architecture)

## 1. User Interface Design

*See [architecture.md §2 Technical Requirements](architecture.md#2-technical-requirements) and [§3 System Architecture](architecture.md#3-system-architecture) for high-level system details.*

### 1.1 Parent Dashboard
- Family overview with all children showing base allowance and totals
- Monthly allowance summaries with bonus breakdown (per child)
- Trust-based flow: no approvals required
- Quick actions to create chores and bonus tasks (planned)

### 1.2 Child Dashboard
- Personal chores checklist with completed bonus tasks integrated
- Available bonus tasks browser
- Reserved tasks status
- Earnings tracker showing monthly allowance + bonus task rewards (no approval gate)

### 1.3 Responsive Design
- Mobile-first approach with touch-friendly interfaces
- Progressive Web App (PWA) capabilities for app-like experience
- Offline-first design for core functionality

## 2. Frontend Architecture
- See [architecture.md §2 Technical Requirements](architecture.md#2-technical-requirements) for tech stack
- **Component Structure:**
  - `App.tsx` - Main application with routing
  - `components/auth/` - Login/logout components
  - `components/chores/` - Monthly chores management
  - `components/tasks/` - Bonus tasks management
  - `components/dashboard/` - Parent and child dashboards
  - `components/common/` - Shared UI components
- **State Management:** React Context API for user session and app state
- **Routing:** React Router for navigation between views
- **Styling:** Tailwind CSS for responsive, mobile-first design