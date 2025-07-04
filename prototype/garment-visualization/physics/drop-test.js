// Physics Drop Test
// Demonstrates dramatic cloth falling for testing physics

class PhysicsDropTest {
  constructor(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.originalSettings = {}
    this.isRunning = false
    this.testStartTime = 0
  }

  async startDropTest() {
    if (!this.clothSimulation || !this.clothSimulation.physicsEngine) {
      console.log("❌ No physics simulation available for drop test")
      return false
    }

    console.log("🧪 === DROP TEST STARTING ===")

    try {
      // Store original settings
      this.storeOriginalSettings()

      // Apply dramatic drop test settings
      this.applyDropTestSettings()

      this.isRunning = true
      this.testStartTime = Date.now()

      console.log("🧪 Drop test active - cloth should fall dramatically!")
      console.log("   • Gravity increased to -50 m/s²")
      console.log("   • Cloth stiffness reduced to 0.05")
      console.log("   • Damping reduced to 0.9")
      console.log("   • Constraint iterations reduced to 1")

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (this.isRunning) {
          this.stopDropTest()
        }
      }, 10000)

      return true
    } catch (error) {
      console.error("❌ Drop test failed:", error)
      return false
    }
  }

  storeOriginalSettings() {
    const engine = this.clothSimulation.physicsEngine

    this.originalSettings = {
      gravity: { ...engine.gravity },
      damping: engine.damping,
      constraintIterations: engine.constraintIterations,
    }

    // Store cloth-specific settings
    engine.clothMeshes.forEach((clothData, clothId) => {
      this.originalSettings[clothId] = {
        constraints: clothData.constraints.map((c) => ({ ...c })),
      }
    })

    console.log("💾 Original settings stored:", this.originalSettings)
  }

  applyDropTestSettings() {
    const engine = this.clothSimulation.physicsEngine

    // Dramatic gravity increase
    engine.setGravity(0, -50, 0) // 5x normal gravity

    // Reduce damping for more movement
    engine.damping = 0.9

    // Reduce constraint iterations for more flexibility
    engine.constraintIterations = 1

    // Make cloth much more flexible
    engine.clothMeshes.forEach((clothData, clothId) => {
      clothData.constraints.forEach((constraint) => {
        if (constraint.type === "structural") {
          constraint.stiffness = 0.05 // Very flexible
        } else if (constraint.type === "shear") {
          constraint.stiffness = 0.02 // Even more flexible
        } else if (constraint.type === "bend") {
          constraint.stiffness = 0.01 // Minimal bending resistance
        }
      })
    })

    // Add strong initial downward velocity to all particles
    engine.clothMeshes.forEach((clothData) => {
      clothData.particles.forEach((particle) => {
        if (!particle.pinned) {
          // Give particles strong downward velocity
          particle.oldPosition.y = particle.position.y + 0.5 // Strong initial velocity
          particle.oldPosition.x += (Math.random() - 0.5) * 0.2 // Random horizontal movement
          particle.oldPosition.z += (Math.random() - 0.5) * 0.2 // Random depth movement
        }
      })
    })

    console.log("⚡ Drop test settings applied - cloth should fall dramatically!")
  }

  restoreOriginalSettings() {
    const engine = this.clothSimulation.physicsEngine

    // Restore gravity
    engine.setGravity(this.originalSettings.gravity.x, this.originalSettings.gravity.y, this.originalSettings.gravity.z)

    // Restore damping
    engine.damping = this.originalSettings.damping

    // Restore constraint iterations
    engine.constraintIterations = this.originalSettings.constraintIterations

    // Restore cloth constraints
    engine.clothMeshes.forEach((clothData, clothId) => {
      if (this.originalSettings[clothId]) {
        const originalConstraints = this.originalSettings[clothId].constraints
        clothData.constraints.forEach((constraint, index) => {
          if (originalConstraints[index]) {
            constraint.stiffness = originalConstraints[index].stiffness
          }
        })
      }
    })

    console.log("🔄 Original settings restored")
  }

  stopDropTest() {
    if (!this.isRunning) {
      console.log("⚠️ Drop test not running")
      return
    }

    const testDuration = (Date.now() - this.testStartTime) / 1000

    console.log("🧪 === DROP TEST COMPLETE ===")
    console.log(`   • Duration: ${testDuration.toFixed(2)}s`)

    // Get final cloth positions
    const engine = this.clothSimulation.physicsEngine
    engine.clothMeshes.forEach((clothData, clothId) => {
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      let avgY = 0

      clothData.particles.forEach((particle) => {
        minY = Math.min(minY, particle.position.y)
        maxY = Math.max(maxY, particle.position.y)
        avgY += particle.position.y
      })
      avgY /= clothData.particles.length

      console.log(`🧪 Final ${clothId} positions:`)
      console.log(`   • Y range: ${minY.toFixed(3)}m to ${maxY.toFixed(3)}m`)
      console.log(`   • Average Y: ${avgY.toFixed(3)}m`)

      // Check if cloth fell significantly
      const heightDrop = 2.2 - avgY // Started at Y=2.2m
      if (heightDrop > 1.0) {
        console.log("✅ DROP TEST PASSED - Cloth fell significantly!")
        console.log(`   • Height drop: ${heightDrop.toFixed(3)}m`)
      } else {
        console.log("⚠️ DROP TEST INCONCLUSIVE - Limited falling detected")
        console.log(`   • Height drop: ${heightDrop.toFixed(3)}m`)
      }
    })

    // Restore original settings
    this.restoreOriginalSettings()

    this.isRunning = false
    console.log("🧪 Drop test cleanup complete")
  }

  isDropTestRunning() {
    return this.isRunning
  }
}

// Export for use in main application
window.PhysicsDropTest = PhysicsDropTest
