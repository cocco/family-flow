import { screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { render } from '../../test-utils';
import ChildDashboard from '../ChildDashboard';
import { mockClient } from '../../api/mockClient';
import { usersFixture, choresFixture, bonusTasksFixture } from '../../api/fixtures';
import type { UserDto, ChoreDto, BonusTaskDto, TaskReservationDto, ChildAllowanceSummaryDto } from '../../api/types';

// Mock the mockClient
jest.mock('../../api/mockClient', () => ({
  mockClient: {
    listChoresByChild: jest.fn(),
    listAvailableBonusTasks: jest.fn(),
    listReservationsByChild: jest.fn(),
    getAllowanceSummary: jest.fn(),
    getBonusTaskById: jest.fn(),
    completeChore: jest.fn(),
    reserveBonusTask: jest.fn(),
    completeReservation: jest.fn(),
  },
}));

const mockMockClient = mockClient as jest.Mocked<typeof mockClient>;

describe('ChildDashboard', () => {
  const childUser: UserDto = usersFixture[1]; // Sam
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const mockChores: ChoreDto[] = choresFixture.filter(c => c.childId === childUser.id);
  const mockAvailableTasks: BonusTaskDto[] = bonusTasksFixture;
  const mockReservations: TaskReservationDto[] = [];
  const mockAllowanceSummary: ChildAllowanceSummaryDto = {
    childId: childUser.id,
    month,
    year,
    baseAllowance: 20,
    bonusTotal: 0,
    total: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful responses
    mockMockClient.listChoresByChild.mockResolvedValue({ data: mockChores });
    mockMockClient.listAvailableBonusTasks.mockResolvedValue({ data: mockAvailableTasks });
    mockMockClient.listReservationsByChild.mockResolvedValue({ data: mockReservations });
    mockMockClient.getAllowanceSummary.mockResolvedValue({ data: mockAllowanceSummary });
    mockMockClient.getBonusTaskById.mockImplementation(async (_ctx, taskId: string) => {
      const task = bonusTasksFixture.find(t => t.id === taskId);
      return task ? { data: task } as any : { error: { code: 'NOT_FOUND', message: 'Bonus task not found' } } as any;
    });
  });

  it('should render loading state initially', () => {
    render(<ChildDashboard />, { currentUser: childUser });

    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render dashboard with user data after loading', async () => {
    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText(`Welcome, ${childUser.displayName}!`)).toBeInTheDocument();
    });

    expect(screen.getByText('Your tasks and earnings')).toBeInTheDocument();
    expect(screen.getByText('📋 My Monthly Tasks')).toBeInTheDocument();
    expect(screen.getByText('⭐ Available Bonus Tasks')).toBeInTheDocument();
  });

  it('should display allowance summary', async () => {
    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('💰 Monthly Earnings')).toBeInTheDocument();
    });

    expect(screen.getByText('Base allowance: $20.00')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    expect(screen.getByText('Total this month')).toBeInTheDocument();
  });

  it('should display allowance summary with bonus tasks', async () => {
    const allowanceWithBonus: ChildAllowanceSummaryDto = {
      ...mockAllowanceSummary,
      bonusTotal: 5,
      total: 25,
    };
    mockMockClient.getAllowanceSummary.mockResolvedValue({ data: allowanceWithBonus });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText((_, element) => {
        return element?.textContent === 'Base allowance: $20.00 + $5.00 bonus';
      })).toBeInTheDocument();
    });

    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });

  it('should display chores in My Tasks section', async () => {
    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Make bed')).toBeInTheDocument();
    });

    expect(screen.getByText('Tidy up and make the bed each morning')).toBeInTheDocument();
    expect(screen.getByText('Feed the cat')).toBeInTheDocument();
    expect(screen.getByText('Morning and evening feeding')).toBeInTheDocument();
  });

  it('should display completed chores with status', async () => {
    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      const completedChore = screen.getByText('Feed the cat').closest('[class*="border rounded-lg"]');
      expect(completedChore).toHaveClass('bg-green-50', 'border-green-200');
    });

    expect(screen.getAllByText('✅ Completed')).toHaveLength(2); // Feed the cat and Put away toys are completed
  });

  it('should display available bonus tasks', async () => {
    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Wash the car')).toBeInTheDocument();
    });

    expect(screen.getByText('Exterior wash and dry')).toBeInTheDocument();
    expect(screen.getByText('+$5')).toBeInTheDocument();
    expect(screen.getByText('Organize bookshelf')).toBeInTheDocument();
    expect(screen.getAllByText('+$3')).toHaveLength(2); // Organize bookshelf and Deep clean kitchen
    expect(screen.getByText('Vacuum living room')).toBeInTheDocument();
    expect(screen.getAllByText('+$2')).toHaveLength(2); // Vacuum living room and Clean windows
  });

  it('should handle completing a chore', async () => {
    const user = userEvent.setup();
    const updatedChore: ChoreDto = {
      ...mockChores[0],
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    mockMockClient.completeChore.mockResolvedValue({ data: updatedChore });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Make bed')).toBeInTheDocument();
    });

    const completeButton = screen.getAllByText('Mark Done')[0];
    await user.click(completeButton);

    expect(mockMockClient.completeChore).toHaveBeenCalledWith(
      { currentUser: childUser },
      mockChores[0].id
    );

    await waitFor(() => {
      expect(screen.getAllByText('✅ Completed')).toHaveLength(3); // Feed the cat, Put away toys, and Make bed
    });
  });

  it('should handle reserving a bonus task', async () => {
    const user = userEvent.setup();
    const newReservation: TaskReservationDto = {
      id: `${bonusTasksFixture[0].id}:${childUser.id}`,
      taskId: bonusTasksFixture[0].id,
      childId: childUser.id,
      isCompleted: false,
      reservedAt: new Date().toISOString(),
    };
    mockMockClient.reserveBonusTask.mockResolvedValue({ data: newReservation });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Wash the car')).toBeInTheDocument();
    });

    const reserveButton = screen.getAllByText('Reserve')[0];
    await user.click(reserveButton);

    expect(mockMockClient.reserveBonusTask).toHaveBeenCalledWith(
      { currentUser: childUser },
      bonusTasksFixture[0].id
    );

    // Task should be moved from available tasks to My Tasks section
    await waitFor(() => {
      // The task should still exist but now in My Tasks with a Mark Done button
      expect(screen.getByText('Wash the car')).toBeInTheDocument();
      expect(screen.getByText('+$5')).toBeInTheDocument();
    });

    // Should have blue left border indicating it's a bonus task
    const reservedTask = screen.getByText('Wash the car').closest('[class*="border-l-4"]');
    expect(reservedTask).toHaveClass('border-l-4', 'border-l-blue-400');
  });

  it('should handle completing a reserved task', async () => {
    const user = userEvent.setup();
    const reservation: TaskReservationDto = {
      id: `${bonusTasksFixture[0].id}:${childUser.id}`,
      taskId: bonusTasksFixture[0].id,
      childId: childUser.id,
      isCompleted: false,
      reservedAt: new Date().toISOString(),
    };
    const completedReservation: TaskReservationDto = {
      ...reservation,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };

    mockMockClient.listReservationsByChild.mockResolvedValue({ data: [reservation] });
    // Reserved tasks should no longer be listed as available
    mockMockClient.listAvailableBonusTasks.mockResolvedValue({
      data: bonusTasksFixture.filter(t => t.id !== reservation.taskId),
    });
    mockMockClient.completeReservation.mockResolvedValue({ data: completedReservation });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      // The task should be visible once (in My Tasks), not in Available list
      expect(screen.getAllByText('Wash the car')).toHaveLength(1);
    });

    // Find the specific "Mark Done" button for the "Wash the car" task
    const washCarContainers = screen.getAllByText('Wash the car');
    const washCarContainer = washCarContainers[0].closest('[class*="border rounded-lg"]');
    const completeButton = within(washCarContainer as HTMLElement).getByText('Mark Done');
    await user.click(completeButton);

    expect(mockMockClient.completeReservation).toHaveBeenCalledWith(
      { currentUser: childUser },
      reservation.id
    );

    await waitFor(() => {
      expect(screen.getAllByText('✅ Completed')).toHaveLength(3); // Feed the cat, Put away toys, and Wash the car
    });
  });

  it('should display error messages when API calls fail', async () => {
    mockMockClient.listChoresByChild.mockResolvedValue({
      error: { code: 'INTERNAL', message: 'Server error' }
    });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('should handle chore completion error', async () => {
    const user = userEvent.setup();
    mockMockClient.completeChore.mockResolvedValue({
      error: { code: 'NOT_FOUND', message: 'Chore not found' }
    });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Make bed')).toBeInTheDocument();
    });

    const completeButton = screen.getAllByText('Mark Done')[0];
    await user.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Chore not found')).toBeInTheDocument();
  });

  it('should handle task reservation error', async () => {
    const user = userEvent.setup();
    mockMockClient.reserveBonusTask.mockResolvedValue({
      error: { code: 'CONFLICT', message: 'Task is no longer available' }
    });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Wash the car')).toBeInTheDocument();
    });

    const reserveButton = screen.getAllByText('Reserve')[0];
    await user.click(reserveButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Task is no longer available')).toBeInTheDocument();
  });

  it('should show empty state when no tasks are available', async () => {
    mockMockClient.listChoresByChild.mockResolvedValue({ data: [] });
    mockMockClient.listReservationsByChild.mockResolvedValue({ data: [] });
    mockMockClient.listAvailableBonusTasks.mockResolvedValue({ data: [] });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('No tasks assigned yet!')).toBeInTheDocument();
    });

    expect(screen.getByText('No bonus tasks available right now!')).toBeInTheDocument();
  });

  it('should display reserved tasks in My Tasks section', async () => {
    const reservation: TaskReservationDto = {
      id: `${bonusTasksFixture[0].id}:${childUser.id}`,
      taskId: bonusTasksFixture[0].id,
      childId: childUser.id,
      isCompleted: false,
      reservedAt: new Date().toISOString(),
    };

    mockMockClient.listReservationsByChild.mockResolvedValue({ data: [reservation] });
    // Reserved task removed from available list
    mockMockClient.listAvailableBonusTasks.mockResolvedValue({
      data: bonusTasksFixture.filter(t => t.id !== reservation.taskId),
    });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      // The task should be visible only in My Tasks
      expect(screen.getAllByText('Wash the car')).toHaveLength(1);
    });

    // Should have blue left border indicating it's a bonus task
    const washCarElements = screen.getAllByText('Wash the car');
    const taskElement = washCarElements[0].closest('[class*="border rounded-lg"]');
    expect(taskElement).toHaveClass('border-l-4', 'border-l-blue-400');
    expect(screen.getAllByText('+$5')).toHaveLength(1); // Appears only in My Tasks
  });

  it('should not show Mark Done button for completed tasks', async () => {
    const completedChore: ChoreDto = {
      ...mockChores[0],
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    mockMockClient.listChoresByChild.mockResolvedValue({ data: [completedChore] });

    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Make bed')).toBeInTheDocument();
    });

    expect(screen.queryByText('Mark Done')).not.toBeInTheDocument();
    expect(screen.getByText('✅ Completed')).toBeInTheDocument();
  });

  it('should handle logout', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<ChildDashboard />, { currentUser: childUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Welcome, Sam!')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    
    await user.click(logoutButton);

    // The logout functionality is handled by the AppContext
    // We can't easily test the actual logout behavior without more complex setup
  });

  it('should not render when no current user', async () => {
    await act(async () => {
      render(<ChildDashboard />, { currentUser: null });
    });

    // Should not render the dashboard content
    expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
  });
});
