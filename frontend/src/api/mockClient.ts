import { store } from './store';
import { delay, chance, error } from './sim';
import type {
  ApiResult,
  BonusTaskDto,
  ChoreDto,
  TaskReservationDto,
  ChildAllowanceSummaryDto,
  UserDto,
  UserRole,
} from './types';

interface RequestContext {
  currentUser: UserDto | null;
}

function requireAuth(ctx: RequestContext): UserDto | null {
  return ctx.currentUser;
}

function requireRole(ctx: RequestContext, role: UserRole): boolean {
  return ctx.currentUser?.role === role;
}

export const mockClient = {
  async getMe(ctx: RequestContext): Promise<ApiResult<UserDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    return { data: ctx.currentUser as UserDto };
  },

  async listChoresByChild(
    ctx: RequestContext,
    childId: string,
    month: number,
    year: number,
  ): Promise<ApiResult<ChoreDto[]>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'child') || ctx.currentUser?.id !== childId) {
      return error('FORBIDDEN', 'Only the child can view their chores');
    }
    const chores = store.getChildChores(childId, month, year);
    return { data: chores };
  },

  async listAvailableBonusTasks(ctx: RequestContext): Promise<ApiResult<BonusTaskDto[]>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'child')) return error('FORBIDDEN', 'Only children can view bonus tasks');
    const tasks = store.getAvailableBonusTasks();
    // Simulate occasional server error
    if (chance(0.05)) return error('INTERNAL', 'Temporary server issue, try again');
    return { data: tasks };
  },

  async listReservationsByChild(
    ctx: RequestContext,
    childId: string,
  ): Promise<ApiResult<TaskReservationDto[]>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'child') || ctx.currentUser?.id !== childId) {
      return error('FORBIDDEN', 'Only the child can view their reservations');
    }
    return { data: store.getReservationsByChild(childId) };
  },

  async getBonusTaskById(
    ctx: RequestContext,
    taskId: string,
  ): Promise<ApiResult<BonusTaskDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    const task = store.getBonusTaskById(taskId);
    if (!task) return error('NOT_FOUND', 'Bonus task not found');
    return { data: task };
  },

  async reserveBonusTask(
    ctx: RequestContext,
    taskId: string,
  ): Promise<ApiResult<TaskReservationDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'child')) return error('FORBIDDEN', 'Only children can reserve tasks');
    const res = store.reserveTask(taskId, ctx.currentUser!.id);
    if (!res) return error('CONFLICT', 'Task is no longer available or already reserved');
    return { data: res };
  },

  async completeChore(ctx: RequestContext, choreId: string): Promise<ApiResult<ChoreDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'child')) return error('FORBIDDEN', 'Only children can complete chores');
    const updated = store.completeChore(choreId);
    if (!updated) return error('NOT_FOUND', 'Chore not found');
    return { data: updated };
  },

  async completeReservation(
    ctx: RequestContext,
    reservationId: string,
  ): Promise<ApiResult<TaskReservationDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'child')) return error('FORBIDDEN', 'Only children can complete reserved tasks');
    const updated = store.completeReservation(reservationId);
    if (!updated) return error('NOT_FOUND', 'Reservation not found');
    return { data: updated };
  },

  async getAllowanceSummary(
    ctx: RequestContext,
    childId: string,
    month: number,
    year: number,
  ): Promise<ApiResult<ChildAllowanceSummaryDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'child') || ctx.currentUser?.id !== childId) {
      return error('FORBIDDEN', 'Only the child can view their allowance');
    }
    const summary = store.calculateChildAllowance(childId, month, year);
    if (!summary) return error('NOT_FOUND', 'Child not found');
    return { data: summary };
  },

  // Parent endpoints (mocked)
  async listFamily(ctx: RequestContext): Promise<ApiResult<UserDto[]>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'parent')) return error('FORBIDDEN', 'Only parents can view family');
    return { data: store.getUsers() };
  },

  async listMonthlySummaries(
    ctx: RequestContext,
    month: number,
    year: number,
  ): Promise<ApiResult<{ childId: string; baseAllowance: number; bonusTotal: number; total: number }[]>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'parent')) return error('FORBIDDEN', 'Only parents can view summaries');
    return { data: store.getMonthlySummaries(month, year) };
  },

  // Parent CRUD — Chores
  async createChore(
    ctx: RequestContext,
    input: { childId: string; title: string; description?: string; month: number; year: number },
  ): Promise<ApiResult<ChoreDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'parent')) return error('FORBIDDEN', 'Only parents can create chores');
    const created = store.createChore(input);
    if (!created) return error('BAD_REQUEST', 'Invalid child for chore');
    return { data: created };
  },

  async updateChore(
    ctx: RequestContext,
    choreId: string,
    updates: Partial<Pick<ChoreDto, 'title' | 'description' | 'isCompleted'>>,
  ): Promise<ApiResult<ChoreDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'parent')) return error('FORBIDDEN', 'Only parents can update chores');
    const updated = store.updateChore(choreId, updates);
    if (!updated) return error('NOT_FOUND', 'Chore not found');
    return { data: updated };
  },

  async deleteChore(
    ctx: RequestContext,
    choreId: string,
  ): Promise<ApiResult<{ id: string }>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'parent')) return error('FORBIDDEN', 'Only parents can delete chores');
    const deleted = store.deleteChore(choreId);
    if (!deleted) return error('NOT_FOUND', 'Chore not found');
    return { data: { id: choreId } };
  },

  // Parent CRUD — Bonus Tasks
  async createBonusTask(
    ctx: RequestContext,
    input: { title: string; description?: string; rewardAmount: number },
  ): Promise<ApiResult<BonusTaskDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'parent')) return error('FORBIDDEN', 'Only parents can create bonus tasks');
    if (input.rewardAmount <= 0) return error('BAD_REQUEST', 'Reward amount must be positive');
    const created = store.createBonusTask({ createdBy: ctx.currentUser!.id, ...input });
    if (!created) return error('BAD_REQUEST', 'Invalid parent for bonus task');
    return { data: created };
  },

  async updateBonusTask(
    ctx: RequestContext,
    taskId: string,
    updates: Partial<Pick<BonusTaskDto, 'title' | 'description' | 'rewardAmount' | 'isAvailable'>>,
  ): Promise<ApiResult<BonusTaskDto>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'parent')) return error('FORBIDDEN', 'Only parents can update bonus tasks');
    const updated = store.updateBonusTask(taskId, updates);
    if (!updated) return error('NOT_FOUND', 'Bonus task not found');
    return { data: updated };
  },

  async deleteBonusTask(
    ctx: RequestContext,
    taskId: string,
  ): Promise<ApiResult<{ id: string }>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'parent')) return error('FORBIDDEN', 'Only parents can delete bonus tasks');
    const deleted = store.deleteBonusTask(taskId);
    if (!deleted) return error('NOT_FOUND', 'Bonus task not found');
    return { data: { id: taskId } };
  },

  async createChoresForAllChildren(
    ctx: RequestContext,
    title: string,
    description: string | undefined,
    month: number,
    year: number,
  ): Promise<ApiResult<ChoreDto[]>> {
    await delay();
    if (!requireAuth(ctx)) return error('UNAUTHENTICATED', 'You must be logged in');
    if (!requireRole(ctx, 'parent')) return error('FORBIDDEN', 'Only parents can create chores');
    if (!title || !title.trim()) return error('INVALID_ARGUMENT', 'Title is required');
    const created = store.addChoresForAllChildren(title.trim(), description?.trim() || undefined, month, year);
    return { data: created };
  },
};

export type MockClient = typeof mockClient;


