# Product Requirements Document (PRD)  
**Project Name:** Family Flow  

## 1. Overview  
This is a simple to-do app for the whole family, especially for kids who want to earn pocket money by doing household chores. It will be a web app with two main features:  

1. **Monthly Chores:** Each child has a list of monthly chores. When a child completes their chores, they receive a monthly allowance. Payments are managed outside the app.  
2. **Bonus Tasks:** Parents can create a list of bonus tasks, each with a set reward amount. Kids can reserve these tasks and mark them as done to earn additional pocket money.  

## 2. Goals  
- Encourage kids to build responsibility and independence by completing chores.  
- Provide parents with a simple way to organize, assign, and track chores.  
- Make the app fun and motivating for kids by connecting chores with rewards.  
- Keep the system lightweight and easy to use for families with varying technical skills.
- The app should be simple and lightweight 

## 3. Non-Goals  
- The app will not handle payments directly; money transfers are outside the scope.  
- The app is not intended to be a full financial management or budgeting tool.  
- No advanced gamification features (e.g., avatars, points marketplace) in the initial version.
- No features beyond the stated goals.

## 4. Functional Requirements  
1. **User Roles:**  
   - Parent: Can create/edit/delete chores and bonus tasks, approve completed tasks, and manage allowances.  
   - Child: Can view their chores and bonus tasks, reserve tasks, and mark them as completed.  

2. **Chores Management:**  
   - Parents can assign recurring monthly chores to each child.  
   - Children can view their assigned chores.  
   - Completion status (done/not done) is tracked.  

3. **Bonus Task Management:**  
   - Parents can create bonus tasks with descriptions and reward amounts.  
   - Kids can reserve available bonus tasks to avoid duplication.  
   - Kids can mark bonus tasks as completed.  
   - Parents can approve or reject completion.  

4. **Allowance Tracking:**  
   - The app tracks earned allowance per child based on completed chores and bonus tasks.  
   - Completed bonus tasks are displayed as additional rows in each child's monthly chores list
   - The combined total of the monthly allowance and bonus task rewards is shown at the end of each child's list  

## 5. User Stories  
- **As a parent**, I want to create a list of chores for my kids so that I can track household responsibilities.  
- **As a parent**, I want to add bonus tasks with specific rewards so my kids can take initiative. 
- **As a child**, I want to see my chores and bunus tasks list so I know what I need to do. The monthly chores and bonus tasks should be in the same list so that I can easily understand all work expected from me.  
- **As a child**, I want to reserve a bonus task so no one else takes it.  
- **As a child**, I want to mark tasks as done so I can earn my allowance.  

## 6. Acceptance Criteria  
- Parents can create, edit, and delete chores and bonus tasks.  
- Children can view, reserve, and complete tasks.  
- Completed tasks require parent approval before being counted.  
- The app displays a monthly allowance summary for each child.  
- Payments are tracked but not processed inside the app.  

## 7. Future Considerations  
- Parents are notified when kids mark tasks as completed.  
- Kids are notified when new bonus tasks are available.
- Mobile app (iOS/Android) version.  
- Gamification features (badges, levels, avatars).  
- Integration with payment providers (e.g., PayPal, bank transfer).  
- Voice assistant integration for hands-free task updates.  
- Calendar sync for chores and deadlines.    