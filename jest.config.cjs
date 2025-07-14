module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform TypeScript files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  
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