// Jest setup file
// Configure global test environment for JSDOM and browser APIs

// Mock browser APIs that may not be available in test environment
global.fetch = jest.fn();
global.FormData = jest.fn();
global.File = jest.fn();
global.FileReader = jest.fn();

// Mock Web APIs used in 3D rendering
global.WebGLRenderingContext = jest.fn();
global.WebGL2RenderingContext = jest.fn();

// Mock URL.createObjectURL for file handling
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  // Only show actual errors, not expected test failures
  if (!args[0]?.includes?.('Warning:') && !args[0]?.includes?.('Not implemented:')) {
    originalError.apply(console, args);
  }
};

console.warn = (...args) => {
  // Suppress JSDOM warnings about missing implementations
  if (!args[0]?.includes?.('Not implemented:')) {
    originalWarn.apply(console, args);
  }
};

// Set up test timeout
jest.setTimeout(10000);