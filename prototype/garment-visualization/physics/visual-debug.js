// Physics Visual Debug System
// Overlays physics visualization on top of the 3D model

class PhysicsVisualDebug {
  constructor() {
    this.isEnabled = false
    this.canvas = null
    this.ctx = null
    this.clothSimulation = null
    this.animationFrame = null
    this.debugOverlay = null
  }

  initialize() {
    try {
      console.log("🎨 Initializing Physics Visual Debug...")

      // Create debug overlay canvas
      this.createDebugOverlay()

      console.log("✅ Physics visual debug initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize visual debug:", error)
      return false
    }
  }

  createDebugOverlay() {
    // Create canvas overlay
    this.canvas = document.createElement("canvas")
    this.canvas.id = "physics-debug-canvas"
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1000;
      display: none;
    `

    document.body.appendChild(this.canvas)
    this.ctx = this.canvas.getContext("2d")

    // Set canvas size
    this.resizeCanvas()

    // Handle window resize
    window.addEventListener("resize", () => this.resizeCanvas())
  }

  resizeCanvas() {
    if (!this.canvas) return

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  setEnabled(enabled) {
    this.isEnabled = enabled

    if (this.canvas) {
      this.canvas.style.display = enabled ? "block" : "none"
    }

    if (enabled) {
      this.startDebugLoop()
    } else {
      this.stopDebugLoop()
    }
  }

  setClothSimulation(clothSimulation) {
    this.clothSimulation = clothSimulation
  }

  startDebugLoop() {
    if (!this.isEnabled || !this.ctx) return

    const draw = () => {
      if (!this.isEnabled) return

      this.drawDebugInfo()
      this.animationFrame = requestAnimationFrame(draw)
    }

    draw()
  }

  stopDebugLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  drawDebugInfo() {
    if (!this.ctx || !this.clothSimulation) return

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw physics particles
    this.drawClothParticles()

    // Draw avatar colliders
    this.drawAvatarColliders()

    // Draw debug text
    this.drawDebugText()
  }

  drawClothParticles() {
    if (!this.clothSimulation.physicsEngine) return

    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const { particles } = clothData

      particles.forEach((particle, index) => {
        // Convert 3D position to 2D screen coordinates
        const screenPos = this.worldToScreen(particle.position)

        if (screenPos.x < 0 || screenPos.x > this.canvas.width || screenPos.y < 0 || screenPos.y > this.canvas.height) {
          return // Skip off-screen particles
        }

        // Draw particle
        this.ctx.beginPath()
        this.ctx.arc(screenPos.x, screenPos.y, particle.pinned ? 6 : 3, 0, 2 * Math.PI)
        this.ctx.fillStyle = particle.pinned ? "#ff4444" : "#44ff44"
        this.ctx.fill()

        // Draw particle index for debugging
        if (index % 20 === 0) {
          // Only show every 20th particle to avoid clutter
          this.ctx.fillStyle = "#ffffff"
          this.ctx.font = "10px monospace"
          this.ctx.fillText(index.toString(), screenPos.x + 5, screenPos.y - 5)
        }
      })
    })
  }

  drawAvatarColliders() {
    if (!this.clothSimulation.physicsEngine) return

    this.clothSimulation.physicsEngine.avatarColliders.forEach((colliders, colliderId) => {
      colliders.forEach((collider) => {
        const screenPos = this.worldToScreen(collider.position)

        if (screenPos.x < 0 || screenPos.x > this.canvas.width || screenPos.y < 0 || screenPos.y > this.canvas.height) {
          return
        }

        // Draw collider
        this.ctx.beginPath()
        if (collider.type === "sphere") {
          this.ctx.arc(screenPos.x, screenPos.y, collider.radius * 100, 0, 2 * Math.PI)
        } else if (collider.type === "capsule") {
          this.ctx.arc(screenPos.x, screenPos.y, collider.radius * 100, 0, 2 * Math.PI)
        }
        this.ctx.strokeStyle = "#4444ff"
        this.ctx.lineWidth = 2
        this.ctx.stroke()
      })
    })
  }

  worldToScreen(worldPos) {
    // Simple projection from 3D world coordinates to 2D screen coordinates
    // This is a basic orthographic projection - in a real implementation you'd use the camera matrix
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    const scale = 200 // Adjust this to scale the visualization

    return {
      x: centerX + worldPos.x * scale,
      y: centerY - worldPos.y * scale, // Flip Y axis
    }
  }

  drawDebugText() {
    if (!this.clothSimulation) return

    const status = this.clothSimulation.getDetailedStatus()

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(10, 10, 300, 120)

    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "12px monospace"

    let y = 30
    this.ctx.fillText(`Physics Engine: ${status.engine}`, 20, y)
    y += 15
    this.ctx.fillText(`Running: ${status.running}`, 20, y)
    y += 15
    this.ctx.fillText(`Update Count: ${status.updateCount}`, 20, y)
    y += 15
    this.ctx.fillText(`Particles: ${status.physicsDetails?.totalParticles || 0}`, 20, y)
    y += 15
    this.ctx.fillText(`Constraints: ${status.physicsDetails?.totalConstraints || 0}`, 20, y)
    y += 15
    this.ctx.fillText(`Gravity: ${status.physicsDetails?.gravity?.y || 0}`, 20, y)
    y += 15
    this.ctx.fillText(`🔴 Pinned  🟢 Free  🔵 Colliders`, 20, y)
  }

  cleanup() {
    this.stopDebugLoop()

    if (this.canvas) {
      document.body.removeChild(this.canvas)
      this.canvas = null
      this.ctx = null
    }

    this.clothSimulation = null
    this.isEnabled = false

    console.log("✅ Physics visual debug cleanup complete")
  }
}

// Export for use in main application
window.PhysicsVisualDebug = PhysicsVisualDebug
