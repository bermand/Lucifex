// Physics Visual Debug
// Provides visual feedback for physics simulation

class PhysicsVisualDebug {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.enabled = false
    this.clothSimulation = null
    this.animationFrame = null
    this.particleColors = {
      pinned: "#ff0000", // Red for pinned particles
      free: "#00ff00", // Green for free particles
      moving: "#ffff00", // Yellow for moving particles
      static: "#888888", // Gray for static particles
    }
    this.constraintColors = {
      structural: "#0066cc", // Blue for structural constraints
      shear: "#cc6600", // Orange for shear constraints
      bend: "#cc00cc", // Purple for bend constraints
    }
  }

  initialize(clothSimulation = null) {
    console.log("🎨 Initializing Physics Visual Debug...")

    try {
      // Create debug canvas overlay
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
        background: transparent;
      `

      this.ctx = this.canvas.getContext("2d")
      this.resizeCanvas()

      // Add to document
      document.body.appendChild(this.canvas)

      // Store cloth simulation reference
      if (clothSimulation) {
        this.clothSimulation = clothSimulation
      }

      // Handle window resize
      window.addEventListener("resize", () => this.resizeCanvas())

      console.log("✅ Physics visual debug initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize visual debug:", error)
      return false
    }
  }

  resizeCanvas() {
    if (!this.canvas) return

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  enable() {
    if (!this.canvas) {
      console.error("❌ Visual debug not initialized")
      return
    }

    this.enabled = true
    this.canvas.style.display = "block"
    this.startRenderLoop()
    console.log("👁️ Physics visual debug enabled")
  }

  disable() {
    this.enabled = false
    if (this.canvas) {
      this.canvas.style.display = "none"
    }
    this.stopRenderLoop()
    console.log("👁️ Physics visual debug disabled")
  }

  setEnabled(enabled) {
    if (enabled) {
      this.enable()
    } else {
      this.disable()
    }
  }

  startRenderLoop() {
    if (!this.enabled) return

    this.render()
    this.animationFrame = requestAnimationFrame(() => this.startRenderLoop())
  }

  stopRenderLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  render() {
    if (!this.enabled || !this.ctx || !this.clothSimulation) return

    try {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // Get physics data
      const physicsEngine = this.clothSimulation.physicsEngine
      if (!physicsEngine || !physicsEngine.clothMeshes) return

      // Render each cloth
      physicsEngine.clothMeshes.forEach((clothData, clothId) => {
        this.renderCloth(clothData, clothId)
      })

      // Render avatar colliders
      physicsEngine.avatarColliders.forEach((colliders, colliderId) => {
        this.renderAvatarColliders(colliders, colliderId)
      })

      // Render debug info
      this.renderDebugInfo()
    } catch (error) {
      console.error("❌ Visual debug render error:", error)
    }
  }

  renderCloth(clothData, clothId) {
    const { particles, constraints } = clothData

    // Project 3D positions to 2D screen coordinates
    const projectedParticles = particles.map((particle) => {
      return this.project3DTo2D(particle.position)
    })

    // Render constraints first (behind particles)
    this.renderConstraints(constraints, projectedParticles)

    // Render particles on top
    this.renderParticles(particles, projectedParticles)
  }

  renderConstraints(constraints, projectedParticles) {
    this.ctx.lineWidth = 1
    this.ctx.globalAlpha = 0.3

    constraints.forEach((constraint) => {
      const p1 = projectedParticles[constraint.p1]
      const p2 = projectedParticles[constraint.p2]

      if (!p1 || !p2) return

      // Set color based on constraint type
      this.ctx.strokeStyle = this.constraintColors[constraint.type] || "#666666"

      // Draw constraint line
      this.ctx.beginPath()
      this.ctx.moveTo(p1.x, p1.y)
      this.ctx.lineTo(p2.x, p2.y)
      this.ctx.stroke()
    })

    this.ctx.globalAlpha = 1.0
  }

  renderParticles(particles, projectedParticles) {
    particles.forEach((particle, index) => {
      const projected = projectedParticles[index]
      if (!projected) return

      // Determine particle color based on state
      let color = this.particleColors.free
      if (particle.pinned) {
        color = this.particleColors.pinned
      } else {
        // Calculate velocity to determine if moving
        const velX = particle.position.x - particle.oldPosition.x
        const velY = particle.position.y - particle.oldPosition.y
        const velZ = particle.position.z - particle.oldPosition.z
        const velocity = Math.sqrt(velX * velX + velY * velY + velZ * velZ)

        if (velocity > 0.001) {
          color = this.particleColors.moving
        } else if (velocity < 0.0001) {
          color = this.particleColors.static
        }
      }

      // Draw particle
      this.ctx.fillStyle = color
      this.ctx.beginPath()
      this.ctx.arc(projected.x, projected.y, particle.pinned ? 4 : 2, 0, Math.PI * 2)
      this.ctx.fill()

      // Draw particle index for debugging (only for first few)
      if (index < 10) {
        this.ctx.fillStyle = "#ffffff"
        this.ctx.font = "10px monospace"
        this.ctx.fillText(index.toString(), projected.x + 5, projected.y - 5)
      }
    })
  }

  renderAvatarColliders(colliders, colliderId) {
    this.ctx.strokeStyle = "#ff6600"
    this.ctx.lineWidth = 2
    this.ctx.globalAlpha = 0.5

    colliders.forEach((collider) => {
      const projected = this.project3DTo2D(collider.position)
      if (!projected) return

      if (collider.type === "sphere") {
        // Draw sphere as circle
        this.ctx.beginPath()
        this.ctx.arc(projected.x, projected.y, collider.radius * 100, 0, Math.PI * 2)
        this.ctx.stroke()
      } else if (collider.type === "capsule") {
        // Draw capsule as circle (simplified)
        this.ctx.beginPath()
        this.ctx.arc(projected.x, projected.y, collider.radius * 100, 0, Math.PI * 2)
        this.ctx.stroke()
      }
    })

    this.ctx.globalAlpha = 1.0
  }

  project3DTo2D(position3D) {
    // Simple orthographic projection
    // In a real implementation, you'd use the camera's projection matrix
    const scale = 100 // Scale factor for visibility
    const offsetX = this.canvas.width / 2
    const offsetY = this.canvas.height / 2

    return {
      x: offsetX + position3D.x * scale,
      y: offsetY - position3D.y * scale, // Flip Y axis
    }
  }

  renderDebugInfo() {
    if (!this.clothSimulation) return

    // Render debug text overlay
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(10, 10, 300, 120)

    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "12px monospace"

    const status = this.clothSimulation.getDetailedStatus()
    const lines = [
      `Physics Debug Active`,
      `Engine: ${status.engine}`,
      `Particles: ${status.physicsDetails?.totalParticles || 0}`,
      `Constraints: ${status.physicsDetails?.totalConstraints || 0}`,
      `Update Count: ${status.updateCount}`,
      ``,
      `Legend:`,
      `🔴 Pinned  🟢 Free  🟡 Moving  ⚫ Static`,
    ]

    lines.forEach((line, index) => {
      this.ctx.fillText(line, 20, 30 + index * 14)
    })
  }

  cleanup() {
    this.disable()

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }

    this.canvas = null
    this.ctx = null
    this.clothSimulation = null

    console.log("✅ Visual debug cleanup complete")
  }
}

// Export for use in main application
window.PhysicsVisualDebug = PhysicsVisualDebug
