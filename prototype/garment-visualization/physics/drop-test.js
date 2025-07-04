// Physics Drop Test
// Demonstrates dramatic cloth falling by temporarily modifying physics parameters

class PhysicsDropTest {
  constructor(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.originalSettings = null
    this.isRunning = false
    this.testDuration = 5000 // 5 seconds
    this.testStartTime = 0
  }

  async startDropTest() {
    if (!this.clothSimulation || !this.clothSimulation.physicsEngine) {
      console.log("❌ No cloth simulation available for drop test")
      return false
    }

    if (this.isRunning) {
      console.log("⚠️ Drop test already running")
      return false
    }

    console.log("🧪 === STARTING DROP TEST ===")

    try {
      // Store original settings
      this.storeOriginalSettings()

      // Apply dramatic drop settings
      this.applyDropSettings()

      // Reset cloth to high position
      this.resetClothPosition()

      this.isRunning = true
      this.testStartTime = Date.now()

      // Monitor test progress
      this.monitorTest()

      console.log("🧪 Drop test started - watch the cloth fall dramatically!")
      return true
    } catch (error) {
      console.error("❌ Failed to start drop test:", error)
      return false
    }
  }

  storeOriginalSettings() {
    const physicsEngine = this.clothSimulation.physicsEngine

    this.originalSettings = {
      gravity: { ...physicsEngine.gravity },
      damping: physicsEngine.damping,
      constraintIterations: physicsEngine.constraintIterations,
    }

    // Store original constraint stiffness
    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      if (!this.originalSettings.clothStiffness) {
        this.originalSettings.clothStiffness = new Map()
      }

      // Sample first constraint of each type for restoration
      const sampleConstraints = {
        structural: clothData.constraints.find((c) => c.type === "structural"),
        shear: clothData.constraints.find((c) => c.type === "shear"),
        bend: clothData.constraints.find((c) => c.type === "bend"),
      }

      this.originalSettings.clothStiffness.set(clothId, sampleConstraints)
    })

    console.log("💾 Original physics settings stored")
  }

  applyDropSettings() {
    const physicsEngine = this.clothSimulation.physicsEngine

    // Increase gravity dramatically
    physicsEngine.setGravity(0, -25, 0) // 2.5x normal gravity

    // Reduce damping for more dramatic movement
    physicsEngine.damping = 0.95 // Was 0.98

    // Reduce constraint iterations for more flexibility
    physicsEngine.constraintIterations = 1

    // Make cloth much more flexible
    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      clothData.constraints.forEach((constraint) => {
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
    })

    console.log("⚡ Drop test settings applied:")
    console.log("   • Gravity: -25 m/s² (2.5x normal)")
    console.log("   • Damping: 0.95 (reduced)")
    console.log("   • Constraints: Very flexible")
  }

  resetClothPosition() {
    const physicsEngine = this.clothSimulation.physicsEngine

    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const { particles } = clothData

      // Reset all particles to high position with random spread
      particles.forEach((particle, index) => {
        // Reset to high position
        particle.position.y = 3.0 + Math.random() * 0.5 // 3-3.5m high
        particle.position.x = particle.position.x + (Math.random() - 0.5) * 0.2 // Small X variation
        particle.position.z = particle.position.z + (Math.random() - 0.5) * 0.2 // Small Z variation

        // Give initial velocities for more dramatic effect
        particle.oldPosition.x = particle.position.x + (Math.random() - 0.5) * 0.1
        particle.oldPosition.y = particle.position.y + 0.2 // Upward initial velocity
        particle.oldPosition.z = particle.position.z + (Math.random() - 0.5) * 0.1

        // Unpin more particles for dramatic fall (keep only 1 pinned)
        if (index > 0) {
          particle.pinned = false
        }
      })

      console.log(`🚀 Cloth ${clothId} reset to high position for dramatic fall`)
    })
  }

  monitorTest() {
    if (!this.isRunning) return

    const elapsed = Date.now() - this.testStartTime

    // Log progress every second
    if (elapsed % 1000 < 100) {
      const seconds = Math.floor(elapsed / 1000)
      console.log(`🧪 Drop test progress: ${seconds}s`)

      // Log cloth positions
      this.logClothPositions()
    }

    // Stop test after duration
    if (elapsed >= this.testDuration) {
      this.stopDropTest()
      return
    }

    // Continue monitoring
    setTimeout(() => this.monitorTest(), 100)
  }

  logClothPositions() {
    const physicsEngine = this.clothSimulation.physicsEngine

    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const { particles } = clothData

      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      let avgY = 0
      let totalVelocity = 0

      particles.forEach((particle) => {
        minY = Math.min(minY, particle.position.y)
        maxY = Math.max(maxY, particle.position.y)
        avgY += particle.position.y

        // Calculate velocity
        const velX = particle.position.x - particle.oldPosition.x
        const velY = particle.position.y - particle.oldPosition.y
        const velZ = particle.position.z - particle.oldPosition.z
        totalVelocity += Math.sqrt(velX * velX + velY * velY + velZ * velZ)
      })

      avgY /= particles.length
      const avgVelocity = totalVelocity / particles.length

      console.log(
        `   Cloth ${clothId}: Y=${minY.toFixed(2)}m to ${maxY.toFixed(2)}m, avg=${avgY.toFixed(2)}m, vel=${avgVelocity.toFixed(4)}m/frame`,
      )
    })
  }

  stopDropTest() {
    if (!this.isRunning) {
      console.log("⚠️ Drop test not running")
      return
    }

    console.log("🧪 === DROP TEST COMPLETE ===")

    // Restore original settings
    this.restoreOriginalSettings()

    this.isRunning = false

    const elapsed = (Date.now() - this.testStartTime) / 1000
    console.log(`🧪 Drop test completed in ${elapsed.toFixed(1)}s`)
    console.log("🔄 Original physics settings restored")
  }

  restoreOriginalSettings() {
    if (!this.originalSettings) {
      console.log("⚠️ No original settings to restore")
      return
    }

    const physicsEngine = this.clothSimulation.physicsEngine

    // Restore gravity
    physicsEngine.setGravity(
      this.originalSettings.gravity.x,
      this.originalSettings.gravity.y,
      this.originalSettings.gravity.z,
    )

    // Restore damping
    physicsEngine.damping = this.originalSettings.damping

    // Restore constraint iterations
    physicsEngine.constraintIterations = this.originalSettings.constraintIterations

    // Restore constraint stiffness
    if (this.originalSettings.clothStiffness) {
      physicsEngine.clothMeshes.forEach((clothData, clothId) => {
        const originalConstraints = this.originalSettings.clothStiffness.get(clothId)
        if (!originalConstraints) return

        clothData.constraints.forEach((constraint) => {
          const original = originalConstraints[constraint.type]
          if (original) {
            constraint.stiffness = original.stiffness
          }
        })
      })
    }

    console.log("✅ Original physics settings restored")
  }

  isTestRunning() {
    return this.isRunning
  }
}

// Export for use in main application
window.PhysicsDropTest = PhysicsDropTest
