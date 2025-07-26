// Jest setup file for global test configuration

// Load environment variables from .env.test file for testing, fallback to .env
require('dotenv').config({ path: '.env.test', silent: true });
require('dotenv').config({ path: '.env', silent: true });

// Import testing library matchers
require('@testing-library/jest-dom');

// Mock environment variables for testing (fallbacks if .env doesn't exist)
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'mock-anon-key';

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