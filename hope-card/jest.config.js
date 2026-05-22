const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/app/**/*.{ts,tsx}',
    '!<rootDir>/src/admin-components/**/*.{ts,tsx}',
    '!<rootDir>/src/admin-lib/**/*.{ts,tsx}',
    '!<rootDir>/src/beneficiary-components/**/*.{ts,tsx}',
    '!<rootDir>/src/beneficiary-utils/**/*.{ts,tsx}',
    '!<rootDir>/src/campaign-manager-components/**/*.{ts,tsx}',
    '!<rootDir>/src/campaign-manager-types/**/*.{ts,tsx}',
    '!<rootDir>/src/campaign-manager-utils/**/*.{ts,tsx}',
    '!<rootDir>/src/donor-components/**/*.{ts,tsx}',
    '!<rootDir>/src/donor-contexts/**/*.{ts,tsx}',
    '!<rootDir>/src/donor-hooks/**/*.{ts,tsx}',
    '!<rootDir>/src/donor-lib/hopecard-session.ts',
    '!<rootDir>/src/donor-lib/hopecard-supabase.ts',
    '!<rootDir>/src/donor-lib/supabase-client.ts',
    '!<rootDir>/src/middleware.ts',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
