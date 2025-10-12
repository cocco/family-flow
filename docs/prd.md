# Product Requirements Document (PRD)  
**Project Name:** Family Flow  

---

## 1. Overview  

Family Flow is a web-based chores-and-rewards app for families. It helps children earn pocket money by completing household chores, while enabling parents to assign, track, and reward tasks easily. The experience is lightweight, transparent, and trust-based.

**Core Features (v1)**  
1. **Monthly Chores** — Recurring chores assigned per child; completion yields base allowance.  
2. **Bonus Tasks** — Optional tasks with specific rewards that kids can reserve and complete for extra earnings.

---

## 2. Goals  

- Encourage responsibility and independence in children  
- Provide parents with a simple tool for organizing chores  
- Motivate kids by linking effort to visible rewards  
- Keep the system minimal, intuitive, and approachable  

---

## 3. Non-Goals  

- The app will **not** handle real money transfers (payments are external)  
- The app is **not** a full budgeting or expense-tracking tool  
- No advanced gamification (avatars, marketplaces, social sharing) in v1  
- No integrations beyond core chore/reward functionality  

---

## 4. Functional Requirements  

Each feature area below includes system requirements plus related user stories for context.

### 4.1 User Roles & Access  

**Functional Requirements**  
- The system supports two user roles: **Parent** and **Child**.  
- Each user sees a role-specific UI and has role-specific permissions.  
- Parents can manage chores and bonus tasks (CRUD).  
- Children can view tasks, reserve bonus tasks, and mark tasks as completed.  

**Related User Stories**  
- *As a parent, I want to manage chores and rewards so our home responsibilities are organized.*  
- *As a child, I want to see and complete tasks so I can earn pocket money.*  

---

### 4.2 Monthly Chores  

**Functional Requirements**  
- Parents can assign **recurring monthly chores** to one or more children.  
- A chore includes: title, description, and a completion status toggle.  
- Children can see their assigned chores and mark each as completed.  
 - Each child has a **base monthly allowance** (default $30, configurable per child).
- The base allowance is counted as earned **only if all monthly chores are completed** in the period.  
- The system tracks chore status per month (resets status at the start of a new month).  

**Related User Stories**  
- *As a parent, I want to assign recurring chores per child so responsibilities stay consistent.*  
- *As a child, I want to view what chores I have and mark them done so I can earn my allowance.*  

---

### 4.3 Bonus Tasks  

**Functional Requirements**  
- Parents can create **bonus tasks** with title, description, and a reward amount.  
- Children can view all active bonus tasks.  
- A child can **reserve** a bonus task to prevent others from claiming it.  
- Once marked completed by the child, the reward is immediately added to that month’s earnings.  
- No parental approval step is required for completion (trust-based flow).  

**Related User Stories**  
- *As a parent, I want to add optional tasks with rewards to motivate extra effort.*  
- *As a child, I want to reserve a bonus task so no one else can take it.*  
- *As a child, I want to mark bonus tasks done so I can increase my earnings.*  

---

### 4.4 Allowance & Earnings Tracking  

**Functional Requirements**  
- The system computes **monthly earnings per child** = base allowance (if chores done) + sum of completed bonus rewards.  
- The app shows a running total of earnings within the current month.  
- The system keeps a **history of monthly summaries** per child (past months).  
- The UI presents summary views for parents (per child) and children (self).  
- No payment processing or external financial transactions are handled in-app.  

**Related User Stories**  
- *As a child, I want to see how much I’ve earned so far in the month to track progress.*  
- *As a parent, I want to view each child’s earnings to have a clear record at month-end.*  

---

## 5. Acceptance Criteria  

- Parents can **create, edit, and delete** both monthly chores and bonus tasks.  
- Children can **view, reserve (for bonus), and mark tasks as completed**.  
- Completing tasks **immediately** affects earnings; no further parent approval is needed.  
- The app **correctly calculates** total monthly earnings combining base + bonus.  
- Role-based access: children cannot manage tasks, and parents cannot perform child-only actions.  
- Task state (e.g., completed, reserved) persists appropriately across page reloads and visits.  
- The system resets monthly chores’ statuses at the start of each new month (or a defined “cycle reset”).  
- Historical earnings per child are viewable.  
- No real payment or money transfer functionality is present.

---

## 6. Future Considerations  

These are ideas to keep in a roadmap (not for v1):  
- Notifications (e.g. when new bonus tasks are available, or child marks task done)  
- Mobile apps (iOS & Android)  
- Gamification: badges, streaks, leaderboards, avatars  
- Integration with payment services (PayPal, bank transfers)  
- Calendar sync (Google Calendar, etc.)  
- Voice assistant or smart-home integrations  
- Deadline reminders, overdue tasks, escalation flows  
- Multi-user households with different roles (e.g. siblings, guardians)  

---

## 7. Glossary & Definitions  

- **Chore**: recurring task assigned monthly to a child (e.g. “Wash dishes”)  
- **Bonus Task**: optional, non-recurring task with a reward amount  
- **Base Allowance**: the fixed monthly amount a child can earn by completing all chores  
- **Reservation**: the act of a child claiming a bonus task so that others cannot take it  
- **Monthly Summary**: overview of chores, bonus tasks, and total earnings for a given month  

---