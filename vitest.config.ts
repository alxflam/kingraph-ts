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
      thresholds: {
        functions: 66,
        lines: 34,
        branches: 84,
        statements: 34
      }
    },
    deps: {
      interopDefault: true
    },
    include: ['**/*.test.ts']
  }
});
