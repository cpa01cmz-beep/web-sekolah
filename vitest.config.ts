import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/types.ts',
      ],
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'worker/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules/',
      'dist/',
      'worker/domain/__tests__/CommonDataService.test.ts',
      'worker/domain/__tests__/StudentDashboardService.test.ts',
      'worker/domain/__tests__/TeacherService.test.ts',
      'worker/domain/__tests__/UserService.test.ts',
      'worker/domain/__tests__/ParentDashboardService.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
      'cloudflare:workers': path.resolve(__dirname, './__mocks__/cloudflare:workers.ts'),
    },
  },
})
