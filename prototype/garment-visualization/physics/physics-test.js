// Physics Test - Minimal test to verify physics is working
// This creates a simple falling particle to test the physics engine

class PhysicsTest {
  constructor() {
    this.testParticles = []
    this.isRunning = false
    this.animationFrame = null
    this.startTime = 0
  }

  async startBasicTest() {
    console.log("🧪 Starting Basic Physics Test...")

    // Create simple falling particles
    this.testParticles = [
      {
        position: { x: 0, y: 2, z: 0 },
        oldPosition: { x: 0, y: 2.1, z: 0 }, // Initial upward velocity
        pinned: false,
      },
      {
        position: { x: 0.2, y: 2, z: 0 },
        oldPosition: { x: 0.2, y: 2.1, z: 0 },
        pinned: false,
      },
      {
        position: { x: -0.2, y: 2, z: 0 },
        oldPosition: { x: -0.2, y: 2.1, z: 0 },
        pinned: false,
      },
    ]

    this.isRunning = true
    this.startTime = Date.now()
    this.testLoop()

    console.log("🧪 Basic physics test started - 3 particles should fall")
  }

  testLoop() {
    if (!this.isRunning) return

    const deltaTime = 1 / 60 // 60 FPS
    const gravity = { x: 0, y: -9.81, z: 0 }
    const damping = 0.98

    // Update each test particle
    this.testParticles.forEach((particle, index) => {
      if (!particle.pinned) {
        // Verlet integration
        const newX =
          particle.position.x +
          (particle.position.x - particle.oldPosition.x) * damping +
          gravity.x * deltaTime * deltaTime

        const newY =
          particle.position.y +
          (particle.position.y - particle.oldPosition.y) * damping +
          gravity.y * deltaTime * deltaTime

        const newZ =
          particle.position.z +
          (particle.position.z - particle.oldPosition.z) * damping +
          gravity.z * deltaTime * deltaTime

        // Store old position
        particle.oldPosition.x = particle.position.x
        particle.oldPosition.y = particle.position.y
        particle.oldPosition.z = particle.position.z

        // Update position
        particle.position.x = newX
        particle.position.y = newY
        particle.position.z = newZ

        // Ground collision
        if (particle.position.y < 0) {
          particle.position.y = 0
          particle.oldPosition.y = particle.position.y + 0.01 // Small bounce
        }
      }
    })

    // Log status every second
    const elapsed = (Date.now() - this.startTime) / 1000
    if (Math.floor(elapsed) % 1 === 0 && elapsed % 1 < 0.1) {
      console.log(`🧪 Test particles at ${elapsed.toFixed(1)}s:`)
      this.testParticles.forEach((particle, index) => {
        const velocity = Math.sqrt(
          Math.pow(particle.position.x - particle.oldPosition.x, 2) +
            Math.pow(particle.position.y - particle.oldPosition.y, 2) +
            Math.pow(particle.position.z - particle.oldPosition.z, 2),
        )
        console.log(`   Particle ${index}: Y=${particle.position.y.toFixed(3)}m, vel=${velocity.toFixed(6)}m/frame`)
      })
    }

    // Stop after 10 seconds
    if (elapsed > 10) {
      this.stopTest()
      return
    }

    this.animationFrame = requestAnimationFrame(() => this.testLoop())
  }

  stopTest() {
    console.log("🧪 Basic physics test completed")
    this.isRunning = false

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    // Final positions
    console.log("🧪 Final test particle positions:")
    this.testParticles.forEach((particle, index) => {
      console.log(`   Particle ${index}: Y=${particle.position.y.toFixed(3)}m`)
    })
  }
}

// Export for use in main application
window.PhysicsTest = PhysicsTest
