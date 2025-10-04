import { mockClient } from '../mockClient';
import { store } from '../store';
import { usersFixture } from '../fixtures';
import type { UserDto } from '../types';

describe('Parent CRUD (mock services) integration', () => {
  const parentUser: UserDto = usersFixture[0];
  const childUser: UserDto = usersFixture[1];
  const ctxParent = { currentUser: parentUser };
  const ctxChild = { currentUser: childUser };
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  beforeEach(() => {
    // Reset the store by creating a new instance is not exposed; rely on seed state and unique IDs
    // Tests avoid assuming exact counts beyond presence checks
  });

  describe('Chores CRUD', () => {
    it('parent creates a chore; child can list and see it', async () => {
      const createRes = await mockClient.createChore(ctxParent, {
        childId: childUser.id,
        title: 'Test chore from parent',
        description: 'Ensure visibility to child',
        month,
        year,
      });
      expect('data' in createRes).toBe(true);
      if ('data' in createRes) {
        expect(createRes.data.title).toBe('Test chore from parent');
      }

      const listRes = await mockClient.listChoresByChild(ctxChild, childUser.id, month, year);
      expect('data' in listRes).toBe(true);
      if ('data' in listRes) {
        expect(listRes.data.some((c) => c.title === 'Test chore from parent')).toBe(true);
      }
    });

    it('child cannot create a chore (forbidden)', async () => {
      const res = await mockClient.createChore(ctxChild as any, {
        childId: childUser.id,
        title: 'Should fail',
        month,
        year,
      } as any);
      expect('error' in res).toBe(true);
      if ('error' in res) expect(res.error.code).toBe('FORBIDDEN');
    });

    it('parent updates and deletes a chore', async () => {
      // Create first
      const created = await mockClient.createChore(ctxParent, {
        childId: childUser.id,
        title: 'Updatable chore',
        month,
        year,
      } as any);
      if (!('data' in created)) throw new Error('Failed to create chore');

      const choreId = created.data.id;

      // Update title
      const updated = await mockClient.updateChore(ctxParent, choreId, { title: 'Updated title' });
      expect('data' in updated).toBe(true);
      if ('data' in updated) expect(updated.data.title).toBe('Updated title');

      // Delete chore
      const deleted = await mockClient.deleteChore(ctxParent, choreId);
      expect('data' in deleted).toBe(true);

      // Delete again => not found
      const deletedAgain = await mockClient.deleteChore(ctxParent, choreId);
      expect('error' in deletedAgain).toBe(true);
      if ('error' in deletedAgain) expect(deletedAgain.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Bonus Tasks CRUD', () => {
    it('parent creates, updates, deletes a bonus task', async () => {
      const created = await mockClient.createBonusTask(ctxParent, {
        title: 'Parent bonus',
        description: 'Test bonus',
        rewardAmount: 3,
      });
      expect('data' in created).toBe(true);
      if (!('data' in created)) throw new Error('createBonusTask failed');

      const taskId = created.data.id;

      const updated = await mockClient.updateBonusTask(ctxParent, taskId, { rewardAmount: 4 });
      expect('data' in updated).toBe(true);
      if ('data' in updated) expect(updated.data.rewardAmount).toBe(4);

      const del = await mockClient.deleteBonusTask(ctxParent, taskId);
      expect('data' in del).toBe(true);

      const delAgain = await mockClient.deleteBonusTask(ctxParent, taskId);
      expect('error' in delAgain).toBe(true);
      if ('error' in delAgain) expect(delAgain.error.code).toBe('NOT_FOUND');
    });

    it('child cannot create bonus task (forbidden)', async () => {
      const res = await mockClient.createBonusTask(ctxChild as any, {
        title: 'Nope',
        rewardAmount: 1,
      } as any);
      expect('error' in res).toBe(true);
      if ('error' in res) expect(res.error.code).toBe('FORBIDDEN');
    });
  });
});



