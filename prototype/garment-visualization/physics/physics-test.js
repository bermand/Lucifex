// Physics Test System
// Provides basic physics testing functionality

class PhysicsTest {
  constructor() {
    this.isRunning = false
    this.testResults = []

    console.log("🧪 PhysicsTest created")
  }

  initialize() {
    console.log("✅ PhysicsTest initialized")
    return true
  }

  runBasicTest() {
    if (this.isRunning) {
      console.log("⚠️ Test already running")
      return
    }

    console.log("🧪 Starting basic physics test...")
    this.isRunning = true
    this.testResults = []

    // Test 1: Gravity simulation
    this.testGravity()

    // Test 2: Constraint solving
    this.testConstraints()

    // Test 3: Collision detection
    this.testCollisions()

    // Complete test
    setTimeout(() => {
      this.completeTest()
    }, 3000)
  }

  testGravity() {
    console.log("🧪 Testing gravity simulation...")

    // Simulate a falling particle
    const particle = {
      position: { x: 0, y: 2, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      mass: 1.0,
    }

    const gravity = -9.81
    const deltaTime = 0.016

    // Simulate 10 frames
    for (let i = 0; i < 10; i++) {
      particle.velocity.y += gravity * deltaTime
      particle.position.y += particle.velocity.y * deltaTime
    }

    const expectedY = 2 + 0.5 * gravity * Math.pow(10 * deltaTime, 2)
    const actualY = particle.position.y
    const error = Math.abs(expectedY - actualY)

    this.testResults.push({
      test: "Gravity",
      expected: expectedY,
      actual: actualY,
      error: error,
      passed: error < 0.1,
    })

    console.log(
      `🧪 Gravity test: Expected Y=${expectedY.toFixed(3)}, Actual Y=${actualY.toFixed(3)}, Error=${error.toFixed(3)}`,
    )
  }

  testConstraints() {
    console.log("🧪 Testing constraint solving...")

    // Create two particles connected by a constraint
    const p1 = { position: { x: 0, y: 0, z: 0 } }
    const p2 = { position: { x: 2, y: 0, z: 0 } }
    const restLength = 1.0

    // Apply constraint solving
    const dx = p2.position.x - p1.position.x
    const dy = p2.position.y - p1.position.y
    const dz = p2.position.z - p1.position.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (distance > 0) {
      const difference = (restLength - distance) / distance
      const translate = {
        x: dx * difference * 0.5,
        y: dy * difference * 0.5,
        z: dz * difference * 0.5,
      }

      p1.position.x -= translate.x
      p1.position.y -= translate.y
      p1.position.z -= translate.z

      p2.position.x += translate.x
      p2.position.y += translate.y
      p2.position.z += translate.z
    }

    const finalDistance = Math.sqrt(
      Math.pow(p2.position.x - p1.position.x, 2) +
        Math.pow(p2.position.y - p1.position.y, 2) +
        Math.pow(p2.position.z - p1.position.z, 2),
    )

    const error = Math.abs(restLength - finalDistance)

    this.testResults.push({
      test: "Constraints",
      expected: restLength,
      actual: finalDistance,
      error: error,
      passed: error < 0.01,
    })

    console.log(
      `🧪 Constraint test: Expected distance=${restLength}, Actual distance=${finalDistance.toFixed(3)}, Error=${error.toFixed(3)}`,
    )
  }

  testCollisions() {
    console.log("🧪 Testing collision detection...")

    // Test sphere collision
    const particle = { position: { x: 0, y: 0, z: 0 } }
    const sphere = {
      position: { x: 0.5, y: 0, z: 0 },
      radius: 0.8,
    }

    const dx = particle.position.x - sphere.position.x
    const dy = particle.position.y - sphere.position.y
    const dz = particle.position.z - sphere.position.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    const isColliding = distance < sphere.radius
    const expectedCollision = true // Should be colliding

    this.testResults.push({
      test: "Collision Detection",
      expected: expectedCollision,
      actual: isColliding,
      error: expectedCollision === isColliding ? 0 : 1,
      passed: expectedCollision === isColliding,
    })

    console.log(
      `🧪 Collision test: Expected collision=${expectedCollision}, Actual collision=${isColliding}, Distance=${distance.toFixed(3)}`,
    )
  }

  completeTest() {
    this.isRunning = false

    console.log("🧪 === PHYSICS TEST RESULTS ===")

    let passedTests = 0
    const totalTests = this.testResults.length

    this.testResults.forEach((result, index) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL"
      console.log(`🧪 Test ${index + 1}: ${result.test} - ${status}`)
      console.log(`   Expected: ${result.expected}`)
      console.log(`   Actual: ${result.actual}`)
      console.log(`   Error: ${result.error}`)

      if (result.passed) passedTests++
    })

    const successRate = (passedTests / totalTests) * 100
    console.log(`🧪 === TEST SUMMARY ===`)
    console.log(`🧪 Passed: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`)

    if (successRate === 100) {
      console.log("🧪 ✅ All physics tests passed!")
    } else if (successRate >= 80) {
      console.log("🧪 ⚠️ Most physics tests passed")
    } else {
      console.log("🧪 ❌ Physics tests failed")
    }
  }

  cleanup() {
    this.isRunning = false
    this.testResults = []
    console.log("🧹 PhysicsTest cleaned up")
  }
}

// Export for use in main application
window.PhysicsTest = PhysicsTest
console.log("✅ PhysicsTest class loaded")
