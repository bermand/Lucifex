class ClothSimulation {
  constructor() {
    this.physics = null
    this.isRunning = false
    this.animationId = null
    this.lastTime = 0
    this.clothMeshes = new Map()
    this.avatarCollider = null
    this.usingFallback = false
  }

  async initialize() {
    try {
      // Try to create AmmoPhysics instance first
      if (window.AmmoPhysics) {
        this.physics = new window.AmmoPhysics()
        const success = await this.physics.initPhysicsWorld()
        if (success) {
          console.log("✅ Cloth simulation initialized with Ammo.js")
          this.usingFallback = false
          return true
        }
      }

      // If Ammo.js fails, fall back to simple physics
      console.log("🔄 Falling back to simple cloth physics...")
      if (window.SimpleClothPhysics) {
        this.physics = new window.SimpleClothPhysics()
        const success = await this.physics.initPhysicsWorld()
        if (success) {
          this.usingFallback = true
          console.log("✅ Cloth simulation initialized with simple physics")
          return true
        }
      }

      console.error("❌ No physics engines available")
      return false
    } catch (error) {
      console.error("❌ Failed to initialize cloth simulation:", error)

      // Try fallback physics
      if (window.SimpleClothPhysics) {
        console.log("🔄 Trying fallback physics after error...")
        this.physics = new window.SimpleClothPhysics()
        const success = await this.physics.initPhysicsWorld()
        if (success) {
          this.usingFallback = true
          console.log("✅ Cloth simulation initialized with simple physics (fallback)")
          return true
        }
      }

      return false
    }
  }

  // Instead of trying to extract mesh from Model Viewer, create a standard cloth
  createStandardClothMesh() {
    // Create a realistic garment-like cloth mesh
    const width = 30
    const height = 40
    const vertices = []
    const indices = []

    // Generate vertices for a cloth that resembles a t-shirt shape
    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        // Create a t-shirt like shape
        let xPos = (x - width / 2) * 0.03
        const yPos = 1.8 - y * 0.04 // Start higher
        const zPos = 0

        // Add some shape variation for t-shirt
        if (y < height * 0.3) {
          // Shoulder area - wider
          xPos *= 1.2
        } else if (y > height * 0.7) {
          // Bottom area - slightly wider
          xPos *= 1.1
        }

        vertices.push(xPos, yPos, zPos)
      }
    }

    // Generate indices for triangles
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const topLeft = y * (width + 1) + x
        const topRight = topLeft + 1
        const bottomLeft = (y + 1) * (width + 1) + x
        const bottomRight = bottomLeft + 1

        // First triangle
        indices.push(topLeft, bottomLeft, topRight)
        // Second triangle
        indices.push(topRight, bottomLeft, bottomRight)
      }
    }

    console.log(`✅ Created standard cloth mesh: ${vertices.length / 3} vertices, ${indices.length / 3} triangles`)

    return {
      vertices: vertices,
      indices: indices,
      geometry: null,
      mesh: null,
      isStandard: true,
    }
  }

  async setupAvatarPhysics(avatarViewer) {
    if (!avatarViewer || !this.physics) return false

    try {
      if (!this.usingFallback && this.physics.createAvatarCollider) {
        // Create avatar collider for Ammo.js
        this.avatarCollider = this.physics.createAvatarCollider(
          { x: 0, y: 0, z: 0 }, // Position
          { x: 0.4, y: 0.9, z: 0.2 }, // Scale (adjust based on avatar size)
        )
        console.log("✅ Avatar physics setup complete (Ammo.js)")
      } else {
        // Simple physics doesn't need avatar colliders
        console.log("✅ Avatar physics setup complete (Simple)")
      }
      return true
    } catch (error) {
      console.error("❌ Failed to setup avatar physics:", error)
      return false
    }
  }

  async setupGarmentPhysics(garmentViewer) {
    if (!garmentViewer || !this.physics) return false

    try {
      // Instead of trying to extract mesh from Model Viewer, use standard cloth
      console.log("🎨 Creating standard cloth for physics simulation...")
      const meshData = this.createStandardClothMesh()

      // Create cloth physics body
      const clothResult = this.physics.createClothFromGeometry(
        meshData.vertices,
        meshData.indices,
        { x: 0, y: 0.2, z: 0 }, // Start position above avatar
      )

      if (clothResult) {
        this.clothMeshes.set(clothResult.id, {
          ...clothResult,
          originalGeometry: meshData.geometry,
          mesh: meshData.mesh,
          viewer: garmentViewer,
          isStandard: meshData.isStandard || false,
        })

        console.log(`✅ Garment physics setup complete (${this.usingFallback ? "Simple" : "Ammo.js"})`)
        return true
      }

      return false
    } catch (error) {
      console.error("❌ Failed to setup garment physics:", error)
      return false
    }
  }

  startSimulation() {
    if (this.isRunning || !this.physics) return

    this.isRunning = true
    this.lastTime = performance.now()

    // Start physics engine
    if (this.physics.startSimulation) {
      this.physics.startSimulation()
    }

    const animate = (currentTime) => {
      if (!this.isRunning) return

      const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1 / 30) // Cap at 30fps
      this.lastTime = currentTime

      // Update physics
      this.physics.updatePhysics(deltaTime)

      // Update cloth meshes (for visualization feedback)
      this.updateClothMeshes()

      this.animationId = requestAnimationFrame(animate)
    }

    this.animationId = requestAnimationFrame(animate)
    console.log(`✅ Cloth simulation started (${this.usingFallback ? "Simple Physics" : "Ammo.js"})`)
  }

  stopSimulation() {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    // Stop physics engine
    if (this.physics.stopSimulation) {
      this.physics.stopSimulation()
    }

    console.log("⏹️ Cloth simulation stopped")
  }

  updateClothMeshes() {
    this.clothMeshes.forEach((clothData, clothId) => {
      try {
        const updatedVertices = this.physics.getClothVertices(clothId)
        if (updatedVertices) {
          // For now, we just log that the simulation is running
          // In a full implementation, we'd update a visual representation
          if (Math.random() < 0.01) {
            // Log occasionally to avoid spam
            console.log(`📊 Cloth simulation running: ${updatedVertices.length / 3} vertices updated`)
          }
        }
      } catch (error) {
        console.error("❌ Failed to update cloth mesh:", error)
      }
    })
  }

  cleanup() {
    this.stopSimulation()
    if (this.physics && this.physics.cleanup) {
      this.physics.cleanup()
    }
    this.clothMeshes.clear()
    this.avatarCollider = null
    console.log("✅ Cloth simulation cleanup complete")
  }

  // Utility methods for adjusting physics parameters
  setClothStiffness(clothId, stiffness) {
    if (this.physics && this.physics.setClothStiffness) {
      this.physics.setClothStiffness(clothId, stiffness)
    }
  }

  setGravity(x, y, z) {
    if (this.physics && this.physics.setGravity) {
      this.physics.setGravity(x, y, z)
    }
  }

  getPhysicsType() {
    return this.usingFallback ? "Simple Physics" : "Ammo.js"
  }

  // Debug method to check cloth simulation status
  getSimulationStatus() {
    return {
      isRunning: this.isRunning,
      physicsType: this.getPhysicsType(),
      clothCount: this.clothMeshes.size,
      hasAvatarCollider: !!this.avatarCollider,
    }
  }
}

// Export for use in main application - using window global instead of ES6 export
window.ClothSimulation = ClothSimulation
