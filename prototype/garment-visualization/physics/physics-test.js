// Physics Test
// Basic physics engine testing and validation

class PhysicsTest {
  constructor() {
    this.testResults = []
    this.isRunning = false

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

    this.isRunning = true
    this.testResults = []

    console.log("🧪 Running basic physics tests...")

    // Test 1: Gravity simulation
    this.testGravity()

    // Test 2: Constraint solving
    this.testConstraints()

    // Test 3: Collision detection
    this.testCollision()

    // Test 4: Performance
    this.testPerformance()

    this.isRunning = false
    this.reportResults()
  }

  testGravity() {
    console.log("🧪 Testing gravity simulation...")

    // Simulate a falling particle
    const particle = { y: 10, vy: 0 }
    const gravity = -9.81
    const dt = 1 / 60

    for (let i = 0; i < 60; i++) {
      // 1 second simulation
      particle.vy += gravity * dt
      particle.y += particle.vy * dt
    }

    const expectedY = 10 + 0.5 * gravity * 1 * 1 // s = ut + 0.5at²
    const error = Math.abs(particle.y - expectedY)

    this.testResults.push({
      test: "Gravity Simulation",
      passed: error < 0.1,
      details: `Final Y: ${particle.y.toFixed(2)}, Expected: ${expectedY.toFixed(2)}, Error: ${error.toFixed(4)}`,
    })
  }

  testConstraints() {
    console.log("🧪 Testing constraint solving...")

    // Test distance constraint
    const p1 = { x: 0, y: 0 }
    const p2 = { x: 2, y: 0 } // Should be distance 1 apart
    const targetDistance = 1

    // Simulate constraint solving
    for (let i = 0; i < 10; i++) {
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const difference = ((targetDistance - distance) / distance) * 0.5

      p1.x -= dx * difference
      p1.y -= dy * difference
      p2.x += dx * difference
      p2.y += dy * difference
    }

    const finalDistance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
    const error = Math.abs(finalDistance - targetDistance)

    this.testResults.push({
      test: "Constraint Solving",
      passed: error < 0.01,
      details: `Final distance: ${finalDistance.toFixed(4)}, Target: ${targetDistance}, Error: ${error.toFixed(4)}`,
    })
  }

  testCollision() {
    console.log("🧪 Testing collision detection...")

    // Test sphere collision
    const particle = { x: 0, y: 0, z: 0 }
    const sphere = { x: 0, y: 0, z: 0, radius: 1 }

    const distance = Math.sqrt(
      (particle.x - sphere.x) ** 2 + (particle.y - sphere.y) ** 2 + (particle.z - sphere.z) ** 2,
    )

    const collision = distance < sphere.radius

    this.testResults.push({
      test: "Collision Detection",
      passed: collision,
      details: `Distance: ${distance.toFixed(2)}, Radius: ${sphere.radius}, Collision: ${collision}`,
    })
  }

  testPerformance() {
    console.log("🧪 Testing performance...")

    const startTime = performance.now()

    // Simulate 1000 particle updates
    for (let i = 0; i < 1000; i++) {
      const particle = { x: Math.random(), y: Math.random(), z: Math.random() }
      particle.x += Math.random() * 0.01
      particle.y += Math.random() * 0.01
      particle.z += Math.random() * 0.01
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    this.testResults.push({
      test: "Performance",
      passed: duration < 10, // Should complete in under 10ms
      details: `1000 particle updates took ${duration.toFixed(2)}ms`,
    })
  }

  reportResults() {
    console.log("📊 Physics Test Results:")
    console.log("========================")

    let passedTests = 0

    for (const result of this.testResults) {
      const status = result.passed ? "✅ PASS" : "❌ FAIL"
      console.log(`${status} ${result.test}: ${result.details}`)

      if (result.passed) passedTests++
    }

    console.log("========================")
    console.log(`Tests passed: ${passedTests}/${this.testResults.length}`)

    if (passedTests === this.testResults.length) {
      console.log("🎉 All physics tests passed!")
    } else {
      console.log("⚠️ Some physics tests failed")
    }
  }

  cleanup() {
    this.isRunning = false
    this.testResults = []
    console.log("🧹 PhysicsTest cleaned up")
  }
}

// Export for global use
window.PhysicsTest = PhysicsTest
console.log("✅ PhysicsTest class loaded")
