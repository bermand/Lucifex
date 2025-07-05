// Physics Drop Test System
// Provides dramatic cloth dropping demonstrations

class PhysicsDropTest {
  constructor(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.isRunning = false
    this.originalSettings = {}
    this.testDuration = 10000 // 10 seconds
    this.testTimer = null
    this.testInterval = null
    this.originalGravity = { x: 0, y: -9.81, z: 0 }
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

      // Increase gravity for dramatic effect
      this.clothSimulation.setGravity(0, -20, 0)

      // Add wind effects
      this.startWindEffects()

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
        particle.position.y = 4.0 - normalizedY * 1.5 // Much higher start
        particle.position.z = (Math.random() - 0.5) * 0.3 // More Z variation

        // Set initial velocity for dramatic effect
        particle.oldPosition.x = particle.position.x + (Math.random() - 0.5) * 0.2
        particle.oldPosition.y = particle.position.y + (Math.random() - 0.5) * 0.2
        particle.oldPosition.z = particle.position.z + (Math.random() - 0.5) * 0.2

        // Unpin more particles for dramatic effect
        if (particle.pinned && Math.random() > 0.3) {
          particle.pinned = false
        }
      })

      console.log(`🎬 Cloth ${clothId} reset to dramatic drop position (Y=4.0m)`)
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

  startWindEffects() {
    let windTime = 0

    this.testInterval = setInterval(() => {
      if (!this.isRunning) return

      windTime += 0.1

      // Create varying wind effects
      const windX = Math.sin(windTime * 2) * 3.0
      const windZ = Math.cos(windTime * 1.5) * 2.0

      // Apply wind to physics
      if (this.clothSimulation.physicsEngine) {
        this.clothSimulation.setGravity(windX, -20, windZ)
      }
    }, 100)
  }

  stopDropTest() {
    if (!this.isRunning) {
      console.log("⚠️ Drop test not running")
      return
    }

    console.log("🛑 Stopping drop test...")
    this.isRunning = false

    // Clear wind effects
    if (this.testInterval) {
      clearInterval(this.testInterval)
      this.testInterval = null
    }

    // Restore original gravity
    if (this.clothSimulation) {
      this.clothSimulation.setGravity(this.originalGravity.x, this.originalGravity.y, this.originalGravity.z)
    }

    console.log("✅ Drop test stopped, gravity restored")
  }

  cleanup() {
    this.stopDropTest()
    this.clothSimulation = null
    console.log("✅ Drop test cleanup complete")
  }
}

// Export for use in main application
window.PhysicsDropTest = PhysicsDropTest
