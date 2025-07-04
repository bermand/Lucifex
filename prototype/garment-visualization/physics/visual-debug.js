// Visual Debug Overlay for Physics Simulation
// Shows physics particles and constraints as visual feedback

class PhysicsVisualDebug {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.isEnabled = false
    this.clothSimulation = null
    this.animationFrame = null
  }

  initialize(clothSimulation) {
    try {
      this.clothSimulation = clothSimulation

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

      // Add resize listener
      window.addEventListener("resize", () => this.resizeCanvas())

      console.log("✅ Physics visual debug initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize physics visual debug:", error)
      return false
    }
  }

  resizeCanvas() {
    if (!this.canvas) return

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  enable() {
    if (!this.canvas || this.isEnabled) return

    document.body.appendChild(this.canvas)
    this.isEnabled = true
    this.startRendering()

    console.log("🎨 Physics visual debug enabled")
  }

  disable() {
    if (!this.isEnabled) return

    this.stopRendering()
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }
    this.isEnabled = false

    console.log("🎨 Physics visual debug disabled")
  }

  startRendering() {
    if (!this.isEnabled) return

    const render = () => {
      if (!this.isEnabled) return

      this.renderDebugInfo()
      this.animationFrame = requestAnimationFrame(render)
    }

    render()
  }

  stopRendering() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  renderDebugInfo() {
    if (!this.ctx || !this.clothSimulation) return

    try {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      // Set up 2D projection (simple orthographic)
      const centerX = this.canvas.width / 2
      const centerY = this.canvas.height / 2
      const scale = 200 // pixels per meter

      // Draw physics particles
      this.drawClothParticles(centerX, centerY, scale)

      // Draw constraints
      this.drawClothConstraints(centerX, centerY, scale)

      // Draw avatar colliders
      this.drawAvatarColliders(centerX, centerY, scale)

      // Draw info panel
      this.drawInfoPanel()
    } catch (error) {
      console.error("❌ Failed to render debug info:", error)
    }
  }

  drawClothParticles(centerX, centerY, scale) {
    if (!this.clothSimulation.physicsEngine || !this.clothSimulation.physicsEngine.clothMeshes) return

    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      clothData.particles.forEach((particle, index) => {
        const screenX = centerX + particle.position.x * scale
        const screenY = centerY - particle.position.y * scale // Flip Y for screen coordinates

        // Draw particle
        this.ctx.beginPath()
        this.ctx.arc(screenX, screenY, particle.pinned ? 4 : 2, 0, 2 * Math.PI)
        this.ctx.fillStyle = particle.pinned ? "#ff4444" : "#44ff44"
        this.ctx.fill()

        // Draw particle ID for debugging (only for first few)
        if (index < 10) {
          this.ctx.fillStyle = "#ffffff"
          this.ctx.font = "10px monospace"
          this.ctx.fillText(index.toString(), screenX + 5, screenY - 5)
        }
      })
    })
  }

  drawClothConstraints(centerX, centerY, scale) {
    if (!this.clothSimulation.physicsEngine || !this.clothSimulation.physicsEngine.clothMeshes) return

    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      clothData.constraints.forEach((constraint) => {
        const p1 = clothData.particles[constraint.p1]
        const p2 = clothData.particles[constraint.p2]

        if (!p1 || !p2) return

        const x1 = centerX + p1.position.x * scale
        const y1 = centerY - p1.position.y * scale
        const x2 = centerX + p2.position.x * scale
        const y2 = centerY - p2.position.y * scale

        // Draw constraint line
        this.ctx.beginPath()
        this.ctx.moveTo(x1, y1)
        this.ctx.lineTo(x2, y2)

        // Color by constraint type
        switch (constraint.type) {
          case "structural":
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
            break
          case "shear":
            this.ctx.strokeStyle = "rgba(255, 255, 0, 0.2)"
            break
          case "bend":
            this.ctx.strokeStyle = "rgba(0, 255, 255, 0.1)"
            break
          default:
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
        }

        this.ctx.lineWidth = 1
        this.ctx.stroke()
      })
    })
  }

  drawAvatarColliders(centerX, centerY, scale) {
    if (!this.clothSimulation.physicsEngine || !this.clothSimulation.physicsEngine.avatarColliders) return

    this.clothSimulation.physicsEngine.avatarColliders.forEach((colliders, colliderId) => {
      colliders.forEach((collider) => {
        const screenX = centerX + collider.position.x * scale
        const screenY = centerY - collider.position.y * scale

        if (collider.type === "sphere") {
          // Draw sphere collider
          this.ctx.beginPath()
          this.ctx.arc(screenX, screenY, collider.radius * scale, 0, 2 * Math.PI)
          this.ctx.strokeStyle = "#ff8844"
          this.ctx.lineWidth = 2
          this.ctx.stroke()
        } else if (collider.type === "capsule") {
          // Draw capsule collider (simplified as circle)
          this.ctx.beginPath()
          this.ctx.arc(screenX, screenY, collider.radius * scale, 0, 2 * Math.PI)
          this.ctx.strokeStyle = "#ff4488"
          this.ctx.lineWidth = 2
          this.ctx.stroke()
        }
      })
    })
  }

  drawInfoPanel() {
    if (!this.clothSimulation) return

    const status = this.clothSimulation.getDetailedStatus()

    // Draw info panel background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(10, 10, 300, 150)

    // Draw info text
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "12px monospace"

    let y = 30
    const lineHeight = 15

    this.ctx.fillText(`Physics Engine: ${status.engine}`, 20, y)
    y += lineHeight
    this.ctx.fillText(`Running: ${status.running}`, 20, y)
    y += lineHeight
    this.ctx.fillText(`Update Count: ${status.updateCount || 0}`, 20, y)
    y += lineHeight

    if (status.physicsDetails) {
      this.ctx.fillText(`Particles: ${status.physicsDetails.totalParticles}`, 20, y)
      y += lineHeight
      this.ctx.fillText(`Constraints: ${status.physicsDetails.totalConstraints}`, 20, y)
      y += lineHeight
      this.ctx.fillText(`Gravity: ${status.physicsDetails.gravity.y.toFixed(1)} m/s²`, 20, y)
      y += lineHeight
    }

    // Draw legend
    y += 10
    this.ctx.fillStyle = "#cccccc"
    this.ctx.font = "10px monospace"
    this.ctx.fillText("Legend:", 20, y)
    y += 12

    // Particle legend
    this.ctx.fillStyle = "#ff4444"
    this.ctx.fillRect(20, y - 3, 6, 6)
    this.ctx.fillStyle = "#cccccc"
    this.ctx.fillText("Pinned particles", 30, y)
    y += 12

    this.ctx.fillStyle = "#44ff44"
    this.ctx.fillRect(20, y - 3, 6, 6)
    this.ctx.fillStyle = "#cccccc"
    this.ctx.fillText("Free particles", 30, y)
    y += 12

    this.ctx.strokeStyle = "#ff8844"
    this.ctx.beginPath()
    this.ctx.arc(23, y - 3, 3, 0, 2 * Math.PI)
    this.ctx.stroke()
    this.ctx.fillStyle = "#cccccc"
    this.ctx.fillText("Avatar colliders", 30, y)
  }
}

// Export for use in main application
window.PhysicsVisualDebug = PhysicsVisualDebug
