import { mockClient } from '../mockClient';
import { usersFixture, choresFixture, bonusTasksFixture } from '../fixtures';
import type { UserDto } from '../types';

// Mock the store to avoid side effects between tests
jest.mock('../store', () => {
  const originalModule = jest.requireActual('../store');
  return {
    ...originalModule,
    store: {
      getChildChores: jest.fn(),
      getAvailableBonusTasks: jest.fn(),
      getReservationsByChild: jest.fn(),
      reserveTask: jest.fn(),
      completeReservation: jest.fn(),
      completeChore: jest.fn(),
      calculateChildAllowance: jest.fn(),
    },
  };
});

import { store } from '../store';

const mockStore = store as jest.Mocked<typeof store>;

describe('mockClient', () => {
  const childUser: UserDto = usersFixture[1]; // Sam
  const parentUser: UserDto = usersFixture[0]; // Alex (Parent)
  const otherChildUser: UserDto = usersFixture[2]; // Riley

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should return current user when authenticated', async () => {
      const result = await mockClient.getMe({ currentUser: childUser });

      expect('data' in result).toBe(true);
      if ('data' in result) {
        expect(result.data).toEqual(childUser);
      }
    });

    it('should return error when not authenticated', async () => {
      const result = await mockClient.getMe({ currentUser: null });

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('UNAUTHENTICATED');
        expect(result.error.message).toBe('You must be logged in');
      }
    });
  });

  describe('listChoresByChild', () => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    beforeEach(() => {
      mockStore.getChildChores.mockReturnValue(choresFixture.filter(c => c.childId === childUser.id));
    });

    it('should return chores for authenticated child', async () => {
      const result = await mockClient.listChoresByChild(
        { currentUser: childUser },
        childUser.id,
        month,
        year
      );

      expect('data' in result).toBe(true);
      if ('data' in result) {
        expect(result.data).toHaveLength(5); // Sam has 5 chores
        expect(mockStore.getChildChores).toHaveBeenCalledWith(childUser.id, month, year);
      }
    });

    it('should return error when not authenticated', async () => {
      const result = await mockClient.listChoresByChild(
        { currentUser: null },
        childUser.id,
        month,
        year
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should return error when not a child', async () => {
      const result = await mockClient.listChoresByChild(
        { currentUser: parentUser },
        childUser.id,
        month,
        year
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('FORBIDDEN');
        expect(result.error.message).toBe('Only the child can view their chores');
      }
    });

    it('should return error when child tries to view another child\'s chores', async () => {
      const result = await mockClient.listChoresByChild(
        { currentUser: childUser },
        otherChildUser.id, // Different child
        month,
        year
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('FORBIDDEN');
        expect(result.error.message).toBe('Only the child can view their chores');
      }
    });
  });

  describe('listAvailableBonusTasks', () => {
    beforeEach(() => {
      // Mock to return only available tasks (6 out of 10 total)
      const availableTasks = bonusTasksFixture.filter(task => task.isAvailable);
      mockStore.getAvailableBonusTasks.mockReturnValue(availableTasks);
    });

    it('should return available tasks for authenticated child', async () => {
      const result = await mockClient.listAvailableBonusTasks({ currentUser: childUser });

      expect('data' in result).toBe(true);
      if ('data' in result) {
        expect(result.data).toHaveLength(6); // 6 available tasks (4 are reserved in seed data)
        expect(mockStore.getAvailableBonusTasks).toHaveBeenCalled();
      }
    });

    it('should return error when not authenticated', async () => {
      const result = await mockClient.listAvailableBonusTasks({ currentUser: null });

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should return error when not a child', async () => {
      const result = await mockClient.listAvailableBonusTasks({ currentUser: parentUser });

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('FORBIDDEN');
        expect(result.error.message).toBe('Only children can view bonus tasks');
      }
    });

    it('should occasionally return server error', async () => {
      // Mock Math.random to return a value that triggers the 5% error chance
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.01); // Less than 0.05

      const result = await mockClient.listAvailableBonusTasks({ currentUser: childUser });

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('INTERNAL');
        expect(result.error.message).toBe('Temporary server issue, try again');
      }

      Math.random = originalRandom;
    });
  });

  describe('reserveBonusTask', () => {
    const taskId = bonusTasksFixture[0].id;

    beforeEach(() => {
      mockStore.reserveTask.mockReturnValue({
        id: `${taskId}:${childUser.id}`,
        taskId,
        childId: childUser.id,
        isCompleted: false,
        reservedAt: new Date().toISOString(),
      });
    });

    it('should successfully reserve task for authenticated child', async () => {
      const result = await mockClient.reserveBonusTask({ currentUser: childUser }, taskId);

      expect('data' in result).toBe(true);
      if ('data' in result) {
        expect(result.data.taskId).toBe(taskId);
        expect(result.data.childId).toBe(childUser.id);
        expect(mockStore.reserveTask).toHaveBeenCalledWith(taskId, childUser.id);
      }
    });

    it('should return error when not authenticated', async () => {
      const result = await mockClient.reserveBonusTask({ currentUser: null }, taskId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should return error when not a child', async () => {
      const result = await mockClient.reserveBonusTask({ currentUser: parentUser }, taskId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('FORBIDDEN');
        expect(result.error.message).toBe('Only children can reserve tasks');
      }
    });

    it('should return error when task is not available', async () => {
      mockStore.reserveTask.mockReturnValue(null);

      const result = await mockClient.reserveBonusTask({ currentUser: childUser }, taskId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('CONFLICT');
        expect(result.error.message).toBe('Task is no longer available or already reserved');
      }
    });
  });

  describe('completeChore', () => {
    const choreId = choresFixture[0].id;

    beforeEach(() => {
      mockStore.completeChore.mockReturnValue({
        ...choresFixture[0],
        isCompleted: true,
        completedAt: new Date().toISOString(),
      });
    });

    it('should successfully complete chore for authenticated child', async () => {
      const result = await mockClient.completeChore({ currentUser: childUser }, choreId);

      expect('data' in result).toBe(true);
      if ('data' in result) {
        expect(result.data.isCompleted).toBe(true);
        expect(result.data.completedAt).toBeDefined();
        expect(mockStore.completeChore).toHaveBeenCalledWith(choreId);
      }
    });

    it('should return error when not authenticated', async () => {
      const result = await mockClient.completeChore({ currentUser: null }, choreId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should return error when not a child', async () => {
      const result = await mockClient.completeChore({ currentUser: parentUser }, choreId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('FORBIDDEN');
        expect(result.error.message).toBe('Only children can complete chores');
      }
    });

    it('should return error when chore not found', async () => {
      mockStore.completeChore.mockReturnValue(null);

      const result = await mockClient.completeChore({ currentUser: childUser }, choreId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('NOT_FOUND');
        expect(result.error.message).toBe('Chore not found');
      }
    });
  });

  describe('completeReservation', () => {
    const reservationId = 'reservation-1';

    beforeEach(() => {
      mockStore.completeReservation.mockReturnValue({
        id: reservationId,
        taskId: bonusTasksFixture[0].id,
        childId: childUser.id,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        reservedAt: new Date().toISOString(),
      });
    });

    it('should successfully complete reservation for authenticated child', async () => {
      const result = await mockClient.completeReservation({ currentUser: childUser }, reservationId);

      expect('data' in result).toBe(true);
      if ('data' in result) {
        expect(result.data.isCompleted).toBe(true);
        expect(result.data.completedAt).toBeDefined();
        expect(mockStore.completeReservation).toHaveBeenCalledWith(reservationId);
      }
    });

    it('should return error when not authenticated', async () => {
      const result = await mockClient.completeReservation({ currentUser: null }, reservationId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should return error when not a child', async () => {
      const result = await mockClient.completeReservation({ currentUser: parentUser }, reservationId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('FORBIDDEN');
        expect(result.error.message).toBe('Only children can complete reserved tasks');
      }
    });

    it('should return error when reservation not found', async () => {
      mockStore.completeReservation.mockReturnValue(null);

      const result = await mockClient.completeReservation({ currentUser: childUser }, reservationId);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('NOT_FOUND');
        expect(result.error.message).toBe('Reservation not found');
      }
    });
  });

  describe('getAllowanceSummary', () => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    beforeEach(() => {
      mockStore.calculateChildAllowance.mockReturnValue({
        childId: childUser.id,
        month,
        year,
        baseAllowance: 20,
        bonusTotal: 5,
        total: 25,
      });
    });

    it('should return allowance summary for authenticated child', async () => {
      const result = await mockClient.getAllowanceSummary(
        { currentUser: childUser },
        childUser.id,
        month,
        year
      );

      expect('data' in result).toBe(true);
      if ('data' in result) {
        expect(result.data.childId).toBe(childUser.id);
        expect(result.data.baseAllowance).toBe(20);
        expect(result.data.bonusTotal).toBe(5);
        expect(result.data.total).toBe(25);
        expect(mockStore.calculateChildAllowance).toHaveBeenCalledWith(childUser.id, month, year);
      }
    });

    it('should return error when not authenticated', async () => {
      const result = await mockClient.getAllowanceSummary(
        { currentUser: null },
        childUser.id,
        month,
        year
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('UNAUTHENTICATED');
      }
    });

    it('should return error when not a child', async () => {
      const result = await mockClient.getAllowanceSummary(
        { currentUser: parentUser },
        childUser.id,
        month,
        year
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('FORBIDDEN');
        expect(result.error.message).toBe('Only the child can view their allowance');
      }
    });

    it('should return error when child tries to view another child\'s allowance', async () => {
      const result = await mockClient.getAllowanceSummary(
        { currentUser: childUser },
        otherChildUser.id, // Different child
        month,
        year
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('FORBIDDEN');
        expect(result.error.message).toBe('Only the child can view their allowance');
      }
    });

    it('should return error when child not found', async () => {
      mockStore.calculateChildAllowance.mockReturnValue(null);

      const result = await mockClient.getAllowanceSummary(
        { currentUser: childUser },
        childUser.id,
        month,
        year
      );

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.code).toBe('NOT_FOUND');
        expect(result.error.message).toBe('Child not found');
      }
    });
  });
});
