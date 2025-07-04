// Physics Visual Debug System
// Provides visual feedback for physics simulation

class PhysicsVisualDebug {
  constructor() {
    this.enabled = false
    this.debugContainer = null
    this.particleElements = []
    this.constraintElements = []
    this.colliderElements = []
    this.updateInterval = null
    this.clothSimulation = null
  }

  initialize() {
    try {
      console.log("🎨 Initializing Physics Visual Debug...")

      // Create debug overlay container
      this.createDebugContainer()

      console.log("✅ Physics visual debug initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize visual debug:", error)
      return false
    }
  }

  createDebugContainer() {
    // Remove existing container
    const existing = document.getElementById("physics-debug-overlay")
    if (existing) {
      existing.remove()
    }

    // Create new debug overlay
    this.debugContainer = document.createElement("div")
    this.debugContainer.id = "physics-debug-overlay"
    this.debugContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1000;
      display: none;
    `

    document.body.appendChild(this.debugContainer)
  }

  setEnabled(enabled) {
    this.enabled = enabled

    if (this.debugContainer) {
      this.debugContainer.style.display = enabled ? "block" : "none"
    }

    if (enabled) {
      this.startDebugLoop()
    } else {
      this.stopDebugLoop()
    }
  }

  startDebugLoop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(() => {
      this.updateDebugVisuals()
    }, 100) // Update 10 times per second
  }

  stopDebugLoop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  updateDebugVisuals() {
    if (!this.enabled || !this.debugContainer) return

    // Clear existing debug elements
    this.debugContainer.innerHTML = ""

    // Get cloth simulation reference
    if (!this.clothSimulation && window.clothSimulation) {
      this.clothSimulation = window.clothSimulation
    }

    if (!this.clothSimulation || !this.clothSimulation.physicsEngine) return

    // Draw particles
    this.drawParticles()

    // Draw constraints
    this.drawConstraints()

    // Draw colliders
    this.drawColliders()
  }

  drawParticles() {
    const physicsEngine = this.clothSimulation.physicsEngine

    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      clothData.particles.forEach((particle, index) => {
        const screenPos = this.worldToScreen(particle.position)
        if (!screenPos) return

        const particleEl = document.createElement("div")
        particleEl.style.cssText = `
          position: absolute;
          left: ${screenPos.x - 2}px;
          top: ${screenPos.y - 2}px;
          width: 4px;
          height: 4px;
          background: ${particle.pinned ? "#ff0000" : "#00ff00"};
          border-radius: 50%;
          pointer-events: none;
        `

        this.debugContainer.appendChild(particleEl)
      })
    })
  }

  drawConstraints() {
    const physicsEngine = this.clothSimulation.physicsEngine

    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      clothData.constraints.forEach((constraint, index) => {
        if (index % 5 !== 0) return // Only draw every 5th constraint to avoid clutter

        const p1 = clothData.particles[constraint.p1]
        const p2 = clothData.particles[constraint.p2]

        if (!p1 || !p2) return

        const pos1 = this.worldToScreen(p1.position)
        const pos2 = this.worldToScreen(p2.position)

        if (!pos1 || !pos2) return

        const constraintEl = document.createElement("div")
        const length = Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2))
        const angle = (Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * 180) / Math.PI

        constraintEl.style.cssText = `
          position: absolute;
          left: ${pos1.x}px;
          top: ${pos1.y}px;
          width: ${length}px;
          height: 1px;
          background: rgba(255, 255, 0, 0.3);
          transform-origin: 0 0;
          transform: rotate(${angle}deg);
          pointer-events: none;
        `

        this.debugContainer.appendChild(constraintEl)
      })
    })
  }

  drawColliders() {
    const physicsEngine = this.clothSimulation.physicsEngine

    physicsEngine.avatarColliders.forEach((colliders, colliderId) => {
      colliders.forEach((collider, index) => {
        const screenPos = this.worldToScreen(collider.position)
        if (!screenPos) return

        const colliderEl = document.createElement("div")
        const size = collider.radius ? collider.radius * 100 : 20 // Scale for visibility

        colliderEl.style.cssText = `
          position: absolute;
          left: ${screenPos.x - size / 2}px;
          top: ${screenPos.y - size / 2}px;
          width: ${size}px;
          height: ${size}px;
          border: 2px solid #ff00ff;
          border-radius: 50%;
          background: rgba(255, 0, 255, 0.1);
          pointer-events: none;
        `

        this.debugContainer.appendChild(colliderEl)
      })
    })
  }

  worldToScreen(worldPos) {
    // Simple projection - in a real implementation you'd use the camera matrix
    // For now, just map world coordinates to screen coordinates
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const scale = 200 // Adjust this based on your world scale

    return {
      x: centerX + worldPos.x * scale,
      y: centerY - worldPos.y * scale, // Flip Y axis
    }
  }

  cleanup() {
    this.stopDebugLoop()

    if (this.debugContainer) {
      this.debugContainer.remove()
      this.debugContainer = null
    }

    this.particleElements = []
    this.constraintElements = []
    this.colliderElements = []

    console.log("✅ Physics visual debug cleanup complete")
  }
}

// Export for use in main application
window.PhysicsVisualDebug = PhysicsVisualDebug
