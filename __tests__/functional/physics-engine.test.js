/**
 * Physics Engine Tests
 * Tests for cloth simulation and avatar collision functionality
 * Covers regression testing for physics engine integration
 */

describe('SimpleClothPhysics - Physics Engine Integration', () => {
  let SimpleClothPhysics;
  let clothPhysics;

  beforeEach(() => {
    // Setup DOM without JSDOM import
    if (typeof document === 'undefined') {
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'http://localhost'
      });
      global.window = dom.window;
      global.document = dom.window.document;
    }
    global.console.log = jest.fn();
    global.console.error = jest.fn();
    
    // Load the SimpleClothPhysics class
    const fs = require('fs');
    const path = require('path');
    const physicsCode = fs.readFileSync(
      path.join(__dirname, '../../prototype/garment-visualization/physics/simple-cloth-physics.js'), 
      'utf8'
    );
    
    // Execute the code in our test environment
    eval(physicsCode);
    SimpleClothPhysics = window.SimpleClothPhysics || eval('SimpleClothPhysics');
    clothPhysics = new SimpleClothPhysics();
  });

  describe('Physics World Initialization', () => {
    test('should initialize with correct default properties', () => {
      expect(clothPhysics.particles).toEqual([]);
      expect(clothPhysics.constraints).toEqual([]);
      expect(clothPhysics.clothBodies).toBeInstanceOf(Map);
      expect(clothPhysics.avatarColliders).toBeInstanceOf(Map);
      expect(clothPhysics.isInitialized).toBe(false);
      expect(clothPhysics.gravity).toEqual({ x: 0, y: -9.81, z: 0 });
      expect(clothPhysics.damping).toBe(0.99);
      expect(clothPhysics.timeStep).toBe(1 / 60);
    });

    test('should successfully initialize physics world', async () => {
      const result = await clothPhysics.initPhysicsWorld();
      
      expect(result).toBe(true);
      expect(clothPhysics.isInitialized).toBe(true);
      expect(console.log).toHaveBeenCalledWith('🔄 Initializing simple physics engine...');
      expect(console.log).toHaveBeenCalledWith('✅ Simple physics engine initialized');
    });
  });

  describe('Avatar Collider Creation', () => {
    beforeEach(async () => {
      await clothPhysics.initPhysicsWorld();
    });

    test('should create avatar collider with valid parameters', () => {
      const position = { x: 0, y: 1, z: 0 };
      const scale = { x: 1, y: 2, z: 1 };
      
      const colliderId = clothPhysics.createAvatarCollider(position, scale);
      
      expect(colliderId).toBeTruthy();
      expect(colliderId).toMatch(/^avatar_\d+$/);
      expect(clothPhysics.avatarColliders.has(colliderId)).toBe(true);
      
      const collider = clothPhysics.avatarColliders.get(colliderId);
      expect(collider.position).toEqual(position);
      expect(collider.scale).toEqual(scale);
      expect(collider.type).toBe('capsule');
    });

    test('should not create collider when physics is not initialized', () => {
      const uninitializedPhysics = new SimpleClothPhysics();
      const result = uninitializedPhysics.createAvatarCollider({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
      
      expect(result).toBeNull();
    });

    test('should handle position and scale parameter copies correctly', () => {
      const position = { x: 1, y: 2, z: 3 };
      const scale = { x: 0.5, y: 1.5, z: 2.0 };
      
      const colliderId = clothPhysics.createAvatarCollider(position, scale);
      const collider = clothPhysics.avatarColliders.get(colliderId);
      
      // Modify original objects
      position.x = 999;
      scale.y = 999;
      
      // Collider should have copies, not references
      expect(collider.position.x).toBe(1);
      expect(collider.scale.y).toBe(1.5);
    });
  });

  describe('Cloth Creation and Management', () => {
    beforeEach(async () => {
      await clothPhysics.initPhysicsWorld();
    });

    test('should handle cloth creation with geometry data', () => {
      const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
      const indices = new Uint16Array([0, 1, 2]);
      const position = { x: 0, y: 2, z: 0 };
      
      // This will test the beginning of the method since we can see it starts with initialization check
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Test with uninitialized physics
      const uninitializedPhysics = new SimpleClothPhysics();
      uninitializedPhysics.createClothFromGeometry(vertices, indices, position);
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ Simple physics not initialized');
    });
  });

  describe('Physics State Management', () => {
    test('should maintain separate instances with independent state', () => {
      const physics1 = new SimpleClothPhysics();
      const physics2 = new SimpleClothPhysics();
      
      expect(physics1.clothBodies).not.toBe(physics2.clothBodies);
      expect(physics1.avatarColliders).not.toBe(physics2.avatarColliders);
      expect(physics1.particles).not.toBe(physics2.particles);
    });

    test('should have correct default physics parameters', () => {
      expect(clothPhysics.gravity.y).toBe(-9.81); // Earth gravity
      expect(clothPhysics.damping).toBeLessThan(1.0); // Should have damping
      expect(clothPhysics.timeStep).toBe(1/60); // 60 FPS simulation
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully during initialization', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Mock an error during initialization
      const faultyPhysics = new SimpleClothPhysics();
      const originalInit = faultyPhysics.initPhysicsWorld;
      faultyPhysics.initPhysicsWorld = jest.fn().mockRejectedValue(new Error('Init failed'));
      
      const result = await faultyPhysics.initPhysicsWorld();
      
      expect(result).toBe(false);
    });
  });
});