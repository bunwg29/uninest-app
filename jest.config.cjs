module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  moduleNameMapper: {
    '^@core$': '<rootDir>/src/core',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@ui$': '<rootDir>/src/ui',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@theme$': '<rootDir>/src/theme',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@hooks$': '<rootDir>/src/hooks',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@navigation$': '<rootDir>/src/navigation',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
  },
  collectCoverageFrom: [
    'src/features/booking/**/*.{ts,tsx}',
    '!src/features/booking/**/index.ts',
    '!src/features/booking/screens/LandlordAppointmentsScreen.tsx',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
    },
  },
};
