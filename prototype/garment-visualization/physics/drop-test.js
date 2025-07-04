// Physics Drop Test
// Demonstrates dramatic cloth falling for testing physics

class PhysicsDropTest {
  constructor(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.originalGravity = { x: 0, y: -9.81, z: 0 }
    this.originalStiffness = 0.4
    this.testRunning = false
    this.testStartTime = 0
  }

  async startDropTest() {
    if (!this.clothSimulation || !this.clothSimulation.physicsEngine) {
      console.log("❌ No cloth simulation available for drop test")
      return false
    }

    if (this.testRunning) {
      console.log("⚠️ Drop test already running")
      return false
    }

    try {
      console.log("🧪 === DROP TEST STARTING ===")

      // Store original settings
      const status = this.clothSimulation.getDetailedStatus()
      if (status.physicsDetails) {
        this.originalGravity = { ...status.physicsDetails.gravity }
      }

      // Apply dramatic drop settings
      this.clothSimulation.setGravity(0, -20, 0) // Double gravity
      this.clothSimulation.setClothStiffness("main-garment", 0.1) // Very flexible

      // Reset cloth to high position
      this.resetClothPosition()

      this.testRunning = true
      this.testStartTime = Date.now()

      console.log("🧪 Drop test active:")
      console.log("   • Gravity: -20 m/s² (2x normal)")
      console.log("   • Stiffness: 0.1 (very flexible)")
      console.log("   • Cloth reset to high position")
      console.log("   • Watch the cloth fall dramatically!")

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (this.testRunning) {
          this.stopDropTest()
        }
      }, 10000)

      return true
    } catch (error) {
      console.error("❌ Drop test failed:", error)
      return false
    }
  }

  resetClothPosition() {
    try {
      // Get the cloth data
      const clothData = this.clothSimulation.clothMeshes.get("main-garment")
      if (!clothData || !clothData.physicsId) {
        console.log("⚠️ No cloth found for position reset")
        return
      }

      const physicsCloth = this.clothSimulation.physicsEngine.clothMeshes.get(clothData.physicsId)
      if (!physicsCloth) {
        console.log("⚠️ No physics cloth found for position reset")
        return
      }

      // Reset all particles to high position with random velocities
      physicsCloth.particles.forEach((particle, index) => {
        // Reset to original grid position but much higher
        const normalizedX = particle.gridX / (physicsCloth.gridWidth - 1) - 0.5
        const normalizedY = particle.gridY / (physicsCloth.gridHeight - 1)

        // Set new high position
        particle.position.x = normalizedX * physicsCloth.physicalWidth
        particle.position.y = 3.0 - normalizedY * physicsCloth.physicalHeight // Start at Y=3.0
        particle.position.z = (Math.random() - 0.5) * 0.3

        // Add random initial velocities for dramatic effect
        particle.oldPosition.x = particle.position.x + (Math.random() - 0.5) * 0.5
        particle.oldPosition.y = particle.position.y + (Math.random() - 0.5) * 0.3
        particle.oldPosition.z = particle.position.z + (Math.random() - 0.5) * 0.5

        // Only pin the top corners
        particle.pinned =
          particle.gridY === 0 && (particle.gridX === 2 || particle.gridX === physicsCloth.gridWidth - 3)
      })

      console.log("✅ Cloth position reset for dramatic drop")
      console.log(`   • ${physicsCloth.particles.length} particles repositioned`)
      console.log(`   • ${physicsCloth.particles.filter((p) => p.pinned).length} particles pinned`)
      console.log("   • Random velocities applied")
    } catch (error) {
      console.error("❌ Failed to reset cloth position:", error)
    }
  }

  stopDropTest() {
    if (!this.testRunning) {
      console.log("⚠️ No drop test running")
      return
    }

    try {
      const testDuration = (Date.now() - this.testStartTime) / 1000

      console.log("🧪 === DROP TEST COMPLETE ===")
      console.log(`   • Duration: ${testDuration.toFixed(1)}s`)

      // Restore original settings
      this.clothSimulation.setGravity(this.originalGravity.x, this.originalGravity.y, this.originalGravity.z)
      this.clothSimulation.setClothStiffness("main-garment", this.originalStiffness)

      this.testRunning = false

      console.log("✅ Original physics settings restored")
      console.log("   • Gravity: -9.81 m/s²")
      console.log("   • Stiffness: 0.4")
    } catch (error) {
      console.error("❌ Failed to stop drop test:", error)
    }
  }

  isRunning() {
    return this.testRunning
  }
}

// Export for use in main application
window.PhysicsDropTest = PhysicsDropTest
