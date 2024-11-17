import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov', 'cobertura'],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
};

export default config;
