// Simple Cloth Physics Engine
// A lightweight cloth simulation that doesn't require Ammo.js

class SimpleClothPhysics {
  constructor() {
    this.clothBodies = new Map()
    this.isInitialized = false
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.99
    this.timeStep = 1 / 60
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

      // Create cloth particles from vertices
      const particles = []
      for (let i = 0; i < vertices.length; i += 3) {
        particles.push({
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
          pinned: vertices[i + 1] + position.y > 1.4, // Pin top vertices
        })
      }

      // Create constraints between particles
      const constraints = []
      const width = Math.sqrt(particles.length) // Assume square grid

      for (let i = 0; i < particles.length; i++) {
        const x = i % width
        const y = Math.floor(i / width)

        // Horizontal constraint
        if (x < width - 1) {
          constraints.push({
            p1: i,
            p2: i + 1,
            restLength: this.distance(particles[i].position, particles[i + 1].position),
          })
        }

        // Vertical constraint
        if (y < width - 1) {
          constraints.push({
            p1: i,
            p2: i + width,
            restLength: this.distance(particles[i].position, particles[i + width].position),
          })
        }
      }

      const clothBody = {
        id: clothId,
        particles: particles,
        constraints: constraints,
        stiffness: 0.4,
        originalVertices: vertices,
        vertexCount: vertices.length / 3,
      }

      this.clothBodies.set(clothId, clothBody)
      console.log(`✅ Simple cloth created: ${particles.length} particles, ${constraints.length} constraints`)

      return { id: clothId, body: clothBody }
    } catch (error) {
      console.error("❌ Failed to create simple cloth:", error)
      return null
    }
  }

  distance(p1, p2) {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    const dz = p1.z - p2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized) return

    this.clothBodies.forEach((cloth) => {
      // Verlet integration
      cloth.particles.forEach((particle) => {
        if (particle.pinned) return

        const vel = {
          x: (particle.position.x - particle.oldPosition.x) * this.damping,
          y: (particle.position.y - particle.oldPosition.y) * this.damping,
          z: (particle.position.z - particle.oldPosition.z) * this.damping,
        }

        particle.oldPosition.x = particle.position.x
        particle.oldPosition.y = particle.position.y
        particle.oldPosition.z = particle.position.z

        particle.position.x += vel.x + this.gravity.x * deltaTime * deltaTime
        particle.position.y += vel.y + this.gravity.y * deltaTime * deltaTime
        particle.position.z += vel.z + this.gravity.z * deltaTime * deltaTime
      })

      // Satisfy constraints
      for (let iteration = 0; iteration < 3; iteration++) {
        cloth.constraints.forEach((constraint) => {
          const p1 = cloth.particles[constraint.p1]
          const p2 = cloth.particles[constraint.p2]

          const dx = p2.position.x - p1.position.x
          const dy = p2.position.y - p1.position.y
          const dz = p2.position.z - p1.position.z
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (distance > 0) {
            const difference = (constraint.restLength - distance) / distance
            const translate = {
              x: dx * difference * 0.5 * cloth.stiffness,
              y: dy * difference * 0.5 * cloth.stiffness,
              z: dz * difference * 0.5 * cloth.stiffness,
            }

            if (!p1.pinned) {
              p1.position.x -= translate.x
              p1.position.y -= translate.y
              p1.position.z -= translate.z
            }

            if (!p2.pinned) {
              p2.position.x += translate.x
              p2.position.y += translate.y
              p2.position.z += translate.z
            }
          }
        })
      }
    })
  }

  getClothVertices(clothId) {
    const cloth = this.clothBodies.get(clothId)
    if (!cloth) return null

    const vertices = new Float32Array(cloth.particles.length * 3)

    cloth.particles.forEach((particle, i) => {
      vertices[i * 3] = particle.position.x
      vertices[i * 3 + 1] = particle.position.y
      vertices[i * 3 + 2] = particle.position.z
    })

    return vertices
  }

  setGravity(x, y, z) {
    this.gravity = { x, y, z }
  }

  setClothStiffness(clothId, stiffness) {
    const cloth = this.clothBodies.get(clothId)
    if (cloth) {
      cloth.stiffness = stiffness
    }
  }

  startSimulation() {
    console.log("✅ Simple physics simulation started")
  }

  stopSimulation() {
    console.log("⏹️ Simple physics simulation stopped")
  }

  cleanup() {
    this.clothBodies.clear()
    console.log("✅ Simple physics cleanup complete")
  }
}

// Export for use in main application
window.SimpleClothPhysics = SimpleClothPhysics
