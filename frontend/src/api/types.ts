export type ApiSuccess<T> = { data: T };

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export type ApiResult<T> = ApiSuccess<T> | { error: ApiErrorShape };

export type UserRole = 'parent' | 'child';

export interface UserDto {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  monthlyAllowance: number; // base monthly allowance
}

export interface ChoreDto {
  id: string;
  childId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string; // ISO
  month: number; // 1-12
  year: number;
}

export interface BonusTaskDto {
  id: string;
  createdBy: string; // parent id
  title: string;
  description?: string;
  rewardAmount: number;
  isAvailable: boolean;
}

export interface TaskReservationDto {
  id: string;
  taskId: string;
  childId: string;
  isCompleted: boolean;
  completedAt?: string; // ISO
  reservedAt: string; // ISO
}

export interface ChildAllowanceSummaryDto {
  childId: string;
  month: number;
  year: number;
  baseAllowance: number;
  bonusTotal: number;
  total: number; // base + bonuses
}


