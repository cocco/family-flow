/**
 * Environment configuration with validation
 * Validates required environment variables at startup with safe defaults
 */

interface EnvConfig {
  apiBaseUrl: string;
  debug: boolean;
  mockApi: boolean;
  enableRoleSwitcher: boolean;
}

const requiredEnvVars = {
  VITE_API_BASE_URL: 'http://localhost:3001/api',
  VITE_DEBUG: 'false',
  VITE_MOCK_API: 'true',
  VITE_ENABLE_ROLE_SWITCHER: 'true',
} as const;

function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Check for required environment variables
  Object.entries(requiredEnvVars).forEach(([key, defaultValue]) => {
    if (!import.meta.env[key] && !defaultValue) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return {
    apiBaseUrl:
      import.meta.env.VITE_API_BASE_URL || requiredEnvVars.VITE_API_BASE_URL,
    debug: import.meta.env.VITE_DEBUG === 'true',
    mockApi: import.meta.env.VITE_MOCK_API === 'true',
    enableRoleSwitcher: import.meta.env.VITE_ENABLE_ROLE_SWITCHER === 'true',
  };
}

export const env: EnvConfig = validateEnv();

// Log configuration in development
if (env.debug) {
  console.log('Family Flow Environment Configuration:', env);
}
