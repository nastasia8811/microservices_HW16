import { createDefaultEsmPreset } from 'ts-jest'

export default {
  ...createDefaultEsmPreset({ tsconfig: { isolatedModules: true } }),
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/services/**/*.ts', '!src/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}
