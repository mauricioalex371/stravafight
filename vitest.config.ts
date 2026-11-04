import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    // Default: run only unit tests (no external dependencies)
    include: ['src/__tests__/unit/**/*.test.ts'],
    // Integration tests require Supabase and are excluded by default
    exclude: ['src/__tests__/integration/**/*.test.ts', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/__tests__/setup.ts',
        'src/__tests__/integration/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
