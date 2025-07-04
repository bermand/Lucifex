// Simple Cloth Physics Engine
// Fallback physics engine using Verlet integration for cloth simulation

class SimpleClothPhysics {
  constructor() {
    this.particles = []
    this.constraints = []
    this.clothBodies = new Map()
    this.avatarColliders = new Map()
    this.isInitialized = false
    this.clothIdCounter = 0
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.99
    this.timeStep = 1 / 60
    this.updateCount = 0
    this.lastStatusLog = 0
  }

  async initPhysicsWorld() {
    try {
      console.log("🔄 Initializing Simple Physics Engine...")
      console.log("📊 Physics Features:")
      console.log("  • Verlet Integration")
      console.log("  • Constraint-based cloth simulation")
      console.log("  • Avatar collision detection")
      console.log("  • Real-time parameter adjustment")

      this.isInitialized = true
      console.log("✅ Simple Physics Engine ready!")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize simple physics:", error)
      return false
    }
  }

  createAvatarCollider(position, scale) {
    if (!this.isInitialized) return null

    try {
      const colliderId = `avatar_${Date.now()}`
      this.avatarColliders.set(colliderId, {
        position: { ...position },
        scale: { ...scale },
        type: "capsule",
      })

      console.log("✅ Avatar collider created (simple physics)")
      return colliderId
    } catch (error) {
      console.error("❌ Failed to create avatar collider:", error)
      return null
    }
  }

  createClothFromGeometry(vertices, indices, position) {
    if (!this.isInitialized) {
      console.error("❌ Simple physics not initialized")
      return null
    }

    try {
      console.log("🔄 Creating enhanced t-shirt cloth simulation...")

      // Enhanced t-shirt parameters
      const clothWidth = 24
      const clothHeight = 30
      const particles = []
      const constraints = []

      // Create particles in a more realistic t-shirt shape
      for (let y = 0; y <= clothHeight; y++) {
        for (let x = 0; x <= clothWidth; x++) {
          let shouldInclude = true
          let xPos = (x - clothWidth / 2) * 0.04
          const yPos = -y * 0.04 + position.y
          const zPos = position.z

          // Enhanced t-shirt shaping
          if (y <= clothHeight * 0.25) {
            // Shoulder area - full width
            shouldInclude = true
          } else if (y <= clothHeight * 0.45) {
            // Armhole area - create realistic armholes
            const centerX = clothWidth / 2
            const armholeRadius = clothWidth * 0.2
            const neckRadius = clothWidth * 0.12

            const distFromCenter = Math.abs(x - centerX)
            const isInNeckArea = distFromCenter < neckRadius
            const isInArmholeArea = distFromCenter > armholeRadius && distFromCenter < clothWidth * 0.4

            shouldInclude = isInNeckArea || !isInArmholeArea
          } else {
            // Body area - slightly tapered
            const taperFactor = 1 - ((y - clothHeight * 0.45) / (clothHeight * 0.55)) * 0.1
            xPos *= taperFactor
            shouldInclude = true
          }

          if (shouldInclude) {
            const particle = {
              id: particles.length,
              x: xPos,
              y: yPos,
              z: zPos,
              oldX: xPos,
              oldY: yPos,
              oldZ: zPos,
              pinned: y === 0 && (x <= 3 || x >= clothWidth - 3), // Pin shoulder points
              mass: 1.0,
              gridX: x,
              gridY: y,
            }
            particles.push(particle)
          }
        }
      }

      // Create enhanced constraint system
      const getParticleAt = (gx, gy) => {
        return particles.find((p) => p.gridX === gx && p.gridY === gy)
      }

      for (const particle of particles) {
        const { gridX: x, gridY: y } = particle

        // Structural constraints (horizontal and vertical)
        const right = getParticleAt(x + 1, y)
        const down = getParticleAt(x, y + 1)

        if (right) {
          constraints.push({
            p1: particle,
            p2: right,
            restLength: this.distance(particle, right),
            stiffness: 0.9,
            type: "structural",
          })
        }

        if (down) {
          constraints.push({
            p1: particle,
            p2: down,
            restLength: this.distance(particle, down),
            stiffness: 0.9,
            type: "structural",
          })
        }

        // Shear constraints (diagonal)
        const downRight = getParticleAt(x + 1, y + 1)
        const downLeft = getParticleAt(x - 1, y + 1)

        if (downRight) {
          constraints.push({
            p1: particle,
            p2: downRight,
            restLength: this.distance(particle, downRight),
            stiffness: 0.7,
            type: "shear",
          })
        }

        if (downLeft) {
          constraints.push({
            p1: particle,
            p2: downLeft,
            restLength: this.distance(particle, downLeft),
            stiffness: 0.7,
            type: "shear",
          })
        }

        // Bend constraints (skip one)
        const right2 = getParticleAt(x + 2, y)
        const down2 = getParticleAt(x, y + 2)

        if (right2) {
          constraints.push({
            p1: particle,
            p2: right2,
            restLength: this.distance(particle, right2),
            stiffness: 0.5,
            type: "bend",
          })
        }

        if (down2) {
          constraints.push({
            p1: particle,
            p2: down2,
            restLength: this.distance(particle, down2),
            stiffness: 0.5,
            type: "bend",
          })
        }
      }

      const clothId = `cloth_${this.clothIdCounter++}`
      this.clothBodies.set(clothId, {
        particles: particles,
        constraints: constraints,
        stiffness: 0.4,
        createdAt: Date.now(),
      })

      console.log(`✅ Enhanced t-shirt cloth created:`)
      console.log(`  • ${particles.length} particles`)
      console.log(`  • ${constraints.length} constraints`)
      console.log(`  • ${constraints.filter((c) => c.type === "structural").length} structural`)
      console.log(`  • ${constraints.filter((c) => c.type === "shear").length} shear`)
      console.log(`  • ${constraints.filter((c) => c.type === "bend").length} bend`)

      return { id: clothId, particles: particles.length }
    } catch (error) {
      console.error("❌ Failed to create simple physics cloth:", error)
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

    try {
      this.updateCount++

      // Update each cloth body
      this.clothBodies.forEach((clothData, clothId) => {
        this.updateClothBody(clothData, deltaTime)
      })

      // Log status periodically (every 5 seconds)
      const now = Date.now()
      if (now - this.lastStatusLog > 5000) {
        this.logPhysicsStatus()
        this.lastStatusLog = now
      }
    } catch (error) {
      console.error("❌ Simple physics update error:", error)
    }
  }

  logPhysicsStatus() {
    console.log(`📊 Physics Status Update #${Math.floor(this.updateCount / 300)}:`)
    console.log(`  • Update count: ${this.updateCount}`)
    console.log(`  • Active cloths: ${this.clothBodies.size}`)
    console.log(`  • Gravity: (${this.gravity.x}, ${this.gravity.y}, ${this.gravity.z})`)
    console.log(`  • Damping: ${this.damping}`)

    this.clothBodies.forEach((clothData, clothId) => {
      const pinnedCount = clothData.particles.filter((p) => p.pinned).length
      console.log(`  • ${clothId}: ${clothData.particles.length} particles, ${pinnedCount} pinned`)
    })
  }

  updateClothBody(clothData, deltaTime) {
    const { particles, constraints, stiffness } = clothData

    // Apply forces (gravity)
    for (const particle of particles) {
      if (!particle.pinned) {
        // Verlet integration
        const velX = (particle.x - particle.oldX) * this.damping
        const velY = (particle.y - particle.oldY) * this.damping
        const velZ = (particle.z - particle.oldZ) * this.damping

        particle.oldX = particle.x
        particle.oldY = particle.y
        particle.oldZ = particle.z

        particle.x += velX + this.gravity.x * deltaTime * deltaTime
        particle.y += velY + this.gravity.y * deltaTime * deltaTime
        particle.z += velZ + this.gravity.z * deltaTime * deltaTime
      }
    }

    // Satisfy constraints (multiple iterations for stability)
    const iterations = 3
    for (let iter = 0; iter < iterations; iter++) {
      for (const constraint of constraints) {
        this.satisfyConstraint(constraint, stiffness)
      }
    }

    // Simple collision with avatar (sphere approximation)
    this.handleCollisions(particles)
  }

  satisfyConstraint(constraint, globalStiffness) {
    const { p1, p2, restLength, stiffness } = constraint

    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const dz = p2.z - p1.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (distance === 0) return

    const difference = (restLength - distance) / distance
    const translate = difference * stiffness * globalStiffness * 0.5

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

  handleCollisions(particles) {
    // Enhanced avatar collision with multiple collision shapes
    const avatarShapes = [
      // Head
      { center: { x: 0, y: 1.6, z: 0 }, radius: 0.15, type: "head" },
      // Torso
      { center: { x: 0, y: 1.0, z: 0 }, radius: 0.25, type: "torso" },
      // Hips
      { center: { x: 0, y: 0.6, z: 0 }, radius: 0.2, type: "hips" },
    ]

    for (const particle of particles) {
      if (particle.pinned) continue

      for (const shape of avatarShapes) {
        const dx = particle.x - shape.center.x
        const dy = particle.y - shape.center.y
        const dz = particle.z - shape.center.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < shape.radius) {
          // Push particle outside the collision shape
          const factor = shape.radius / distance
          particle.x = shape.center.x + dx * factor
          particle.y = shape.center.y + dy * factor
          particle.z = shape.center.z + dz * factor

          // Add some friction
          const friction = 0.95
          particle.oldX = particle.x + (particle.x - particle.oldX) * friction
          particle.oldY = particle.y + (particle.y - particle.oldY) * friction
          particle.oldZ = particle.z + (particle.z - particle.oldZ) * friction
        }
      }

      // Ground collision
      if (particle.y < 0) {
        particle.y = 0
        particle.oldY = particle.y + (particle.y - particle.oldY) * 0.8 // Bounce damping
      }
    }
  }

  getClothVertices(clothId) {
    const clothData = this.clothBodies.get(clothId)
    if (!clothData) return null

    try {
      const { particles } = clothData
      const vertices = new Float32Array(particles.length * 3)

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        vertices[i * 3] = particle.x
        vertices[i * 3 + 1] = particle.y
        vertices[i * 3 + 2] = particle.z
      }

      return vertices
    } catch (error) {
      console.error("❌ Failed to get cloth vertices:", error)
      return null
    }
  }

  setGravity(x, y, z) {
    this.gravity = { x, y, z }
    console.log(`🌍 Simple physics gravity set to (${x}, ${y}, ${z})`)
  }

  setClothStiffness(clothId, stiffness) {
    const clothData = this.clothBodies.get(clothId)
    if (clothData) {
      clothData.stiffness = Math.max(0.1, Math.min(1.0, stiffness))
      console.log(`🧵 Cloth ${clothId} stiffness set to ${clothData.stiffness}`)
    }
  }

  setDamping(damping) {
    this.damping = Math.max(0.8, Math.min(0.999, damping))
    console.log(`💨 Physics damping set to ${this.damping}`)
  }

  addWind(windX, windY, windZ) {
    this.clothBodies.forEach((clothData) => {
      clothData.particles.forEach((particle) => {
        if (!particle.pinned) {
          particle.x += windX * 0.001
          particle.y += windY * 0.001
          particle.z += windZ * 0.001
        }
      })
    })
  }

  getDetailedStatus() {
    const status = {
      isInitialized: this.isInitialized,
      updateCount: this.updateCount,
      clothCount: this.clothBodies.size,
      totalParticles: 0,
      totalConstraints: 0,
      gravity: { ...this.gravity },
      damping: this.damping,
    }

    this.clothBodies.forEach((clothData) => {
      status.totalParticles += clothData.particles.length
      status.totalConstraints += clothData.constraints.length
    })

    return status
  }

  removeCloth(clothId) {
    if (this.clothBodies.has(clothId)) {
      this.clothBodies.delete(clothId)
      console.log(`🗑️ Cloth ${clothId} removed`)
    }
  }

  cleanup() {
    this.clothBodies.clear()
    this.avatarColliders.clear()
    this.particles = []
    this.constraints = []
    this.isInitialized = false
    console.log("✅ Simple physics cleanup complete")
  }

  startSimulation() {
    console.log("▶️ Simple physics simulation started")
  }

  stopSimulation() {
    console.log("⏹️ Simple physics simulation stopped")
  }
}

// Export for use in main application
window.SimpleClothPhysics = SimpleClothPhysics
