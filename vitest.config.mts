import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // `server-only` aruncă în afara Next; în teste îl înlocuim cu un modul gol.
      'server-only': fileURLToPath(new URL('./tests/unit/server-only-stub.ts', import.meta.url)),
    },
  },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
