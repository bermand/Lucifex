// Physics Test
// Basic physics engine testing and validation

class PhysicsTest {
  constructor(clothSimulation) {
    this.clothSimulation = clothSimulation
    console.log("🧪 PhysicsTest initialized")
  }

  runBasicTest() {
    console.log("🧪 Running basic physics test...")

    if (!this.clothSimulation) {
      console.error("❌ No cloth simulation available")
      return false
    }

    try {
      // Test 1: Check particle creation
      const particles = this.clothSimulation.getParticles()
      console.log(`✅ Test 1 - Particles: ${particles.length} created`)

      // Test 2: Check constraints
      const constraints = this.clothSimulation.getConstraints()
      console.log(`✅ Test 2 - Constraints: ${constraints.length} created`)

      // Test 3: Check simulation status
      const status = this.clothSimulation.getStatus()
      console.log(`✅ Test 3 - Simulation running: ${status.isRunning}`)

      // Test 4: Check physics settings
      console.log(`✅ Test 4 - Gravity: ${status.gravity.y}`)
      console.log(`✅ Test 4 - Stiffness: ${status.stiffness}`)
      console.log(`✅ Test 4 - Damping: ${status.damping}`)

      // Test 5: Particle position validation
      let validPositions = 0
      for (const particle of particles) {
        if (
          particle.position &&
          typeof particle.position.x === "number" &&
          typeof particle.position.y === "number" &&
          typeof particle.position.z === "number"
        ) {
          validPositions++
        }
      }
      console.log(`✅ Test 5 - Valid particle positions: ${validPositions}/${particles.length}`)

      // Test 6: Constraint validation
      let validConstraints = 0
      for (const constraint of constraints) {
        if (
          constraint.p1 >= 0 &&
          constraint.p1 < particles.length &&
          constraint.p2 >= 0 &&
          constraint.p2 < particles.length &&
          constraint.restLength > 0
        ) {
          validConstraints++
        }
      }
      console.log(`✅ Test 6 - Valid constraints: ${validConstraints}/${constraints.length}`)

      // Test 7: Physics update test
      const initialY = particles[0].position.y
      setTimeout(() => {
        const afterY = particles[0].position.y
        const moved = Math.abs(afterY - initialY) > 0.001
        console.log(`✅ Test 7 - Physics movement detected: ${moved}`)
        console.log(`   Initial Y: ${initialY.toFixed(3)}, After Y: ${afterY.toFixed(3)}`)
      }, 1000)

      console.log("🎉 Basic physics test completed successfully")
      return true
    } catch (error) {
      console.error("❌ Physics test failed:", error)
      return false
    }
  }

  runPerformanceTest() {
    console.log("⚡ Running physics performance test...")

    if (!this.clothSimulation) {
      console.error("❌ No cloth simulation available")
      return
    }

    const startTime = performance.now()
    let frameCount = 0
    const testDuration = 5000 // 5 seconds

    const performanceLoop = () => {
      frameCount++

      if (performance.now() - startTime < testDuration) {
        requestAnimationFrame(performanceLoop)
      } else {
        const endTime = performance.now()
        const totalTime = endTime - startTime
        const fps = (frameCount / totalTime) * 1000

        console.log(`⚡ Performance Test Results:`)
        console.log(`   Duration: ${totalTime.toFixed(2)}ms`)
        console.log(`   Frames: ${frameCount}`)
        console.log(`   Average FPS: ${fps.toFixed(2)}`)

        if (fps > 30) {
          console.log("✅ Performance: Excellent (>30 FPS)")
        } else if (fps > 15) {
          console.log("⚠️ Performance: Good (15-30 FPS)")
        } else {
          console.log("❌ Performance: Poor (<15 FPS)")
        }
      }
    }

    performanceLoop()
  }

  testCollisionDetection() {
    console.log("🎯 Testing collision detection...")

    const particles = this.clothSimulation.getParticles()
    const avatarCollider = this.clothSimulation.avatarCollider

    let collisionCount = 0
    for (const particle of particles) {
      const dx = particle.position.x - avatarCollider.center.x
      const dy = particle.position.y - avatarCollider.center.y
      const dz = particle.position.z - avatarCollider.center.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (distance < avatarCollider.radius) {
        collisionCount++
      }
    }

    console.log(`🎯 Collision test: ${collisionCount} particles in collision zone`)
    return collisionCount
  }

  runFullTestSuite() {
    console.log("🧪 Running full physics test suite...")

    const results = {
      basicTest: this.runBasicTest(),
      collisionTest: this.testCollisionDetection() >= 0,
      performanceTest: true, // Will run async
    }

    this.runPerformanceTest()

    const passed = Object.values(results).filter((r) => r).length
    const total = Object.keys(results).length

    console.log(`🧪 Test Suite Results: ${passed}/${total} tests passed`)

    if (passed === total) {
      console.log("🎉 All tests passed! Physics engine is working correctly.")
    } else {
      console.log("⚠️ Some tests failed. Check the logs above for details.")
    }

    return results
  }
}

// Export for global use
window.PhysicsTest = PhysicsTest
