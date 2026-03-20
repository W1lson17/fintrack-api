import type { Config } from "jest"

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testEnvironmentOptions: {
    timezone: "UTC"
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/generated/**",
    "!src/types/**",
    "!src/routes/**",
    "!src/schemas/**",
    "!src/repositories/**",
    "!src/lib/prisma.ts",
    "!src/lib/constants.ts",
    "!src/lib/logger.ts",
  ],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        isolatedModules: true
      }
    }]
  },
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
}

export default config