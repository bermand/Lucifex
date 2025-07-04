// Simple Cloth Physics Engine
// A lightweight Verlet integration based cloth simulation

class SimpleClothPhysics {
  constructor() {
    this.particles = []
    this.constraints = []
    this.clothBodies = new Map()
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.99
    this.isInitialized = false
  }

  async initialize() {
    this.isInitialized = true
    console.log("✅ Simple cloth physics initialized")
    return true
  }

  createClothFromGeometry(vertices, indices, position = { x: 0, y: 1, z: 0 }) {
    if (!vertices || !indices) return null

    try {
      const clothId = `simple_cloth_${Date.now()}`
      const particles = []
      const constraints = []

      // Create particles from vertices
      for (let i = 0; i < vertices.length; i += 3) {
        const particle = {
          position: {
            x: vertices[i] + position.x,
            y: vertices[i + 1] + position.y,
            z: vertices[i + 2] + position.z,
          },
          oldPosition: {
            x: vertices[i] + position.x,
            y: vertices[i + 1] + position.y,
            z: vertices[i + 2] + position.z,
          },
          pinned: false,
          mass: 1.0,
        }

        // Pin top row of particles (like hanging a cloth)
        if (vertices[i + 1] + position.y > position.y + 1.5) {
          particle.pinned = true
        }

        particles.push(particle)
      }

      // Create constraints from triangles
      const edges = new Set()
      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i]
        const b = indices[i + 1]
        const c = indices[i + 2]

        // Add edges (avoid duplicates)
        const edges_to_add = [
          [Math.min(a, b), Math.max(a, b)],
          [Math.min(b, c), Math.max(b, c)],
          [Math.min(c, a), Math.max(c, a)],
        ]

        edges_to_add.forEach(([p1, p2]) => {
          const edgeKey = `${p1}-${p2}`
          if (!edges.has(edgeKey)) {
            edges.add(edgeKey)

            const particle1 = particles[p1]
            const particle2 = particles[p2]

            if (particle1 && particle2) {
              const dx = particle1.position.x - particle2.position.x
              const dy = particle1.position.y - particle2.position.y
              const dz = particle1.position.z - particle2.position.z
              const restLength = Math.sqrt(dx * dx + dy * dy + dz * dz)

              constraints.push({
                p1: p1,
                p2: p2,
                restLength: restLength,
                stiffness: 0.4,
              })
            }
          }
        })
      }

      const clothData = {
        particles: particles,
        constraints: constraints,
        vertexCount: particles.length,
        originalVertices: vertices,
      }

      this.clothBodies.set(clothId, clothData)

      console.log(`✅ Simple cloth created: ${particles.length} particles, ${constraints.length} constraints`)
      return { id: clothId, body: clothData }
    } catch (error) {
      console.error("❌ Failed to create simple cloth:", error)
      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized) return

    // Cap deltaTime to prevent instability
    deltaTime = Math.min(deltaTime, 1 / 60)

    this.clothBodies.forEach((clothData) => {
      // Verlet integration
      clothData.particles.forEach((particle) => {
        if (particle.pinned) return

        // Store current position
        const tempX = particle.position.x
        const tempY = particle.position.y
        const tempZ = particle.position.z

        // Apply gravity and damping
        const velX = (particle.position.x - particle.oldPosition.x) * this.damping
        const velY = (particle.position.y - particle.oldPosition.y) * this.damping
        const velZ = (particle.position.z - particle.oldPosition.z) * this.damping

        // Update position with Verlet integration
        particle.position.x += velX + this.gravity.x * deltaTime * deltaTime
        particle.position.y += velY + this.gravity.y * deltaTime * deltaTime
        particle.position.z += velZ + this.gravity.z * deltaTime * deltaTime

        // Update old position
        particle.oldPosition.x = tempX
        particle.oldPosition.y = tempY
        particle.oldPosition.z = tempZ
      })

      // Satisfy constraints (multiple iterations for stability)
      for (let iteration = 0; iteration < 3; iteration++) {
        clothData.constraints.forEach((constraint) => {
          const p1 = clothData.particles[constraint.p1]
          const p2 = clothData.particles[constraint.p2]

          if (!p1 || !p2) return

          const dx = p2.position.x - p1.position.x
          const dy = p2.position.y - p1.position.y
          const dz = p2.position.z - p1.position.z
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (distance === 0) return

          const difference = (constraint.restLength - distance) / distance
          const translate = {
            x: dx * difference * constraint.stiffness,
            y: dy * difference * constraint.stiffness,
            z: dz * difference * constraint.stiffness,
          }

          // Move particles to satisfy constraint
          if (!p1.pinned) {
            p1.position.x -= translate.x * 0.5
            p1.position.y -= translate.y * 0.5
            p1.position.z -= translate.z * 0.5
          }

          if (!p2.pinned) {
            p2.position.x += translate.x * 0.5
            p2.position.y += translate.y * 0.5
            p2.position.z += translate.z * 0.5
          }
        })
      }
    })
  }

  getClothVertices(clothId) {
    const clothData = this.clothBodies.get(clothId)
    if (!clothData) return null

    const vertices = new Float32Array(clothData.vertexCount * 3)

    for (let i = 0; i < clothData.particles.length; i++) {
      const particle = clothData.particles[i]
      vertices[i * 3] = particle.position.x
      vertices[i * 3 + 1] = particle.position.y
      vertices[i * 3 + 2] = particle.position.z
    }

    return vertices
  }

  setGravity(x, y, z) {
    this.gravity.x = x
    this.gravity.y = y
    this.gravity.z = z
  }

  setClothStiffness(clothId, stiffness) {
    const clothData = this.clothBodies.get(clothId)
    if (clothData) {
      clothData.constraints.forEach((constraint) => {
        constraint.stiffness = stiffness
      })
    }
  }

  removeCloth(clothId) {
    this.clothBodies.delete(clothId)
  }

  cleanup() {
    this.clothBodies.clear()
    this.particles = []
    this.constraints = []
    console.log("✅ Simple physics cleanup completed")
  }

  startSimulation() {
    // Simple physics doesn't need special start logic
  }

  stopSimulation() {
    // Simple physics doesn't need special stop logic
  }
}

// Export for use in main application
window.SimpleClothPhysics = SimpleClothPhysics
