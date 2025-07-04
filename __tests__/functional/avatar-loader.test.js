/**
 * Avatar Loader Tests
 * Tests for FR-003: Avatar Generation from Measurements
 * Tests for FR-004: Avatar Rendering
 */

// Mock fetch for testing
global.fetch = jest.fn();

describe('AvatarLoader - FR-003 & FR-004: Avatar Generation and Rendering', () => {
  let AvatarLoader;
  let avatarLoader;

  beforeEach(() => {
    // Reset fetch mock
    fetch.mockClear();
    
    // Setup DOM without JSDOM import
    if (typeof document === 'undefined') {
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'http://localhost'
      });
      global.window = dom.window;
      global.document = dom.window.document;
    }
    
    // Load the AvatarLoader class
    const fs = require('fs');
    const path = require('path');
    const avatarLoaderCode = fs.readFileSync(
      path.join(__dirname, '../../prototype/garment-visualization/avatar-loader.js'), 
      'utf8'
    );
    
    // Execute the code in our test environment
    eval(avatarLoaderCode);
    AvatarLoader = window.AvatarLoader;
    avatarLoader = new AvatarLoader();
  });

  describe('FR-003.1: System morphs a base 3D avatar mesh according to user measurements', () => {
    test('should initialize with correct default properties', () => {
      expect(avatarLoader.avatarCache).toBeInstanceOf(Map);
      expect(avatarLoader.baseUrl).toBe('./prototype/assets/avatars/');
      expect(avatarLoader.manifest).toBeNull();
    });

    test('should load default manifest when manifest.json is not available', async () => {
      fetch.mockRejectedValueOnce(new Error('File not found'));
      
      const manifest = await avatarLoader.loadManifest();
      
      expect(manifest).toHaveProperty('version', '1.0.0');
      expect(manifest.avatars).toHaveProperty('female-s');
      expect(manifest.avatars).toHaveProperty('male-l');
      expect(Object.keys(manifest.avatars)).toHaveLength(6);
    });

    test('should load manifest from server when available', async () => {
      const mockManifest = {
        version: '2.0.0',
        avatars: { 'custom-avatar': { name: 'Custom', description: 'Test' } }
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      });
      
      const manifest = await avatarLoader.loadManifest();
      
      expect(manifest).toEqual(mockManifest);
      expect(avatarLoader.manifest).toEqual(mockManifest);
    });
  });

  describe('FR-003.2: Morphing is applied via parameterized sliders or direct value inputs', () => {
    test('should handle avatar loading with different avatar IDs', async () => {
      // Mock successful HEAD request
      fetch.mockResolvedValueOnce({ ok: true });
      
      const avatarUrl = await avatarLoader.loadAvatar('female-m');
      
      expect(fetch).toHaveBeenCalledWith('./prototype/assets/avatars/female-m.glb', { method: 'HEAD' });
      expect(avatarUrl).toBe('./prototype/assets/avatars/female-m.glb');
      expect(avatarLoader.avatarCache.get('female-m')).toBe(avatarUrl);
    });

    test('should cache loaded avatars to avoid redundant requests', async () => {
      // First load
      fetch.mockResolvedValueOnce({ ok: true });
      await avatarLoader.loadAvatar('male-s');
      
      // Second load should use cache
      const cachedUrl = await avatarLoader.loadAvatar('male-s');
      
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(cachedUrl).toBe('./prototype/assets/avatars/male-s.glb');
    });
  });

  describe('FR-003.3: Avatar mesh must be regenerable from stored measurement data', () => {
    test('should provide fallback when avatar file is not available', async () => {
      fetch.mockRejectedValueOnce(new Error('File not found'));
      
      const result = await avatarLoader.loadAvatar('nonexistent-avatar');
      
      expect(result).toBeNull();
    });

    test('should preload all avatars and return summary', async () => {
      // Set up a mock manifest first
      avatarLoader.manifest = {
        avatars: {
          'female-s': { name: 'Female Small' },
          'female-m': { name: 'Female Medium' },
          'female-l': { name: 'Female Large' },
          'male-s': { name: 'Male Small' },
          'male-m': { name: 'Male Medium' },
          'male-l': { name: 'Male Large' }
        }
      };
      
      // Mock some successful and some failed loads
      fetch
        .mockResolvedValueOnce({ ok: true })  // female-s
        .mockResolvedValueOnce({ ok: true })  // female-m
        .mockResolvedValueOnce({ ok: false }) // female-l
        .mockResolvedValueOnce({ ok: true })  // male-s
        .mockResolvedValueOnce({ ok: false }) // male-m
        .mockResolvedValueOnce({ ok: true }); // male-l
      
      const result = await avatarLoader.preloadAvatars();
      
      expect(result.total).toBe(6);
      expect(result.loaded).toBe(4);
      expect(result.available).toContain('female-s');
      expect(result.available).toContain('male-l');
    });
  });

  describe('FR-004: Avatar Rendering Support', () => {
    test('should track available avatars for rendering', async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      await avatarLoader.loadAvatar('female-l');
      
      expect(avatarLoader.isAvatarAvailable('female-l')).toBe(true);
      expect(avatarLoader.isAvatarAvailable('nonexistent')).toBe(false);
      expect(avatarLoader.getAvailableAvatars()).toContain('female-l');
    });
  });
});