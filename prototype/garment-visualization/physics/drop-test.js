// Physics Drop Test
// Dramatic cloth falling demonstration

class PhysicsDropTest {
  constructor(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.isRunning = false
    this.originalSettings = null

    console.log("🎬 PhysicsDropTest initialized")
  }

  startDropTest() {
    if (!this.clothSimulation) {
      console.error("❌ No cloth simulation available for drop test")
      return
    }

    if (this.isRunning) {
      console.log("⚠️ Drop test already running")
      return
    }

    console.log("🎬 Starting dramatic drop test...")
    this.isRunning = true

    // Store original settings
    this.originalSettings = {
      gravity: this.clothSimulation.gravity.y,
      damping: this.clothSimulation.damping,
      stiffness: this.clothSimulation.stiffness,
      startHeight: this.clothSimulation.startHeight,
    }

    // Apply dramatic settings
    this.clothSimulation.updateSettings({
      gravity: 15, // Stronger gravity
      damping: 0.92, // Less damping for more movement
      stiffness: 0.3, // Softer cloth
    })

    // Reset cloth to higher position for dramatic effect
    this.clothSimulation.startHeight = 3.0 // 3 meters high
    this.clothSimulation.resetClothPosition()

    // Show effect for 10 seconds then restore
    setTimeout(() => {
      this.endDropTest()
    }, 10000)

    console.log("🎬 Drop test active - cloth falling dramatically!")
  }

  endDropTest() {
    if (!this.isRunning || !this.originalSettings) {
      return
    }

    console.log("🎬 Ending drop test, restoring original settings...")

    // Restore original settings
    this.clothSimulation.updateSettings({
      gravity: Math.abs(this.originalSettings.gravity),
      damping: this.originalSettings.damping,
      stiffness: this.originalSettings.stiffness,
    })

    this.clothSimulation.startHeight = this.originalSettings.startHeight

    this.isRunning = false
    this.originalSettings = null

    console.log("✅ Drop test completed, settings restored")
  }

  isDropTestRunning() {
    return this.isRunning
  }
}

// Export for global use
window.PhysicsDropTest = PhysicsDropTest
