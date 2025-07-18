// Cloth Simulation Manager
// Handles the integration between Model Viewer and Ammo.js physics

// Import AmmoPhysics
import AmmoPhysics from "./ammo-physics"

class ClothSimulation {
  constructor() {
    this.physics = new AmmoPhysics()
    this.isRunning = false
    this.animationId = null
    this.lastTime = 0
    this.clothMeshes = new Map()
    this.avatarCollider = null
  }

  async initialize() {
    try {
      const success = await this.physics.initPhysicsWorld()
      if (success) {
        console.log("✅ Cloth simulation initialized")
        return true
      }
      return false
    } catch (error) {
      console.error("❌ Failed to initialize cloth simulation:", error)
      return false
    }
  }

  async extractMeshData(modelViewer) {
    return new Promise((resolve) => {
      modelViewer.addEventListener("load", () => {
        try {
          // Access the Three.js scene from model-viewer
          const scene = modelViewer.model
          if (!scene) {
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
              }
            }
          })

          resolve(meshData)
        } catch (error) {
          console.error("❌ Failed to extract mesh data:", error)
          resolve(null)
        }
      })
    })
  }

  async setupAvatarPhysics(avatarViewer) {
    if (!avatarViewer) return false

    try {
      // Create avatar collider
      this.avatarCollider = this.physics.createAvatarCollider(
        { x: 0, y: 0, z: 0 }, // Position
        { x: 0.4, y: 0.9, z: 0.2 }, // Scale (adjust based on avatar size)
      )

      console.log("✅ Avatar physics setup complete")
      return true
    } catch (error) {
      console.error("❌ Failed to setup avatar physics:", error)
      return false
    }
  }

  async setupGarmentPhysics(garmentViewer) {
    if (!garmentViewer) return false

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

        console.log("✅ Garment physics setup complete")
        return true
      }

      return false
    } catch (error) {
      console.error("❌ Failed to setup garment physics:", error)
      return false
    }
  }

  startSimulation() {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTime = performance.now()

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
    console.log("✅ Cloth simulation started")
  }

  stopSimulation() {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
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
    this.physics.cleanup()
    this.clothMeshes.clear()
    this.avatarCollider = null
    console.log("✅ Cloth simulation cleanup complete")
  }

  // Utility methods for adjusting physics parameters
  setClothStiffness(clothId, stiffness) {
    const clothData = this.clothMeshes.get(clothId)
    if (clothData) {
      const material = clothData.body.get_m_materials().at(0)
      material.set_m_kLST(stiffness)
      material.set_m_kAST(stiffness)
      material.set_m_kVST(stiffness)
    }
  }

  setGravity(x, y, z) {
    if (this.physics.physicsWorld) {
      const gravity = new this.physics.AmmoLib.btVector3(x, y, z)
      this.physics.physicsWorld.setGravity(gravity)
      this.physics.physicsWorld.getWorldInfo().set_m_gravity(gravity)
    }
  }
}

// Export for use in main application
window.ClothSimulation = ClothSimulation
