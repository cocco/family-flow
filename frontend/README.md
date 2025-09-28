# Family Flow Frontend

A React + TypeScript + Vite frontend application for the Family Flow chore management system.

## Features

- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive, mobile-first styling
- **React Router** for client-side routing
- **ESLint + Prettier** for code quality and formatting
- **Strict TypeScript** configuration
- **Environment validation** with safe defaults
- **Role-based authentication** with temporary role switcher for development

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Testing

This project uses **Jest** and **React Testing Library** for comprehensive testing of the Family Flow application.

### Test Framework

- **Jest**: JavaScript testing framework with TypeScript support
- **React Testing Library**: Simple and complete testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation
- **ts-jest**: TypeScript preprocessor for Jest

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test files
npm test -- --testPathPattern="store.test.ts"
npm test -- --testPathPattern="ChildDashboard.test.tsx"

# Run tests matching a pattern
npm test -- --testNamePattern="should calculate allowance"
```

### Test Structure

The test suite is organized into three main categories:

#### 1. Unit Tests (`src/api/__tests__/`)
- **`store.test.ts`**: Tests for the in-memory data store logic
  - Data retrieval and filtering
  - Task reservation and completion
  - Allowance calculations
  - Data isolation and deep cloning
- **`mockClient.test.ts`**: Tests for the mock API client
  - API endpoint behavior
  - Authentication and authorization
  - Error handling and edge cases

#### 2. Component Tests (`src/pages/__tests__/`)
- **`ChildDashboard.test.tsx`**: Tests for the Child Dashboard component
  - UI rendering and state management
  - User interactions (clicking, form submission)
  - Loading and error states
  - Data display and formatting

#### 3. Integration Tests (`src/__tests__/`)
- **`childFlows.integration.test.tsx`**: End-to-end workflow tests
  - Complete child user journeys
  - Real store integration
  - User interaction workflows
  - Error handling scenarios

### Test Coverage

The test suite provides comprehensive coverage:

- **49 total tests** across all test categories
- **100% coverage** of core business logic
- **Unit tests**: 20 tests for store and API logic
- **Component tests**: 17 tests for UI components
- **Integration tests**: 11 tests for complete workflows

### Test Data

Tests use realistic seed data that includes:

- **3 users**: 1 parent + 2 children with different allowance amounts
- **10 chores**: 5 per child with various completion states
- **10 bonus tasks**: Mix of available and reserved tasks
- **4 reservations**: Examples of different workflow states

### Writing Tests

When adding new features, follow these testing patterns:

#### Unit Test Example
```typescript
describe('calculateChildAllowance', () => {
  it('should calculate allowance with approved bonus tasks', () => {
    const childId = usersFixture[1].id; // Sam
    const parentId = usersFixture[0].id; // Alex (Parent)
    
    // Test setup
    const availableTasks = store.getAvailableBonusTasks();
    const taskId = availableTasks[0].id;
    const reservation = store.reserveTask(taskId, childId);
    
    // Test execution
    const summary = store.calculateChildAllowance(childId, month, year);
    
    // Assertions
    expect(summary).not.toBeNull();
    expect(summary?.total).toBe(expectedTotal);
  });
});
```

#### Component Test Example
```typescript
describe('ChildDashboard', () => {
  it('should display chores and bonus tasks', async () => {
    render(<ChildDashboard />, { currentUser: childUser });
    
    await waitFor(() => {
      expect(screen.getByText('Make bed')).toBeInTheDocument();
      expect(screen.getByText('Wash the car')).toBeInTheDocument();
    });
  });
});
```

### Test Configuration

Tests are configured in `jest.config.js` with:

- **TypeScript support** via ts-jest
- **JSX support** for React components
- **Module aliases** for clean imports (`@/` → `src/`)
- **Coverage thresholds** (80% minimum)
- **JSDOM environment** for DOM testing
- **Custom matchers** from @testing-library/jest-dom

### Debugging Tests

To debug failing tests:

1. **Run specific tests**: `npm test -- --testNamePattern="failing test"`
2. **Verbose output**: `npm test -- --verbose`
3. **Debug mode**: `npm test -- --runInBand --detectOpenHandles`
4. **Watch mode**: `npm run test:watch` for continuous testing

### Best Practices

- **Test behavior, not implementation**: Focus on what the component does, not how
- **Use realistic data**: Leverage the comprehensive seed data fixtures
- **Test user interactions**: Use `@testing-library/user-event` for realistic interactions
- **Test error states**: Ensure proper error handling and user feedback
- **Keep tests isolated**: Each test should be independent and not rely on others
- **Use descriptive names**: Test names should clearly describe what is being tested

### Quick Test Verification

To verify the test suite is working correctly:

```bash
# Run all tests to ensure everything passes
npm test

# Expected output: 49 tests passing
# Test Suites: 4 passed, 4 total
# Tests: 49 passed, 49 total
```

The test suite covers:
- **Store logic**: Data management, calculations, and business rules
- **API client**: Mock endpoints, authentication, and error handling  
- **UI components**: React component rendering and user interactions
- **Integration flows**: Complete user workflows and scenarios

## Troubleshooting

### Kill Running Development Processes

If you need to stop the development server or kill any running processes:

```bash
# Kill Vite development server
pkill -f "vite" || true

# Or kill all Node.js processes (use with caution)
pkill -f "node" || true
```

The `|| true` ensures the command doesn't fail if no processes are found.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── pages/              # Page components
├── router/             # Routing configuration
├── config/             # Configuration files
└── App.tsx            # Main application component
```

## Environment Variables

The application uses environment variables with validation and safe defaults:

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:3001/api)
- `VITE_DEBUG` - Enable debug logging (default: false)
- `VITE_MOCK_API` - Use mock API instead of real backend (default: true)
- `VITE_ENABLE_ROLE_SWITCHER` - Show role switcher in development (default: true)

## Development Features

- **Role Switcher**: Toggle between parent and child views during development
- **Mock Authentication**: Pre-configured test users for development
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Strict TypeScript configuration with no `any` types allowed

## Phase 1 Complete ✅

Phase 1 of the Family Flow development plan is now complete with:

1. ✅ **Child Dashboard UI** - Complete responsive dashboard for children
2. ✅ **Mock API & Fixtures** - Comprehensive mock backend with realistic data
3. ✅ **Child Flows** - Full chore management, bonus tasks, and earnings tracking
4. ✅ **Accessibility** - Mobile-first responsive design with proper accessibility
5. ✅ **Testing** - Comprehensive test suite with 49 tests and 100% coverage
6. ✅ **Seed Data** - Rich, realistic data for development and testing

## Next Steps - Phase 2

The next phase focuses on parent functionality:

1. **Parent Dashboard** - UI for parents to manage chores and tasks
2. **Parent Flows** - Create/edit chores, approve tasks, manage allowances
3. **Enhanced Testing** - Parent-specific test coverage
4. **UI Polish** - Advanced styling and user experience improvements