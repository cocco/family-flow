import { env } from '../config/env';
import type { MockClient } from './mockClient';
import { mockClient } from './mockClient';

// Placeholder for real client shape parity
export type ApiClient = MockClient;

export function createApiClient(): ApiClient {
  if (env.mockApi) {
    return mockClient;
  }
  // For now return mock as fallback to keep app functional
  return mockClient;
}


