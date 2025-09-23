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

## Next Steps

This bootstrap completes Phase 1 of the Family Flow development plan. The next steps include:

1. Mock API client and fixtures
2. Child Dashboard implementation
3. Child flows (chores, bonus tasks, earnings)
4. Accessibility and mobile-first enhancements
5. Testing setup