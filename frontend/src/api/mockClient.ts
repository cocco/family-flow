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
};

export type MockClient = typeof mockClient;


