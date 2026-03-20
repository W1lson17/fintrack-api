import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      exclude: [
        'src/index.ts',
        'src/generated/**',
        'src/types/**',
        'src/routes/**',
        'src/schemas/**',
        'src/repositories/**',
        'src/lib/prisma.ts',
        'src/lib/constants.ts',
        'src/lib/logger.ts'
      ]
    }
  },
})