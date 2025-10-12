import { bonusTasksFixture, choresFixture, reservationsFixture, usersFixture } from './fixtures';
import type {
  BonusTaskDto,
  ChoreDto,
  TaskReservationDto,
  UserDto,
  ChildAllowanceSummaryDto,
} from './types';

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export class InMemoryStore {
  private users: UserDto[] = deepClone(usersFixture);
  private chores: ChoreDto[] = deepClone(choresFixture);
  private bonusTasks: BonusTaskDto[] = deepClone(bonusTasksFixture);
  private reservations: TaskReservationDto[] = deepClone(reservationsFixture);
  private idCounter = 10000;

  private generateId(): string {
    this.idCounter += 1;
    return String(this.idCounter);
  }
  private idSequence: number = 100000;

  getUsers(): UserDto[] {
    return deepClone(this.users);
  }

  getChildren(): UserDto[] {
    return this.users.filter((u) => u.role === 'child').map(deepClone);
  }

  getPendingApprovals(): { type: 'chore' | 'bonus'; id: string; title: string; childId: string; rewardAmount?: number }[] {
    // With trust-based flow, there are no approvals. Keep method for compatibility and return empty.
    return [];
  }

  getMonthlySummaries(month: number, year: number): { childId: string; baseAllowance: number; bonusTotal: number; total: number }[] {
    return this.getChildren().map((child) => {
      const summary = this.calculateChildAllowance(child.id, month, year);
      return {
        childId: child.id,
        baseAllowance: summary?.baseAllowance ?? 0,
        bonusTotal: summary?.bonusTotal ?? 0,
        total: summary?.total ?? 0,
      };
    });
  }

  getChildChores(childId: string, month: number, year: number): ChoreDto[] {
    return this.chores.filter(
      (c) => c.childId === childId && c.month === month && c.year === year,
    ).map(deepClone);
  }

  getAvailableBonusTasks(): BonusTaskDto[] {
    return this.bonusTasks.filter((t) => t.isAvailable).map(deepClone);
  }

  getReservationsByChild(childId: string): TaskReservationDto[] {
    return this.reservations.filter((r) => r.childId === childId).map(deepClone);
  }

  getBonusTaskById(taskId: string): BonusTaskDto | null {
    const task = this.bonusTasks.find((t) => t.id === taskId);
    return task ? deepClone(task) : null;
  }

  reserveTask(taskId: string, childId: string): TaskReservationDto | null {
    const task = this.bonusTasks.find((t) => t.id === taskId);
    if (!task || !task.isAvailable) return null;
    // prevent double reservation for the same task
    const alreadyReserved = this.reservations.some((r) => r.taskId === taskId);
    if (alreadyReserved) return null;
    task.isAvailable = false;
    const reservation: TaskReservationDto = {
      id: `${taskId}:${childId}`,
      taskId,
      childId,
      isCompleted: false,
      reservedAt: new Date().toISOString(),
    };
    this.reservations.push(reservation);
    return deepClone(reservation);
  }

  completeReservation(reservationId: string): TaskReservationDto | null {
    const res = this.reservations.find((r) => r.id === reservationId);
    if (!res) return null;
    res.isCompleted = true;
    res.completedAt = new Date().toISOString();
    return deepClone(res);
  }

  // Approvals removed in trust-based flow

  completeChore(choreId: string): ChoreDto | null {
    const chore = this.chores.find((c) => c.id === choreId);
    if (!chore) return null;
    chore.isCompleted = true;
    chore.completedAt = new Date().toISOString();
    return deepClone(chore);
  }

  calculateChildAllowance(childId: string, month: number, year: number): ChildAllowanceSummaryDto | null {
    const child = this.users.find((u) => u.id === childId && u.role === 'child');
    if (!child) return null;
    // Sum completed bonus tasks for the given month/year
    const bonusTotal = this.reservations.reduce((sum, r) => {
      if (r.childId !== childId || !r.isCompleted) return sum;
      if (!r.completedAt) return sum;
      const completedDate = new Date(r.completedAt);
      const completedMonth = completedDate.getMonth() + 1;
      const completedYear = completedDate.getFullYear();
      if (completedMonth !== month || completedYear !== year) return sum;
      const task = this.bonusTasks.find((t) => t.id === r.taskId);
      return sum + (task?.rewardAmount ?? 0);
    }, 0);
    // Base allowance is earned only when ALL monthly chores are completed
    const childChores = this.getChildChores(childId, month, year);
    const allChoresCompleted = childChores.length > 0 && childChores.every((c) => c.isCompleted);
    const baseAllowance = allChoresCompleted ? child.monthlyAllowance : 0;
    return {
      childId,
      month,
      year,
      baseAllowance,
      bonusTotal,
      total: baseAllowance + bonusTotal,
    };
  }

  addChoresForAllChildren(title: string, description: string | undefined, month: number, year: number): ChoreDto[] {
    const children = this.getChildren();
    const created: ChoreDto[] = [];
    for (const child of children) {
      const newChore: ChoreDto = {
        id: `chore-${this.idSequence++}`,
        childId: child.id,
        title,
        description,
        isCompleted: false,
        month,
        year,
      };
      this.chores.push(newChore);
      created.push(deepClone(newChore));
    }
    return created;
  }

  // Parent CRUD — Chores
  createChore(input: {
    childId: string;
    title: string;
    description?: string;
    month: number;
    year: number;
  }): ChoreDto | null {
    const child = this.users.find((u) => u.id === input.childId && u.role === 'child');
    if (!child) return null;
    const chore: ChoreDto = {
      id: this.generateId(),
      childId: input.childId,
      title: input.title,
      description: input.description,
      isCompleted: false,
      month: input.month,
      year: input.year,
    };
    this.chores.push(chore);
    return deepClone(chore);
  }

  updateChore(choreId: string, updates: Partial<Pick<ChoreDto, 'title' | 'description' | 'isCompleted'>>): ChoreDto | null {
    const chore = this.chores.find((c) => c.id === choreId);
    if (!chore) return null;
    if (updates.title !== undefined) chore.title = updates.title;
    if (updates.description !== undefined) chore.description = updates.description;
    if (updates.isCompleted !== undefined) {
      chore.isCompleted = updates.isCompleted;
      chore.completedAt = updates.isCompleted ? new Date().toISOString() : undefined;
    }
    return deepClone(chore);
  }

  deleteChore(choreId: string): boolean {
    const before = this.chores.length;
    this.chores = this.chores.filter((c) => c.id !== choreId);
    return this.chores.length !== before;
  }

  // Parent CRUD — Bonus Tasks
  createBonusTask(input: {
    createdBy: string;
    title: string;
    description?: string;
    rewardAmount: number;
  }): BonusTaskDto | null {
    const parent = this.users.find((u) => u.id === input.createdBy && u.role === 'parent');
    if (!parent) return null;
    const task: BonusTaskDto = {
      id: this.generateId(),
      createdBy: input.createdBy,
      title: input.title,
      description: input.description,
      rewardAmount: input.rewardAmount,
      isAvailable: true,
    };
    this.bonusTasks.push(task);
    return deepClone(task);
  }

  updateBonusTask(taskId: string, updates: Partial<Pick<BonusTaskDto, 'title' | 'description' | 'rewardAmount' | 'isAvailable'>>): BonusTaskDto | null {
    const task = this.bonusTasks.find((t) => t.id === taskId);
    if (!task) return null;
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.rewardAmount !== undefined) task.rewardAmount = updates.rewardAmount;
    if (updates.isAvailable !== undefined) task.isAvailable = updates.isAvailable;
    return deepClone(task);
  }

  deleteBonusTask(taskId: string): boolean {
    // Also remove any uncompleted reservations for this task
    this.reservations = this.reservations.filter((r) => r.taskId !== taskId);
    const before = this.bonusTasks.length;
    this.bonusTasks = this.bonusTasks.filter((t) => t.id !== taskId);
    return this.bonusTasks.length !== before;
  }
}

export const store = new InMemoryStore();


