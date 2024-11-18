import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  watch: false,
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov', 'cobertura'],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testMatch: [
    '**/*.test.{ts,tsx}',
    '!**/__tests__/**/(DISABLED.)*.[jt]s?(x)',
    '!**/(DISABLED.)?(*.)+(spec|test).[tj]s?(x)',
  ],
};

export default config;
