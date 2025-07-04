// Physics Visual Debug
// Provides visual feedback for physics simulation

class PhysicsVisualDebug {
  constructor() {
    this.enabled = false
    this.debugCanvas = null
    this.debugContext = null
    this.clothSimulation = null
    this.animationFrame = null
  }

  initialize(clothSimulation = null) {
    try {
      console.log("🎨 Initializing Physics Visual Debug...")

      this.clothSimulation = clothSimulation
      this.createDebugCanvas()

      console.log("✅ Physics visual debug initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize visual debug:", error)
      return false
    }
  }

  createDebugCanvas() {
    // Create debug canvas overlay
    this.debugCanvas = document.createElement("canvas")
    this.debugCanvas.id = "physics-debug-canvas"
    this.debugCanvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1000;
      background: transparent;
    `

    this.debugCanvas.width = window.innerWidth
    this.debugCanvas.height = window.innerHeight
    this.debugContext = this.debugCanvas.getContext("2d")

    // Handle window resize
    window.addEventListener("resize", () => {
      this.debugCanvas.width = window.innerWidth
      this.debugCanvas.height = window.innerHeight
    })
  }

  enable() {
    if (this.enabled) return

    this.enabled = true
    document.body.appendChild(this.debugCanvas)
    this.startDebugLoop()

    console.log("👁️ Physics visual debug enabled")
  }

  disable() {
    if (!this.enabled) return

    this.enabled = false

    if (this.debugCanvas && this.debugCanvas.parentNode) {
      this.debugCanvas.parentNode.removeChild(this.debugCanvas)
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    console.log("👁️ Physics visual debug disabled")
  }

  setEnabled(enabled) {
    if (enabled) {
      this.enable()
    } else {
      this.disable()
    }
  }

  startDebugLoop() {
    if (!this.enabled) return

    this.drawDebugInfo()
    this.animationFrame = requestAnimationFrame(() => this.startDebugLoop())
  }

  drawDebugInfo() {
    if (!this.debugContext || !this.clothSimulation) return

    // Clear canvas
    this.debugContext.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height)

    // Draw debug information
    this.drawPhysicsStatus()
    this.drawParticleInfo()

    if (this.clothSimulation.physicsEngine) {
      this.drawClothParticles()
    }
  }

  drawPhysicsStatus() {
    const ctx = this.debugContext
    const x = 20
    let y = 50

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.fillRect(x - 10, y - 30, 300, 120)

    ctx.fillStyle = "#00ff00"
    ctx.font = "14px monospace"
    ctx.fillText("🔍 PHYSICS DEBUG", x, y)

    y += 20
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px monospace"

    if (this.clothSimulation.isRunning) {
      ctx.fillText(`Status: RUNNING (${this.clothSimulation.updateCount} updates)`, x, y)
      y += 15
      ctx.fillText(`Engine: ${this.clothSimulation.getPhysicsType()}`, x, y)
      y += 15
      ctx.fillText(`Cloths: ${this.clothSimulation.clothMeshes.size}`, x, y)
      y += 15
      ctx.fillText(`Colliders: ${this.clothSimulation.avatarColliders.size}`, x, y)
    } else {
      ctx.fillStyle = "#ff6666"
      ctx.fillText("Status: NOT RUNNING", x, y)
    }
  }

  drawParticleInfo() {
    if (!this.clothSimulation.physicsEngine || !this.clothSimulation.physicsEngine.clothMeshes) return

    const ctx = this.debugContext
    const x = 20
    let y = 200

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.fillRect(x - 10, y - 20, 280, 100)

    ctx.fillStyle = "#ffff00"
    ctx.font = "12px monospace"
    ctx.fillText("🧵 CLOTH PARTICLES", x, y)

    y += 20
    ctx.fillStyle = "#ffffff"

    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const particles = clothData.particles
      const constraints = clothData.constraints
      const pinnedCount = particles.filter((p) => p.pinned).length

      ctx.fillText(`Cloth ${clothId}:`, x, y)
      y += 15
      ctx.fillText(`  Particles: ${particles.length} (${pinnedCount} pinned)`, x, y)
      y += 15
      ctx.fillText(`  Constraints: ${constraints.length}`, x, y)
      y += 15
    })
  }

  drawClothParticles() {
    if (!this.clothSimulation.physicsEngine || !this.clothSimulation.physicsEngine.clothMeshes) return

    const ctx = this.debugContext
    const centerX = this.debugCanvas.width / 2
    const centerY = this.debugCanvas.height / 2
    const scale = 100 // Scale factor for visualization

    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const particles = clothData.particles

      // Draw particles
      particles.forEach((particle, index) => {
        const screenX = centerX + particle.position.x * scale
        const screenY = centerY - particle.position.y * scale // Flip Y for screen coordinates

        ctx.beginPath()
        ctx.arc(screenX, screenY, particle.pinned ? 4 : 2, 0, 2 * Math.PI)

        if (particle.pinned) {
          ctx.fillStyle = "#ff0000" // Red for pinned particles
        } else {
          ctx.fillStyle = "#00ff00" // Green for free particles
        }

        ctx.fill()

        // Draw particle index for debugging (only for first few)
        if (index < 10) {
          ctx.fillStyle = "#ffffff"
          ctx.font = "10px monospace"
          ctx.fillText(index.toString(), screenX + 5, screenY - 5)
        }
      })

      // Draw constraints
      const constraints = clothData.constraints
      constraints.forEach((constraint, index) => {
        // Only draw every 10th constraint to avoid clutter
        if (index % 10 !== 0) return

        const p1 = particles[constraint.p1]
        const p2 = particles[constraint.p2]

        if (!p1 || !p2) return

        const x1 = centerX + p1.position.x * scale
        const y1 = centerY - p1.position.y * scale
        const x2 = centerX + p2.position.x * scale
        const y2 = centerY - p2.position.y * scale

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)

        // Color code by constraint type
        if (constraint.type === "structural") {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        } else if (constraint.type === "shear") {
          ctx.strokeStyle = "rgba(255, 255, 0, 0.2)"
        } else if (constraint.type === "bend") {
          ctx.strokeStyle = "rgba(0, 255, 255, 0.1)"
        }

        ctx.lineWidth = 1
        ctx.stroke()
      })
    })

    // Draw coordinate system
    ctx.strokeStyle = "#666666"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(centerX - 50, centerY)
    ctx.lineTo(centerX + 50, centerY)
    ctx.moveTo(centerX, centerY - 50)
    ctx.lineTo(centerX, centerY + 50)
    ctx.stroke()

    // Draw scale reference
    ctx.fillStyle = "#ffffff"
    ctx.font = "10px monospace"
    ctx.fillText("1m", centerX + 100, centerY + 15)
    ctx.strokeStyle = "#ffffff"
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX + 100, centerY)
    ctx.stroke()
  }

  cleanup() {
    this.disable()
    this.clothSimulation = null

    if (this.debugCanvas) {
      this.debugCanvas = null
      this.debugContext = null
    }

    console.log("✅ Physics visual debug cleanup complete")
  }
}

// Export for use in main application
window.PhysicsVisualDebug = PhysicsVisualDebug
