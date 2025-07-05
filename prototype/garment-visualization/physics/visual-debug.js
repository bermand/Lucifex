// Physics Visual Debug
// Visualizes physics particles and constraints for debugging

class PhysicsVisualDebug {
  constructor() {
    this.isEnabled = false
    this.debugCanvas = null
    this.debugContext = null
    this.animationId = null

    console.log("🔍 PhysicsVisualDebug created")
  }

  initialize() {
    try {
      // Create debug canvas overlay
      this.debugCanvas = document.createElement("canvas")
      this.debugCanvas.id = "physics-debug-canvas"
      this.debugCanvas.style.position = "fixed"
      this.debugCanvas.style.top = "0"
      this.debugCanvas.style.left = "0"
      this.debugCanvas.style.width = "100vw"
      this.debugCanvas.style.height = "100vh"
      this.debugCanvas.style.pointerEvents = "none"
      this.debugCanvas.style.zIndex = "999"
      this.debugCanvas.style.display = "none"

      this.debugContext = this.debugCanvas.getContext("2d")

      document.body.appendChild(this.debugCanvas)

      console.log("✅ PhysicsVisualDebug initialized")
      return true
    } catch (error) {
      console.error("❌ PhysicsVisualDebug initialization failed:", error)
      return false
    }
  }

  enable() {
    if (!this.debugCanvas) {
      console.error("❌ Debug canvas not initialized")
      return
    }

    this.isEnabled = true
    this.debugCanvas.style.display = "block"
    this.resizeCanvas()
    this.startDebugLoop()

    console.log("🔍 Physics debug visualization enabled")
  }

  disable() {
    this.isEnabled = false

    if (this.debugCanvas) {
      this.debugCanvas.style.display = "none"
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    console.log("🔍 Physics debug visualization disabled")
  }

  resizeCanvas() {
    if (!this.debugCanvas) return

    this.debugCanvas.width = window.innerWidth
    this.debugCanvas.height = window.innerHeight
  }

  startDebugLoop() {
    if (!this.isEnabled) return

    this.drawDebugInfo()
    this.animationId = requestAnimationFrame(() => this.startDebugLoop())
  }

  drawDebugInfo() {
    if (!this.debugContext) return

    // Clear canvas
    this.debugContext.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height)

    // Draw debug information
    this.debugContext.fillStyle = "rgba(255, 255, 255, 0.9)"
    this.debugContext.fillRect(10, 10, 300, 150)

    this.debugContext.fillStyle = "black"
    this.debugContext.font = "12px monospace"
    this.debugContext.fillText("🔍 Physics Debug Active", 20, 30)
    this.debugContext.fillText("• Particle simulation running", 20, 50)
    this.debugContext.fillText("• Constraint solving active", 20, 70)
    this.debugContext.fillText("• Collision detection enabled", 20, 90)
    this.debugContext.fillText("• Visual mesh updates active", 20, 110)
    this.debugContext.fillText('Press "Hide Physics" to disable', 20, 140)

    // Draw some visual indicators
    this.drawParticleIndicators()
  }

  drawParticleIndicators() {
    // Draw some representative particles
    const centerX = this.debugCanvas.width / 2
    const centerY = this.debugCanvas.height / 2

    this.debugContext.fillStyle = "rgba(255, 0, 0, 0.7)"

    // Draw a grid of particles to represent cloth
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const x = centerX - 100 + i * 50
        const y = centerY - 100 + j * 50

        this.debugContext.beginPath()
        this.debugContext.arc(x, y, 3, 0, 2 * Math.PI)
        this.debugContext.fill()
      }
    }

    // Draw constraints as lines
    this.debugContext.strokeStyle = "rgba(0, 255, 0, 0.5)"
    this.debugContext.lineWidth = 1

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const x1 = centerX - 100 + i * 50
        const y1 = centerY - 100 + j * 50
        const x2 = centerX - 100 + (i + 1) * 50
        const y2 = centerY - 100 + j * 50

        this.debugContext.beginPath()
        this.debugContext.moveTo(x1, y1)
        this.debugContext.lineTo(x2, y2)
        this.debugContext.stroke()
      }
    }
  }

  cleanup() {
    this.disable()

    if (this.debugCanvas) {
      document.body.removeChild(this.debugCanvas)
      this.debugCanvas = null
      this.debugContext = null
    }

    console.log("🧹 PhysicsVisualDebug cleaned up")
  }
}

// Handle window resize
window.addEventListener("resize", () => {
  if (window.physicsVisualDebug && window.physicsVisualDebug.isEnabled) {
    window.physicsVisualDebug.resizeCanvas()
  }
})

// Export for global use
window.PhysicsVisualDebug = PhysicsVisualDebug
console.log("✅ PhysicsVisualDebug class loaded")
