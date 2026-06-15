import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/heb-cal/',
  test: {
    environment: 'jsdom',
  },
});
