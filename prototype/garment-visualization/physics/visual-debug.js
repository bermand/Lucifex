// Physics Visual Debug
// Visualizes physics particles and constraints

class PhysicsVisualDebug {
  constructor() {
    this.isActive = false
    this.debugContainer = null
    this.clothSimulation = null
    this.animationId = null

    console.log("🔍 PhysicsVisualDebug initialized")
  }

  initialize(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.createDebugContainer()
    this.isActive = true
    this.startDebugLoop()

    console.log("✅ Physics visual debug started")
  }

  createDebugContainer() {
    // Create debug overlay
    this.debugContainer = document.createElement("div")
    this.debugContainer.id = "physics-debug-overlay"
    this.debugContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.1);
    `

    // Create canvas for drawing
    const canvas = document.createElement("canvas")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    `

    this.debugContainer.appendChild(canvas)
    document.body.appendChild(this.debugContainer)

    this.canvas = canvas
    this.ctx = canvas.getContext("2d")

    // Handle window resize
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })
  }

  startDebugLoop() {
    if (!this.isActive) return

    this.drawDebugInfo()
    this.animationId = requestAnimationFrame(() => this.startDebugLoop())
  }

  drawDebugInfo() {
    if (!this.ctx || !this.clothSimulation) return

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const particles = this.clothSimulation.getParticles()
    const constraints = this.clothSimulation.getConstraints()

    if (!particles || particles.length === 0) return

    // Project 3D positions to 2D screen coordinates
    const projectedParticles = particles.map((particle) => {
      return this.project3DTo2D(particle.position)
    })

    // Draw constraints (connections between particles)
    this.ctx.strokeStyle = "rgba(100, 150, 255, 0.3)"
    this.ctx.lineWidth = 1
    this.ctx.beginPath()

    for (const constraint of constraints) {
      const p1 = projectedParticles[constraint.p1]
      const p2 = projectedParticles[constraint.p2]

      if (p1 && p2) {
        this.ctx.moveTo(p1.x, p1.y)
        this.ctx.lineTo(p2.x, p2.y)
      }
    }

    this.ctx.stroke()

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const projected = projectedParticles[i]
      if (!projected) continue

      const particle = particles[i]

      // Color based on height (red = high, blue = low)
      const heightNormalized = Math.max(0, Math.min(1, (particle.position.y + 1) / 3))
      const red = Math.floor((1 - heightNormalized) * 255)
      const blue = Math.floor(heightNormalized * 255)

      this.ctx.fillStyle = `rgba(${red}, 100, ${blue}, 0.8)`
      this.ctx.beginPath()
      this.ctx.arc(projected.x, projected.y, particle.pinned ? 6 : 3, 0, Math.PI * 2)
      this.ctx.fill()
    }

    // Draw avatar collider
    const avatarCollider = this.clothSimulation.avatarCollider
    const projectedCenter = this.project3DTo2D(avatarCollider.center)

    if (projectedCenter) {
      this.ctx.strokeStyle = "rgba(255, 100, 100, 0.6)"
      this.ctx.lineWidth = 2
      this.ctx.beginPath()
      this.ctx.arc(projectedCenter.x, projectedCenter.y, avatarCollider.radius * 200, 0, Math.PI * 2)
      this.ctx.stroke()
    }

    // Draw debug info text
    this.drawDebugText(particles)
  }

  project3DTo2D(position3D) {
    // Simple orthographic projection
    // In a real implementation, you'd use the camera's projection matrix
    const scale = 200
    const offsetX = this.canvas.width / 2
    const offsetY = this.canvas.height / 2

    return {
      x: offsetX + position3D.x * scale,
      y: offsetY - position3D.y * scale, // Flip Y axis
    }
  }

  drawDebugText(particles) {
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    this.ctx.font = "14px monospace"

    const status = this.clothSimulation.getStatus()
    const lines = [
      `🔍 Physics Debug Active`,
      `Particles: ${particles.length}`,
      `Constraints: ${status.constraintCount}`,
      `Gravity: ${status.gravity.y.toFixed(2)}`,
      `Stiffness: ${status.stiffness.toFixed(2)}`,
      `Damping: ${status.damping.toFixed(2)}`,
      `Running: ${status.isRunning ? "✅" : "❌"}`,
    ]

    lines.forEach((line, index) => {
      this.ctx.fillText(line, 20, 30 + index * 20)
    })

    // Legend
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    this.ctx.font = "12px monospace"
    const legendY = this.canvas.height - 100

    this.ctx.fillText("🔴 High particles", 20, legendY)
    this.ctx.fillText("🔵 Low particles", 20, legendY + 20)
    this.ctx.fillText("🔴 Avatar collider", 20, legendY + 40)
    this.ctx.fillText("🔵 Cloth constraints", 20, legendY + 60)
  }

  cleanup() {
    this.isActive = false

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    if (this.debugContainer) {
      document.body.removeChild(this.debugContainer)
      this.debugContainer = null
    }

    this.canvas = null
    this.ctx = null
    this.clothSimulation = null

    console.log("🧹 Physics visual debug cleaned up")
  }
}

// Export for global use
window.PhysicsVisualDebug = PhysicsVisualDebug
