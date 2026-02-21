import { QueryClient } from '@tanstack/react-query';

export const createMockQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

export const mockConsoleMethods = () => {
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
  };

  return {
    mock: () => {
      console.error = vi.fn();
      console.warn = vi.fn();
      console.log = vi.fn();
    },
    restore: () => {
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.log = originalConsole.log;
    },
  };
};

import { vi } from 'vitest';
