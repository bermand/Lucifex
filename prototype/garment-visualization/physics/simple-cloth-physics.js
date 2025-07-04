// Simple Cloth Physics - A lightweight alternative when Ammo.js fails
// Provides basic cloth simulation using Verlet integration

class SimpleClothPhysics {
  constructor() {
    this.particles = []
    this.constraints = []
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.99
    this.isRunning = false
    this.clothMeshes = new Map()
  }

  createClothFromGeometry(vertices, indices, position = { x: 0, y: 1, z: 0 }) {
    const clothId = `simple_cloth_${Date.now()}`

    // Create particles from vertices
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
        pinned: false,
        mass: 1.0,
      })
    }

    // Create constraints between connected vertices
    const constraints = []
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i]
      const b = indices[i + 1]
      const c = indices[i + 2]

      // Add constraints for triangle edges
      this.addConstraint(constraints, particles, a, b)
      this.addConstraint(constraints, particles, b, c)
      this.addConstraint(constraints, particles, c, a)
    }

    // Pin top vertices to simulate hanging cloth
    const topY = Math.max(...particles.map((p) => p.position.y))
    particles.forEach((particle) => {
      if (Math.abs(particle.position.y - topY) < 0.1) {
        particle.pinned = true
      }
    })

    const clothData = {
      particles,
      constraints,
      originalVertices: vertices,
      vertexCount: vertices.length / 3,
      stiffness: 0.8,
    }

    this.clothMeshes.set(clothId, clothData)
    console.log("✅ Simple cloth created with", particles.length, "particles")

    return { id: clothId, body: clothData }
  }

  addConstraint(constraints, particles, indexA, indexB) {
    // Avoid duplicate constraints
    const existing = constraints.find((c) => (c.a === indexA && c.b === indexB) || (c.a === indexB && c.b === indexA))

    if (!existing && indexA < particles.length && indexB < particles.length) {
      const pA = particles[indexA]
      const pB = particles[indexB]
      const distance = this.distance(pA.position, pB.position)

      constraints.push({
        a: indexA,
        b: indexB,
        restLength: distance,
      })
    }
  }

  distance(a, b) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const dz = a.z - b.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  updatePhysics(deltaTime) {
    if (!this.isRunning) return

    this.clothMeshes.forEach((clothData) => {
      this.updateCloth(clothData, deltaTime)
    })
  }

  updateCloth(clothData, deltaTime) {
    const { particles, constraints, stiffness } = clothData

    // Apply Verlet integration
    particles.forEach((particle) => {
      if (particle.pinned) return

      // Store current position
      const tempX = particle.position.x
      const tempY = particle.position.y
      const tempZ = particle.position.z

      // Calculate new position using Verlet integration
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
    })

    // Satisfy constraints (multiple iterations for stability)
    for (let iteration = 0; iteration < 3; iteration++) {
      constraints.forEach((constraint) => {
        const pA = particles[constraint.a]
        const pB = particles[constraint.b]

        if (!pA || !pB) return // Safety check

        const dx = pB.position.x - pA.position.x
        const dy = pB.position.y - pA.position.y
        const dz = pB.position.z - pA.position.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance > 0) {
          const difference = (constraint.restLength - distance) / distance
          const translate = {
            x: dx * difference * 0.5 * stiffness,
            y: dy * difference * 0.5 * stiffness,
            z: dz * difference * 0.5 * stiffness,
          }

          if (!pA.pinned) {
            pA.position.x -= translate.x
            pA.position.y -= translate.y
            pA.position.z -= translate.z
          }

          if (!pB.pinned) {
            pB.position.x += translate.x
            pB.position.y += translate.y
            pB.position.z += translate.z
          }
        }
      })
    }
  }

  getClothVertices(clothId) {
    const clothData = this.clothMeshes.get(clothId)
    if (!clothData) return null

    const { particles, vertexCount } = clothData
    const updatedVertices = new Float32Array(vertexCount * 3)

    for (let i = 0; i < Math.min(particles.length, vertexCount); i++) {
      const particle = particles[i]
      updatedVertices[i * 3] = particle.position.x
      updatedVertices[i * 3 + 1] = particle.position.y
      updatedVertices[i * 3 + 2] = particle.position.z
    }

    return updatedVertices
  }

  setClothStiffness(clothId, stiffness) {
    const clothData = this.clothMeshes.get(clothId)
    if (clothData) {
      clothData.stiffness = Math.max(0.1, Math.min(1.0, stiffness))
      console.log(`🔧 Cloth stiffness set to ${clothData.stiffness}`)
    }
  }

  setGravity(x, y, z) {
    this.gravity = { x, y, z }
    console.log(`🌍 Gravity set to (${x}, ${y}, ${z})`)
  }

  startSimulation() {
    this.isRunning = true
    console.log("✅ Simple cloth simulation started")
  }

  stopSimulation() {
    this.isRunning = false
    console.log("⏹️ Simple cloth simulation stopped")
  }

  cleanup() {
    this.clothMeshes.clear()
    this.isRunning = false
    console.log("✅ Simple cloth physics cleanup completed")
  }

  // Debug method
  getSimulationInfo() {
    const info = {
      isRunning: this.isRunning,
      clothCount: this.clothMeshes.size,
      gravity: this.gravity,
      damping: this.damping,
    }

    this.clothMeshes.forEach((clothData, clothId) => {
      info[clothId] = {
        particles: clothData.particles.length,
        constraints: clothData.constraints.length,
        stiffness: clothData.stiffness,
      }
    })

    return info
  }
}

// Export for use in main application
window.SimpleClothPhysics = SimpleClothPhysics
