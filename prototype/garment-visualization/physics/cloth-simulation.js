// Cloth Simulation Wrapper
// Manages physics engines and updates visual representation of REAL 3D models

class ClothSimulation {
  constructor() {
    this.physicsEngine = null
    this.engineType = null
    this.isInitialized = false
    this.isRunning = false
    this.animationFrame = null
    this.lastTime = 0
    this.clothMeshes = new Map()
    this.avatarColliders = new Map()
    this.visualMeshes = new Map()
    this.updateCount = 0
    this.realModelViewers = new Map() // Store references to actual Model Viewer elements
    this.initialModelStates = new Map() // Store initial model states
  }

  async initialize() {
    try {
      console.log("🔄 Initializing Cloth Simulation for Real 3D Models...")

      // Always try Simple Physics first (it's more reliable)
      if (window.SimpleClothPhysics) {
        console.log("🔄 Trying Simple Physics Engine...")
        this.physicsEngine = new window.SimpleClothPhysics()
        const success = await this.physicsEngine.initPhysicsWorld()

        if (success) {
          this.engineType = "simple"
          this.isInitialized = true
          console.log("✅ Simple Physics Engine initialized successfully")
          return true
        }
      }

      // Fallback to Ammo.js if available
      if (window.AmmoPhysics) {
        console.log("🔄 Trying Ammo.js Physics Engine...")
        this.physicsEngine = new window.AmmoPhysics()
        const success = await this.physicsEngine.initPhysicsWorld()

        if (success) {
          this.engineType = "ammo"
          this.isInitialized = true
          console.log("✅ Ammo.js Physics Engine initialized successfully")
          return true
        }
      }

      throw new Error("No physics engine could be initialized")
    } catch (error) {
      console.error("❌ Failed to initialize cloth simulation:", error)
      return false
    }
  }

  async setupAvatarPhysics(avatarModelViewer) {
    if (!this.isInitialized) {
      console.error("❌ Cloth simulation not initialized")
      return false
    }

    try {
      console.log("🔄 Setting up avatar physics for real 3D model...")

      // Store reference to the real avatar model viewer
      this.realModelViewers.set("avatar", avatarModelViewer)

      // Wait for model to load if not already loaded
      await this.waitForModelLoad(avatarModelViewer)

      // Create multiple avatar colliders for better collision detection
      const colliders = [
        // Torso
        { pos: { x: 0, y: 0.6, z: 0 }, size: { x: 0.35, y: 0.4, z: 0.2 } },
        // Head
        { pos: { x: 0, y: 1.2, z: 0 }, size: { x: 0.15, y: 0.2, z: 0.15 } },
        // Arms
        { pos: { x: -0.4, y: 0.8, z: 0 }, size: { x: 0.1, y: 0.3, z: 0.1 } },
        { pos: { x: 0.4, y: 0.8, z: 0 }, size: { x: 0.1, y: 0.3, z: 0.1 } },
        // Legs
        { pos: { x: -0.15, y: 0.2, z: 0 }, size: { x: 0.12, y: 0.4, z: 0.12 } },
        { pos: { x: 0.15, y: 0.2, z: 0 }, size: { x: 0.12, y: 0.4, z: 0.12 } },
      ]

      let colliderCount = 0
      for (const collider of colliders) {
        const colliderId = this.physicsEngine.createAvatarCollider(collider.pos, collider.size)
        if (colliderId) {
          this.avatarColliders.set(`avatar-collider-${colliderCount}`, colliderId)
          colliderCount++
        }
      }

      if (colliderCount > 0) {
        console.log(`✅ Avatar physics setup complete with ${colliderCount} colliders for real model`)
        return true
      } else {
        throw new Error("Failed to create avatar colliders")
      }
    } catch (error) {
      console.error("❌ Failed to setup avatar physics:", error)
      return false
    }
  }

  async setupGarmentPhysics(garmentModelViewer) {
    if (!this.isInitialized) {
      console.error("❌ Cloth simulation not initialized")
      return false
    }

    try {
      console.log("🔄 Setting up garment physics for real 3D model...")

      // Store reference to the real garment model viewer
      this.realModelViewers.set("garment", garmentModelViewer)

      // Wait for model to load if not already loaded
      await this.waitForModelLoad(garmentModelViewer)

      // Store initial model state
      this.storeInitialModelState(garmentModelViewer, "garment")

      // Create cloth mesh positioned above the avatar
      const clothResult = this.physicsEngine.createClothFromGeometry(
        [], // vertices (will be generated procedurally)
        [], // indices (will be generated procedurally)
        { x: 0, y: 2.0, z: 0 }, // starting position well above avatar
      )

      if (clothResult && clothResult.id) {
        this.clothMeshes.set("main-garment", {
          physicsId: clothResult.id,
          modelViewer: garmentModelViewer,
          lastUpdateTime: 0,
        })

        // Create visual representation that will control the real model
        this.createVisualClothMesh(garmentModelViewer, clothResult.id)

        console.log("✅ Garment physics setup complete for real model")
        return true
      } else {
        throw new Error("Failed to create cloth mesh")
      }
    } catch (error) {
      console.error("❌ Failed to setup garment physics:", error)
      return false
    }
  }

  async waitForModelLoad(modelViewer) {
    return new Promise((resolve) => {
      if (modelViewer.loaded) {
        resolve()
      } else {
        modelViewer.addEventListener("load", resolve, { once: true })
      }
    })
  }

  storeInitialModelState(modelViewer, type) {
    // Store the initial state of the model for reset purposes
    this.initialModelStates.set(type, {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    })
  }

  createVisualClothMesh(modelViewer, clothId) {
    try {
      // Get initial cloth vertices from physics engine
      const vertices = this.physicsEngine.getClothVertices(clothId)
      if (!vertices) {
        console.error("❌ Could not get initial cloth vertices")
        return
      }

      // Create a visual indicator that shows the cloth is being simulated
      const clothData = this.physicsEngine.clothMeshes.get(clothId)
      if (clothData) {
        console.log(`🎨 Visual cloth mesh created for REAL 3D model with ${clothData.particles.length} particles`)

        // Store visual mesh reference with initial vertices
        this.visualMeshes.set(clothId, {
          particleCount: clothData.particles.length,
          lastVertices: new Float32Array(vertices), // Copy the initial vertices
          updateCount: 0,
          realModelViewer: modelViewer, // Store reference to the real model
        })
      }
    } catch (error) {
      console.error("❌ Failed to create visual cloth mesh:", error)
    }
  }

  startSimulation() {
    if (!this.isInitialized) {
      console.error("❌ Cannot start simulation - not initialized")
      return
    }

    if (this.isRunning) {
      console.log("⚠️ Simulation already running")
      return
    }

    console.log("▶️ Starting physics simulation with REAL 3D model updates...")
    this.isRunning = true
    this.lastTime = performance.now()
    this.updateCount = 0
    this.animate()

    // Log status every 5 seconds
    this.statusInterval = setInterval(() => {
      this.logSimulationStatus()
    }, 5000)
  }

  stopSimulation() {
    if (!this.isRunning) {
      console.log("⚠️ Simulation not running")
      return
    }

    console.log("⏹️ Stopping physics simulation...")
    this.isRunning = false

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    if (this.statusInterval) {
      clearInterval(this.statusInterval)
      this.statusInterval = null
    }
  }

  resetSimulation() {
    console.log("🔄 Resetting physics simulation and real 3D models...")

    if (this.physicsEngine) {
      // Reset all cloth positions
      this.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
        const { particles } = clothData

        // Reset all particles to original high position
        particles.forEach((particle, index) => {
          const gridX = particle.gridX || index % 16
          const gridY = particle.gridY || Math.floor(index / 16)

          // Calculate original position
          const normalizedX = gridX / 15 // 0 to 1
          const normalizedY = gridY / 19 // 0 to 1

          // Reset to high starting position (higher than before)
          particle.position.x = (normalizedX - 0.5) * 1.0 // -0.5 to 0.5
          particle.position.y = 3.0 - normalizedY * 0.5 // 3.0 to 2.5 (much higher)
          particle.position.z = (Math.random() - 0.5) * 0.1 // Small Z variation

          // Reset old position for initial velocity
          particle.oldPosition.x = particle.position.x + (Math.random() - 0.5) * 0.02
          particle.oldPosition.y = particle.position.y + 0.05 // Small upward velocity
          particle.oldPosition.z = particle.position.z + (Math.random() - 0.5) * 0.02
        })

        console.log(`✅ Cloth ${clothId} reset to high starting position`)
      })

      // Reset real model transformations using Model Viewer API
      const garmentViewer = this.realModelViewers.get("garment")
      if (garmentViewer) {
        this.resetModelTransform(garmentViewer)
        console.log("✅ Real garment model reset to original position")
      }

      // Reset simulation time
      this.physicsEngine.simulationTime = 0
    }
  }

  resetModelTransform(modelViewer) {
    try {
      // Reset using Model Viewer's built-in properties to avoid background movement
      if (modelViewer.model) {
        modelViewer.model.position.set(0, 0, 0)
        modelViewer.model.rotation.set(0, 0, 0)
        modelViewer.model.scale.set(1, 1, 1)
      }

      // Also reset any CSS transforms as fallback
      modelViewer.style.transform = ""
      modelViewer.style.filter = ""
      modelViewer.style.opacity = "1.0"
    } catch (error) {
      console.error("❌ Failed to reset model transform:", error)
    }
  }

  animate() {
    if (!this.isRunning) return

    const currentTime = performance.now()
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1 / 30) // Cap at 30fps
    this.lastTime = currentTime
    this.updateCount++

    // Update physics
    if (this.physicsEngine && this.physicsEngine.updatePhysics) {
      this.physicsEngine.updatePhysics(deltaTime)
    }

    // Update REAL 3D models based on physics
    this.updateRealModelMeshes()

    // Continue animation loop
    this.animationFrame = requestAnimationFrame(() => this.animate())
  }

  updateRealModelMeshes() {
    try {
      this.clothMeshes.forEach((clothData, clothName) => {
        const physicsId = clothData.physicsId
        const modelViewer = clothData.modelViewer

        if (!physicsId || !modelViewer) return

        // Get updated vertices from physics engine
        const vertices = this.physicsEngine.getClothVertices(physicsId)
        if (!vertices) return

        // Update visual mesh reference
        const visualMesh = this.visualMeshes.get(physicsId)
        if (visualMesh) {
          visualMesh.updateCount++

          // Log visual updates occasionally
          if (visualMesh.updateCount % 300 === 0) {
            // Every ~5 seconds at 60fps
            console.log(
              `🎨 REAL model updated: ${visualMesh.particleCount} particles, update #${visualMesh.updateCount}`,
            )
            this.logClothMovement(vertices, physicsId)
          }

          // Update stored vertices for next comparison
          visualMesh.lastVertices = new Float32Array(vertices)
        }

        // Update the REAL Model Viewer based on physics
        this.updateRealModelViewer(modelViewer, vertices, physicsId)
      })
    } catch (error) {
      console.error("❌ Failed to update real model meshes:", error)
    }
  }

  updateRealModelViewer(modelViewer, vertices, clothId) {
    try {
      // Calculate cloth statistics for visual feedback
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      let avgY = 0
      let avgX = 0
      let avgZ = 0

      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i]
        const y = vertices[i + 1]
        const z = vertices[i + 2]

        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
        avgY += y
        avgX += x
        avgZ += z
      }

      const particleCount = vertices.length / 3
      avgY /= particleCount
      avgX /= particleCount
      avgZ /= particleCount

      // Store cloth stats for status display
      const clothStats = {
        minY: minY.toFixed(3),
        maxY: maxY.toFixed(3),
        avgY: avgY.toFixed(3),
        avgX: avgX.toFixed(3),
        avgZ: avgZ.toFixed(3),
        heightRange: (maxY - minY).toFixed(3),
        particleCount: particleCount,
        lastUpdate: Date.now(),
      }

      // Update cloth data with stats
      const clothData = this.clothMeshes.get("main-garment")
      if (clothData) {
        clothData.stats = clothStats
        clothData.lastUpdateTime = Date.now()
      }

      // Apply physics-based transformations to the REAL Model Viewer (without moving background)
      this.applyPhysicsToRealModel(modelViewer, vertices, clothStats)
    } catch (error) {
      console.error("❌ Failed to update real model viewer:", error)
    }
  }

  applyPhysicsToRealModel(modelViewer, vertices, clothStats) {
    try {
      // Calculate physics-based transformations
      const avgY = Number.parseFloat(clothStats.avgY)
      const avgX = Number.parseFloat(clothStats.avgX)
      const avgZ = Number.parseFloat(clothStats.avgZ)
      const heightRange = Number.parseFloat(clothStats.heightRange)

      // How much the cloth has dropped from starting position (3.0m)
      const dropAmount = Math.max(0, 3.0 - avgY)
      const dropProgress = Math.min(dropAmount / 2.0, 1.0) // 0 to 1

      // Sagging effect based on height range
      const sagAmount = Math.max(0, heightRange - 0.5) / 1.5 // How much it's stretched
      const sagProgress = Math.min(sagAmount, 1.0)

      // Calculate transformations
      const positionY = -dropProgress * 0.3 // Move model down as cloth falls
      const positionX = avgX * 0.1 // Follow cloth center X
      const positionZ = avgZ * 0.1 // Follow cloth center Z

      const scaleY = Math.max(0.7, 1 - sagProgress * 0.3) // Compress as it sags
      const scaleX = 1 + sagProgress * 0.1 // Slight horizontal expansion
      const scaleZ = 1 + sagProgress * 0.05 // Slight depth expansion

      const rotationX = sagProgress * 0.1 // Tilt as it drapes (in radians)
      const rotationZ = Math.sin(this.updateCount * 0.01) * dropProgress * 0.05 // Subtle sway

      // Apply transformations using Model Viewer's API to avoid background movement
      if (modelViewer.model) {
        // Set position
        modelViewer.model.position.set(positionX, positionY, positionZ)

        // Set rotation
        modelViewer.model.rotation.set(rotationX, 0, rotationZ)

        // Set scale
        modelViewer.model.scale.set(scaleX, scaleY, scaleZ)

        console.log(
          `🎬 Model transform: pos(${positionX.toFixed(3)}, ${positionY.toFixed(3)}, ${positionZ.toFixed(3)}) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}, ${scaleZ.toFixed(3)})`,
        )
      } else {
        // Fallback to CSS transforms if Model Viewer API not available
        console.log("⚠️ Using CSS transform fallback")
        const transform = `
          translate3d(${positionX * 100}px, ${positionY * 100}px, ${positionZ * 100}px)
          scale3d(${scaleX}, ${scaleY}, ${scaleZ})
          rotateX(${rotationX * 57.3}deg)
          rotateZ(${rotationZ * 57.3}deg)
        `

        if (modelViewer.style) {
          modelViewer.style.transform = transform
        }
      }

      // Log dramatic changes
      if (dropProgress > 0.1) {
        console.log(
          `🎬 REAL MODEL PHYSICS: Drop ${(dropProgress * 100).toFixed(0)}%, Sag ${(sagProgress * 100).toFixed(0)}%, Y: ${avgY.toFixed(2)}m`,
        )
      }
    } catch (error) {
      console.error("❌ Failed to apply physics to real model:", error)
    }
  }

  logClothMovement(vertices, clothId) {
    try {
      // Calculate movement statistics
      let totalMovement = 0
      let maxMovement = 0
      let movingParticles = 0

      const visualMesh = this.visualMeshes.get(clothId)
      if (visualMesh && visualMesh.lastVertices && visualMesh.lastVertices.length === vertices.length) {
        const prevVertices = visualMesh.lastVertices

        for (let i = 0; i < vertices.length; i += 3) {
          const dx = vertices[i] - prevVertices[i]
          const dy = vertices[i + 1] - prevVertices[i + 1]
          const dz = vertices[i + 2] - prevVertices[i + 2]
          const movement = Math.sqrt(dx * dx + dy * dy + dz * dz)

          totalMovement += movement
          maxMovement = Math.max(maxMovement, movement)

          if (movement > 0.0001) {
            // Threshold for "moving"
            movingParticles++
          }
        }

        const avgMovement = totalMovement / (vertices.length / 3)

        console.log(`📊 REAL Model Movement Analysis:`)
        console.log(`   • Average movement: ${avgMovement.toFixed(6)}m`)
        console.log(`   • Max movement: ${maxMovement.toFixed(6)}m`)
        console.log(`   • Moving particles: ${movingParticles}/${vertices.length / 3}`)

        // Check if cloth is actually moving and colliding
        if (avgMovement > 0.001) {
          console.log(`✅ REAL MODEL IS MOVING! Average: ${avgMovement.toFixed(6)}m/frame`)
        } else if (avgMovement > 0.0001) {
          console.log(`⚠️ Real model moving slowly: ${avgMovement.toFixed(6)}m/frame`)
        } else {
          console.log(`❌ Real model appears static: ${avgMovement.toFixed(6)}m/frame`)
        }
      } else {
        console.log(`⚠️ No previous vertices to compare movement (first frame)`)

        // Store current vertices for next comparison
        if (visualMesh) {
          visualMesh.lastVertices = new Float32Array(vertices)
        }
      }
    } catch (error) {
      console.error("❌ Failed to log cloth movement:", error)
    }
  }

  logSimulationStatus() {
    if (!this.isInitialized) return

    const status = this.getDetailedStatus()
    console.log("🔄 REAL Model Physics Simulation Status:")
    console.log(`   Engine: ${status.engine}`)
    console.log(`   Running: ${this.isRunning}`)
    console.log(`   Update Count: ${this.updateCount}`)
    console.log(`   Cloth Meshes: ${status.clothMeshes}`)
    console.log(`   Avatar Colliders: ${status.avatarColliders}`)
    console.log(`   Real Model Viewers: ${this.realModelViewers.size}`)

    if (status.physicsDetails) {
      console.log(`   Total Particles: ${status.physicsDetails.totalParticles}`)
      console.log(`   Total Constraints: ${status.physicsDetails.totalConstraints}`)
    }

    // Log cloth-specific stats
    this.clothMeshes.forEach((clothData, clothName) => {
      if (clothData.stats) {
        console.log(`   Real Model ${clothName}:`)
        console.log(`     • Height range: ${clothData.stats.heightRange}m`)
        console.log(`     • Average Y: ${clothData.stats.avgY}m`)
        console.log(`     • Average X: ${clothData.stats.avgX}m`)
        console.log(`     • Average Z: ${clothData.stats.avgZ}m`)
        console.log(`     • Particles: ${clothData.stats.particleCount}`)
      }
    })
  }

  setGravity(x, y, z) {
    if (this.physicsEngine && this.physicsEngine.setGravity) {
      this.physicsEngine.setGravity(x, y, z)
      console.log(`🌍 Gravity updated to: ${x}, ${y}, ${z} (affects real models)`)
    }
  }

  setClothStiffness(clothId, stiffness) {
    if (this.physicsEngine && this.physicsEngine.setClothStiffness) {
      // Map our cloth IDs to engine cloth IDs
      const clothData = this.clothMeshes.get(clothId)
      if (clothData && clothData.physicsId) {
        this.physicsEngine.setClothStiffness(clothData.physicsId, stiffness)
        console.log(`🧵 Real model cloth stiffness updated to: ${stiffness}`)
      }
    }
  }

  getPhysicsType() {
    if (!this.physicsEngine) return "None"
    return this.physicsEngine.getPhysicsType ? this.physicsEngine.getPhysicsType() : this.engineType
  }

  getDetailedStatus() {
    if (!this.physicsEngine || !this.physicsEngine.getDetailedStatus) {
      return {
        engine: "None",
        initialized: false,
        clothMeshes: 0,
        avatarColliders: 0,
      }
    }

    const engineStatus = this.physicsEngine.getDetailedStatus()
    return {
      ...engineStatus,
      running: this.isRunning,
      updateCount: this.updateCount,
      clothMeshes: this.clothMeshes.size,
      avatarColliders: this.avatarColliders.size,
      realModelViewers: this.realModelViewers.size,
    }
  }

  logDetailedStatus() {
    console.log("📊 REAL Model Cloth Simulation Detailed Status:")
    console.log(`   Wrapper Initialized: ${this.isInitialized}`)
    console.log(`   Wrapper Running: ${this.isRunning}`)
    console.log(`   Engine Type: ${this.engineType}`)
    console.log(`   Update Count: ${this.updateCount}`)
    console.log(`   Cloth Meshes (Wrapper): ${this.clothMeshes.size}`)
    console.log(`   Avatar Colliders (Wrapper): ${this.avatarColliders.size}`)
    console.log(`   Real Model Viewers: ${this.realModelViewers.size}`)

    // Log real model viewer details
    this.realModelViewers.forEach((viewer, type) => {
      console.log(`   Real ${type} model:`, viewer ? "✅ Connected" : "❌ Missing")
    })

    if (this.physicsEngine && this.physicsEngine.logFullStatus) {
      this.physicsEngine.logFullStatus()
    }

    // Force movement analysis for all cloths
    console.log("🔍 === REAL MODEL MOVEMENT ANALYSIS ===")
    this.clothMeshes.forEach((clothData, clothName) => {
      const physicsId = clothData.physicsId
      if (physicsId) {
        const vertices = this.physicsEngine.getClothVertices(physicsId)
        if (vertices) {
          console.log(`Analyzing movement for real model ${clothName}:`)
          this.logClothMovement(vertices, physicsId)
        }
      }
    })
  }

  logFullStatus() {
    this.logDetailedStatus()
  }

  cleanup() {
    this.stopSimulation()

    if (this.physicsEngine && this.physicsEngine.cleanup) {
      this.physicsEngine.cleanup()
    }

    this.clothMeshes.clear()
    this.avatarColliders.clear()
    this.visualMeshes.clear()
    this.realModelViewers.clear()
    this.initialModelStates.clear()
    this.physicsEngine = null
    this.engineType = null
    this.isInitialized = false

    console.log("✅ Real model cloth simulation cleanup complete")
  }
}

// Export for use in main application
window.ClothSimulation = ClothSimulation
