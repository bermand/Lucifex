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

      // Create avatar collider at center position
      const colliderId = this.physicsEngine.createAvatarCollider({ x: 0, y: 0, z: 0 }, { x: 0.4, y: 0.9, z: 0.2 })

      if (colliderId) {
        this.avatarColliders.set("main-avatar", colliderId)
        console.log("✅ Avatar physics setup complete for real model")
        return true
      } else {
        throw new Error("Failed to create avatar collider")
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

      // Create cloth mesh (we'll use a procedural t-shirt shape that will control the real model)
      const clothResult = this.physicsEngine.createClothFromGeometry(
        [], // vertices (will be generated procedurally)
        [], // indices (will be generated procedurally)
        { x: 0, y: 1.5, z: 0 }, // starting position above avatar
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

          // Reset to high starting position
          particle.position.x = (normalizedX - 0.5) * 1.0 // -0.5 to 0.5
          particle.position.y = 2.5 - normalizedY * 1.2 // 2.5 to 1.3
          particle.position.z = (Math.random() - 0.5) * 0.1 // Small Z variation

          // Reset old position for initial velocity
          particle.oldPosition.x = particle.position.x + (Math.random() - 0.5) * 0.05
          particle.oldPosition.y = particle.position.y + 0.1 // Small upward velocity
          particle.oldPosition.z = particle.position.z + (Math.random() - 0.5) * 0.05
        })

        console.log(`✅ Cloth ${clothId} reset to starting position`)
      })

      // Reset real model transformations
      const garmentViewer = this.realModelViewers.get("garment")
      if (garmentViewer) {
        garmentViewer.style.transform = "translateY(0px) scaleY(1) scaleX(1) rotateX(0deg)"
        garmentViewer.style.opacity = "1.0"
        console.log("✅ Real garment model reset to original position")
      }

      // Reset simulation time
      this.physicsEngine.simulationTime = 0
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

      for (let i = 1; i < vertices.length; i += 3) {
        const y = vertices[i]
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
        avgY += y
      }
      avgY /= vertices.length / 3

      // Store cloth stats for status display
      const clothStats = {
        minY: minY.toFixed(3),
        maxY: maxY.toFixed(3),
        avgY: avgY.toFixed(3),
        heightRange: (maxY - minY).toFixed(3),
        particleCount: vertices.length / 3,
        lastUpdate: Date.now(),
      }

      // Update cloth data with stats
      const clothData = this.clothMeshes.get("main-garment")
      if (clothData) {
        clothData.stats = clothStats
        clothData.lastUpdateTime = Date.now()
      }

      // Apply dramatic physics-based transformations to the REAL Model Viewer
      this.applyPhysicsToRealModel(modelViewer, vertices, clothStats)
    } catch (error) {
      console.error("❌ Failed to update real model viewer:", error)
    }
  }

  applyPhysicsToRealModel(modelViewer, vertices, clothStats) {
    try {
      // Calculate physics-based transformations
      const avgY = Number.parseFloat(clothStats.avgY)
      const heightRange = Number.parseFloat(clothStats.heightRange)

      // How much the cloth has dropped from starting position (2.5m)
      const dropAmount = Math.max(0, 2.5 - avgY)
      const dropProgress = Math.min(dropAmount / 2.5, 1.0) // 0 to 1

      // Sagging effect based on height range
      const sagAmount = Math.max(0, heightRange - 1.0) / 2.0 // How much it's stretched
      const sagProgress = Math.min(sagAmount, 1.0)

      // Apply DRAMATIC transformations to the REAL Model Viewer
      const translateY = dropProgress * 200 // Move down as cloth falls (more dramatic)
      const swayX = Math.sin(this.updateCount * 0.02) * dropProgress * 5
      const swayZ = Math.cos(this.updateCount * 0.015) * dropProgress * 3
      const scaleY = Math.max(0.6, 1 - sagProgress * 0.4) // Compress as it sags (more dramatic)
      const scaleX = 1 + sagProgress * 0.2 // Slight horizontal expansion
      const rotateX = sagProgress * 15 // Tilt as it drapes (more dramatic)

      // Apply to the REAL model viewer
      if (modelViewer && modelViewer.style) {
        modelViewer.style.transform = `
          translateY(${translateY}px)
          translateX(${swayX}px)
          scaleY(${scaleY})
          scaleX(${scaleX})
          rotateX(${rotateX}deg)
          rotateZ(${swayZ}deg)
        `

        // Add visual feedback through opacity changes
        const opacity = Math.max(0.7, 1.0 - dropProgress * 0.1)
        modelViewer.style.opacity = opacity.toString()

        // Add physics-based filter effects
        const blur = dropProgress * 0.5
        const brightness = 1 + sagProgress * 0.2
        modelViewer.style.filter = `blur(${blur}px) brightness(${brightness})`
      }

      // Log dramatic changes
      if (dropProgress > 0.1) {
        console.log(
          `🎬 REAL MODEL PHYSICS EFFECT: Drop ${(dropProgress * 100).toFixed(0)}%, Sag ${(sagProgress * 100).toFixed(0)}%`,
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
        console.log(`   • Total movement: ${totalMovement.toFixed(6)}m`)
        console.log(`   • Moving particles: ${movingParticles}/${vertices.length / 3}`)
        console.log(`   • Movement threshold: 0.0001m`)

        // Check if cloth is actually moving
        if (avgMovement > 0.001) {
          console.log(`✅ REAL MODEL IS MOVING! Average: ${avgMovement.toFixed(6)}m/frame`)
        } else if (avgMovement > 0.0001) {
          console.log(`⚠️ Real model moving slowly: ${avgMovement.toFixed(6)}m/frame`)
        } else {
          console.log(`❌ Real model appears static: ${avgMovement.toFixed(6)}m/frame`)
        }
      } else {
        console.log(`⚠️ No previous vertices to compare movement (first frame or data issue)`)

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
        console.log(`     • Particles: ${clothData.stats.particleCount}`)
        console.log(`     • Last update: ${new Date(clothData.stats.lastUpdate).toLocaleTimeString()}`)
      }
    })

    // Force a movement analysis
    this.clothMeshes.forEach((clothData, clothName) => {
      const physicsId = clothData.physicsId
      if (physicsId) {
        const vertices = this.physicsEngine.getClothVertices(physicsId)
        if (vertices) {
          console.log(`🔍 Forced movement check for real model ${clothName}:`)
          this.logClothMovement(vertices, physicsId)
        }
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
    this.physicsEngine = null
    this.engineType = null
    this.isInitialized = false

    console.log("✅ Real model cloth simulation cleanup complete")
  }
}

// Export for use in main application
window.ClothSimulation = ClothSimulation
