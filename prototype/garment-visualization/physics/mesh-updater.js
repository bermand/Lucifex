// Physics Mesh Updater
// Connects physics simulation to visual 3D model

class PhysicsMeshUpdater {
  constructor(modelViewer) {
    this.modelViewer = modelViewer
    this.isInitialized = false
    this.userScale = 1.0
    this.userPosition = { x: 0, y: 0, z: 0 }
    this.baseTransform = null

    console.log("🔗 PhysicsMeshUpdater created")
  }

  async initialize() {
    if (!this.modelViewer) {
      throw new Error("Model viewer not available")
    }

    try {
      // Wait for model to load
      await this.waitForModelLoad()

      // Store base transform
      this.storeBaseTransform()

      this.isInitialized = true
      console.log("✅ PhysicsMeshUpdater initialized")

      return true
    } catch (error) {
      console.error("❌ Failed to initialize PhysicsMeshUpdater:", error)
      return false
    }
  }

  async waitForModelLoad() {
    return new Promise((resolve, reject) => {
      if (this.modelViewer.loaded) {
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error("Model load timeout"))
      }, 10000)

      this.modelViewer.addEventListener(
        "load",
        () => {
          clearTimeout(timeout)
          resolve()
        },
        { once: true },
      )

      this.modelViewer.addEventListener(
        "error",
        (error) => {
          clearTimeout(timeout)
          reject(error)
        },
        { once: true },
      )
    })
  }

  storeBaseTransform() {
    // Store the current transform as base
    const computedStyle = window.getComputedStyle(this.modelViewer)
    this.baseTransform = computedStyle.transform

    console.log("📊 Base transform stored:", this.baseTransform)
  }

  updateFromPhysics(particles, time) {
    if (!this.isInitialized || !particles || particles.length === 0) {
      return
    }

    try {
      // Calculate physics-based effects
      const physicsEffects = this.calculatePhysicsEffects(particles, time)

      // Apply combined transform (user settings + physics effects)
      this.applyTransform(physicsEffects)
    } catch (error) {
      console.error("Error updating mesh from physics:", error)
    }
  }

  calculatePhysicsEffects(particles, time) {
    // Calculate center of mass
    let centerX = 0,
      centerY = 0,
      centerZ = 0
    let validParticles = 0

    for (const particle of particles) {
      if (particle.position.y > -0.4) {
        // Only count particles not on ground
        centerX += particle.position.x
        centerY += particle.position.y
        centerZ += particle.position.z
        validParticles++
      }
    }

    if (validParticles === 0) {
      return { translation: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: 1.0 }
    }

    centerX /= validParticles
    centerY /= validParticles
    centerZ /= validParticles

    // Calculate physics effects
    const effects = {
      translation: {
        x: centerX * 0.1, // Subtle movement based on cloth center
        y: Math.max(0, (centerY - 1.0) * 0.05), // Slight downward movement as cloth falls
        z: centerZ * 0.1,
      },
      rotation: {
        x: Math.sin(time * 0.5) * 2, // Gentle swaying
        y: Math.cos(time * 0.3) * 1,
        z: Math.sin(time * 0.7) * 1,
      },
      scale: 1.0 + Math.sin(time * 2) * 0.02, // Very subtle scale variation (2%)
    }

    return effects
  }

  applyTransform(physicsEffects) {
    // Combine user settings with physics effects
    const finalScale = this.userScale * physicsEffects.scale
    const finalX = this.userPosition.x + physicsEffects.translation.x
    const finalY = this.userPosition.y + physicsEffects.translation.y
    const finalZ = this.userPosition.z + physicsEffects.translation.z

    // Apply transform that preserves user settings
    const transform = `
      scale(${finalScale})
      translate(${finalX * 100}px, ${finalY * -100}px)
      rotateX(${physicsEffects.rotation.x}deg)
      rotateY(${physicsEffects.rotation.y}deg)
      rotateZ(${physicsEffects.rotation.z}deg)
    `

    this.modelViewer.style.transform = transform
  }

  setGarmentScale(scale) {
    this.userScale = scale
    console.log(`🔧 User scale updated: ${scale}`)
  }

  setGarmentPosition(x, y, z = 0) {
    this.userPosition = { x, y, z }
    console.log(`🔧 User position updated: (${x}, ${y}, ${z})`)
  }

  cleanup() {
    this.isInitialized = false
    this.modelViewer = null
    console.log("🧹 PhysicsMeshUpdater cleaned up")
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      userScale: this.userScale,
      userPosition: this.userPosition,
      hasModelViewer: !!this.modelViewer,
    }
  }
}

// Export for global use
window.PhysicsMeshUpdater = PhysicsMeshUpdater
