// Cloth Simulation Manager
// Handles the integration between Model Viewer and physics engines

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
        this.usingFallback = true
        console.log("✅ Cloth simulation initialized with simple physics")
        return true
      }

      console.error("❌ No physics engines available")
      return false
    } catch (error) {
      console.error("❌ Failed to initialize cloth simulation:", error)

      // Try fallback physics
      if (window.SimpleClothPhysics) {
        console.log("🔄 Trying fallback physics after error...")
        this.physics = new window.SimpleClothPhysics()
        this.usingFallback = true
        console.log("✅ Cloth simulation initialized with simple physics (fallback)")
        return true
      }

      return false
    }
  }

  async extractMeshData(modelViewer) {
    return new Promise((resolve) => {
      // Check if model is already loaded
      if (modelViewer.loaded) {
        this.processMeshData(modelViewer, resolve)
      } else {
        // Wait for model to load
        modelViewer.addEventListener(
          "load",
          () => {
            this.processMeshData(modelViewer, resolve)
          },
          { once: true },
        )
      }
    })
  }

  processMeshData(modelViewer, resolve) {
    try {
      // Access the Three.js scene from model-viewer
      const scene = modelViewer.model
      if (!scene) {
        console.warn("⚠️ No scene found in model viewer")
        resolve(null)
        return
      }

      let meshData = null
      scene.traverse((child) => {
        if (child.isMesh && child.geometry) {
          const geometry = child.geometry

          // Get position attribute
          const positions = geometry.attributes.position
          if (positions) {
            const vertices = Array.from(positions.array)

            // Get indices
            let indices
            if (geometry.index) {
              indices = Array.from(geometry.index.array)
            } else {
              // Generate indices for non-indexed geometry
              indices = []
              for (let i = 0; i < vertices.length / 3; i++) {
                indices.push(i)
              }
            }

            meshData = {
              vertices: vertices,
              indices: indices,
              geometry: geometry,
              mesh: child,
            }

            console.log(`✅ Extracted mesh data: ${vertices.length / 3} vertices, ${indices.length / 3} triangles`)
          }
        }
      })

      resolve(meshData)
    } catch (error) {
      console.error("❌ Failed to extract mesh data:", error)
      resolve(null)
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
      const meshData = await this.extractMeshData(garmentViewer)
      if (!meshData) {
        console.warn("⚠️ Could not extract garment mesh data")
        return false
      }

      // Create cloth physics body
      const clothResult = this.physics.createClothFromGeometry(
        meshData.vertices,
        meshData.indices,
        { x: 0, y: 0.5, z: 0 }, // Start position above avatar
      )

      if (clothResult) {
        this.clothMeshes.set(clothResult.id, {
          ...clothResult,
          originalGeometry: meshData.geometry,
          mesh: meshData.mesh,
          viewer: garmentViewer,
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

      // Update cloth meshes
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
        if (updatedVertices && clothData.originalGeometry) {
          // Update the geometry vertices
          const positions = clothData.originalGeometry.attributes.position
          if (positions) {
            positions.array.set(updatedVertices)
            positions.needsUpdate = true

            // Update normals for proper lighting
            clothData.originalGeometry.computeVertexNormals()
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
}

// Export for use in main application - using window global instead of ES6 export
window.ClothSimulation = ClothSimulation
