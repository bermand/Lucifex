// Physics Drop Test System
// Provides dramatic cloth dropping demonstrations

class PhysicsDropTest {
  constructor(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.isRunning = false
    this.originalSettings = {}
    this.testDuration = 10000 // 10 seconds
    this.testTimer = null
  }

  async startDropTest() {
    if (this.isRunning) {
      console.log("⚠️ Drop test already running")
      return false
    }

    if (!this.clothSimulation || !this.clothSimulation.physicsEngine) {
      console.log("❌ No physics simulation available")
      return false
    }

    try {
      console.log("🧪 === STARTING DRAMATIC DROP TEST ===")

      this.isRunning = true

      // Save original settings
      this.saveOriginalSettings()

      // Apply dramatic test settings
      this.applyDropTestSettings()

      // Reset cloth to high position
      this.resetClothToDropPosition()

      // Start test timer
      this.startTestTimer()

      console.log("🧪 Drop test started - watch the dramatic fall!")
      return true
    } catch (error) {
      console.error("❌ Failed to start drop test:", error)
      this.isRunning = false
      return false
    }
  }

  saveOriginalSettings() {
    const physicsEngine = this.clothSimulation.physicsEngine

    this.originalSettings = {
      gravity: { ...physicsEngine.gravity },
      damping: physicsEngine.damping,
      constraintIterations: physicsEngine.constraintIterations,
    }

    // Save cloth-specific settings
    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      this.originalSettings[clothId] = {
        constraints: clothData.constraints.map((c) => ({ ...c })),
      }
    })
  }

  applyDropTestSettings() {
    const physicsEngine = this.clothSimulation.physicsEngine

    // Increase gravity for dramatic effect
    physicsEngine.setGravity(0, -15, 0)

    // Reduce damping for more movement
    physicsEngine.damping = 0.95

    // Reduce constraint iterations for more flexibility
    physicsEngine.constraintIterations = 1

    // Make cloth more flexible
    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      clothData.constraints.forEach((constraint) => {
        if (constraint.type === "structural") {
          constraint.stiffness = 0.1 // Very flexible
        } else if (constraint.type === "shear") {
          constraint.stiffness = 0.05 // Even more flexible
        } else if (constraint.type === "bend") {
          constraint.stiffness = 0.02 // Minimal bending resistance
        }
      })
    })

    console.log("⚙️ Applied dramatic drop test settings")
  }

  resetClothToDropPosition() {
    const physicsEngine = this.clothSimulation.physicsEngine

    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const { particles } = clothData

      console.log(`🔄 Resetting ${particles.length} particles to drop position`)

      particles.forEach((particle, index) => {
        // Calculate grid position
        const gridX = particle.gridX || index % 16
        const gridY = particle.gridY || Math.floor(index / 16)

        // Calculate normalized position
        const normalizedX = gridX / 15 // 0 to 1
        const normalizedY = gridY / 19 // 0 to 1

        // Set high starting position
        particle.position.x = (normalizedX - 0.5) * 1.2 // Wider spread
        particle.position.y = 3.0 - normalizedY * 0.5 // High starting position
        particle.position.z = (Math.random() - 0.5) * 0.3 // More Z variation

        // Set initial velocity for dramatic effect
        particle.oldPosition.x = particle.position.x + (Math.random() - 0.5) * 0.2
        particle.oldPosition.y = particle.position.y + 0.3 // Strong upward velocity
        particle.oldPosition.z = particle.position.z + (Math.random() - 0.5) * 0.2

        // Only pin a few top particles
        particle.pinned = gridY === 0 && (gridX === 4 || gridX === 12)
      })

      console.log(`✅ Cloth ${clothId} reset to dramatic drop position`)
    })
  }

  startTestTimer() {
    this.testTimer = setTimeout(() => {
      this.stopDropTest()
    }, this.testDuration)

    // Log progress every 2 seconds
    const progressInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(progressInterval)
        return
      }

      this.logDropProgress()
    }, 2000)
  }

  logDropProgress() {
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

        const velX = particle.position.x - particle.oldPosition.x
        const velY = particle.position.y - particle.oldPosition.y
        const velZ = particle.position.z - particle.oldPosition.z
        totalVelocity += Math.sqrt(velX * velX + velY * velY + velZ * velZ)
      })

      avgY /= particles.length
      const avgVelocity = totalVelocity / particles.length

      console.log(`🧪 Drop Test Progress - ${clothId}:`)
      console.log(`   • Y range: ${minY.toFixed(3)}m to ${maxY.toFixed(3)}m`)
      console.log(`   • Average Y: ${avgY.toFixed(3)}m`)
      console.log(`   • Average velocity: ${avgVelocity.toFixed(6)}m/frame`)
      console.log(`   • Height span: ${(maxY - minY).toFixed(3)}m`)
    })
  }

  stopDropTest() {
    if (!this.isRunning) {
      return
    }

    console.log("🧪 === DROP TEST COMPLETE ===")

    this.isRunning = false

    if (this.testTimer) {
      clearTimeout(this.testTimer)
      this.testTimer = null
    }

    // Restore original settings
    this.restoreOriginalSettings()

    console.log("✅ Drop test finished - settings restored")
  }

  restoreOriginalSettings() {
    const physicsEngine = this.clothSimulation.physicsEngine

    // Restore physics settings
    physicsEngine.setGravity(
      this.originalSettings.gravity.x,
      this.originalSettings.gravity.y,
      this.originalSettings.gravity.z,
    )

    physicsEngine.damping = this.originalSettings.damping
    physicsEngine.constraintIterations = this.originalSettings.constraintIterations

    // Restore cloth constraints
    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      if (this.originalSettings[clothId]) {
        clothData.constraints.forEach((constraint, index) => {
          const original = this.originalSettings[clothId].constraints[index]
          if (original) {
            constraint.stiffness = original.stiffness
          }
        })
      }
    })

    console.log("⚙️ Original physics settings restored")
  }
}

// Export for use in main application
window.PhysicsDropTest = PhysicsDropTest
