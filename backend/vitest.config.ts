import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    passWithNoTests: true,
    // CONVENCIONES.md §2.3: al menos 90 % de líneas en los tres servicios.
    coverage: {
      include: ['src/modules/*/*.service.ts'],
      thresholds: { lines: 90 },
    },
  },
});
