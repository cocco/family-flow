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
    childId: childRileyId,
    title: 'Take out trash',
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
    isAvailable: true,
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Organize bookshelf',
    rewardAmount: 3,
    isAvailable: true,
  },
  {
    id: nextId(),
    createdBy: parentId,
    title: 'Vacuum living room',
    rewardAmount: 2,
    isAvailable: true,
  },
];

export const reservationsFixture: TaskReservationDto[] = [
  // Start with none reserved; flows will populate
];


