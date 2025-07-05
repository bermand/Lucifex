// Physics Test System
// Verifies that the physics engine is working correctly

class PhysicsTest {
  constructor() {
    this.testResults = []
  }

  async startBasicTest() {
    console.log("🧪 Starting basic physics engine test...")
    this.testResults = []

    try {
      // Test 1: Engine availability
      await this.testEngineAvailability()

      // Test 2: Particle creation
      await this.testParticleCreation()

      // Test 3: Gravity effects
      await this.testGravityEffects()

      // Test 4: Collision detection
      await this.testCollisionDetection()

      // Report results
      this.reportTestResults()

      return this.testResults.every((result) => result.passed)
    } catch (error) {
      console.error("❌ Basic physics test failed:", error)
      return false
    }
  }

  async testEngineAvailability() {
    console.log("🔍 Test 1: Engine Availability")

    const passed = !!(window.SimpleClothPhysics && window.ClothSimulation)

    this.testResults.push({
      name: "Engine Availability",
      passed,
      details: passed ? "✅ Physics engines loaded" : "❌ Physics engines missing",
    })

    console.log(passed ? "✅ PASS: Physics engines available" : "❌ FAIL: Physics engines missing")
  }

  async testParticleCreation() {
    console.log("🔍 Test 2: Particle Creation")

    try {
      const engine = new window.SimpleClothPhysics()
      await engine.initPhysicsWorld()

      const cloth = engine.createClothFromGeometry([], [], { x: 0, y: 2, z: 0 })
      const passed = !!(cloth && cloth.particles && cloth.particles.length > 0)

      this.testResults.push({
        name: "Particle Creation",
        passed,
        details: passed ? `✅ Created ${cloth.particles.length} particles` : "❌ Failed to create particles",
      })

      console.log(passed ? `✅ PASS: Created ${cloth.particles.length} particles` : "❌ FAIL: Particle creation failed")

      engine.cleanup()
    } catch (error) {
      this.testResults.push({
        name: "Particle Creation",
        passed: false,
        details: `❌ Error: ${error.message}`,
      })
      console.log("❌ FAIL: Particle creation error:", error.message)
    }
  }

  async testGravityEffects() {
    console.log("🔍 Test 3: Gravity Effects")

    try {
      const engine = new window.SimpleClothPhysics()
      await engine.initPhysicsWorld()

      const cloth = engine.createClothFromGeometry([], [], { x: 0, y: 2, z: 0 })

      if (!cloth || !cloth.particles) {
        throw new Error("No cloth particles for gravity test")
      }

      // Record initial positions
      const initialY = cloth.particles[0].position.y

      // Run physics for a short time
      for (let i = 0; i < 60; i++) {
        // 1 second at 60fps
        engine.updatePhysics(1 / 60)
      }

      // Check if particles moved down due to gravity
      const finalY = cloth.particles[0].position.y
      const moved = finalY < initialY - 0.1 // Should have fallen at least 0.1 units

      this.testResults.push({
        name: "Gravity Effects",
        passed: moved,
        details: moved
          ? `✅ Particles fell ${(initialY - finalY).toFixed(3)}m`
          : `❌ No significant movement: ${(initialY - finalY).toFixed(3)}m`,
      })

      console.log(
        moved
          ? `✅ PASS: Gravity working, particles fell ${(initialY - finalY).toFixed(3)}m`
          : `❌ FAIL: Insufficient gravity effect`,
      )

      engine.cleanup()
    } catch (error) {
      this.testResults.push({
        name: "Gravity Effects",
        passed: false,
        details: `❌ Error: ${error.message}`,
      })
      console.log("❌ FAIL: Gravity test error:", error.message)
    }
  }

  async testCollisionDetection() {
    console.log("🔍 Test 4: Collision Detection")

    try {
      const engine = new window.SimpleClothPhysics()
      await engine.initPhysicsWorld()

      // Create avatar collider
      const colliderId = engine.createAvatarCollider({ x: 0, y: 0, z: 0 })
      const passed = !!(colliderId && engine.avatarColliders.has(colliderId))

      this.testResults.push({
        name: "Collision Detection",
        passed,
        details: passed ? "✅ Avatar collider created" : "❌ Failed to create avatar collider",
      })

      console.log(passed ? "✅ PASS: Collision detection setup" : "❌ FAIL: Collision detection failed")

      engine.cleanup()
    } catch (error) {
      this.testResults.push({
        name: "Collision Detection",
        passed: false,
        details: `❌ Error: ${error.message}`,
      })
      console.log("❌ FAIL: Collision test error:", error.message)
    }
  }

  reportTestResults() {
    console.log("📊 === PHYSICS ENGINE TEST RESULTS ===")

    const passedTests = this.testResults.filter((result) => result.passed).length
    const totalTests = this.testResults.length

    console.log(`Overall: ${passedTests}/${totalTests} tests passed`)

    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}: ${result.details}`)
    })

    if (passedTests === totalTests) {
      console.log("🎉 ALL TESTS PASSED - Physics engine is working correctly!")
    } else {
      console.log("⚠️ Some tests failed - check physics engine setup")
    }

    console.log("=====================================")
  }

  getTestResults() {
    return this.testResults
  }
}

// Export for use in main application
window.PhysicsTest = PhysicsTest
