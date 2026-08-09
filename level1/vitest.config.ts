import { defineConfig } from 'vitest/config';

export default defineConfig({
  mode: 'node',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'contracts/managed'],
    reporters: ['default'],
    deps: {
      interopDefault: true,
    },
  },
  resolve: {
    extensions: ['.ts', '.js'],
    conditions: ['import', 'node', 'default'],
  },
});