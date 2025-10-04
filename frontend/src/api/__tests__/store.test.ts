import { InMemoryStore } from '../store';
import { usersFixture, choresFixture, bonusTasksFixture, reservationsFixture } from '../fixtures';

describe('InMemoryStore', () => {
  let store: InMemoryStore;

  beforeEach(() => {
    store = new InMemoryStore();
  });

  describe('getChildChores', () => {
    it('should return chores for a specific child and month/year', () => {
      const childId = usersFixture[1].id; // Sam
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const chores = store.getChildChores(childId, month, year);

      expect(chores).toHaveLength(5); // Sam has 5 chores
      expect(chores.every(chore => chore.childId === childId)).toBe(true);
      expect(chores.every(chore => chore.month === month && chore.year === year)).toBe(true);
    });

    it('should return empty array for child with no chores', () => {
      const nonExistentChildId = 'non-existent';
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const chores = store.getChildChores(nonExistentChildId, month, year);

      expect(chores).toHaveLength(0);
    });

    it('should return empty array for different month/year', () => {
      const childId = usersFixture[1].id; // Sam
      const month = 12; // Different month
      const year = 2023; // Different year

      const chores = store.getChildChores(childId, month, year);

      expect(chores).toHaveLength(0);
    });
  });

  describe('getAvailableBonusTasks', () => {
    it('should return only available bonus tasks', () => {
      const tasks = store.getAvailableBonusTasks();

      expect(tasks).toHaveLength(6); // 6 tasks are available initially
      expect(tasks.every(task => task.isAvailable)).toBe(true);
    });

    it('should return empty array when no tasks are available', () => {
      // Reserve all available tasks to make them unavailable
      const childId = usersFixture[1].id;
      const availableTasks = store.getAvailableBonusTasks();
      
      // Reserve all available tasks
      availableTasks.forEach(task => {
        store.reserveTask(task.id, childId);
      });

      const tasks = store.getAvailableBonusTasks();

      expect(tasks).toHaveLength(0);
    });
  });

  describe('getReservationsByChild', () => {
    it('should return reservations for a specific child', () => {
      const childId = usersFixture[1].id; // Sam
      
      // Create a reservation for an available task
      const taskId = bonusTasksFixture[4].id; // Use an available task (index 4 should be available)
      store.reserveTask(taskId, childId);

      const reservations = store.getReservationsByChild(childId);

      expect(reservations).toHaveLength(3); // Sam has 2 reservations in seed data + 1 created in test
      expect(reservations[0].childId).toBe(childId);
      expect(reservations.some(r => r.taskId === taskId)).toBe(true);
    });

    it('should return empty array for child with no reservations', () => {
      const childId = usersFixture[2].id; // Riley

      const reservations = store.getReservationsByChild(childId);

      expect(reservations).toHaveLength(2); // Riley has 2 reservations in seed data
    });
  });

  describe('reserveTask', () => {
    it('should successfully reserve an available task', () => {
      const availableTasks = store.getAvailableBonusTasks();
      const taskId = availableTasks[0].id; // First available task
      const childId = usersFixture[1].id;

      const reservation = store.reserveTask(taskId, childId);

      expect(reservation).not.toBeNull();
      expect(reservation?.taskId).toBe(taskId);
      expect(reservation?.childId).toBe(childId);
      expect(reservation?.isCompleted).toBe(false);
      expect(reservation?.reservedAt).toBeDefined();
    });

    it('should return null for non-existent task', () => {
      const taskId = 'non-existent';
      const childId = usersFixture[1].id;

      const reservation = store.reserveTask(taskId, childId);

      expect(reservation).toBeNull();
    });

    it('should return null for already reserved task', () => {
      const availableTasks = store.getAvailableBonusTasks();
      const taskId = availableTasks[0].id; // First available task
      const childId = usersFixture[1].id;

      // First reservation should succeed
      const firstReservation = store.reserveTask(taskId, childId);
      expect(firstReservation).not.toBeNull();

      // Second reservation should fail
      const secondReservation = store.reserveTask(taskId, childId);
      expect(secondReservation).toBeNull();
    });

    it('should make task unavailable after reservation', () => {
      const availableTasks = store.getAvailableBonusTasks();
      const taskId = availableTasks[0].id; // First available task
      const childId = usersFixture[1].id;

      store.reserveTask(taskId, childId);

      const updatedAvailableTasks = store.getAvailableBonusTasks();
      expect(updatedAvailableTasks.find(task => task.id === taskId)).toBeUndefined();
    });
  });

  describe('completeReservation', () => {
    it('should successfully complete a reservation', () => {
      const availableTasks = store.getAvailableBonusTasks();
      const taskId = availableTasks[0].id; // First available task
      const childId = usersFixture[1].id;

      // First reserve the task
      const reservation = store.reserveTask(taskId, childId);
      expect(reservation).not.toBeNull();

      // Then complete it
      const completedReservation = store.completeReservation(reservation!.id);

      expect(completedReservation).not.toBeNull();
      expect(completedReservation?.isCompleted).toBe(true);
      expect(completedReservation?.completedAt).toBeDefined();
    });

    it('should return null for non-existent reservation', () => {
      const reservationId = 'non-existent';

      const result = store.completeReservation(reservationId);

      expect(result).toBeNull();
    });
  });

  describe('completeChore', () => {
    it('should successfully complete a chore', () => {
      const choreId = choresFixture[0].id; // Sam's first chore

      const completedChore = store.completeChore(choreId);

      expect(completedChore).not.toBeNull();
      expect(completedChore?.isCompleted).toBe(true);
      expect(completedChore?.completedAt).toBeDefined();
    });

    it('should return null for non-existent chore', () => {
      const choreId = 'non-existent';

      const result = store.completeChore(choreId);

      expect(result).toBeNull();
    });
  });

  describe('calculateChildAllowance', () => {
    it('should calculate allowance with base allowance and existing completed bonuses', () => {
      const childId = usersFixture[1].id; // Sam
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const summary = store.calculateChildAllowance(childId, month, year);

      expect(summary).not.toBeNull();
      expect(summary?.childId).toBe(childId);
      expect(summary?.baseAllowance).toBe(20); // Sam's monthly allowance
      expect(summary?.bonusTotal).toBe(7); // Sam has completed bonuses totaling $7 (5 + 2)
      expect(summary?.total).toBe(27);
    });

    it('should calculate allowance with additional completed bonus tasks (no approvals)', () => {
      const childId = usersFixture[1].id; // Sam
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      // Reserve and complete an available task (trust-based flow)
      const availableTasks = store.getAvailableBonusTasks();
      const taskId = availableTasks[0].id; // First available task
      const reservation = store.reserveTask(taskId, childId);
      expect(reservation).not.toBeNull();

      const completedReservation = store.completeReservation(reservation!.id);
      expect(completedReservation).not.toBeNull();

      const summary = store.calculateChildAllowance(childId, month, year);

      expect(summary).not.toBeNull();
      expect(summary?.baseAllowance).toBe(20);
      expect(summary?.bonusTotal).toBe(7 + availableTasks[0].rewardAmount); // Existing completed ($7) + new bonus
      expect(summary?.total).toBe(20 + 7 + availableTasks[0].rewardAmount);
    });

    it('should count completed bonus tasks without approvals', () => {
      const childId = usersFixture[1].id; // Sam
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      // Reserve and complete an available task
      const availableTasks = store.getAvailableBonusTasks();
      const taskId = availableTasks[0].id; // First available task
      const reservation = store.reserveTask(taskId, childId);
      expect(reservation).not.toBeNull();

      const completedReservation = store.completeReservation(reservation!.id);
      expect(completedReservation).not.toBeNull();

      const summary = store.calculateChildAllowance(childId, month, year);

      expect(summary).not.toBeNull();
      expect(summary?.baseAllowance).toBe(20);
      expect(summary?.bonusTotal).toBe(7 + availableTasks[0].rewardAmount);
      expect(summary?.total).toBe(20 + 7 + availableTasks[0].rewardAmount);
    });

    it('should return null for non-existent child', () => {
      const childId = 'non-existent';
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const summary = store.calculateChildAllowance(childId, month, year);

      expect(summary).toBeNull();
    });

    it('should return null for parent user', () => {
      const parentId = usersFixture[0].id; // Parent
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const summary = store.calculateChildAllowance(parentId, month, year);

      expect(summary).toBeNull();
    });
  });

  describe('data isolation', () => {
    it('should not mutate original fixture data', () => {
      const originalChores = [...choresFixture];
      const originalTasks = [...bonusTasksFixture];
      const originalReservations = [...reservationsFixture];

      // Perform operations that would mutate data
      const childId = usersFixture[1].id;
      store.completeChore(choresFixture[0].id);
      store.reserveTask(bonusTasksFixture[0].id, childId);

      // Check that original fixtures are unchanged
      expect(choresFixture).toEqual(originalChores);
      expect(bonusTasksFixture).toEqual(originalTasks);
      expect(reservationsFixture).toEqual(originalReservations);
    });

    it('should return deep clones of data', () => {
      const childId = usersFixture[1].id;
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const chores = store.getChildChores(childId, month, year);
      const tasks = store.getAvailableBonusTasks();
      const reservations = store.getReservationsByChild(childId);

      // Modifying returned data should not affect store
      if (chores.length > 0) {
        chores[0].title = 'Modified Title';
        const choresAgain = store.getChildChores(childId, month, year);
        expect(choresAgain[0].title).not.toBe('Modified Title');
      }

      if (tasks.length > 0) {
        tasks[0].title = 'Modified Task';
        const tasksAgain = store.getAvailableBonusTasks();
        expect(tasksAgain[0].title).not.toBe('Modified Task');
      }
    });
  });
});
