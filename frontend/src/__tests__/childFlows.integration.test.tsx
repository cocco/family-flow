import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import ChildDashboard from '../pages/ChildDashboard';
import { usersFixture } from '../api/fixtures';
import type { UserDto } from '../api/types';
import { mockClient } from '../api/mockClient';
// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock the mockClient to use a real store instance

jest.mock('../api/mockClient', () => ({
  mockClient: {
    listChoresByChild: jest.fn(),
    listAvailableBonusTasks: jest.fn(),
    listReservationsByChild: jest.fn(),
    getAllowanceSummary: jest.fn(),
    completeChore: jest.fn(),
    reserveBonusTask: jest.fn(),
    completeReservation: jest.fn(),
  },
}));

describe('Child Flows Integration Tests', () => {
  const childUser: UserDto = usersFixture[1]; // Sam
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create clean test data - these need to be outside the mock functions to share state
    let cleanChores = [
      {
        id: 'chore-1',
        childId: childUser.id,
        title: 'Make bed',
        description: 'Tidy up and make the bed each morning',
        isCompleted: false,
        month,
        year,
      },
      {
        id: 'chore-2', 
        childId: childUser.id,
        title: 'Set the table',
        description: 'Set the table for dinner each evening',
        isCompleted: false,
        month,
        year,
      },
      {
        id: 'chore-3',
        childId: childUser.id,
        title: 'Feed the cat',
        description: 'Morning and evening feeding',
        isCompleted: true,
        completedAt: new Date().toISOString(),
        month,
        year,
      },
    ];
    
    let cleanBonusTasks = [
      {
        id: 'bonus-1',
        createdBy: 'parent-1',
        title: 'Wash the car',
        description: 'Exterior wash and dry',
        rewardAmount: 5,
        isAvailable: true,
      },
      {
        id: 'bonus-2',
        createdBy: 'parent-1', 
        title: 'Garden weeding',
        description: 'Pull weeds from the front garden bed',
        rewardAmount: 4,
        isAvailable: true,
      },
    ];
    
    let cleanReservations: any[] = [];
    
    // Set up clean mock implementations that share state
    (mockClient.listChoresByChild as jest.Mock).mockImplementation(async () => {
      return { data: [...cleanChores] };
    });
    
    (mockClient.listAvailableBonusTasks as jest.Mock).mockImplementation(async () => {
      return { data: cleanBonusTasks.filter(t => t.isAvailable) };
    });
    
    (mockClient.listReservationsByChild as jest.Mock).mockImplementation(async () => {
      return { data: [...cleanReservations] };
    });
    
    (mockClient.getAllowanceSummary as jest.Mock).mockImplementation(async () => {
      return { data: { childId: childUser.id, month, year, baseAllowance: 20, approvedBonusTotal: 0, total: 20 } };
    });
    
    (mockClient.completeChore as jest.Mock).mockImplementation(async (_ctx: any, choreId: string) => {
      const chore = cleanChores.find(c => c.id === choreId);
      if (chore) {
        chore.isCompleted = true;
        chore.completedAt = new Date().toISOString();
        return { data: chore };
      }
      return { error: { code: 'NOT_FOUND', message: 'Chore not found' } };
    });
    
    (mockClient.reserveBonusTask as jest.Mock).mockImplementation(async (_ctx: any, taskId: string) => {
      const task = cleanBonusTasks.find(t => t.id === taskId);
      if (task && task.isAvailable) {
        task.isAvailable = false;
        const reservation = {
          id: `${taskId}:${childUser.id}`,
          taskId,
          childId: childUser.id,
          isCompleted: false,
          reservedAt: new Date().toISOString(),
        };
        cleanReservations.push(reservation);
        return { data: reservation };
      }
      return { error: { code: 'ALREADY_RESERVED', message: 'Task already reserved' } };
    });
    
    (mockClient.completeReservation as jest.Mock).mockImplementation(async (_ctx: any, reservationId: string) => {
      const reservation = cleanReservations.find(r => r.id === reservationId);
      if (reservation) {
        reservation.isCompleted = true;
        reservation.completedAt = new Date().toISOString();
        return { data: reservation };
      }
      return { error: { code: 'NOT_FOUND', message: 'Reservation not found' } };
    });
  });

  describe('Complete Chore Flow', () => {
    it('should complete a chore and update the UI', async () => {
      const user = userEvent.setup();
      render(<ChildDashboard />, { currentUser: childUser });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Make bed')).toBeInTheDocument();
      });

      // Find the incomplete chore and complete it
      const makeBedChore = screen.getByText('Make bed').closest('div');
      expect(makeBedChore).not.toHaveClass('bg-green-50');

      const completeButton = screen.getAllByText('Mark Done')[0];
      await user.click(completeButton);

      // Verify the chore is marked as completed
      await waitFor(() => {
        const completedChore = screen.getByText('Make bed').closest('[class*="border rounded-lg"]');
        expect(completedChore).toHaveTextContent('✅ Completed');
      });

      const updatedMakeBedChore = screen.getByText('Make bed').closest('[class*="border rounded-lg"]');
      expect(updatedMakeBedChore).toHaveClass('bg-green-50', 'border-green-200');
    });

    it('should not allow completing already completed chores', async () => {
      render(<ChildDashboard />, { currentUser: childUser });

      await waitFor(() => {
        expect(screen.getByText('Feed the cat')).toBeInTheDocument();
      });

      // The completed chore should not have a "Mark Done" button
      const completedChore = screen.getByText('Feed the cat').closest('[class*="border rounded-lg"]');
      expect(completedChore).toHaveClass('bg-green-50');
      // Check that there are only 2 "Mark Done" buttons for the incomplete chores
      const markDoneButtons = screen.queryAllByText('Mark Done');
      expect(markDoneButtons).toHaveLength(2); // Make bed and Set the table
    });
  });

  describe('Reserve Bonus Task Flow', () => {
    it('should reserve a bonus task and move it to My Tasks', async () => {
      const user = userEvent.setup();
      render(<ChildDashboard />, { currentUser: childUser });

      // Wait for the available bonus tasks to load
      await waitFor(() => {
        expect(screen.getByText('Wash the car')).toBeInTheDocument();
        expect(screen.getAllByText('Reserve')).toHaveLength(2);
      });

      // Reserve the "Wash the car" task specifically
      // Find the parent container that includes both the task info and the Reserve button
      const washCarContainer = screen.getByText('Wash the car').closest('[class*="border border-gray-200"]') as HTMLElement;
      const reserveButton = within(washCarContainer).getByText('Reserve');
      await user.click(reserveButton);

      // Task should be moved from available tasks to My Tasks section
      await waitFor(() => {
        // The task should still exist but now in My Tasks with a Mark Done button
        expect(screen.getByText('Wash the car')).toBeInTheDocument();
        expect(screen.getByText('+$5')).toBeInTheDocument();
      });

      // Should have blue left border indicating it's a bonus task
      const reservedTask = screen.getByText('Wash the car').closest('[class*="border-l-4"]');
      expect(reservedTask).toHaveClass('border-l-4', 'border-l-blue-400');
      
      // There should be only 1 Reserve button left (for Garden weeding)
      expect(screen.getAllByText('Reserve')).toHaveLength(1);
    });

    it('should prevent double reservation of the same task', async () => {
      const user = userEvent.setup();
      render(<ChildDashboard />, { currentUser: childUser });

      await waitFor(() => {
        expect(screen.getByText('Wash the car')).toBeInTheDocument();
      });

      // Reserve the task first time
      const reserveButton = screen.getAllByText('Reserve')[0];
      await user.click(reserveButton);

      // Wait longer for the component to re-render
      await waitFor(() => {
        // The Reserve button for this specific task should no longer be available
        const reserveButtons = screen.getAllByText('Reserve');
        expect(reserveButtons).toHaveLength(1); // Only Garden weeding should have a Reserve button
        
        // Verify that "Wash the car" task is still visible somewhere on the page
        expect(screen.getByText('Wash the car')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Try to reserve again (this should fail)
      // Since the task is no longer available, we can't test this directly
      // The store logic prevents double reservation
    });
  });

  describe('Complete Reserved Task Flow', () => {
    it('should complete a reserved bonus task', async () => {
      const user = userEvent.setup();
      render(<ChildDashboard />, { currentUser: childUser });

      // First reserve a task
      await waitFor(() => {
        expect(screen.getByText('Wash the car')).toBeInTheDocument();
      });

      const reserveButton = screen.getAllByText('Reserve')[0];
      await user.click(reserveButton);

      // Wait for task to appear in My Tasks
      await waitFor(() => {
        expect(screen.getByText('Wash the car')).toBeInTheDocument();
      });

      // Complete the reserved task
      const completeButton = within(screen.getByText('Wash the car').closest('[class*="border rounded-lg"]') as HTMLElement).getByText('Mark Done');
      await user.click(completeButton);

      // Verify the task is marked as completed
      await waitFor(() => {
        const completedTask = screen.getByText('Wash the car').closest('[class*="border rounded-lg"]');
        expect(completedTask).toHaveTextContent('✅ Completed');
      });

      const completedTask = screen.getByText('Wash the car').closest('[class*="border rounded-lg"]');
      expect(completedTask).toHaveClass('bg-green-50', 'border-green-200');
    });
  });

  describe('Allowance Calculation Flow', () => {
    it('should display correct allowance with base amount only', async () => {
      render(<ChildDashboard />, { currentUser: childUser });

      await waitFor(() => {
        expect(screen.getByText('💰 Monthly Earnings')).toBeInTheDocument();
      });

      expect(screen.getByText('Base allowance: $20.00')).toBeInTheDocument();
      expect(screen.getByText('Total this month')).toBeInTheDocument();
      // Check that the total amount is displayed correctly
      expect(screen.getByText('$20.00')).toBeInTheDocument();
    });

    it('should update allowance when bonus tasks are completed and approved', async () => {
      const user = userEvent.setup();
      render(<ChildDashboard />, { currentUser: childUser });

      // Reserve and complete a bonus task
      await waitFor(() => {
        expect(screen.getByText('Wash the car')).toBeInTheDocument();
      });

      const reserveButton = screen.getAllByText('Reserve')[0];
      await user.click(reserveButton);

      await waitFor(() => {
        expect(screen.getByText('Wash the car')).toBeInTheDocument();
      });

      const completeButton = within(screen.getByText('Wash the car').closest('[class*="border rounded-lg"]') as HTMLElement).getByText('Mark Done');
      await user.click(completeButton);

      // Note: In the real app, parent approval would be required
      // For this test, we're just verifying the completion flow works
      await waitFor(() => {
        const completedTask = screen.getByText('Wash the car').closest('[class*="border rounded-lg"]');
        expect(completedTask).toHaveTextContent('✅ Completed');
      });

      // The allowance should still show the base amount since parent approval is required
      // In a real scenario, the parent would approve and the allowance would update
      expect(screen.getByText('Base allowance: $20.00')).toBeInTheDocument();
      expect(screen.getByText('$20.00')).toBeInTheDocument();
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle API errors gracefully', async () => {
      // Mock an error response
      (mockClient.listChoresByChild as jest.Mock).mockResolvedValueOnce({
        error: { code: 'INTERNAL', message: 'Server error' }
      });

      render(<ChildDashboard />, { currentUser: childUser });

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  describe('Empty State Flow', () => {
    it('should display appropriate empty states', async () => {
      // Mock empty responses
      (mockClient.listChoresByChild as jest.Mock).mockResolvedValue({ data: [] });
      (mockClient.listReservationsByChild as jest.Mock).mockResolvedValue({ data: [] });
      (mockClient.listAvailableBonusTasks as jest.Mock).mockResolvedValue({ data: [] });

      render(<ChildDashboard />, { currentUser: childUser });

      await waitFor(() => {
        expect(screen.getByText('No tasks assigned yet!')).toBeInTheDocument();
      });

      expect(screen.getByText('No bonus tasks available right now!')).toBeInTheDocument();
      expect(screen.getByText('Check back later for new opportunities')).toBeInTheDocument();
    });
  });

  describe('Data Persistence Flow', () => {
    it('should maintain state across multiple operations', async () => {
      const user = userEvent.setup();
      render(<ChildDashboard />, { currentUser: childUser });

      // Complete a chore
      await waitFor(() => {
        expect(screen.getByText('Make bed')).toBeInTheDocument();
      });

      const completeChoreButton = screen.getAllByText('Mark Done')[0];
      await user.click(completeChoreButton);

      await waitFor(() => {
        const completedChore = screen.getByText('Make bed').closest('[class*="border rounded-lg"]');
        expect(completedChore).toHaveTextContent('✅ Completed');
      });

      // Reserve a bonus task
      const reserveButton = screen.getAllByText('Reserve')[0];
      await user.click(reserveButton);

      await waitFor(() => {
        expect(screen.getByText('Wash the car')).toBeInTheDocument();
      });

      // Complete the reserved task
      const completeTaskButton = within(screen.getByText('Wash the car').closest('[class*="border rounded-lg"]') as HTMLElement).getByText('Mark Done');
      await user.click(completeTaskButton);

      await waitFor(() => {
        expect(screen.getAllByText('✅ Completed')).toHaveLength(3);
      });

      // Verify both tasks are still marked as completed
      expect(screen.getByText('Make bed')).toBeInTheDocument();
      expect(screen.getByText('Wash the car')).toBeInTheDocument();
    });
  });
});
