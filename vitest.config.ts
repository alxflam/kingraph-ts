/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://vitest.dev/config/
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src'],
      exclude: ['src/defaults/*.ts'],
      thresholds: {
        functions: 70,
        lines: 20,
        branches: 80,
        statements: 20
      }
    },
    deps: {
      interopDefault: true
    },
    include: ['**/*.test.ts']
  }
});
