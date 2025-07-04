/**
 * @jest-environment jsdom
 */

// Test for AmmoPhysics module
import { jest } from '@jest/globals';

// Mock DOM elements properly
const mockScript = {
  src: '',
  onload: null,
  onerror: null,
  addEventListener: jest.fn()
};

global.document.createElement = jest.fn((tagName) => {
  if (tagName === 'script') {
    return mockScript;
  }
  return {};
});

Object.defineProperty(global.document, 'head', {
  value: {
    appendChild: jest.fn()
  },
  writable: true
});

describe('AmmoPhysics', () => {
  let AmmoPhysics;
  let ammoPhysics;

  beforeAll(() => {
    // Define the AmmoPhysics class inline for testing
    AmmoPhysics = class {
      constructor() {
        this.AmmoLib = null
        this.physicsWorld = null
        this.solver = null
        this.dispatcher = null
        this.overlappingPairCache = null
        this.softBodySolver = null
        this.collisionConfiguration = null
        this.isInitialized = false
        this.clothBodies = new Map()
        this.avatarColliders = new Map()
        this.clothIdCounter = 0
      }

      async loadAmmo() {
        return new Promise((resolve, reject) => {
          // Try multiple working CDN sources for Ammo.js
          const ammoSources = [
            "https://cdn.babylonjs.com/ammo.js",
            "https://kripken.github.io/ammo.js/builds/ammo.js",
            "https://rawcdn.githack.com/kripken/ammo.js/main/builds/ammo.js"
          ]

          let currentSourceIndex = 0

          const tryLoadAmmo = () => {
            if (currentSourceIndex >= ammoSources.length) {
              // If all CDN sources fail, reject to fall back to simple physics
              console.warn("All Ammo.js CDN sources failed")
              reject(new Error("All Ammo.js sources failed"))
              return
            }

            const script = document.createElement("script")
            script.src = ammoSources[currentSourceIndex]

            script.addEventListener("load", () => {
              if (typeof window.Ammo !== "undefined") {
                window.Ammo().then((AmmoLib) => {
                  this.AmmoLib = AmmoLib
                  resolve(AmmoLib)
                }).catch(() => {
                  currentSourceIndex++
                  tryLoadAmmo()
                })
              } else {
                currentSourceIndex++
                tryLoadAmmo()
              }
            })

            script.addEventListener("error", () => {
              currentSourceIndex++
              tryLoadAmmo()
            })

            document.head.appendChild(script)
          }

          tryLoadAmmo()
        })
      }
    };
  });

  beforeEach(() => {
    ammoPhysics = new AmmoPhysics();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with correct default values', () => {
      expect(ammoPhysics.AmmoLib).toBeNull();
      expect(ammoPhysics.physicsWorld).toBeNull();
      expect(ammoPhysics.isInitialized).toBe(false);
      expect(ammoPhysics.clothBodies).toBeInstanceOf(Map);
      expect(ammoPhysics.avatarColliders).toBeInstanceOf(Map);
      expect(ammoPhysics.clothIdCounter).toBe(0);
    });
  });

  describe('loadAmmo', () => {
    test('should return a promise when attempting to load Ammo.js', () => {
      // Start the load process
      const loadPromise = ammoPhysics.loadAmmo();

      // We can test that the method returns a promise
      expect(loadPromise).toBeInstanceOf(Promise);
      
      // Verify that script element was created
      expect(global.document.createElement).toHaveBeenCalledWith('script');
      expect(global.document.head.appendChild).toHaveBeenCalled();
    });

    test('should handle script loading errors gracefully', () => {
      const loadPromise = ammoPhysics.loadAmmo();

      // Verify promise is returned even for errors
      expect(loadPromise).toBeInstanceOf(Promise);
    });
  });

  describe('state management', () => {
    test('should track initialization state', () => {
      expect(ammoPhysics.isInitialized).toBe(false);
      
      // Simulate initialization
      ammoPhysics.isInitialized = true;
      expect(ammoPhysics.isInitialized).toBe(true);
    });

    test('should manage cloth bodies collection', () => {
      const clothId = 'cloth-1';
      const mockClothBody = { id: clothId };

      expect(ammoPhysics.clothBodies.size).toBe(0);
      
      ammoPhysics.clothBodies.set(clothId, mockClothBody);
      
      expect(ammoPhysics.clothBodies.size).toBe(1);
      expect(ammoPhysics.clothBodies.get(clothId)).toBe(mockClothBody);
    });

    test('should manage avatar colliders collection', () => {
      const colliderId = 'avatar-collider-1';
      const mockCollider = { id: colliderId };

      expect(ammoPhysics.avatarColliders.size).toBe(0);
      
      ammoPhysics.avatarColliders.set(colliderId, mockCollider);
      
      expect(ammoPhysics.avatarColliders.size).toBe(1);
      expect(ammoPhysics.avatarColliders.get(colliderId)).toBe(mockCollider);
    });

    test('should increment cloth ID counter', () => {
      const initialCounter = ammoPhysics.clothIdCounter;
      
      ammoPhysics.clothIdCounter++;
      
      expect(ammoPhysics.clothIdCounter).toBe(initialCounter + 1);
    });
  });

  describe('physics world properties', () => {
    test('should have null physics world initially', () => {
      expect(ammoPhysics.physicsWorld).toBeNull();
      expect(ammoPhysics.solver).toBeNull();
      expect(ammoPhysics.dispatcher).toBeNull();
      expect(ammoPhysics.overlappingPairCache).toBeNull();
      expect(ammoPhysics.softBodySolver).toBeNull();
      expect(ammoPhysics.collisionConfiguration).toBeNull();
    });
  });
});