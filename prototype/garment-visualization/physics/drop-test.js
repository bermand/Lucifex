// Physics Drop Test
// Dramatic cloth falling demonstration

class PhysicsDropTest {
  constructor() {
    this.isRunning = false
    this.testDuration = 5000 // 5 seconds
    this.startTime = 0

    console.log("🎬 PhysicsDropTest created")
  }

  initialize() {
    console.log("✅ PhysicsDropTest initialized")
    return true
  }

  startDropTest() {
    if (this.isRunning) {
      console.log("⚠️ Drop test already running")
      return
    }

    this.isRunning = true
    this.startTime = Date.now()

    console.log("🎬 Starting dramatic drop test...")

    // Create dramatic falling effect
    this.animateDropTest()
  }

  animateDropTest() {
    if (!this.isRunning) return

    const elapsed = Date.now() - this.startTime
    const progress = Math.min(elapsed / this.testDuration, 1.0)

    // Dramatic falling curve
    const fallDistance = this.easeOutBounce(progress) * 200 // 200px max fall
    const rotation = Math.sin(progress * Math.PI * 2) * 15 // Swaying motion

    // Apply dramatic transform
    const garmentViewer = document.getElementById("garment-viewer")
    if (garmentViewer) {
      const currentTransform = garmentViewer.style.transform || ""
      const baseTransform = currentTransform.replace(/translateY$$[^)]*$$/, "").replace(/rotateZ$$[^)]*$$/, "")

      garmentViewer.style.transform = `${baseTransform} translateY(${-fallDistance}px) rotateZ(${rotation}deg)`
    }

    if (progress < 1.0) {
      requestAnimationFrame(() => this.animateDropTest())
    } else {
      this.stopDropTest()
    }
  }

  easeOutBounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  }

  stopDropTest() {
    this.isRunning = false
    console.log("🎬 Drop test completed")

    // Reset garment position after a delay
    setTimeout(() => {
      const garmentViewer = document.getElementById("garment-viewer")
      if (garmentViewer) {
        const currentTransform = garmentViewer.style.transform || ""
        const baseTransform = currentTransform.replace(/translateY$$[^)]*$$/, "").replace(/rotateZ$$[^)]*$$/, "")
        garmentViewer.style.transform = baseTransform
      }
    }, 1000)
  }

  cleanup() {
    this.stopDropTest()
    console.log("🧹 PhysicsDropTest cleaned up")
  }
}

// Export for global use
window.PhysicsDropTest = PhysicsDropTest
console.log("✅ PhysicsDropTest class loaded")
