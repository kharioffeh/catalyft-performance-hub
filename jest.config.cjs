module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // Ignore Cypress and problematic test files
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.cy\\.(ts|tsx|js)$',
    'tests/.*\\.(spec|cy)\\.(ts|tsx|js)$',
    'supabase/tests/'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform TypeScript files and handle ES modules
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
      useESM: true,
    }],
  },
  
  // Transform ES modules from node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase|isows)/)',
  ],
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  
  // Test environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Collect coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'supabase/functions/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true
};