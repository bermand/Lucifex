
# Testing Guide

This document describes how to run and contribute to the test suite for the Lucifex project.

## Overview

The Lucifex project uses **Jest** as the primary testing framework with **jsdom** for DOM testing. The test suite covers:

- **Functional Requirements Testing**: Validates core business logic based on `docs/Detailed_Functional_Requirements.md`
- **Integration Testing**: Tests user workflows and component interactions
- **Prototype Testing**: Regression tests for existing prototype functionality
- **Physics Engine Testing**: Validates cloth simulation and avatar collision systems

## Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- npm (comes with Node.js)

### Installation

```bash
# Install dependencies
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

### Running Specific Test Suites

```bash
# Run only integration tests
npm test -- --testPathPattern="integration"

# Run only functional tests
npm test -- --testPathPattern="functional"

# Run only prototype tests
npm test -- --testPathPattern="prototype"

# Run specific test file
npm test -- avatar-loader.test.js
```

## Test Structure

```
__tests__/
├── setup.js                 # Jest configuration and global mocks
├── functional/              # Tests based on functional requirements
│   ├── avatar-loader.test.js       # FR-003, FR-004: Avatar generation & rendering
│   ├── core-functionality.test.js  # FR-002, FR-005, FR-006, FR-009: Core features
│   ├── html-components.test.js     # FR-005, FR-006: UI components
│   └── physics-engine.test.js      # Physics simulation tests
├── integration/             # End-to-end workflow tests
│   └── user-workflows.test.js      # FR-002, FR-009: User scenarios
└── prototype/               # Regression tests for existing code
    └── javascript-functionality.test.js  # Prototype component tests
```

## Test Categories

### Functional Requirements Tests

These tests validate specific functional requirements from the project documentation:

- **FR-002**: Manual Measurement Input
- **FR-003**: Avatar Generation from Measurements  
- **FR-004**: Avatar Rendering
- **FR-005**: Garment Library Display
- **FR-006**: Garment Preview on Avatar
- **FR-009**: Look Saving and Wishlist

### Integration Tests

End-to-end tests covering complete user workflows:

- Avatar creation and customization
- Garment selection and fitting
- Look saving and management
- Measurement input and validation

### Prototype Tests

Regression tests for existing prototype functionality:

- Avatar loader module
- Physics engine components
- Three.js integration
- Error handling and fallbacks

## Writing Tests

### Test File Naming

- Functional tests: `feature-name.test.js`
- Integration tests: `workflow-name.test.js`
- Prototype tests: `component-name.test.js`

### Test Structure Example

```javascript
/**
 * Feature Tests
 * Tests for FR-XXX: Feature Description
 */

describe('Feature Name - FR-XXX', () => {
  beforeEach(() => {
    // Setup for each test
  });

  describe('FR-XXX.1: Specific requirement', () => {
    test('should validate specific behavior', () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expectedOutput);
    });
  });
});
```

### Mocking Guidelines

The test setup includes several pre-configured mocks:

- **fetch**: For HTTP requests
- **localStorage**: For data persistence tests
- **WebGL context**: For 3D rendering tests
- **requestAnimationFrame**: For animation tests
- **console methods**: To avoid test noise

### DOM Testing

For testing HTML components:

```javascript
test('should render component correctly', () => {
  // JSDOM is automatically available
  const element = document.createElement('div');
  element.innerHTML = '<model-viewer src="test.glb"></model-viewer>';
  
  expect(element.querySelector('model-viewer')).toBeTruthy();
});
```

## Coverage

The test suite tracks code coverage for:

- `prototype/**/*.js` - Prototype JavaScript files
- `scripts/**/*.js` - Utility scripts

Coverage reports are generated in the `coverage/` directory and include:

- **HTML report**: `coverage/lcov-report/index.html`
- **LCOV format**: `coverage/lcov.info`
- **Console summary**: Displayed after test runs

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

## Continuous Integration

Tests run automatically on:

- **Push** to `functional-testing` branch
- **Pull requests** to `functional-testing` branch

The CI pipeline includes:

1. **Test Execution**: Run on Node.js 18.x and 20.x
2. **Coverage Analysis**: Generate and upload coverage reports
3. **Security Audit**: Check for vulnerabilities
4. **Performance Check**: Validate file sizes and HTML structure

## Common Issues and Solutions

### JSDOM Issues

If you encounter `TextEncoder is not defined` errors:
- The setup file should handle this automatically
- Ensure tests import from the correct setup

### File Path Issues

When testing prototype files:
- Use relative paths from the test file location
- Example: `../../prototype/garment-visualization/avatar-loader.js`

### Mock Configuration

To add new mocks, update `__tests__/setup.js`:

```javascript
// Add global mocks here
global.MyAPI = {
  method: jest.fn()
};
```

### WebGL Context Errors

WebGL context is mocked automatically. If you need custom WebGL behavior:

```javascript
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    // Custom WebGL mock methods
  }));
});
```

## Performance Testing

### Running Performance Tests

```bash
# Basic performance validation
npm run test:ci

# Check for large files and bundle sizes
find prototype/ -size +1M -type f
```

### Optimization Guidelines

- Keep test files under 100KB
- Mock external dependencies
- Use `jest.fn()` for performance-critical mocks
- Avoid real file I/O in unit tests

## Contributing Test Cases

### Adding New Tests

1. Identify the functional requirement (FR-XXX)
2. Create test file in appropriate directory
3. Follow existing naming conventions
4. Include requirement ID in test descriptions
5. Add both positive and negative test cases

### Test Documentation

Each test file should include:

- Header comment with FR references
- Clear test descriptions
- Inline comments for complex logic
- Examples of expected inputs/outputs

### Reviewing Tests

When reviewing test PRs:

- Verify coverage increases
- Check test descriptions match requirements
- Ensure tests are deterministic
- Validate mock usage is appropriate

## Debugging Tests

### Running Individual Tests

```bash
# Debug specific test with verbose output
npm test -- --verbose avatar-loader.test.js

# Run with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand avatar-loader.test.js
```

### Common Debug Commands

```bash
# Show test coverage for specific file
npm test -- --coverage --collectCoverageFrom="prototype/garment-visualization/avatar-loader.js"

# Run tests with detailed output
npm test -- --verbose --no-coverage

# Run tests and watch for changes
npm run test:watch -- --verbose
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)
- [Testing Library](https://testing-library.com/docs/dom-testing-library/intro)
- [Project Functional Requirements](docs/Detailed_Functional_Requirements.md)
