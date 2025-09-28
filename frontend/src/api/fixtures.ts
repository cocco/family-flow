import type { BonusTaskDto, ChoreDto, TaskReservationDto, UserDto } from './types';

// Simple ID helper for fixtures
let autoIdCounter = 1;
const nextId = (): string => String(autoIdCounter++);

const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();

export const usersFixture: UserDto[] = [
  {
    id: nextId(),
    username: 'parent.alex',
    displayName: 'Alex (Parent)',
    role: 'parent',
    monthlyAllowance: 0,
  },
  {
    id: nextId(),
    username: 'child.sam',
    displayName: 'Sam',
    role: 'child',
    monthlyAllowance: 20,
  },
  {
    id: nextId(),
    username: 'child.riley',
    displayName: 'Riley',
    role: 'child',
    monthlyAllowance: 25,
  },
];

const parentId = usersFixture[0].id;
const childSamId = usersFixture[1].id;
const childRileyId = usersFixture[2].id;

export const choresFixture: ChoreDto[] = [
  // Sam's chores
  {
    id: nextId(),
    childId: childSamId,
    title: 'Make bed',
    description: 'Tidy up and make the bed each morning',
    isCompleted: false,
    month,
    year,
  },
  {
    id: nextId(),
    childId: childSamId,
    title: 'Feed the cat',
    description: 'Morning and evening feeding',
    isCompleted: true,
    completedAt: new Date(year, month - 1, 2).toISOString(),
    month,
    year,
  },
  {
    id: nextId(),
    childId: childSamId,
    title: 'Set the table',
    description: 'Set the table for dinner each evening',
    isCompleted: false,
    month,
    year,
  },
  {
    id: nextId(),
    childId: childSamId,
    title: 'Put away toys',
    description: 'Clean up toys and games after playing',
    isCompleted: true,
    completedAt: new Date(year, month - 1, 5).toISOString(),
    approvedAt: new Date(year, month - 1, 6).toISOString(),
    approvedBy: parentId,
    month,
    year,
  },
  {
    id: nextId(),
    childId: childSamId,
    title: 'Water the plants',
    description: 'Water the indoor plants twice a week',
    isCompleted: false,
    month,
    year,
  },
  
  // Riley's chores
  {
    id: nextId(),
    childId: childRileyId,
    title: 'Take out trash',
    description: 'Take out the trash and recycling on Tuesdays and Fridays',
    isCompleted: false,
    month,
    year,
  },
  {
    id: nextId(),
    childId: childRileyId,
    title: 'Walk the dog',
    description: 'Take the dog for a 15-minute walk after school',
    isCompleted: true,
    completedAt: new Date(year, month - 1, 3).toISOString(),
    month,
    year,
  },
  {
    id: nextId(),
    childId: childRileyId,
    title: 'Empty dishwasher',
    description: 'Empty the dishwasher and put dishes away',
    isCompleted: false,
    month,
    year,
  },
  {
    id: nextId(),
    childId: childRileyId,
    title: 'Clean bathroom',
    description: 'Clean the bathroom sink and mirror weekly',
    isCompleted: true,
    completedAt: new Date(year, month - 1, 1).toISOString(),
    approvedAt: new Date(year, month - 1, 2).toISOString(),
    approvedBy: parentId,
    month,
    year,
  },
  {
    id: nextId(),
    childId: childRileyId,
    title: 'Fold laundry',
    description: 'Fold and put away clean clothes',
    isCompleted: false,
    month,
    year,
  },
];

export const bonusTasksFixture: BonusTaskDto[] = [
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Wash the car',
    description: 'Exterior wash and dry',
    rewardAmount: 5,
    isAvailable: false, // Reserved by Sam
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Organize bookshelf',
    description: 'Sort books by category and alphabetically',
    rewardAmount: 3,
    isAvailable: false, // Reserved by Riley
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Vacuum living room',
    description: 'Vacuum the entire living room including under furniture',
    rewardAmount: 2,
    isAvailable: false, // Reserved by Sam
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Clean windows',
    description: 'Clean all windows inside and out',
    rewardAmount: 8,
    isAvailable: false, // Reserved by Riley
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Garden weeding',
    description: 'Pull weeds from the front garden bed',
    rewardAmount: 4,
    isAvailable: true,
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Deep clean kitchen',
    description: 'Clean all appliances, counters, and cabinets',
    rewardAmount: 6,
    isAvailable: true,
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Organize garage',
    description: 'Sort tools and organize storage boxes',
    rewardAmount: 7,
    isAvailable: true,
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Paint bedroom wall',
    description: 'Touch up paint on bedroom wall',
    rewardAmount: 10,
    isAvailable: true,
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Help with grocery shopping',
    description: 'Help carry groceries and put them away',
    rewardAmount: 2,
    isAvailable: true,
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Clean out car',
    description: 'Remove trash and vacuum car interior',
    rewardAmount: 3,
    isAvailable: true,
  },
];

export const reservationsFixture: TaskReservationDto[] = [
  // Sam's completed bonus task (approved)
  {
    id: `${bonusTasksFixture[0].id}:${childSamId}`,
    taskId: bonusTasksFixture[0].id, // Wash the car
    childId: childSamId,
    isCompleted: true,
    completedAt: new Date(year, month - 1, 4).toISOString(),
    approvedAt: new Date(year, month - 1, 5).toISOString(),
    approvedBy: parentId,
    reservedAt: new Date(year, month - 1, 3).toISOString(),
  },
  // Riley's completed bonus task
  {
    id: `${bonusTasksFixture[1].id}:${childRileyId}`,
    taskId: bonusTasksFixture[1].id, // Organize bookshelf
    childId: childRileyId,
    isCompleted: true,
    completedAt: new Date(year, month - 1, 6).toISOString(),
    approvedAt: new Date(year, month - 1, 7).toISOString(),
    approvedBy: parentId,
    reservedAt: new Date(year, month - 1, 5).toISOString(),
  },
  // Sam's pending bonus task (completed but not approved)
  {
    id: `${bonusTasksFixture[2].id}:${childSamId}`,
    taskId: bonusTasksFixture[2].id, // Vacuum living room
    childId: childSamId,
    isCompleted: true,
    completedAt: new Date(year, month - 1, 8).toISOString(),
    reservedAt: new Date(year, month - 1, 7).toISOString(),
  },
  // Riley's reserved but not completed task
  {
    id: `${bonusTasksFixture[3].id}:${childRileyId}`,
    taskId: bonusTasksFixture[3].id, // Clean windows
    childId: childRileyId,
    isCompleted: false,
    reservedAt: new Date(year, month - 1, 9).toISOString(),
  },
];


