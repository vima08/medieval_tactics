import { defineConfig } from 'vite';
export default defineConfig({
  base: '/medieval_tactics/',
  server: { port: 5173 },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
