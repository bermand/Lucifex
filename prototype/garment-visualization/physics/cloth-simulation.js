// Cloth Simulation Manager
// High-level interface for cloth physics simulation

class ClothSimulation {
  constructor() {
    this.physicsEngine = null
    this.meshUpdater = null
    this.isInitialized = false
    this.settings = {
      gravity: 9.81,
      stiffness: 0.4,
      damping: 0.95,
      windStrength: 0.1,
    }

    console.log("🧬 ClothSimulation manager created")
  }

  async initialize(physicsEngine = "simple") {
    console.log(`🔄 Initializing cloth simulation with ${physicsEngine} physics...`)

    try {
      // Initialize physics engine
      if (physicsEngine === "simple" && window.SimpleClothPhysics) {
        this.physicsEngine = new window.SimpleClothPhysics()
        await this.physicsEngine.initialize()
      } else {
        throw new Error(`Physics engine '${physicsEngine}' not available`)
      }

      this.isInitialized = true
      console.log("✅ Cloth simulation initialized successfully")

      return true
    } catch (error) {
      console.error("❌ Failed to initialize cloth simulation:", error)
      return false
    }
  }

  connectMeshUpdater(meshUpdater) {
    this.meshUpdater = meshUpdater
    if (this.physicsEngine) {
      this.physicsEngine.setMeshUpdater(meshUpdater)
    }
    console.log("🔗 Mesh updater connected to cloth simulation")
  }

  start() {
    if (!this.isInitialized || !this.physicsEngine) {
      console.error("❌ Cannot start simulation - not initialized")
      return false
    }

    this.physicsEngine.start()
    console.log("▶️ Cloth simulation started")
    return true
  }

  stop() {
    if (this.physicsEngine) {
      this.physicsEngine.stop()
    }
    console.log("⏹️ Cloth simulation stopped")
  }

  reset() {
    if (this.physicsEngine) {
      this.physicsEngine.reset()
    }
    console.log("🔄 Cloth simulation reset")
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }

    if (this.physicsEngine) {
      this.physicsEngine.updateSettings(this.settings)
    }

    console.log("🔧 Cloth simulation settings updated:", newSettings)
  }

  getStatus() {
    if (!this.physicsEngine) {
      return {
        isInitialized: false,
        isRunning: false,
        engine: "none",
      }
    }

    return {
      isInitialized: this.isInitialized,
      ...this.physicsEngine.getStatus(),
      engine: "simple",
      settings: this.settings,
    }
  }

  // Delegate methods to physics engine
  getParticles() {
    return this.physicsEngine ? this.physicsEngine.getParticles() : []
  }

  getConstraints() {
    return this.physicsEngine ? this.physicsEngine.getConstraints() : []
  }

  resetClothPosition() {
    if (this.physicsEngine) {
      this.physicsEngine.resetClothPosition()
    }
  }

  setMeshUpdater(meshUpdater) {
    this.connectMeshUpdater(meshUpdater)
  }
}

// Export for global use
window.ClothSimulation = ClothSimulation
