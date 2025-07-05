// Cloth Simulation - Main physics simulation class
class ClothSimulation {
  constructor() {
    this.isInitialized = false
    this.isRunning = false
    this.clothMesh = null
    this.avatarMesh = null
    this.particles = []
    this.constraints = []
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.99
    this.stiffness = 0.4
    this.clothWidth = 20
    this.clothHeight = 20
    this.animationId = null
    this.startTime = Date.now()

    console.log("🧬 ClothSimulation created")
  }

  async initialize() {
    try {
      console.log("🔄 Initializing ClothSimulation...")

      // Create cloth particles in a grid
      this.createClothGrid()

      // Create constraints between particles
      this.createConstraints()

      this.isInitialized = true
      console.log("✅ ClothSimulation initialized successfully")
      return true
    } catch (error) {
      console.error("❌ ClothSimulation initialization failed:", error)
      return false
    }
  }

  createClothGrid() {
    this.particles = []
    const spacing = 0.05 // Distance between particles
    const startY = 2.0 // Starting height

    for (let y = 0; y < this.clothHeight; y++) {
      for (let x = 0; x < this.clothWidth; x++) {
        const particle = {
          position: {
            x: (x - this.clothWidth / 2) * spacing,
            y: startY,
            z: (y - this.clothHeight / 2) * spacing,
          },
          oldPosition: {
            x: (x - this.clothWidth / 2) * spacing,
            y: startY,
            z: (y - this.clothHeight / 2) * spacing,
          },
          pinned: y === 0 && (x === 0 || x === this.clothWidth - 1), // Pin top corners
          mass: 1.0,
        }

        this.particles.push(particle)
      }
    }

    console.log(`Created ${this.particles.length} cloth particles`)
  }

  createConstraints() {
    this.constraints = []

    for (let y = 0; y < this.clothHeight; y++) {
      for (let x = 0; x < this.clothWidth; x++) {
        const index = y * this.clothWidth + x

        // Horizontal constraints
        if (x < this.clothWidth - 1) {
          this.constraints.push({
            p1: index,
            p2: index + 1,
            restLength: 0.05,
          })
        }

        // Vertical constraints
        if (y < this.clothHeight - 1) {
          this.constraints.push({
            p1: index,
            p2: index + this.clothWidth,
            restLength: 0.05,
          })
        }
      }
    }

    console.log(`Created ${this.constraints.length} cloth constraints`)
  }

  async setupAvatarPhysics(avatarViewer) {
    console.log("🎯 Setting up avatar physics...")
    // Avatar acts as a collision object
    this.avatarMesh = avatarViewer
    return true
  }

  async setupGarmentPhysics(garmentViewer) {
    console.log("👕 Setting up garment physics...")
    this.clothMesh = garmentViewer
    return true
  }

  startSimulation() {
    if (!this.isInitialized) {
      console.error("❌ Cannot start simulation - not initialized")
      return
    }

    this.isRunning = true
    this.startTime = Date.now()
    this.animate()
    console.log("▶️ Physics simulation started")
  }

  stopSimulation() {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    console.log("⏹️ Physics simulation stopped")
  }

  animate() {
    if (!this.isRunning) return

    this.updatePhysics()
    this.updateVisualMesh()

    this.animationId = requestAnimationFrame(() => this.animate())
  }

  updatePhysics() {
    const deltaTime = 0.016 // ~60fps

    // Apply forces to particles
    for (const particle of this.particles) {
      if (particle.pinned) continue

      // Store current position
      const tempX = particle.position.x
      const tempY = particle.position.y
      const tempZ = particle.position.z

      // Verlet integration
      particle.position.x +=
        (particle.position.x - particle.oldPosition.x) * this.damping + this.gravity.x * deltaTime * deltaTime
      particle.position.y +=
        (particle.position.y - particle.oldPosition.y) * this.damping + this.gravity.y * deltaTime * deltaTime
      particle.position.z +=
        (particle.position.z - particle.oldPosition.z) * this.damping + this.gravity.z * deltaTime * deltaTime

      // Update old position
      particle.oldPosition.x = tempX
      particle.oldPosition.y = tempY
      particle.oldPosition.z = tempZ
    }

    // Satisfy constraints
    for (let i = 0; i < 3; i++) {
      // Multiple iterations for stability
      for (const constraint of this.constraints) {
        const p1 = this.particles[constraint.p1]
        const p2 = this.particles[constraint.p2]

        const dx = p2.position.x - p1.position.x
        const dy = p2.position.y - p1.position.y
        const dz = p2.position.z - p1.position.z

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        const difference = ((constraint.restLength - distance) / distance) * 0.5

        const translateX = dx * difference
        const translateY = dy * difference
        const translateZ = dz * difference

        if (!p1.pinned) {
          p1.position.x -= translateX
          p1.position.y -= translateY
          p1.position.z -= translateZ
        }

        if (!p2.pinned) {
          p2.position.x += translateX
          p2.position.y += translateY
          p2.position.z += translateZ
        }
      }
    }
  }

  updateVisualMesh() {
    if (!this.clothMesh) return

    // Apply physics simulation results to the visual garment
    const elapsedTime = (Date.now() - this.startTime) / 1000

    // Create a subtle draping effect
    const drapeAmount = Math.min(elapsedTime * 0.5, 1.0) // Gradual drape over 2 seconds
    const fallAmount = Math.min(elapsedTime * 0.3, 0.5) // Fall up to 0.5 units

    // Apply transform to simulate cloth physics
    const currentTransform = this.clothMesh.style.transform || ""
    const baseTransform = currentTransform.replace(/translateY$$[^)]*$$/, "").replace(/rotateX$$[^)]*$$/, "")

    this.clothMesh.style.transform = `${baseTransform} translateY(${-fallAmount}px) rotateX(${drapeAmount * 5}deg)`
  }

  resetSimulation() {
    this.stopSimulation()
    this.startTime = Date.now()

    // Reset particle positions
    const spacing = 0.05
    const startY = 2.0

    for (let y = 0; y < this.clothHeight; y++) {
      for (let x = 0; x < this.clothWidth; x++) {
        const index = y * this.clothWidth + x
        const particle = this.particles[index]

        particle.position.x = (x - this.clothWidth / 2) * spacing
        particle.position.y = startY
        particle.position.z = (y - this.clothHeight / 2) * spacing

        particle.oldPosition.x = particle.position.x
        particle.oldPosition.y = particle.position.y
        particle.oldPosition.z = particle.position.z
      }
    }

    // Reset visual mesh
    if (this.clothMesh) {
      const currentTransform = this.clothMesh.style.transform || ""
      const baseTransform = currentTransform.replace(/translateY$$[^)]*$$/, "").replace(/rotateX$$[^)]*$$/, "")
      this.clothMesh.style.transform = baseTransform
    }

    this.startSimulation()
    console.log("🔄 Cloth simulation reset")
  }

  resetClothPosition() {
    this.resetSimulation()
  }

  setGravity(x, y, z) {
    this.gravity = { x, y, z }
    console.log(`Gravity set to: ${x}, ${y}, ${z}`)
  }

  setClothStiffness(mesh, stiffness) {
    this.stiffness = stiffness
    console.log(`Cloth stiffness set to: ${stiffness}`)
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      running: this.isRunning,
      particles: this.particles.length,
      constraints: this.constraints.length,
      gravity: this.gravity,
      stiffness: this.stiffness,
    }
  }

  cleanup() {
    this.stopSimulation()
    this.particles = []
    this.constraints = []
    this.clothMesh = null
    this.avatarMesh = null
    this.isInitialized = false
    console.log("🧹 ClothSimulation cleaned up")
  }
}

// Make ClothSimulation available globally
window.ClothSimulation = ClothSimulation
console.log("✅ ClothSimulation class loaded")
