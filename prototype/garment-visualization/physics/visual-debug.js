// Physics Visual Debug
// Provides visual feedback for physics simulation

class PhysicsVisualDebug {
  constructor() {
    this.enabled = false
    this.debugOverlay = null
    this.canvas = null
    this.ctx = null
    this.animationFrame = null
    this.clothSimulation = null
  }

  initialize() {
    try {
      console.log("🎨 Initializing Physics Visual Debug...")

      // Create debug overlay canvas
      this.canvas = document.createElement("canvas")
      this.canvas.id = "physics-debug-canvas"
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.1);
        display: none;
      `

      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
      this.ctx = this.canvas.getContext("2d")

      document.body.appendChild(this.canvas)

      // Handle window resize
      window.addEventListener("resize", () => {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
      })

      console.log("✅ Physics visual debug initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize visual debug:", error)
      return false
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled

    if (this.canvas) {
      this.canvas.style.display = enabled ? "block" : "none"
    }

    if (enabled) {
      this.startDebugLoop()
    } else {
      this.stopDebugLoop()
    }
  }

  setClothSimulation(simulation) {
    this.clothSimulation = simulation
  }

  startDebugLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }

    const debugLoop = () => {
      if (this.enabled) {
        this.drawDebugInfo()
        this.animationFrame = requestAnimationFrame(debugLoop)
      }
    }

    debugLoop()
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

    // Draw cloth particles
    this.drawClothParticles()

    // Draw constraints
    this.drawConstraints()

    // Draw avatar colliders
    this.drawAvatarColliders()

    // Draw info panel
    this.drawInfoPanel()
  }

  drawClothParticles() {
    if (!this.clothSimulation.physicsEngine) return

    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const { particles } = clothData

      particles.forEach((particle, index) => {
        // Convert 3D position to 2D screen position (simplified projection)
        const screenX = ((particle.position.x + 2) * this.canvas.width) / 4 + this.canvas.width / 2
        const screenY = ((-particle.position.y + 2) * this.canvas.height) / 4 + this.canvas.height / 2

        // Draw particle
        this.ctx.beginPath()
        this.ctx.arc(screenX, screenY, particle.pinned ? 6 : 3, 0, 2 * Math.PI)
        this.ctx.fillStyle = particle.pinned ? "#ff0000" : "#00ff00"
        this.ctx.fill()

        // Draw particle ID for debugging
        if (index % 20 === 0) {
          // Only show every 20th particle to avoid clutter
          this.ctx.fillStyle = "#ffffff"
          this.ctx.font = "10px monospace"
          this.ctx.fillText(index.toString(), screenX + 5, screenY - 5)
        }
      })
    })
  }

  drawConstraints() {
    if (!this.clothSimulation.physicsEngine) return

    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const { particles, constraints } = clothData

      // Only draw every 10th constraint to avoid visual clutter
      constraints.forEach((constraint, index) => {
        if (index % 10 !== 0) return

        const p1 = particles[constraint.p1]
        const p2 = particles[constraint.p2]

        if (!p1 || !p2) return

        // Convert 3D positions to 2D screen positions
        const x1 = ((p1.position.x + 2) * this.canvas.width) / 4 + this.canvas.width / 2
        const y1 = ((-p1.position.y + 2) * this.canvas.height) / 4 + this.canvas.height / 2
        const x2 = ((p2.position.x + 2) * this.canvas.width) / 4 + this.canvas.width / 2
        const y2 = ((-p2.position.y + 2) * this.canvas.height) / 4 + this.canvas.height / 2

        // Draw constraint line
        this.ctx.beginPath()
        this.ctx.moveTo(x1, y1)
        this.ctx.lineTo(x2, y2)

        // Color code by constraint type
        switch (constraint.type) {
          case "structural":
            this.ctx.strokeStyle = "rgba(255, 255, 0, 0.3)"
            break
          case "shear":
            this.ctx.strokeStyle = "rgba(0, 255, 255, 0.2)"
            break
          case "bend":
            this.ctx.strokeStyle = "rgba(255, 0, 255, 0.1)"
            break
          default:
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
        }

        this.ctx.lineWidth = 1
        this.ctx.stroke()
      })
    })
  }

  drawAvatarColliders() {
    if (!this.clothSimulation.physicsEngine) return

    this.clothSimulation.physicsEngine.avatarColliders.forEach((colliders, colliderId) => {
      colliders.forEach((collider, index) => {
        // Convert 3D position to 2D screen position
        const screenX = ((collider.position.x + 2) * this.canvas.width) / 4 + this.canvas.width / 2
        const screenY = ((-collider.position.y + 2) * this.canvas.height) / 4 + this.canvas.height / 2

        // Draw collider
        this.ctx.beginPath()

        if (collider.type === "sphere") {
          this.ctx.arc(screenX, screenY, collider.radius * 50, 0, 2 * Math.PI)
        } else if (collider.type === "capsule") {
          this.ctx.arc(screenX, screenY, collider.radius * 50, 0, 2 * Math.PI)
        }

        this.ctx.strokeStyle = "#ff8800"
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Label collider
        this.ctx.fillStyle = "#ff8800"
        this.ctx.font = "12px monospace"
        this.ctx.fillText(`${collider.type}`, screenX + 10, screenY)
      })
    })
  }

  drawInfoPanel() {
    if (!this.clothSimulation) return

    // Draw info panel background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(10, 10, 300, 150)

    // Draw info text
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "12px monospace"

    const status = this.clothSimulation.getDetailedStatus()
    const lines = [
      `Physics Debug Active`,
      `Engine: ${status.engine}`,
      `Running: ${status.running}`,
      `Update Count: ${status.updateCount}`,
      `Cloth Meshes: ${status.clothMeshes}`,
      `Avatar Colliders: ${status.avatarColliders}`,
      `Visual Meshes: ${status.visualMeshes}`,
      ``,
      `Legend:`,
      `🔴 Red dots: Pinned particles`,
      `🟢 Green dots: Free particles`,
      `🟡 Yellow lines: Structural constraints`,
      `🟠 Orange circles: Avatar colliders`,
    ]

    lines.forEach((line, index) => {
      this.ctx.fillText(line, 20, 30 + index * 15)
    })
  }

  cleanup() {
    this.setEnabled(false)

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }

    this.canvas = null
    this.ctx = null
    this.clothSimulation = null

    console.log("✅ Physics visual debug cleanup complete")
  }
}

// Export for use in main application
window.PhysicsVisualDebug = PhysicsVisualDebug
