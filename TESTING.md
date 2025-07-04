# Testing Guide

This document describes how to run tests locally and understand the CI testing features for the Lucifex project.

## Overview

The Lucifex project uses **Jest** as the primary testing framework with enhanced CI reporting capabilities. Tests cover JavaScript modules for avatar loading, physics simulation, and utility scripts.

## Local Testing

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

# Run tests in CI mode (with XML reporting)
npm run test:ci
```

### Test Output

- **Console output**: Real-time test results and coverage summary
- **HTML coverage report**: `coverage/lcov-report/index.html`
- **XML test results**: `test-results/junit.xml` (for CI integration)

## Test Structure

```
tests/
├── setup.js                    # Jest configuration and global mocks
├── avatar-loader.test.js        # Tests for avatar loading functionality
├── ammo-physics.test.js         # Tests for physics engine initialization
└── download-avatars.test.js     # Tests for avatar download script
```

### What We Test

1. **Avatar Loader (`avatar-loader.test.js`)**
   - Avatar manifest loading and parsing
   - Avatar file caching and retrieval
   - Fallback mechanisms for missing files
   - Preloading and availability checks

2. **Physics Engine (`ammo-physics.test.js`)**
   - Ammo.js initialization and loading
   - Physics world state management
   - Cloth body and collider management
   - Error handling for CDN failures

3. **Download Scripts (`download-avatars.test.js`)**
   - Directory creation and file system operations
   - Avatar source validation
   - Manifest generation
   - Error handling for file operations

## CI Integration

### GitHub Actions Workflow

The CI workflow (`.github/workflows/ci.yml`) provides:

- **Multi-Node.js version testing** (18.x, 20.x)
- **Automated test execution** with coverage reporting
- **JUnit XML reporting** for test result visualization
- **Artifact uploads** for test results and coverage reports
- **Inline test annotations** via dorny/test-reporter
- **PR comments** with coverage summaries

### Test Reporting Features

1. **dorny/test-reporter Integration**
   - Displays test failures inline in PR diffs
   - Provides summary tables in PR checks
   - Links to detailed test results

2. **Coverage Reporting**
   - Generates LCOV and HTML coverage reports
   - Uploads coverage as CI artifacts
   - Posts coverage summary as PR comment

3. **Artifact Storage**
   - Test results (JUnit XML)
   - Coverage reports (HTML and LCOV)
   - Build artifacts (if applicable)

### Viewing CI Results

1. **In Pull Requests:**
   - Check the "Checks" tab for test status
   - View inline annotations for failing tests
   - Read coverage summary in PR comments

2. **In Actions Tab:**
   - Download test result artifacts
   - View detailed coverage reports
   - Check logs for debugging

## Writing Tests

### Test File Conventions

- Place test files in the `tests/` directory
- Use `.test.js` suffix for test files
- Import modules using relative paths
- Mock external dependencies (DOM, fetch, file system)

### Example Test Structure

```javascript
/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

describe('MyModule', () => {
  beforeEach(() => {
    // Setup before each test
  });

  test('should do something specific', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Best Practices

1. **Use descriptive test names** that explain the expected behavior
2. **Mock external dependencies** to ensure tests are isolated
3. **Test both success and error paths** for robust coverage
4. **Keep tests focused** on a single piece of functionality
5. **Use setup and teardown** to maintain clean test state

## Mock Configuration

The project includes comprehensive mocking for browser APIs:

- **DOM APIs**: `document`, `window` objects
- **Web APIs**: `fetch`, `FormData`, `File`, `FileReader`
- **WebGL**: `WebGLRenderingContext`, `WebGL2RenderingContext`
- **File APIs**: `URL.createObjectURL`, `URL.revokeObjectURL`

## Coverage Targets

- **Statements**: Aim for >80% coverage
- **Branches**: Aim for >75% coverage
- **Functions**: Aim for >85% coverage
- **Lines**: Aim for >80% coverage

## Troubleshooting

### Common Issues

1. **Tests failing locally but passing in CI**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review environment-specific configurations

2. **Coverage reports not generating**
   - Ensure test files match the `testMatch` pattern
   - Check that source files are in `collectCoverageFrom` paths
   - Verify Jest configuration in `package.json`

3. **Mock-related errors**
   - Review `tests/setup.js` for global mocks
   - Add specific mocks for new external dependencies
   - Check Jest documentation for mocking patterns

### Getting Help

- Review Jest documentation: https://jestjs.io/docs/getting-started
- Check GitHub Actions logs for detailed error messages
- Examine test artifacts for additional debugging information

## Future Enhancements

Potential improvements to the testing infrastructure:

- **Visual regression testing** for 3D rendering components
- **Integration tests** for full avatar + garment workflows
- **Performance benchmarking** for physics simulation
- **Cross-browser testing** using tools like Playwright
- **E2E testing** for complete user workflows