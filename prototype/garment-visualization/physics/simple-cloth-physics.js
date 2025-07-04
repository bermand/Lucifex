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
  }

  async initPhysicsWorld() {
    try {
      console.log("🔄 Initializing simple physics engine...")
      this.isInitialized = true
      console.log("✅ Simple physics engine initialized")
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
      console.log("🔄 Creating simple physics cloth...")

      // Create a t-shirt shaped cloth
      const clothWidth = 20
      const clothHeight = 25
      const particles = []
      const constraints = []

      // Create particles in a grid
      for (let y = 0; y <= clothHeight; y++) {
        for (let x = 0; x <= clothWidth; x++) {
          // T-shirt shaping
          let shouldInclude = true

          if (y <= clothHeight * 0.3) {
            // Shoulder area - full width
            shouldInclude = true
          } else if (y <= clothHeight * 0.5) {
            // Neck/armhole area
            const centerX = clothWidth / 2
            const armholeSize = clothWidth * 0.25
            shouldInclude = Math.abs(x - centerX) > armholeSize || Math.abs(x - centerX) < clothWidth * 0.15
          } else {
            // Body area - full width
            shouldInclude = true
          }

          if (shouldInclude) {
            const particle = {
              id: particles.length,
              x: (x - clothWidth / 2) * 0.05 + position.x,
              y: -y * 0.05 + position.y,
              z: position.z,
              oldX: (x - clothWidth / 2) * 0.05 + position.x,
              oldY: -y * 0.05 + position.y,
              oldZ: position.z,
              pinned: y === 0 && (x <= 2 || x >= clothWidth - 2), // Pin top corners
              mass: 1.0,
              gridX: x,
              gridY: y,
            }
            particles.push(particle)
          }
        }
      }

      // Create constraints between neighboring particles
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
            stiffness: 0.8,
          })
        }

        if (down) {
          constraints.push({
            p1: particle,
            p2: down,
            restLength: this.distance(particle, down),
            stiffness: 0.8,
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
            stiffness: 0.6,
          })
        }

        if (downLeft) {
          constraints.push({
            p1: particle,
            p2: downLeft,
            restLength: this.distance(particle, downLeft),
            stiffness: 0.6,
          })
        }
      }

      const clothId = `cloth_${this.clothIdCounter++}`
      this.clothBodies.set(clothId, {
        particles: particles,
        constraints: constraints,
        stiffness: 0.4,
      })

      console.log(`✅ Simple physics cloth created: ${particles.length} particles, ${constraints.length} constraints`)
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
      // Update each cloth body
      this.clothBodies.forEach((clothData) => {
        this.updateClothBody(clothData, deltaTime)
      })
    } catch (error) {
      console.error("❌ Simple physics update error:", error)
    }
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
    // Simple sphere collision with avatar
    const avatarCenter = { x: 0, y: 0.5, z: 0 }
    const avatarRadius = 0.3

    for (const particle of particles) {
      if (particle.pinned) continue

      const dx = particle.x - avatarCenter.x
      const dy = particle.y - avatarCenter.y
      const dz = particle.z - avatarCenter.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (distance < avatarRadius) {
        // Push particle outside the avatar
        const factor = avatarRadius / distance
        particle.x = avatarCenter.x + dx * factor
        particle.y = avatarCenter.y + dy * factor
        particle.z = avatarCenter.z + dz * factor
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
      clothData.stiffness = stiffness
      console.log(`🧵 Simple physics cloth stiffness set to ${stiffness}`)
    }
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
