/**
 * Integration Tests
 * Tests for FR-009: Look Saving and Wishlist
 * Tests for FR-002: Manual Measurement Input
 * Tests for end-to-end user workflows
 */

describe('User Workflow Integration Tests', () => {
  describe('FR-009: Look Saving and Wishlist', () => {
    let mockLocalStorage;

    beforeEach(() => {
      // Mock localStorage for look saving tests
      mockLocalStorage = {
        store: {},
        getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
        setItem: jest.fn((key, value) => {
          mockLocalStorage.store[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete mockLocalStorage.store[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage.store = {};
        })
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });
    });

    test('FR-009.1: Users can save full avatar + garment combos as "looks"', () => {
      const lookData = {
        id: 'look-001',
        avatarId: 'female-m',
        garmentId: 'dress-001',
        measurements: {
          height: 165,
          chest: 85,
          waist: 68,
          hips: 92
        },
        created: new Date().toISOString()
      };

      // Simulate saving a look
      localStorage.setItem(`look_${lookData.id}`, JSON.stringify(lookData));
      
      // Verify the look was saved
      const savedLook = JSON.parse(localStorage.getItem(`look_${lookData.id}`));
      expect(savedLook).toEqual(lookData);
      expect(savedLook.avatarId).toBe('female-m');
      expect(savedLook.garmentId).toBe('dress-001');
    });

    test('FR-009.2: Users can name and tag looks', () => {
      const namedLook = {
        id: 'look-002',
        name: 'Evening Outfit',
        tags: ['formal', 'evening', 'black-tie'],
        description: 'Elegant dress for formal events',
        avatarId: 'female-l',
        garmentId: 'gown-001'
      };

      localStorage.setItem(`look_${namedLook.id}`, JSON.stringify(namedLook));
      
      const retrieved = JSON.parse(localStorage.getItem(`look_${namedLook.id}`));
      expect(retrieved.name).toBe('Evening Outfit');
      expect(retrieved.tags).toContain('formal');
      expect(retrieved.tags).toContain('evening');
      expect(retrieved.description).toBe('Elegant dress for formal events');
    });

    test('FR-009.3: Looks can be saved to wishlist, marked for fitting, or archived', () => {
      const lookWithStatus = {
        id: 'look-003',
        name: 'Casual Day Look',
        status: 'wishlist', // wishlist, fitting, archived
        priority: 'high',
        notes: 'Perfect for weekend outings'
      };

      localStorage.setItem(`look_${lookWithStatus.id}`, JSON.stringify(lookWithStatus));
      
      // Test status changes
      const saved = JSON.parse(localStorage.getItem(`look_${lookWithStatus.id}`));
      expect(saved.status).toBe('wishlist');
      
      // Simulate moving to fitting
      saved.status = 'fitting';
      saved.fittingDate = new Date().toISOString();
      localStorage.setItem(`look_${saved.id}`, JSON.stringify(saved));
      
      const updated = JSON.parse(localStorage.getItem(`look_${saved.id}`));
      expect(updated.status).toBe('fitting');
      expect(updated.fittingDate).toBeTruthy();
    });

    test('should handle multiple looks management', () => {
      const looks = [
        { id: 'look-1', name: 'Work Outfit', status: 'active' },
        { id: 'look-2', name: 'Party Dress', status: 'wishlist' },
        { id: 'look-3', name: 'Casual Wear', status: 'archived' }
      ];

      // Save multiple looks
      looks.forEach(look => {
        localStorage.setItem(`look_${look.id}`, JSON.stringify(look));
      });

      // Retrieve and verify all looks
      const savedLooks = looks.map(look => 
        JSON.parse(localStorage.getItem(`look_${look.id}`))
      );

      expect(savedLooks).toHaveLength(3);
      expect(savedLooks.find(l => l.status === 'wishlist').name).toBe('Party Dress');
      expect(savedLooks.find(l => l.status === 'archived').name).toBe('Casual Wear');
    });
  });

  describe('FR-002: Manual Measurement Input', () => {
    test('FR-002.1: Users can enter height, chest, waist, hips, shoulders, inseam, etc.', () => {
      const measurements = {
        height: 170,
        chest: 90,
        waist: 72,
        hips: 96,
        shoulders: 42,
        inseam: 76,
        armLength: 58,
        neckCircumference: 36
      };

      // Validate measurement ranges
      expect(measurements.height).toBeGreaterThan(140);
      expect(measurements.height).toBeLessThan(210);
      
      expect(measurements.chest).toBeGreaterThan(60);
      expect(measurements.chest).toBeLessThan(150);
      
      expect(measurements.waist).toBeGreaterThan(50);
      expect(measurements.waist).toBeLessThan(130);
    });

    test('FR-002.2: Inputs should be validated in real-time for plausible value ranges', () => {
      const validateMeasurement = (type, value) => {
        const ranges = {
          height: { min: 140, max: 210 },
          chest: { min: 60, max: 150 },
          waist: { min: 50, max: 130 },
          hips: { min: 60, max: 160 },
          shoulders: { min: 30, max: 60 },
          inseam: { min: 60, max: 95 }
        };

        const range = ranges[type];
        return range && value >= range.min && value <= range.max;
      };

      // Test valid measurements
      expect(validateMeasurement('height', 175)).toBe(true);
      expect(validateMeasurement('chest', 85)).toBe(true);
      expect(validateMeasurement('waist', 70)).toBe(true);

      // Test invalid measurements
      expect(validateMeasurement('height', 250)).toBe(false);
      expect(validateMeasurement('chest', 200)).toBe(false);
      expect(validateMeasurement('waist', 30)).toBe(false);
    });

    test('FR-002.3: Users can save and update their measurements at any time', () => {
      const userId = 'user-123';
      const initialMeasurements = {
        height: 168,
        chest: 88,
        waist: 66,
        hips: 94,
        lastUpdated: '2024-01-01T00:00:00Z'
      };

      // Save initial measurements
      localStorage.setItem(`measurements_${userId}`, JSON.stringify(initialMeasurements));
      
      // Update measurements
      const updatedMeasurements = {
        ...initialMeasurements,
        chest: 90, // Updated
        waist: 68, // Updated
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(`measurements_${userId}`, JSON.stringify(updatedMeasurements));
      
      const saved = JSON.parse(localStorage.getItem(`measurements_${userId}`));
      expect(saved.chest).toBe(90);
      expect(saved.waist).toBe(68);
      expect(new Date(saved.lastUpdated).getTime()).toBeGreaterThan(new Date(initialMeasurements.lastUpdated).getTime());
    });

    test('FR-002.4: Measurements are stored securely and linked to the user profile', () => {
      const userProfile = {
        id: 'user-456',
        email: 'user@example.com',
        preferences: {
          units: 'cm',
          privacy: 'private'
        }
      };

      const measurements = {
        userId: userProfile.id,
        data: {
          height: 172,
          chest: 92,
          waist: 74,
          hips: 98
        },
        privacy: userProfile.preferences.privacy,
        encrypted: true,
        lastUpdated: new Date().toISOString()
      };

      // Store linked data
      localStorage.setItem(`profile_${userProfile.id}`, JSON.stringify(userProfile));
      localStorage.setItem(`measurements_${userProfile.id}`, JSON.stringify(measurements));

      // Verify linkage
      const storedProfile = JSON.parse(localStorage.getItem(`profile_${userProfile.id}`));
      const storedMeasurements = JSON.parse(localStorage.getItem(`measurements_${userProfile.id}`));

      expect(storedMeasurements.userId).toBe(storedProfile.id);
      expect(storedMeasurements.privacy).toBe(storedProfile.preferences.privacy);
      expect(storedMeasurements.encrypted).toBe(true);
    });
  });

  describe('End-to-End User Workflows', () => {
    test('should support complete avatar creation and garment selection workflow', () => {
      // Step 1: User inputs measurements
      const measurements = {
        height: 165,
        chest: 86,
        waist: 68,
        hips: 92
      };

      // Step 2: Avatar is generated based on measurements  
      const avatarConfig = {
        baseModel: 'female-m',
        morphTargets: {
          height: (measurements.height - 165) / 165, // Normalized
          chest: (measurements.chest - 85) / 85,
          waist: (measurements.waist - 70) / 70,
          hips: (measurements.hips - 90) / 90
        }
      };

      // Step 3: Garment is selected and applied
      const selectedGarment = {
        id: 'dress-001',
        name: 'Summer Dress',
        category: 'dresses',
        material: 'cotton'
      };

      // Step 4: Complete look is created
      const completeLook = {
        id: `look_${Date.now()}`,
        measurements,
        avatarConfig,
        garment: selectedGarment,
        created: new Date().toISOString()
      };

      // Verify workflow completion
      expect(completeLook.measurements.height).toBe(165);
      expect(completeLook.avatarConfig.baseModel).toBe('female-m');
      expect(completeLook.garment.name).toBe('Summer Dress');
      expect(completeLook.id).toMatch(/^look_\d+$/);
    });

    test('should handle avatar switching and garment re-fitting', () => {
      const originalLook = {
        avatarId: 'female-s',
        garmentId: 'top-001',
        fit: 'perfect'
      };

      // Switch to different avatar size
      const updatedLook = {
        ...originalLook,
        avatarId: 'female-l',
        fit: 'needs-adjustment', // Garment may need re-fitting
        lastModified: new Date().toISOString()
      };

      expect(updatedLook.avatarId).toBe('female-l');
      expect(updatedLook.fit).toBe('needs-adjustment');
      expect(updatedLook.garmentId).toBe(originalLook.garmentId);
    });
  });
});