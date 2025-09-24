import type { ApiErrorShape } from './types';

export function delay(minMs = 150, maxMs = 450): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function chance(probability: number): boolean {
  return Math.random() < probability;
}

export function error(code: string, message: string, details?: ApiErrorShape['details']): { error: ApiErrorShape } {
  return { error: { code, message, details } };
}


