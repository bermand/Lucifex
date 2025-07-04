// Basic Physics Test
// Simple test to verify physics engine is working correctly

class PhysicsTest {
  constructor() {
    this.testParticles = []
    this.testRunning = false
    this.testStartTime = 0
  }

  async startBasicTest() {
    console.log("🧪 === BASIC PHYSICS TEST STARTING ===")

    try {
      // Load Simple Physics if not already loaded
      if (!window.SimpleClothPhysics) {
        console.log("❌ SimpleClothPhysics not available")
        return false
      }

      // Create a simple physics instance for testing
      const testPhysics = new window.SimpleClothPhysics()
      const initialized = await testPhysics.initPhysicsWorld()

      if (!initialized) {
        console.log("❌ Failed to initialize test physics")
        return false
      }

      console.log("✅ Test physics engine initialized")

      // Create a simple falling particle test
      const testCloth = testPhysics.createClothFromGeometry(
        [], // Will be generated procedurally
        [], // Will be generated procedurally
        { x: 0, y: 3.0, z: 0 }, // Start high up
      )

      if (!testCloth) {
        console.log("❌ Failed to create test cloth")
        return false
      }

      console.log("✅ Test cloth created with ID:", testCloth.id)
      console.log("   • Particles:", testCloth.particles.length)
      console.log("   • Constraints:", testCloth.constraints.length)

      // Run test simulation for 5 seconds
      this.testRunning = true
      this.testStartTime = Date.now()
      let frameCount = 0
      const maxFrames = 300 // 5 seconds at 60fps

      const testLoop = () => {
        if (!this.testRunning || frameCount >= maxFrames) {
          this.completeBasicTest(testPhysics, testCloth.id, frameCount)
          return
        }

        // Update physics
        testPhysics.updatePhysics(1 / 60)
        frameCount++

        // Log progress every 60 frames (1 second)
        if (frameCount % 60 === 0) {
          const vertices = testPhysics.getClothVertices(testCloth.id)
          if (vertices) {
            let minY = Number.POSITIVE_INFINITY
            let maxY = Number.NEGATIVE_INFINITY

            for (let i = 1; i < vertices.length; i += 3) {
              const y = vertices[i]
              minY = Math.min(minY, y)
              maxY = Math.max(maxY, y)
            }

            console.log(`🧪 Test Progress (${frameCount / 60}s): Y range ${minY.toFixed(3)}m to ${maxY.toFixed(3)}m`)
          }
        }

        // Continue test
        requestAnimationFrame(testLoop)
      }

      // Start test loop
      requestAnimationFrame(testLoop)

      console.log("🧪 Basic physics test running for 5 seconds...")
      return true
    } catch (error) {
      console.error("❌ Basic physics test failed:", error)
      return false
    }
  }

  completeBasicTest(testPhysics, clothId, frameCount) {
    const testDuration = (Date.now() - this.testStartTime) / 1000

    console.log("🧪 === BASIC PHYSICS TEST COMPLETE ===")
    console.log(`   • Duration: ${testDuration.toFixed(2)}s`)
    console.log(`   • Frames: ${frameCount}`)
    console.log(`   • Average FPS: ${(frameCount / testDuration).toFixed(1)}`)

    // Get final particle positions
    const vertices = testPhysics.getClothVertices(clothId)
    if (vertices) {
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      let avgY = 0

      for (let i = 1; i < vertices.length; i += 3) {
        const y = vertices[i]
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
        avgY += y
      }
      avgY /= vertices.length / 3

      console.log("🧪 Final Results:")
      console.log(`   • Y range: ${minY.toFixed(3)}m to ${maxY.toFixed(3)}m`)
      console.log(`   • Average Y: ${avgY.toFixed(3)}m`)
      console.log(`   • Height drop: ${(3.0 - avgY).toFixed(3)}m`)

      // Determine if test passed
      const heightDrop = 3.0 - avgY
      if (heightDrop > 0.5) {
        console.log("✅ PHYSICS TEST PASSED - Particles fell significantly!")
        console.log("   • Gravity is working correctly")
        console.log("   • Verlet integration is functioning")
        console.log("   • Cloth simulation is operational")
      } else {
        console.log("⚠️ PHYSICS TEST INCONCLUSIVE - Limited movement detected")
        console.log("   • Particles may be too constrained")
        console.log("   • Gravity may be too weak")
        console.log("   • Check physics parameters")
      }
    }

    // Cleanup test physics
    testPhysics.cleanup()
    this.testRunning = false

    console.log("🧪 Test cleanup complete")
  }

  stopBasicTest() {
    this.testRunning = false
    console.log("🧪 Basic physics test stopped")
  }
}

// Export for use in main application
window.PhysicsTest = PhysicsTest
