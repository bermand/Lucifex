// Simple Cloth Physics Engine
// A lightweight Verlet integration-based cloth simulation
// Fallback when Ammo.js is not available

class SimpleClothPhysics {
  constructor() {
    this.isInitialized = false
    this.clothBodies = new Map()
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.99
    this.timeStep = 1 / 60
  }

  async initPhysicsWorld() {
    this.isInitialized = true
    console.log("✅ Simple cloth physics initialized")
    return true
  }

  createAvatarCollider(position = { x: 0, y: 0, z: 0 }, scale = { x: 0.4, y: 0.9, z: 0.2 }) {
    // Simple physics doesn't need complex colliders for now
    // This would be implemented for collision detection if needed
    console.log("✅ Simple avatar collider created (placeholder)")
    return { position, scale }
  }

  createClothFromGeometry(vertices, indices, position = { x: 0, y: 1, z: 0 }) {
    if (!this.isInitialized) return null

    try {
      // Create a simple t-shirt shaped cloth grid
      const width = 20 // Grid width
      const height = 25 // Grid height
      const spacing = 0.05 // Distance between particles

      const particles = []
      const constraints = []

      // Create particle grid in t-shirt shape
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // T-shirt shape logic
          let shouldCreateParticle = true

          // Create main body
          if (y < height * 0.3) {
            // Shoulder area - full width for top rows
            shouldCreateParticle = true
          } else if (y < height * 0.5) {
            // Neck/shoulder transition - narrow in the middle
            const centerX = width / 2
            const neckWidth = width * 0.3
            shouldCreateParticle = Math.abs(x - centerX) < neckWidth || Math.abs(x - centerX) > width * 0.35
          } else {
            // Body area - full width
            shouldCreateParticle = true
          }

          if (shouldCreateParticle) {
            const particle = {
              id: y * width + x,
              x: position.x + (x - width / 2) * spacing,
              y: position.y - y * spacing,
              z: position.z,
              oldX: position.x + (x - width / 2) * spacing,
              oldY: position.y - y * spacing,
              oldZ: position.z,
              pinned: y === 0 && (x < width * 0.2 || x > width * 0.8), // Pin shoulders
              mass: 1.0,
            }
            particles.push(particle)
          }
        }
      }

      // Create constraints between neighboring particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]

        // Find neighbors and create constraints
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dz = p1.z - p2.z
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

          // Only connect nearby particles (structural constraints)
          if (distance < spacing * 1.5) {
            constraints.push({
              p1: i,
              p2: j,
              restLength: distance,
              stiffness: 0.8,
            })
          }

          // Add diagonal constraints for shear resistance
          if (distance < spacing * 2.1 && distance > spacing * 1.3) {
            constraints.push({
              p1: i,
              p2: j,
              restLength: distance,
              stiffness: 0.4,
            })
          }
        }
      }

      const clothId = `simple_cloth_${Date.now()}`
      const clothData = {
        particles,
        constraints,
        vertexCount: particles.length,
        stiffness: 0.8,
      }

      this.clothBodies.set(clothId, clothData)

      console.log(`✅ Simple cloth created with ${particles.length} particles and ${constraints.length} constraints`)
      return { id: clothId, body: clothData }
    } catch (error) {
      console.error("❌ Failed to create simple cloth:", error)
      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized) return

    this.clothBodies.forEach((clothData) => {
      this.updateCloth(clothData, deltaTime)
    })
  }

  updateCloth(clothData, deltaTime) {
    const { particles, constraints } = clothData
    const dt = Math.min(deltaTime, this.timeStep)

    // Verlet integration - update positions
    for (const particle of particles) {
      if (particle.pinned) continue

      // Store current position
      const tempX = particle.x
      const tempY = particle.y
      const tempZ = particle.z

      // Verlet integration: newPos = currentPos + (currentPos - oldPos) + acceleration * dt²
      particle.x = particle.x + (particle.x - particle.oldX) * this.damping + this.gravity.x * dt * dt
      particle.y = particle.y + (particle.y - particle.oldY) * this.damping + this.gravity.y * dt * dt
      particle.z = particle.z + (particle.z - particle.oldZ) * this.damping + this.gravity.z * dt * dt

      // Update old position
      particle.oldX = tempX
      particle.oldY = tempY
      particle.oldZ = tempZ
    }

    // Satisfy constraints (multiple iterations for stability)
    const iterations = 3
    for (let iter = 0; iter < iterations; iter++) {
      for (const constraint of constraints) {
        const p1 = particles[constraint.p1]
        const p2 = particles[constraint.p2]

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dz = p2.z - p1.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance === 0) continue

        const difference = (constraint.restLength - distance) / distance
        const translate = difference * constraint.stiffness * 0.5

        const offsetX = dx * translate
        const offsetY = dy * translate
        const offsetZ = dz * translate

        if (!p1.pinned) {
          p1.x -= offsetX
          p1.y -= offsetY
          p1.z -= offsetZ
        }

        if (!p2.pinned) {
          p2.x += offsetX
          p2.y += offsetY
          p2.z += offsetZ
        }
      }
    }
  }

  getClothVertices(clothId) {
    const clothData = this.clothBodies.get(clothId)
    if (!clothData) return null

    const { particles } = clothData
    const vertices = new Float32Array(particles.length * 3)

    for (let i = 0; i < particles.length; i++) {
      vertices[i * 3] = particles[i].x
      vertices[i * 3 + 1] = particles[i].y
      vertices[i * 3 + 2] = particles[i].z
    }

    return vertices
  }

  setGravity(x, y, z) {
    this.gravity = { x, y, z }
    console.log(`✅ Simple physics gravity set to (${x}, ${y}, ${z})`)
  }

  setClothStiffness(clothId, stiffness) {
    const clothData = this.clothBodies.get(clothId)
    if (clothData) {
      clothData.stiffness = stiffness
      // Update all constraint stiffness
      for (const constraint of clothData.constraints) {
        constraint.stiffness = stiffness
      }
      console.log(`✅ Simple cloth stiffness set to ${stiffness}`)
    }
  }

  removeCloth(clothId) {
    this.clothBodies.delete(clothId)
    console.log(`✅ Simple cloth ${clothId} removed`)
  }

  cleanup() {
    this.clothBodies.clear()
    this.isInitialized = false
    console.log("✅ Simple physics cleanup completed")
  }
}

// Export for use in main application
window.SimpleClothPhysics = SimpleClothPhysics
