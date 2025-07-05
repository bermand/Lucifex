// Cloth Simulation Wrapper
// Manages physics engines and updates visual representation

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
    this.visualMeshes = new Map() // Store references to visual meshes
    this.updateCount = 0
  }

  async initialize() {
    try {
      console.log("🔄 Initializing Cloth Simulation...")

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

  async setupAvatarPhysics(modelViewer) {
    if (!this.isInitialized) {
      console.error("❌ Cloth simulation not initialized")
      return false
    }

    try {
      console.log("🔄 Setting up avatar physics...")

      // Create avatar collider at center position
      const colliderId = this.physicsEngine.createAvatarCollider({ x: 0, y: 0, z: 0 }, { x: 0.4, y: 0.9, z: 0.2 })

      if (colliderId) {
        this.avatarColliders.set("main-avatar", colliderId)
        console.log("✅ Avatar physics setup complete")
        return true
      } else {
        throw new Error("Failed to create avatar collider")
      }
    } catch (error) {
      console.error("❌ Failed to setup avatar physics:", error)
      return false
    }
  }

  async setupGarmentPhysics(modelViewer) {
    if (!this.isInitialized) {
      console.error("❌ Cloth simulation not initialized")
      return false
    }

    try {
      console.log("🔄 Setting up garment physics...")

      // Create cloth mesh (we'll use a procedural t-shirt shape)
      const clothResult = this.physicsEngine.createClothFromGeometry(
        [], // vertices (will be generated procedurally)
        [], // indices (will be generated procedurally)
        { x: 0, y: 1.2, z: 0 }, // starting position above avatar
      )

      if (clothResult && clothResult.id) {
        this.clothMeshes.set("main-garment", {
          physicsId: clothResult.id,
          modelViewer: modelViewer,
          lastUpdateTime: 0,
        })

        // Create visual representation
        this.createVisualClothMesh(modelViewer, clothResult.id)

        console.log("✅ Garment physics setup complete")
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
        console.log(`🎨 Visual cloth mesh created for physics cloth with ${clothData.particles.length} particles`)

        // Store visual mesh reference with initial vertices
        this.visualMeshes.set(clothId, {
          particleCount: clothData.particles.length,
          lastVertices: new Float32Array(vertices), // Copy the initial vertices
          updateCount: 0,
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

    console.log("▶️ Starting physics simulation with visual updates...")
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
    console.log("🔄 Resetting physics simulation...")

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

    // Update visual representation
    this.updateVisualMeshes()

    // Continue animation loop
    this.animationFrame = requestAnimationFrame(() => this.animate())
  }

  updateVisualMeshes() {
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
              `🎨 Visual mesh updated: ${visualMesh.particleCount} particles, update #${visualMesh.updateCount}`,
            )
            this.logClothMovement(vertices, physicsId)
          }

          // Update stored vertices for next comparison
          visualMesh.lastVertices = new Float32Array(vertices)
        }

        // Update model viewer (this is where we'd normally update the 3D mesh)
        // For now, we'll create visual feedback through console and status updates
        this.updateModelViewerCloth(modelViewer, vertices, physicsId)
      })
    } catch (error) {
      console.error("❌ Failed to update visual meshes:", error)
    }
  }

  updateModelViewerCloth(modelViewer, vertices, clothId) {
    try {
      // Since we can't directly modify Model Viewer's mesh, we'll provide visual feedback
      // In a full implementation, this would update the actual 3D geometry

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

      // Apply dramatic physics-based transformations to the model viewer
      this.applyPhysicsToModelViewer(modelViewer, vertices, clothStats)
    } catch (error) {
      console.error("❌ Failed to update model viewer cloth:", error)
    }
  }

  applyPhysicsToModelViewer(modelViewer, vertices, clothStats) {
    try {
      // Calculate physics-based transformations
      const avgY = Number.parseFloat(clothStats.avgY)
      const heightRange = Number.parseFloat(clothStats.heightRange)

      // How much the cloth has dropped from starting position (2.2m)
      const dropAmount = Math.max(0, 2.2 - avgY)
      const dropProgress = Math.min(dropAmount / 2.0, 1.0) // 0 to 1

      // Sagging effect based on height range
      const sagAmount = Math.max(0, heightRange - 1.0) / 2.0 // How much it's stretched
      const sagProgress = Math.min(sagAmount, 1.0)

      // Apply dramatic transformations to the model viewer
      const translateY = dropProgress * 100 // Move down as cloth falls
      const scaleY = Math.max(0.7, 1 - sagProgress * 0.3) // Compress as it sags
      const scaleX = 1 + sagProgress * 0.1 // Slight horizontal expansion
      const rotateX = sagProgress * 10 // Tilt as it drapes

      // Apply to model viewer
      if (modelViewer && modelViewer.style) {
        modelViewer.style.transform = `
          translateY(${translateY}px)
          scaleY(${scaleY})
          scaleX(${scaleX})
          rotateX(${rotateX}deg)
        `

        // Add visual feedback through opacity changes
        const opacity = 0.8 + dropProgress * 0.2
        modelViewer.style.opacity = opacity.toString()
      }

      // Also apply to combined viewer
      const combinedViewer = document.getElementById("combined-viewer")
      if (combinedViewer && combinedViewer.style) {
        combinedViewer.style.transform = `
          translateY(${translateY}px)
          scaleY(${scaleY})
          scaleX(${scaleX})
          rotateX(${rotateX}deg)
        `
        const opacity = 0.8 + dropProgress * 0.2 // Declare opacity here
        combinedViewer.style.opacity = opacity.toString()
      }

      // Log dramatic changes
      if (dropProgress > 0.1) {
        console.log(
          `🎬 DRAMATIC PHYSICS EFFECT: Drop ${(dropProgress * 100).toFixed(0)}%, Sag ${(sagProgress * 100).toFixed(0)}%`,
        )
      }
    } catch (error) {
      console.error("❌ Failed to apply physics to model viewer:", error)
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

        console.log(`📊 Cloth Movement Analysis:`)
        console.log(`   • Average movement: ${avgMovement.toFixed(6)}m`)
        console.log(`   • Max movement: ${maxMovement.toFixed(6)}m`)
        console.log(`   • Total movement: ${totalMovement.toFixed(6)}m`)
        console.log(`   • Moving particles: ${movingParticles}/${vertices.length / 3}`)
        console.log(`   • Movement threshold: 0.0001m`)

        // Check if cloth is actually moving
        if (avgMovement > 0.001) {
          console.log(`✅ CLOTH IS MOVING! Average: ${avgMovement.toFixed(6)}m/frame`)
        } else if (avgMovement > 0.0001) {
          console.log(`⚠️ Cloth moving slowly: ${avgMovement.toFixed(6)}m/frame`)
        } else {
          console.log(`❌ Cloth appears static: ${avgMovement.toFixed(6)}m/frame`)
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
    console.log("🔄 Physics Simulation Status:")
    console.log(`   Engine: ${status.engine}`)
    console.log(`   Running: ${this.isRunning}`)
    console.log(`   Update Count: ${this.updateCount}`)
    console.log(`   Cloth Meshes: ${status.clothMeshes}`)
    console.log(`   Avatar Colliders: ${status.avatarColliders}`)
    console.log(`   Visual Meshes: ${this.visualMeshes.size}`)

    if (status.physicsDetails) {
      console.log(`   Total Particles: ${status.physicsDetails.totalParticles}`)
      console.log(`   Total Constraints: ${status.physicsDetails.totalConstraints}`)
    }

    // Log cloth-specific stats
    this.clothMeshes.forEach((clothData, clothName) => {
      if (clothData.stats) {
        console.log(`   Cloth ${clothName}:`)
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
          console.log(`🔍 Forced movement check for ${clothName}:`)
          this.logClothMovement(vertices, physicsId)
        }
      }
    })
  }

  setGravity(x, y, z) {
    if (this.physicsEngine && this.physicsEngine.setGravity) {
      this.physicsEngine.setGravity(x, y, z)
      console.log(`🌍 Gravity updated to: ${x}, ${y}, ${z}`)
    }
  }

  setClothStiffness(clothId, stiffness) {
    if (this.physicsEngine && this.physicsEngine.setClothStiffness) {
      // Map our cloth IDs to engine cloth IDs
      const clothData = this.clothMeshes.get(clothId)
      if (clothData && clothData.physicsId) {
        this.physicsEngine.setClothStiffness(clothData.physicsId, stiffness)
        console.log(`🧵 Cloth stiffness updated to: ${stiffness}`)
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
      visualMeshes: this.visualMeshes.size,
    }
  }

  logDetailedStatus() {
    console.log("📊 Cloth Simulation Detailed Status:")
    console.log(`   Wrapper Initialized: ${this.isInitialized}`)
    console.log(`   Wrapper Running: ${this.isRunning}`)
    console.log(`   Engine Type: ${this.engineType}`)
    console.log(`   Update Count: ${this.updateCount}`)
    console.log(`   Cloth Meshes (Wrapper): ${this.clothMeshes.size}`)
    console.log(`   Avatar Colliders (Wrapper): ${this.avatarColliders.size}`)
    console.log(`   Visual Meshes: ${this.visualMeshes.size}`)

    if (this.physicsEngine && this.physicsEngine.logFullStatus) {
      this.physicsEngine.logFullStatus()
    }

    // Force movement analysis for all cloths
    console.log("🔍 === FORCED MOVEMENT ANALYSIS ===")
    this.clothMeshes.forEach((clothData, clothName) => {
      const physicsId = clothData.physicsId
      if (physicsId) {
        const vertices = this.physicsEngine.getClothVertices(physicsId)
        if (vertices) {
          console.log(`Analyzing movement for ${clothName}:`)
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
    this.physicsEngine = null
    this.engineType = null
    this.isInitialized = false

    console.log("✅ Cloth simulation cleanup complete")
  }
}

// Export for use in main application
window.ClothSimulation = ClothSimulation
