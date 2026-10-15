import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts']
  },
  resolve: {
    alias: {
      '@ninja/shared': path.resolve(__dirname, 'packages/shared/src/index.ts')
    }
  }
});
