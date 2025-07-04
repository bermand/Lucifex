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
      console.log("🔍 Extracting mesh data from Model Viewer...")

      // Model Viewer doesn't expose Three.js scene directly
      // We need to use Model Viewer's internal APIs or create synthetic mesh data

      // Check if we can access the internal Three.js scene
      let scene = null

      // Try different ways to access the scene
      if (modelViewer.model) {
        scene = modelViewer.model
      } else if (modelViewer._scene) {
        scene = modelViewer._scene
      } else if (modelViewer.shadowRoot) {
        // Try to find the canvas and get WebGL context
        const canvas = modelViewer.shadowRoot.querySelector("canvas")
        if (canvas) {
          console.log("📊 Found Model Viewer canvas, creating synthetic mesh data...")
          // Create synthetic mesh data for cloth simulation
          const syntheticMesh = this.createSyntheticClothMesh()
          resolve(syntheticMesh)
          return
        }
      }

      // If we found a scene object, try to traverse it
      if (scene && typeof scene.traverse === "function") {
        console.log("✅ Found Three.js scene in Model Viewer")

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

        if (meshData) {
          resolve(meshData)
          return
        }
      }

      // If we can't access the real mesh, create synthetic cloth mesh
      console.log("⚠️ Cannot access Model Viewer geometry directly, creating synthetic cloth mesh...")
      const syntheticMesh = this.createSyntheticClothMesh()
      resolve(syntheticMesh)
    } catch (error) {
      console.error("❌ Failed to extract mesh data:", error)

      // Fallback to synthetic mesh
      console.log("🔄 Creating synthetic cloth mesh as fallback...")
      const syntheticMesh = this.createSyntheticClothMesh()
      resolve(syntheticMesh)
    }
  }

  createSyntheticClothMesh() {
    // Create a simple cloth mesh for physics simulation
    // This represents a basic garment shape (like a t-shirt or dress)

    const width = 20 // Number of vertices across
    const height = 30 // Number of vertices down
    const scale = 0.05 // Size of each quad

    const vertices = []
    const indices = []

    // Generate vertices in a grid pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Position vertices to form a garment shape
        const xPos = (x - width / 2) * scale
        const yPos = (height - y) * scale * 0.8 // Taller than wide
        const zPos = Math.sin(x * 0.3) * 0.02 // Slight curve for 3D shape

        vertices.push(xPos, yPos, zPos)
      }
    }

    // Generate triangle indices
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const topLeft = y * width + x
        const topRight = y * width + (x + 1)
        const bottomLeft = (y + 1) * width + x
        const bottomRight = (y + 1) * width + (x + 1)

        // Two triangles per quad
        indices.push(topLeft, bottomLeft, topRight)
        indices.push(topRight, bottomLeft, bottomRight)
      }
    }

    console.log(`✅ Created synthetic cloth mesh: ${vertices.length / 3} vertices, ${indices.length / 3} triangles`)

    return {
      vertices: vertices,
      indices: indices,
      synthetic: true,
      geometry: null,
      mesh: null,
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
          synthetic: meshData.synthetic || false,
        })

        console.log(`✅ Garment physics setup complete (${this.usingFallback ? "Simple" : "Ammo.js"})`)

        if (meshData.synthetic) {
          console.log("💡 Using synthetic cloth mesh - physics will work but won't match exact garment shape")
        }

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

      // Update cloth meshes (only if we have real geometry)
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

        // For synthetic meshes, we can't update the actual Model Viewer geometry
        // But the physics simulation still runs for demonstration
        if (clothData.synthetic) {
          // Physics is running but we can't visually update the Model Viewer garment
          // This is expected behavior when using synthetic mesh data
          return
        }

        // For real geometry, try to update if possible
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

  getSimulationInfo() {
    const clothCount = this.clothMeshes.size
    const syntheticCount = Array.from(this.clothMeshes.values()).filter((cloth) => cloth.synthetic).length
    const realCount = clothCount - syntheticCount

    return {
      engine: this.getPhysicsType(),
      clothBodies: clothCount,
      syntheticMeshes: syntheticCount,
      realMeshes: realCount,
      isRunning: this.isRunning,
    }
  }
}

// Export for use in main application - using window global instead of ES6 export
window.ClothSimulation = ClothSimulation
