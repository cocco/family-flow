import { screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { render } from '../../test-utils';
import ParentDashboard from '../ParentDashboard';
import { mockClient } from '../../api/mockClient';
import { usersFixture } from '../../api/fixtures';
import type { UserDto } from '../../api/types';

// Mock the mockClient used by ParentDashboard
jest.mock('../../api/mockClient', () => ({
  mockClient: {
    listFamily: jest.fn(),
    listMonthlySummaries: jest.fn(),
    createChoresForAllChildren: jest.fn(),
    createBonusTask: jest.fn(),
  },
}));

const mockMockClient = mockClient as jest.Mocked<typeof mockClient>;

describe('ParentDashboard', () => {
  const parentUser: UserDto = usersFixture[0];
  const childSam = usersFixture[1];
  const childRiley = usersFixture[2];
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: family list returns all users, summaries return base-only totals
    mockMockClient.listFamily.mockResolvedValue({ data: usersFixture });
    mockMockClient.listMonthlySummaries.mockResolvedValue({
      data: [
        { childId: childSam.id, baseAllowance: childSam.monthlyAllowance, bonusTotal: 0, total: childSam.monthlyAllowance },
        { childId: childRiley.id, baseAllowance: childRiley.monthlyAllowance, bonusTotal: 0, total: childRiley.monthlyAllowance },
      ],
    });
  });

  it('renders loading state initially', () => {
    render(<ParentDashboard />, { currentUser: parentUser });
    expect(screen.getByText('Loading family dashboard...')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders family overview and monthly summaries after load', async () => {
    await act(async () => {
      render(<ParentDashboard />, { currentUser: parentUser });
    });

    await waitFor(() => {
      expect(screen.getByText(`Welcome, ${parentUser.displayName}!`)).toBeInTheDocument();
    });

    // Family Overview shows two children and their names
    expect(screen.getByText('Family Overview')).toBeInTheDocument();
    expect(screen.getByText('2 children')).toBeInTheDocument();
    const familyRegion = screen.getByRole('region', { name: 'Family Overview' });
    expect(within(familyRegion).getByText(childSam.displayName)).toBeInTheDocument();
    expect(within(familyRegion).getByText(childRiley.displayName)).toBeInTheDocument();

    // Monthly summaries section header
    expect(screen.getByText('💰 Monthly Allowance Summaries')).toBeInTheDocument();
  });

  it('displays family totals aggregated from summaries', async () => {
    mockMockClient.listMonthlySummaries.mockResolvedValue({
      data: [
        { childId: childSam.id, baseAllowance: 20, bonusTotal: 5, total: 25 },
        { childId: childRiley.id, baseAllowance: 25, bonusTotal: 3, total: 28 },
      ],
    });

    await act(async () => {
      render(<ParentDashboard />, { currentUser: parentUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Family Totals (This Month)')).toBeInTheDocument();
    });

    // Base 20 + 25 = 45.00, Bonus 5 + 3 = 8.00, Total 25 + 28 = 53.00
    expect(screen.getByText('$45.00')).toBeInTheDocument();
    expect(screen.getByText('$8.00')).toBeInTheDocument();
    expect(screen.getByText('$53.00')).toBeInTheDocument();
  });

  it('opens and submits Create Chore modal', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<ParentDashboard />, { currentUser: parentUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Create Chore')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create Chore' }));

    const dialog = screen.getByRole('dialog', { name: 'Create Chore' });
    expect(dialog).toBeInTheDocument();

    const titleInput = within(dialog).getByLabelText('Title');
    const descInput = within(dialog).getByLabelText('Description (optional)');
    const createButton = within(dialog).getByRole('button', { name: 'Create' });

    // Disabled until title is provided
    expect(createButton).toBeDisabled();

    await user.type(titleInput, 'Sweep floor');
    await user.type(descInput, 'Quick sweep');

    // Mock successful API response
    mockMockClient.createChoresForAllChildren.mockResolvedValue({ data: [] });

    expect(createButton).toBeEnabled();
    await user.click(createButton);

    expect(mockMockClient.createChoresForAllChildren).toHaveBeenCalledWith(
      { currentUser: parentUser },
      'Sweep floor',
      'Quick sweep',
      month,
      year,
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Create Chore' })).not.toBeInTheDocument();
    });
  });

  it('opens Bonus Task modal and validates UI-only flow', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<ParentDashboard />, { currentUser: parentUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Create Bonus Task')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create Bonus Task' }));

    const dialog = screen.getByRole('dialog', { name: 'Create Bonus Task' });
    expect(dialog).toBeInTheDocument();

    const titleInput = within(dialog).getByLabelText('Title');
    const rewardInput = within(dialog).getByLabelText('Reward Amount ($)');
    const createButton = within(dialog).getByRole('button', { name: 'Create' });

    expect(createButton).toBeDisabled();
    await user.type(titleInput, 'Wash windows');
    await user.clear(rewardInput);
    await user.type(rewardInput, '5');
    expect(createButton).toBeEnabled();

    await user.click(createButton);

    // UI-only in Phase 2: ensure no API call is made
    expect(mockMockClient.createBonusTask).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Create Bonus Task' })).not.toBeInTheDocument();
    });
  });

  it('shows error banner when API fails', async () => {
    mockMockClient.listFamily.mockResolvedValue({ error: { code: 'INTERNAL', message: 'Server issue' } });

    await act(async () => {
      render(<ParentDashboard />, { currentUser: parentUser });
    });

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Server issue')).toBeInTheDocument();
  });
});


