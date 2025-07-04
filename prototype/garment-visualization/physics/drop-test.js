// Physics Drop Test
// Demonstrates dramatic cloth falling with enhanced physics

class PhysicsDropTest {
  constructor(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.isRunning = false
    this.originalSettings = {}
    this.testDuration = 10000 // 10 seconds
    this.testStartTime = 0
  }

  async startDropTest() {
    if (!this.clothSimulation || !this.clothSimulation.physicsEngine) {
      console.error("❌ No physics simulation available for drop test")
      return false
    }

    if (this.isRunning) {
      console.log("⚠️ Drop test already running")
      return false
    }

    try {
      console.log("🧪 === STARTING DRAMATIC DROP TEST ===")

      this.isRunning = true
      this.testStartTime = Date.now()

      // Store original settings
      this.originalSettings = {
        gravity: { ...this.clothSimulation.physicsEngine.gravity },
        damping: this.clothSimulation.physicsEngine.damping,
        constraintIterations: this.clothSimulation.physicsEngine.constraintIterations,
      }

      // Apply dramatic drop settings
      this.clothSimulation.physicsEngine.gravity = { x: 0, y: -25, z: 0 } // 2.5x stronger gravity
      this.clothSimulation.physicsEngine.damping = 0.95 // Less damping for more movement
      this.clothSimulation.physicsEngine.constraintIterations = 1 // Maximum flexibility

      // Reset cloth to high starting position
      this.resetClothToDropPosition()

      // Make cloth more flexible
      this.makeClothMoreFlexible()

      console.log("🧪 Drop test settings applied:")
      console.log("   • Gravity: 2.5x stronger (-25 m/s²)")
      console.log("   • Damping: Reduced for more movement")
      console.log("   • Constraints: Maximum flexibility")
      console.log("   • Position: Reset to high drop position")

      // Auto-stop after test duration
      setTimeout(() => {
        if (this.isRunning) {
          this.stopDropTest()
        }
      }, this.testDuration)

      return true
    } catch (error) {
      console.error("❌ Failed to start drop test:", error)
      this.isRunning = false
      return false
    }
  }

  resetClothToDropPosition() {
    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const { particles } = clothData

      console.log(`🔄 Resetting ${particles.length} particles to drop position...`)

      particles.forEach((particle, index) => {
        // Calculate grid position
        const gridX = particle.gridX || index % 16
        const gridY = particle.gridY || Math.floor(index / 16)

        // Calculate normalized position
        const normalizedX = gridX / 15 // 0 to 1
        const normalizedY = gridY / 19 // 0 to 1

        // Set to very high starting position for dramatic fall
        particle.position.x = (normalizedX - 0.5) * 1.2 // Wider spread
        particle.position.y = 4.0 - normalizedY * 0.5 // Start very high (3.5-4.0m)
        particle.position.z = (Math.random() - 0.5) * 0.3 // More Z variation

        // Set old position for initial velocity (add some random motion)
        particle.oldPosition.x = particle.position.x + (Math.random() - 0.5) * 0.2
        particle.oldPosition.y = particle.position.y + 0.3 // Strong initial upward velocity
        particle.oldPosition.z = particle.position.z + (Math.random() - 0.5) * 0.2

        // Only pin the top corners for dramatic effect
        particle.pinned = gridY === 0 && (gridX === 3 || gridX === 12)
      })

      console.log(`✅ Cloth ${clothId} reset to dramatic drop position`)
    })
  }

  makeClothMoreFlexible() {
    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const { constraints } = clothData

      // Make all constraints much more flexible
      constraints.forEach((constraint) => {
        switch (constraint.type) {
          case "structural":
            constraint.stiffness = 0.05 // Very flexible
            break
          case "shear":
            constraint.stiffness = 0.02 // Extremely flexible
            break
          case "bend":
            constraint.stiffness = 0.01 // Almost no bending resistance
            break
        }
      })

      console.log(`✅ Made cloth ${clothId} extremely flexible for drop test`)
    })
  }

  stopDropTest() {
    if (!this.isRunning) {
      console.log("⚠️ Drop test not running")
      return
    }

    try {
      console.log("🧪 === STOPPING DROP TEST ===")

      const testDuration = (Date.now() - this.testStartTime) / 1000
      console.log(`🧪 Drop test ran for ${testDuration.toFixed(1)} seconds`)

      // Restore original settings
      if (this.originalSettings.gravity) {
        this.clothSimulation.physicsEngine.gravity = { ...this.originalSettings.gravity }
        this.clothSimulation.physicsEngine.damping = this.originalSettings.damping
        this.clothSimulation.physicsEngine.constraintIterations = this.originalSettings.constraintIterations
      }

      // Restore original constraint stiffness
      this.restoreOriginalStiffness()

      this.isRunning = false

      console.log("✅ Drop test stopped, original settings restored")
    } catch (error) {
      console.error("❌ Failed to stop drop test:", error)
    }
  }

  restoreOriginalStiffness() {
    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const { constraints } = clothData

      // Restore moderate stiffness
      constraints.forEach((constraint) => {
        switch (constraint.type) {
          case "structural":
            constraint.stiffness = 0.15
            break
          case "shear":
            constraint.stiffness = 0.08
            break
          case "bend":
            constraint.stiffness = 0.05
            break
        }
      })

      console.log(`✅ Restored original stiffness for cloth ${clothId}`)
    })
  }

  getStatus() {
    return {
      running: this.isRunning,
      duration: this.isRunning ? (Date.now() - this.testStartTime) / 1000 : 0,
      maxDuration: this.testDuration / 1000,
    }
  }
}

// Export for use in main application
window.PhysicsDropTest = PhysicsDropTest
