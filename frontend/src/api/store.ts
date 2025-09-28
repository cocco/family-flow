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

  getUsers(): UserDto[] {
    return deepClone(this.users);
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

  approveReservation(reservationId: string, approvedBy: string): TaskReservationDto | null {
    const res = this.reservations.find((r) => r.id === reservationId);
    if (!res) return null;
    res.approvedBy = approvedBy;
    res.approvedAt = new Date().toISOString();
    return deepClone(res);
  }

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
    const approvedBonusTotal = this.reservations.reduce((sum, r) => {
      if (r.childId !== childId || !r.approvedAt) return sum;
      const task = this.bonusTasks.find((t) => t.id === r.taskId);
      return sum + (task?.rewardAmount ?? 0);
    }, 0);
    const baseAllowance = child.monthlyAllowance;
    return {
      childId,
      month,
      year,
      baseAllowance,
      approvedBonusTotal,
      total: baseAllowance + approvedBonusTotal,
    };
  }
}

export const store = new InMemoryStore();


