// Physics Drop Test
// Demonstrates cloth falling and draping over avatar

class PhysicsDropTest {
  constructor(clothSimulation) {
    this.clothSimulation = clothSimulation
    this.testActive = false
    this.testStartTime = 0
  }

  async startDropTest() {
    if (!this.clothSimulation || !this.clothSimulation.isInitialized) {
      console.error("❌ Cloth simulation not available for drop test")
      return false
    }

    console.log("🧪 Starting Physics Drop Test...")
    this.testActive = true
    this.testStartTime = Date.now()

    // Reset physics to ensure clean test
    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      // Reset all particles to high position with downward velocity
      clothData.particles.forEach((particle, index) => {
        if (!particle.pinned) {
          // Start much higher
          particle.position.y += 0.5

          // Give strong downward initial velocity
          particle.oldPosition.y = particle.position.y + 0.2
          particle.oldPosition.x = particle.position.x + (Math.random() - 0.5) * 0.1
          particle.oldPosition.z = particle.position.z + (Math.random() - 0.5) * 0.1
        }
      })
    })

    // Increase gravity for dramatic effect
    this.clothSimulation.setGravity(0, -15, 0) // 1.5x Earth gravity

    // Add some wind disturbance
    setTimeout(() => {
      this.addWindBurst()
    }, 1000)

    // Log progress every second
    this.progressInterval = setInterval(() => {
      this.logDropProgress()
    }, 1000)

    // Auto-stop test after 30 seconds
    setTimeout(() => {
      this.stopDropTest()
    }, 30000)

    console.log("🧪 Drop test started - cloth should fall dramatically!")
    return true
  }

  addWindBurst() {
    if (!this.testActive) return

    console.log("💨 Adding wind burst for more dramatic movement...")

    // Temporarily modify physics engine to add wind burst
    const originalUpdatePhysics = this.clothSimulation.physicsEngine.updateClothPhysics
    const windBurstStrength = 2.0
    const windBurstDuration = 2000 // 2 seconds

    this.clothSimulation.physicsEngine.updateClothPhysics = function (clothData, deltaTime) {
      // Add wind burst to all particles
      clothData.particles.forEach((particle, index) => {
        if (!particle.pinned) {
          const windX = Math.sin(index * 0.1) * windBurstStrength
          const windZ = Math.cos(index * 0.1) * windBurstStrength

          particle.oldPosition.x -= windX * deltaTime
          particle.oldPosition.z -= windZ * deltaTime
        }
      })

      // Call original update
      return originalUpdatePhysics.call(this, clothData, deltaTime)
    }

    // Restore original function after wind burst
    setTimeout(() => {
      this.clothSimulation.physicsEngine.updateClothPhysics = originalUpdatePhysics
      console.log("💨 Wind burst ended")
    }, windBurstDuration)
  }

  logDropProgress() {
    if (!this.testActive) return

    const elapsed = (Date.now() - this.testStartTime) / 1000
    console.log(`🧪 Drop Test Progress (${elapsed.toFixed(1)}s):`)

    this.clothSimulation.physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      let avgY = 0
      let totalVelocity = 0

      clothData.particles.forEach((particle) => {
        minY = Math.min(minY, particle.position.y)
        maxY = Math.max(maxY, particle.position.y)
        avgY += particle.position.y

        // Calculate velocity
        const velY = particle.position.y - particle.oldPosition.y
        totalVelocity += Math.abs(velY)
      })

      avgY /= clothData.particles.length
      const avgVelocity = totalVelocity / clothData.particles.length

      console.log(`   • Cloth height: ${minY.toFixed(3)}m to ${maxY.toFixed(3)}m`)
      console.log(`   • Average Y: ${avgY.toFixed(3)}m`)
      console.log(`   • Average velocity: ${avgVelocity.toFixed(6)}m/frame`)
      console.log(`   • Height range: ${(maxY - minY).toFixed(3)}m`)

      // Check if cloth has reached avatar level
      if (minY < 0.2) {
        console.log("🎯 Cloth has reached avatar level!")
      }

      // Check if cloth is moving
      if (avgVelocity > 0.001) {
        console.log("✅ Cloth is moving - physics working!")
      } else {
        console.log("⚠️ Cloth movement very slow - may need adjustment")
      }
    })
  }

  stopDropTest() {
    if (!this.testActive) return

    console.log("🧪 Drop test completed")
    this.testActive = false

    if (this.progressInterval) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }

    // Reset gravity to normal
    this.clothSimulation.setGravity(0, -9.81, 0)

    // Final status
    console.log("📊 Final Drop Test Results:")
    this.logDropProgress()
  }

  isTestActive() {
    return this.testActive
  }
}

// Export for use in main application
window.PhysicsDropTest = PhysicsDropTest
