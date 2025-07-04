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
      console.log("🔍 Extracting mesh data from model-viewer...")

      // Try multiple methods to access the Three.js scene
      let scene = null

      // Method 1: Direct model property
      if (modelViewer.model) {
        scene = modelViewer.model
        console.log("✅ Found scene via model property")
      }

      // Method 2: Try accessing internal Three.js renderer
      if (!scene && modelViewer.shadowRoot) {
        const canvas = modelViewer.shadowRoot.querySelector("canvas")
        if (canvas && canvas.__threeRenderer) {
          scene = canvas.__threeRenderer.scene
          console.log("✅ Found scene via renderer")
        }
      }

      // Method 3: Try accessing via internal properties
      if (!scene && modelViewer._scene) {
        scene = modelViewer._scene
        console.log("✅ Found scene via _scene property")
      }

      if (!scene) {
        console.warn("⚠️ No scene found in model viewer, creating simple mesh data")
        // Create a simple cloth mesh for testing
        resolve(this.createSimpleClothMesh())
        return
      }

      let meshData = null

      // Function to traverse the scene
      const traverseScene = (object) => {
        if (object.isMesh && object.geometry) {
          const geometry = object.geometry

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
              mesh: object,
            }

            console.log(`✅ Extracted mesh data: ${vertices.length / 3} vertices, ${indices.length / 3} triangles`)
            return true // Found mesh, stop traversing
          }
        }

        // Traverse children
        if (object.children) {
          for (const child of object.children) {
            if (traverseScene(child)) {
              return true // Found mesh in child
            }
          }
        }

        return false
      }

      // Start traversal
      if (scene.traverse && typeof scene.traverse === "function") {
        // Use Three.js traverse method
        scene.traverse((child) => {
          if (!meshData && child.isMesh && child.geometry) {
            const geometry = child.geometry
            const positions = geometry.attributes.position
            if (positions) {
              const vertices = Array.from(positions.array)
              let indices
              if (geometry.index) {
                indices = Array.from(geometry.index.array)
              } else {
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
      } else {
        // Use custom traversal
        traverseScene(scene)
      }

      if (!meshData) {
        console.warn("⚠️ No mesh found in scene, creating simple cloth mesh")
        meshData = this.createSimpleClothMesh()
      }

      resolve(meshData)
    } catch (error) {
      console.error("❌ Failed to extract mesh data:", error)
      console.log("🔄 Creating fallback cloth mesh...")
      resolve(this.createSimpleClothMesh())
    }
  }

  createSimpleClothMesh() {
    // Create a simple cloth mesh for physics simulation
    const width = 20
    const height = 20
    const vertices = []
    const indices = []

    // Generate vertices for a cloth grid
    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        vertices.push(
          (x - width / 2) * 0.05, // X position
          1.5 - y * 0.05, // Y position (hanging from top)
          0, // Z position
        )
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

    console.log(`✅ Created simple cloth mesh: ${vertices.length / 3} vertices, ${indices.length / 3} triangles`)

    return {
      vertices: vertices,
      indices: indices,
      geometry: null, // No actual geometry object
      mesh: null, // No actual mesh object
      isSimple: true, // Flag to indicate this is a simple mesh
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
          isSimple: meshData.isSimple || false,
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
        if (updatedVertices) {
          if (clothData.originalGeometry && !clothData.isSimple) {
            // Update the actual geometry vertices
            const positions = clothData.originalGeometry.attributes.position
            if (positions) {
              positions.array.set(updatedVertices)
              positions.needsUpdate = true

              // Update normals for proper lighting
              clothData.originalGeometry.computeVertexNormals()
            }
          } else {
            // For simple meshes or when we can't update the original geometry,
            // we could create a visual representation here
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
