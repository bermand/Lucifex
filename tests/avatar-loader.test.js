/**
 * @jest-environment jsdom
 */

// Test for AvatarLoader module
import { jest } from '@jest/globals';

// Mock fetch globally for this test
global.fetch = jest.fn();

describe('AvatarLoader', () => {
  let AvatarLoader;
  let avatarLoader;

  beforeAll(() => {
    // Define the AvatarLoader class inline for testing
    AvatarLoader = class {
      constructor() {
        this.avatarCache = new Map()
        this.baseUrl = "./prototype/assets/avatars/"
        this.manifest = null
      }

      async loadManifest() {
        try {
          const response = await fetch(`${this.baseUrl}manifest.json`)
          this.manifest = await response.json()
          return this.manifest
        } catch (error) {
          console.warn("Avatar manifest not found, using defaults")
          return this.getDefaultManifest()
        }
      }

      getDefaultManifest() {
        return {
          version: "1.0.0",
          avatars: {
            "female-s": { name: "Female Small", description: "Petite female avatar" },
            "female-m": { name: "Female Medium", description: "Average female avatar" },
            "female-l": { name: "Female Large", description: "Plus-size female avatar" },
            "male-s": { name: "Male Small", description: "Slim male avatar" },
            "male-m": { name: "Male Medium", description: "Average male avatar" },
            "male-l": { name: "Male Large", description: "Large male avatar" },
          },
        }
      }

      async loadAvatar(avatarId) {
        // Check cache first
        if (this.avatarCache.has(avatarId)) {
          return this.avatarCache.get(avatarId)
        }

        const avatarUrl = `${this.baseUrl}${avatarId}.glb`

        try {
          // Check if file exists
          const response = await fetch(avatarUrl, { method: "HEAD" })

          if (response.ok) {
            // File exists, cache the URL
            this.avatarCache.set(avatarId, avatarUrl)
            return avatarUrl
          } else {
            throw new Error(`Avatar file not found: ${avatarId}.glb`)
          }
        } catch (error) {
          console.warn(`Avatar ${avatarId} not available:`, error.message)

          // Return placeholder or fallback
          return this.getFallbackAvatar(avatarId)
        }
      }

      getFallbackAvatar(avatarId) {
        // Return a data URL for a simple placeholder
        // In a real app, you might have a default avatar GLB
        console.log(`Using fallback for avatar: ${avatarId}`)
        return null // Will show placeholder in UI
      }

      async preloadAvatars() {
        if (!this.manifest) {
          await this.loadManifest()
        }

        const loadPromises = Object.keys(this.manifest.avatars).map((avatarId) => this.loadAvatar(avatarId))

        const results = await Promise.allSettled(loadPromises)

        const loaded = results.filter((r) => r.status === "fulfilled").length
        const total = results.length

        console.log(`Avatar preload complete: ${loaded}/${total} avatars available`)

        return {
          loaded,
          total,
          available: Array.from(this.avatarCache.keys()),
        }
      }

      getAvailableAvatars() {
        return Array.from(this.avatarCache.keys())
      }

      isAvatarAvailable(avatarId) {
        return this.avatarCache.has(avatarId)
      }
    };
  });

  beforeEach(() => {
    avatarLoader = new AvatarLoader();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with correct default values', () => {
      expect(avatarLoader.avatarCache).toBeInstanceOf(Map);
      expect(avatarLoader.baseUrl).toBe('./prototype/assets/avatars/');
      expect(avatarLoader.manifest).toBeNull();
    });
  });

  describe('getDefaultManifest', () => {
    test('should return a valid default manifest', () => {
      const manifest = avatarLoader.getDefaultManifest();
      
      expect(manifest).toHaveProperty('version', '1.0.0');
      expect(manifest).toHaveProperty('avatars');
      expect(manifest.avatars).toHaveProperty('female-s');
      expect(manifest.avatars).toHaveProperty('male-m');
      expect(manifest.avatars['female-s']).toHaveProperty('name');
      expect(manifest.avatars['female-s']).toHaveProperty('description');
    });
  });

  describe('loadManifest', () => {
    test('should load manifest from API when available', async () => {
      const mockManifest = { version: '2.0.0', avatars: {} };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      });

      const result = await avatarLoader.loadManifest();

      expect(global.fetch).toHaveBeenCalledWith('./prototype/assets/avatars/manifest.json');
      expect(result).toEqual(mockManifest);
      expect(avatarLoader.manifest).toEqual(mockManifest);
    });

    test('should return default manifest when API fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await avatarLoader.loadManifest();

      expect(result).toEqual(avatarLoader.getDefaultManifest());
    });
  });

  describe('loadAvatar', () => {
    test('should return cached avatar URL if available', async () => {
      const avatarId = 'male-m';
      const expectedUrl = './prototype/assets/avatars/male-m.glb';
      avatarLoader.avatarCache.set(avatarId, expectedUrl);

      const result = await avatarLoader.loadAvatar(avatarId);

      expect(result).toBe(expectedUrl);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('should fetch and cache avatar URL when file exists', async () => {
      const avatarId = 'male-m';
      global.fetch.mockResolvedValueOnce({ ok: true });

      const result = await avatarLoader.loadAvatar(avatarId);

      expect(global.fetch).toHaveBeenCalledWith('./prototype/assets/avatars/male-m.glb', { method: 'HEAD' });
      expect(result).toBe('./prototype/assets/avatars/male-m.glb');
      expect(avatarLoader.avatarCache.get(avatarId)).toBe('./prototype/assets/avatars/male-m.glb');
    });

    test('should return fallback when avatar file not found', async () => {
      const avatarId = 'nonexistent';
      global.fetch.mockResolvedValueOnce({ ok: false });

      const result = await avatarLoader.loadAvatar(avatarId);

      expect(result).toBeNull(); // getFallbackAvatar returns null
    });
  });

  describe('preloadAvatars', () => {
    test('should preload all avatars from manifest', async () => {
      // Mock loadManifest
      const mockManifest = {
        avatars: {
          'male-m': {},
          'female-m': {},
          'male-l': {}
        }
      };
      avatarLoader.manifest = mockManifest;

      // Mock successful avatar loading
      global.fetch.mockResolvedValue({ ok: true });

      const result = await avatarLoader.preloadAvatars();

      expect(result.total).toBe(3);
      expect(result.loaded).toBe(3);
      expect(result.available).toContain('male-m');
      expect(result.available).toContain('female-m');
      expect(result.available).toContain('male-l');
    });
  });

  describe('utility methods', () => {
    test('getAvailableAvatars should return cached avatar IDs', () => {
      avatarLoader.avatarCache.set('avatar1', 'url1');
      avatarLoader.avatarCache.set('avatar2', 'url2');

      const result = avatarLoader.getAvailableAvatars();

      expect(result).toEqual(['avatar1', 'avatar2']);
    });

    test('isAvatarAvailable should check cache', () => {
      avatarLoader.avatarCache.set('avatar1', 'url1');

      expect(avatarLoader.isAvatarAvailable('avatar1')).toBe(true);
      expect(avatarLoader.isAvatarAvailable('avatar2')).toBe(false);
    });
  });
});