import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/*/src/**/*.vitest.{ts,tsx}',
      'packages/*/src/**/*.vispec.{ts,tsx}',
    ],
    environment: 'node',
    globals: true,
  },
});
