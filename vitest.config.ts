import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/*/src/**/*.vi.test.{ts,tsx}',
      'packages/*/src/**/*.vi.spec.{ts,tsx}',
    ],
    environment: 'node',
    globals: true,
  },
});
