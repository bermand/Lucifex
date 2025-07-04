// Physics Visual Debug
// Provides visual feedback for physics simulation

class PhysicsVisualDebug {
  constructor() {
    this.clothSimulation = null
    this.debugCanvas = null
    this.debugContext = null
    this.isEnabled = false
    this.animationFrame = null
  }

  initialize(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.createDebugCanvas()
    console.log("✅ Physics visual debug initialized")
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
    if (!this.clothSimulation) {
      console.error("❌ No cloth simulation to debug")
      return
    }

    this.isEnabled = true
    document.body.appendChild(this.debugCanvas)
    this.startDebugLoop()
    console.log("🎨 Physics visual debug enabled")
  }

  disable() {
    this.isEnabled = false
    if (this.debugCanvas && this.debugCanvas.parentNode) {
      this.debugCanvas.parentNode.removeChild(this.debugCanvas)
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    console.log("🎨 Physics visual debug disabled")
  }

  startDebugLoop() {
    if (!this.isEnabled) return

    this.drawDebugInfo()
    this.animationFrame = requestAnimationFrame(() => this.startDebugLoop())
  }

  drawDebugInfo() {
    if (!this.debugContext || !this.clothSimulation) return

    // Clear canvas
    this.debugContext.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height)

    // Get physics engine
    const physicsEngine = this.clothSimulation.physicsEngine
    if (!physicsEngine || !physicsEngine.clothMeshes) return

    // Draw cloth particles and constraints
    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      this.drawCloth(clothData)
    })

    // Draw avatar colliders
    physicsEngine.avatarColliders.forEach((colliders, colliderId) => {
      this.drawAvatarColliders(colliders)
    })

    // Draw debug info text
    this.drawDebugText()
  }

  drawCloth(clothData) {
    const { particles, constraints } = clothData
    const ctx = this.debugContext

    // Project 3D positions to 2D screen coordinates
    const project3DTo2D = (pos3D) => {
      // Simple orthographic projection
      const scale = 200
      const offsetX = this.debugCanvas.width / 2
      const offsetY = this.debugCanvas.height / 2

      return {
        x: offsetX + pos3D.x * scale,
        y: offsetY - pos3D.y * scale, // Flip Y axis
      }
    }

    // Draw constraints (white lines)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1
    ctx.beginPath()

    constraints.forEach((constraint) => {
      const p1 = particles[constraint.p1]
      const p2 = particles[constraint.p2]

      if (p1 && p2) {
        const pos1 = project3DTo2D(p1.position)
        const pos2 = project3DTo2D(p2.position)

        ctx.moveTo(pos1.x, pos1.y)
        ctx.lineTo(pos2.x, pos2.y)
      }
    })

    ctx.stroke()

    // Draw particles (colored dots)
    particles.forEach((particle) => {
      const pos = project3DTo2D(particle.position)

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, particle.pinned ? 4 : 2, 0, 2 * Math.PI)

      if (particle.pinned) {
        ctx.fillStyle = "red" // Pinned particles are red
      } else {
        ctx.fillStyle = "lime" // Free particles are green
      }

      ctx.fill()
    })
  }

  drawAvatarColliders(colliders) {
    const ctx = this.debugContext

    // Project 3D positions to 2D screen coordinates
    const project3DTo2D = (pos3D) => {
      const scale = 200
      const offsetX = this.debugCanvas.width / 2
      const offsetY = this.debugCanvas.height / 2

      return {
        x: offsetX + pos3D.x * scale,
        y: offsetY - pos3D.y * scale,
      }
    }

    ctx.strokeStyle = "orange"
    ctx.lineWidth = 2

    colliders.forEach((collider) => {
      const pos = project3DTo2D(collider.position)

      ctx.beginPath()
      if (collider.type === "sphere") {
        ctx.arc(pos.x, pos.y, collider.radius * 200, 0, 2 * Math.PI)
      } else if (collider.type === "capsule") {
        ctx.arc(pos.x, pos.y, collider.radius * 200, 0, 2 * Math.PI)
      }
      ctx.stroke()
    })
  }

  drawDebugText() {
    const ctx = this.debugContext

    ctx.fillStyle = "white"
    ctx.font = "14px monospace"
    ctx.textAlign = "left"

    let y = 30
    const lineHeight = 20

    ctx.fillText("🔍 Physics Debug Overlay", 20, y)
    y += lineHeight * 1.5

    if (this.clothSimulation && this.clothSimulation.physicsEngine) {
      const engine = this.clothSimulation.physicsEngine

      ctx.fillText(`Engine: ${engine.getPhysicsType()}`, 20, y)
      y += lineHeight

      ctx.fillText(`Simulation Time: ${engine.simulationTime?.toFixed(1) || 0}s`, 20, y)
      y += lineHeight

      ctx.fillText(`Gravity: ${engine.gravity.y}m/s²`, 20, y)
      y += lineHeight

      engine.clothMeshes.forEach((clothData, clothId) => {
        const pinnedCount = clothData.particles.filter((p) => p.pinned).length
        ctx.fillText(`${clothId}: ${clothData.particles.length} particles (${pinnedCount} pinned)`, 20, y)
        y += lineHeight
      })

      y += lineHeight
      ctx.fillText("Legend:", 20, y)
      y += lineHeight
      ctx.fillText("🔴 Red dots: Pinned particles", 20, y)
      y += lineHeight
      ctx.fillText("🟢 Green dots: Free particles", 20, y)
      y += lineHeight
      ctx.fillText("⚪ White lines: Constraints", 20, y)
      y += lineHeight
      ctx.fillText("🟠 Orange circles: Avatar colliders", 20, y)
    }
  }
}

// Export for use in main application
window.PhysicsVisualDebug = PhysicsVisualDebug
