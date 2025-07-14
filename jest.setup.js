// Jest setup file for global test configuration

// Mock environment variables for testing
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

// Global test utilities
global.console = {
  ...console,
  // Mock console.log during tests to reduce noise
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};