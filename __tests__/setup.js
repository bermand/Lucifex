// Jest setup file for jsdom environment and custom matchers
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock WebGL context for Three.js testing
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: (contextType) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        canvas: HTMLCanvasElement.prototype,
        getExtension: () => null,
        getParameter: () => null,
        createShader: () => ({}),
        shaderSource: () => {},
        compileShader: () => {},
        createProgram: () => ({}),
        attachShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        createTexture: () => ({}),
        bindTexture: () => {},
        texImage2D: () => {},
        texParameteri: () => {},
        generateMipmap: () => {},
        viewport: () => {},
        clear: () => {},
        clearColor: () => {},
        enable: () => {},
        disable: () => {},
        drawArrays: () => {},
        drawElements: () => {}
      };
    }
    return null;
  }
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();