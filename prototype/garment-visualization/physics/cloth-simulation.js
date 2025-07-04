// Cloth Simulation Manager
// Handles both Ammo.js and Simple Physics engines with automatic fallback

import * as THREE from "three"

class ClothSimulation {
  constructor() {
    this.physicsEngine = null
    this.isAmmoJS = false
    this.isInitialized = false
    this.clothId = null
    this.clothMesh = null
    this.lastUpdateTime = 0
    this.updateInterval = 1000 / 60 // 60 FPS
    this.logInterval = 3000 // Log every 3 seconds
    this.lastLogTime = 0
  }

  async initialize() {
    console.log("🔄 Initializing cloth simulation...")

    // Try Ammo.js first
    try {
      this.physicsEngine = new window.AmmoPhysics()
      const ammoSuccess = await this.physicsEngine.initPhysicsWorld()

      if (ammoSuccess) {
        this.isAmmoJS = true
        console.log("✅ Using Ammo.js physics engine")
      } else {
        throw new Error("Ammo.js initialization failed")
      }
    } catch (error) {
      console.log("🔄 Ammo.js failed, falling back to simple physics")

      // Fallback to simple physics
      this.physicsEngine = new window.SimpleClothPhysics()
      await this.physicsEngine.initPhysicsWorld()
      this.isAmmoJS = false
      console.log("✅ Using simple physics engine")
    }

    this.isInitialized = true
    return true
  }

  async setupGarmentPhysics(scene) {
    if (!this.isInitialized) {
      console.error("❌ Physics not initialized")
      return false
    }

    try {
      console.log("🔄 Setting up garment physics...")

      // Create avatar collider (for collision detection)
      this.physicsEngine.createAvatarCollider(
        { x: 0, y: 0, z: 0 }, // position
        { x: 0.4, y: 0.9, z: 0.2 }, // scale
      )

      // Create standard cloth geometry for physics simulation
      const clothGeometry = this.createStandardClothGeometry()

      // Create physics cloth body
      const clothResult = this.physicsEngine.createClothFromGeometry(
        clothGeometry.vertices,
        clothGeometry.indices,
        { x: 0, y: 1.5, z: 0 }, // position above avatar
      )

      if (!clothResult) {
        console.error("❌ Failed to create physics cloth body")
        return false
      }

      this.clothId = clothResult.id

      // Create visual mesh for the cloth
      this.createVisualClothMesh(scene, clothGeometry)

      console.log("✅ Garment physics setup complete")
      return true
    } catch (error) {
      console.error("❌ Failed to setup garment physics:", error)
      return false
    }
  }

  createStandardClothGeometry() {
    // Create a simple rectangular cloth that will be shaped like a t-shirt
    const width = 20
    const height = 25
    const vertices = []
    const indices = []

    // Generate vertices in a grid pattern
    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        // Create t-shirt shape
        let shouldInclude = true

        // T-shirt shaping logic
        if (y <= height * 0.3) {
          // Shoulder area - full width
          shouldInclude = true
        } else if (y <= height * 0.5) {
          // Neck area - create armholes
          const centerX = width / 2
          const armholeSize = width * 0.25
          shouldInclude = Math.abs(x - centerX) > armholeSize || Math.abs(x - centerX) < width * 0.15
        } else {
          // Body area - full width
          shouldInclude = true
        }

        if (shouldInclude) {
          vertices.push(
            (x - width / 2) * 0.05, // x
            -y * 0.05, // y (negative to hang down)
            0, // z
          )
        }
      }
    }

    // Generate indices for triangles
    const verticesPerRow = width + 1
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const topLeft = y * verticesPerRow + x
        const topRight = topLeft + 1
        const bottomLeft = (y + 1) * verticesPerRow + x
        const bottomRight = bottomLeft + 1

        // Create two triangles per quad
        indices.push(topLeft, bottomLeft, topRight)
        indices.push(topRight, bottomLeft, bottomRight)
      }
    }

    console.log(`📐 Created standard cloth geometry: ${vertices.length / 3} vertices, ${indices.length / 3} triangles`)

    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices),
    }
  }

  createVisualClothMesh(scene, geometry) {
    // Create Three.js geometry for visualization
    const clothGeometry = new THREE.BufferGeometry()
    clothGeometry.setAttribute("position", new THREE.BufferAttribute(geometry.vertices, 3))
    clothGeometry.setIndex(new THREE.BufferAttribute(geometry.indices, 1))
    clothGeometry.computeVertexNormals()

    // Create material
    const clothMaterial = new THREE.MeshLambertMaterial({
      color: 0x4a90e2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    })

    // Create mesh
    this.clothMesh = new THREE.Mesh(clothGeometry, clothMaterial)
    this.clothMesh.position.set(0, 1.5, 0)
    this.clothMesh.castShadow = true
    this.clothMesh.receiveShadow = true

    scene.add(this.clothMesh)
    console.log("✅ Visual cloth mesh created and added to scene")
  }

  update(deltaTime) {
    if (!this.isInitialized || !this.physicsEngine) return

    const currentTime = Date.now()

    // Throttle physics updates for performance
    if (currentTime - this.lastUpdateTime >= this.updateInterval) {
      this.physicsEngine.updatePhysics(deltaTime)
      this.updateVisualMesh()
      this.lastUpdateTime = currentTime
    }

    // Periodic logging
    if (currentTime - this.lastLogTime >= this.logInterval) {
      this.logPhysicsState()
      this.lastLogTime = currentTime
    }
  }

  updateVisualMesh() {
    if (!this.clothMesh || !this.clothId) return

    // Get updated vertex positions from physics
    const updatedVertices = this.physicsEngine.getClothVertices(this.clothId)
    if (!updatedVertices) return

    // Update the visual mesh
    const positionAttribute = this.clothMesh.geometry.getAttribute("position")
    positionAttribute.array.set(updatedVertices)
    positionAttribute.needsUpdate = true

    // Recompute normals for proper lighting
    this.clothMesh.geometry.computeVertexNormals()
  }

  logPhysicsState() {
    if (!this.clothId) return

    const vertices = this.physicsEngine.getClothVertices(this.clothId)
    if (vertices && vertices.length >= 6) {
      console.log(
        `📊 Physics Update - Engine: ${this.isAmmoJS ? "Ammo.js" : "Simple"}, ` +
          `Vertices: ${vertices.length / 3}, ` +
          `Sample pos: (${vertices[0].toFixed(2)}, ${vertices[1].toFixed(2)}, ${vertices[2].toFixed(2)})`,
      )
    }
  }

  setGravity(x, y, z) {
    if (this.physicsEngine) {
      this.physicsEngine.setGravity(x, y, z)
      console.log(`🌍 Gravity set to (${x}, ${y}, ${z})`)
    }
  }

  setClothStiffness(stiffness) {
    if (this.physicsEngine && this.clothId) {
      this.physicsEngine.setClothStiffness(this.clothId, stiffness)
      console.log(`🧵 Cloth stiffness set to ${stiffness}`)
    }
  }

  reset() {
    if (this.physicsEngine && this.clothId) {
      this.physicsEngine.removeCloth(this.clothId)
      this.clothId = null
    }

    if (this.clothMesh) {
      this.clothMesh.parent?.remove(this.clothMesh)
      this.clothMesh = null
    }

    console.log("🔄 Cloth simulation reset")
  }

  cleanup() {
    this.reset()

    if (this.physicsEngine) {
      this.physicsEngine.cleanup()
      this.physicsEngine = null
    }

    this.isInitialized = false
    this.isAmmoJS = false
    console.log("🧹 Cloth simulation cleanup complete")
  }

  getEngineInfo() {
    return {
      isInitialized: this.isInitialized,
      engine: this.isAmmoJS ? "Ammo.js" : "Simple Physics",
      hasCloth: !!this.clothId,
    }
  }
}

// Export for use in main application
window.ClothSimulation = ClothSimulation
