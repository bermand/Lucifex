// Physics Mesh Updater
// Updates 3D mesh based on physics simulation results

class PhysicsMeshUpdater {
  constructor(modelViewer) {
    this.modelViewer = modelViewer
    this.isInitialized = false
    this.garmentScale = 1.0
    this.physicsActive = false

    console.log("🔄 PhysicsMeshUpdater created")
  }

  async initialize() {
    try {
      if (!this.modelViewer) {
        throw new Error("Model viewer not provided")
      }

      this.isInitialized = true
      console.log("✅ PhysicsMeshUpdater initialized")
      return true
    } catch (error) {
      console.error("❌ PhysicsMeshUpdater initialization failed:", error)
      return false
    }
  }

  updateMesh(particles, constraints) {
    if (!this.isInitialized || !this.physicsActive) return

    try {
      // Calculate average particle position for cloth center
      let avgY = 0
      let validParticles = 0

      for (const particle of particles) {
        if (!particle.pinned) {
          avgY += particle.position.y
          validParticles++
        }
      }

      if (validParticles > 0) {
        avgY /= validParticles

        // Apply transform based on physics
        const fallAmount = Math.max(0, 2.0 - avgY) // How much cloth has fallen
        const transform = `translateY(${-fallAmount * 50}px) rotateX(${fallAmount * 10}deg)`

        this.modelViewer.style.transform = transform
      }
    } catch (error) {
      console.error("❌ Error updating mesh:", error)
    }
  }

  setGarmentScale(scale) {
    this.garmentScale = scale
    console.log(`Garment scale set to: ${scale}`)
  }

  enablePhysics() {
    this.physicsActive = true
    console.log("🎬 Physics mesh updates enabled")
  }

  disablePhysics() {
    this.physicsActive = false

    // Reset transform
    if (this.modelViewer) {
      this.modelViewer.style.transform = `scale(${this.garmentScale})`
    }

    console.log("⏹️ Physics mesh updates disabled")
  }

  cleanup() {
    this.disablePhysics()
    this.modelViewer = null
    this.isInitialized = false
    console.log("🧹 PhysicsMeshUpdater cleaned up")
  }
}

// Export for global use
window.PhysicsMeshUpdater = PhysicsMeshUpdater
console.log("✅ PhysicsMeshUpdater class loaded")
