// Cloth Simulation - Main physics simulation class with realistic draping
class ClothSimulation {
  constructor() {
    this.isInitialized = false
    this.isRunning = false
    this.clothMesh = null
    this.avatarMesh = null
    this.particles = []
    this.constraints = []
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.98
    this.stiffness = 0.4
    this.clothWidth = 15
    this.clothHeight = 15
    this.animationId = null
    this.startTime = Date.now()
    this.physicsTime = 0

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
    const spacing = 0.08 // Distance between particles
    const startY = 1.8 // Starting height above avatar
    const startZ = 0.3 // Slightly in front

    for (let y = 0; y < this.clothHeight; y++) {
      for (let x = 0; x < this.clothWidth; x++) {
        const particle = {
          position: {
            x: (x - this.clothWidth / 2) * spacing,
            y: startY - y * spacing * 0.1, // Slight curve
            z: startZ + y * spacing * 0.05,
          },
          oldPosition: {
            x: (x - this.clothWidth / 2) * spacing,
            y: startY - y * spacing * 0.1,
            z: startZ + y * spacing * 0.05,
          },
          pinned: y === 0 && (x === 2 || x === this.clothWidth - 3), // Pin shoulder points
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
            restLength: 0.08,
          })
        }

        // Vertical constraints
        if (y < this.clothHeight - 1) {
          this.constraints.push({
            p1: index,
            p2: index + this.clothWidth,
            restLength: 0.08,
          })
        }

        // Diagonal constraints for stability
        if (x < this.clothWidth - 1 && y < this.clothHeight - 1) {
          this.constraints.push({
            p1: index,
            p2: index + this.clothWidth + 1,
            restLength: 0.08 * Math.sqrt(2),
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
    this.physicsTime = 0
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
    this.physicsTime += deltaTime

    // Apply forces to particles
    for (const particle of this.particles) {
      if (particle.pinned) continue

      // Store current position
      const tempX = particle.position.x
      const tempY = particle.position.y
      const tempZ = particle.position.z

      // Add some wind effect for natural movement
      const windX = Math.sin(this.physicsTime * 2 + particle.position.y) * 0.01
      const windZ = Math.cos(this.physicsTime * 1.5 + particle.position.x) * 0.005

      // Verlet integration with wind
      particle.position.x +=
        (particle.position.x - particle.oldPosition.x) * this.damping + (this.gravity.x + windX) * deltaTime * deltaTime
      particle.position.y +=
        (particle.position.y - particle.oldPosition.y) * this.damping + this.gravity.y * deltaTime * deltaTime
      particle.position.z +=
        (particle.position.z - particle.oldPosition.z) * this.damping + (this.gravity.z + windZ) * deltaTime * deltaTime

      // Simple collision with avatar (sphere approximation)
      const avatarY = 0.9 // Avatar center height
      const avatarRadius = 0.3
      const distFromAvatar = Math.sqrt(
        particle.position.x * particle.position.x +
          (particle.position.y - avatarY) * (particle.position.y - avatarY) +
          particle.position.z * particle.position.z,
      )

      if (distFromAvatar < avatarRadius && particle.position.y > 0.2) {
        // Push particle away from avatar
        const pushFactor = (avatarRadius - distFromAvatar) / avatarRadius
        particle.position.x += particle.position.x * pushFactor * 0.1
        particle.position.z += particle.position.z * pushFactor * 0.1
        particle.position.y = Math.max(particle.position.y, avatarY - avatarRadius + 0.05)
      }

      // Update old position
      particle.oldPosition.x = tempX
      particle.oldPosition.y = tempY
      particle.oldPosition.z = tempZ
    }

    // Satisfy constraints multiple times for stability
    for (let i = 0; i < 2; i++) {
      for (const constraint of this.constraints) {
        const p1 = this.particles[constraint.p1]
        const p2 = this.particles[constraint.p2]

        const dx = p2.position.x - p1.position.x
        const dy = p2.position.y - p1.position.y
        const dz = p2.position.z - p1.position.z

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (distance === 0) continue

        const difference = ((constraint.restLength - distance) / distance) * this.stiffness * 0.5

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

    // Calculate cloth center of mass for realistic draping effect
    let centerY = 0
    let validParticles = 0

    for (const particle of this.particles) {
      if (!particle.pinned) {
        centerY += particle.position.y
        validParticles++
      }
    }

    if (validParticles > 0) {
      centerY /= validParticles
    }

    // Create realistic draping transform
    const elapsedTime = (Date.now() - this.startTime) / 1000
    const maxDrapeTime = 4.0 // Drape over 4 seconds

    // Gradual falling effect
    const fallProgress = Math.min(elapsedTime / maxDrapeTime, 1.0)
    const fallAmount = fallProgress * 0.15 // Fall 15cm max

    // Subtle swaying motion
    const swayX = Math.sin(this.physicsTime * 0.8) * 0.02 * fallProgress
    const swayZ = Math.cos(this.physicsTime * 0.6) * 0.015 * fallProgress

    // Draping rotation (garment conforms to body)
    const drapeRotationX = fallProgress * 8 // Max 8 degrees forward tilt
    const drapeRotationZ = swayX * 100 // Convert sway to rotation

    // Get current transform and preserve user scaling/positioning
    const currentTransform = this.clothMesh.style.transform || ""
    const scaleMatch = currentTransform.match(/scale$$[^)]*$$/)
    const translateMatch = currentTransform.match(/translate$$[^)]*$$/)

    let baseTransform = ""
    if (scaleMatch) baseTransform += scaleMatch[0] + " "
    if (translateMatch) baseTransform += translateMatch[0] + " "

    // Apply physics-based transform
    this.clothMesh.style.transform = `${baseTransform}translateY(${-fallAmount * 100}px) translateX(${swayX * 100}px) translateZ(${swayZ * 100}px) rotateX(${drapeRotationX}deg) rotateZ(${drapeRotationZ}deg)`
  }

  resetSimulation() {
    this.stopSimulation()
    this.startTime = Date.now()
    this.physicsTime = 0

    // Reset particle positions
    const spacing = 0.08
    const startY = 1.8
    const startZ = 0.3

    for (let y = 0; y < this.clothHeight; y++) {
      for (let x = 0; x < this.clothWidth; x++) {
        const index = y * this.clothWidth + x
        const particle = this.particles[index]

        particle.position.x = (x - this.clothWidth / 2) * spacing
        particle.position.y = startY - y * spacing * 0.1
        particle.position.z = startZ + y * spacing * 0.05

        particle.oldPosition.x = particle.position.x
        particle.oldPosition.y = particle.position.y
        particle.oldPosition.z = particle.position.z
      }
    }

    // Reset visual mesh
    if (this.clothMesh) {
      const currentTransform = this.clothMesh.style.transform || ""
      const scaleMatch = currentTransform.match(/scale$$[^)]*$$/)
      const translateMatch = currentTransform.match(/translate$$[^)]*$$/)

      let baseTransform = ""
      if (scaleMatch) baseTransform += scaleMatch[0] + " "
      if (translateMatch) baseTransform += translateMatch[0] + " "

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
      physicsTime: this.physicsTime,
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
