// Simple Cloth Physics Engine
// Uses Verlet integration for realistic cloth simulation without external dependencies

class SimpleClothPhysics {
  constructor() {
    this.particles = []
    this.constraints = []
    this.isInitialized = false
    this.clothIdCounter = 0
    this.clothMeshes = new Map()
    this.avatarColliders = new Map()
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.99
    this.timeStep = 1 / 60
    this.constraintIterations = 3
  }

  async initPhysicsWorld() {
    try {
      console.log("🔄 Initializing Simple Physics Engine...")

      // Simple physics doesn't need external libraries
      this.isInitialized = true

      console.log("✅ Simple Physics Engine initialized successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize Simple Physics:", error)
      return false
    }
  }

  createAvatarCollider(position = { x: 0, y: 0, z: 0 }, scale = { x: 0.4, y: 0.9, z: 0.2 }) {
    if (!this.isInitialized) return null

    try {
      // Create multiple collision shapes for better avatar representation
      const colliders = [
        // Head
        {
          type: "sphere",
          position: { x: position.x, y: position.y + 0.7, z: position.z },
          radius: 0.12,
        },
        // Upper torso
        {
          type: "capsule",
          position: { x: position.x, y: position.y + 0.3, z: position.z },
          radius: scale.x * 0.8,
          height: 0.4,
        },
        // Lower torso
        {
          type: "capsule",
          position: { x: position.x, y: position.y - 0.1, z: position.z },
          radius: scale.x * 0.7,
          height: 0.3,
        },
        // Hips
        {
          type: "capsule",
          position: { x: position.x, y: position.y - 0.4, z: position.z },
          radius: scale.x * 0.6,
          height: 0.2,
        },
      ]

      const colliderId = `avatar_${Date.now()}`
      this.avatarColliders.set(colliderId, colliders)

      console.log("✅ Simple Physics avatar collider created with", colliders.length, "shapes")
      return colliderId
    } catch (error) {
      console.error("❌ Failed to create avatar collider:", error)
      return null
    }
  }

  createClothFromGeometry(vertices, indices, position = { x: 0, y: 1, z: 0 }) {
    if (!this.isInitialized) {
      console.error("❌ Simple Physics not initialized")
      return null
    }

    try {
      console.log("🔄 Creating Simple Physics cloth body...")

      // Create a more realistic t-shirt shaped cloth
      const clothWidth = 20 // Particles across
      const clothHeight = 26 // Particles down
      const clothParticles = []
      const clothConstraints = []

      // Physical dimensions
      const physicalWidth = 1.2 // meters
      const physicalHeight = 1.5 // meters
      const spacing = physicalWidth / (clothWidth - 1)

      // Create particles in t-shirt shape
      for (let y = 0; y < clothHeight; y++) {
        for (let x = 0; x < clothWidth; x++) {
          const normalizedY = y / (clothHeight - 1)
          const normalizedX = x / (clothWidth - 1)

          // Create t-shirt silhouette
          let shouldCreateParticle = true

          // Neck opening (top center)
          if (y < 3 && x > 7 && x < 13) {
            shouldCreateParticle = false
          }

          // Armholes (sides, upper portion)
          if (y < 8) {
            const armholeWidth = Math.max(0, 3 - y * 0.3)
            if (x < armholeWidth || x >= clothWidth - armholeWidth) {
              shouldCreateParticle = false
            }
          }

          // Body tapering (make it more fitted)
          if (y > 15) {
            const taperAmount = (y - 15) * 0.1
            const minX = Math.floor(taperAmount)
            const maxX = clothWidth - 1 - Math.floor(taperAmount)
            if (x < minX || x > maxX) {
              shouldCreateParticle = false
            }
          }

          if (shouldCreateParticle) {
            const particle = {
              id: clothParticles.length,
              position: {
                x: position.x + (normalizedX - 0.5) * physicalWidth,
                y: position.y - normalizedY * physicalHeight,
                z: position.z,
              },
              oldPosition: {
                x: position.x + (normalizedX - 0.5) * physicalWidth,
                y: position.y - normalizedY * physicalHeight,
                z: position.z,
              },
              pinned: y === 0, // Pin top row (shoulders)
              mass: 1.0,
              gridX: x,
              gridY: y,
            }
            clothParticles.push(particle)
          }
        }
      }

      // Create constraints between particles
      const getParticleAt = (gx, gy) => {
        return clothParticles.find((p) => p.gridX === gx && p.gridY === gy)
      }

      // Structural constraints (horizontal and vertical)
      for (let y = 0; y < clothHeight; y++) {
        for (let x = 0; x < clothWidth; x++) {
          const particle = getParticleAt(x, y)
          if (!particle) continue

          // Right neighbor
          if (x < clothWidth - 1) {
            const rightParticle = getParticleAt(x + 1, y)
            if (rightParticle) {
              clothConstraints.push({
                type: "structural",
                p1: particle.id,
                p2: rightParticle.id,
                restLength: spacing,
                stiffness: 0.8,
              })
            }
          }

          // Bottom neighbor
          if (y < clothHeight - 1) {
            const bottomParticle = getParticleAt(x, y + 1)
            if (bottomParticle) {
              clothConstraints.push({
                type: "structural",
                p1: particle.id,
                p2: bottomParticle.id,
                restLength: spacing,
                stiffness: 0.8,
              })
            }
          }

          // Diagonal constraints (shear)
          if (x < clothWidth - 1 && y < clothHeight - 1) {
            const diagParticle = getParticleAt(x + 1, y + 1)
            if (diagParticle) {
              clothConstraints.push({
                type: "shear",
                p1: particle.id,
                p2: diagParticle.id,
                restLength: spacing * Math.sqrt(2),
                stiffness: 0.6,
              })
            }
          }

          if (x > 0 && y < clothHeight - 1) {
            const diagParticle = getParticleAt(x - 1, y + 1)
            if (diagParticle) {
              clothConstraints.push({
                type: "shear",
                p1: particle.id,
                p2: diagParticle.id,
                restLength: spacing * Math.sqrt(2),
                stiffness: 0.6,
              })
            }
          }

          // Bend constraints (skip one particle)
          if (x < clothWidth - 2) {
            const bendParticle = getParticleAt(x + 2, y)
            if (bendParticle) {
              clothConstraints.push({
                type: "bend",
                p1: particle.id,
                p2: bendParticle.id,
                restLength: spacing * 2,
                stiffness: 0.3,
              })
            }
          }

          if (y < clothHeight - 2) {
            const bendParticle = getParticleAt(x, y + 2)
            if (bendParticle) {
              clothConstraints.push({
                type: "bend",
                p1: particle.id,
                p2: bendParticle.id,
                restLength: spacing * 2,
                stiffness: 0.3,
              })
            }
          }
        }
      }

      const clothId = `cloth_${this.clothIdCounter++}`
      this.clothMeshes.set(clothId, {
        particles: clothParticles,
        constraints: clothConstraints,
        gridWidth: clothWidth,
        gridHeight: clothHeight,
        physicalWidth: physicalWidth,
        physicalHeight: physicalHeight,
      })

      console.log(`✅ Simple Physics t-shirt cloth created:`)
      console.log(`   • Cloth ID: ${clothId}`)
      console.log(`   • Particles: ${clothParticles.length}`)
      console.log(`   • Constraints: ${clothConstraints.length}`)
      console.log(`   • Grid: ${clothWidth}x${clothHeight}`)
      console.log(`   • Physical size: ${physicalWidth}m x ${physicalHeight}m`)

      return { id: clothId, particles: clothParticles, constraints: clothConstraints }
    } catch (error) {
      console.error("❌ Failed to create Simple Physics cloth body:", error)
      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized) return

    try {
      const dt = Math.min(deltaTime, this.timeStep)

      // Update all cloth meshes
      this.clothMeshes.forEach((clothData) => {
        this.updateClothPhysics(clothData, dt)
      })
    } catch (error) {
      console.error("❌ Physics update error:", error)
    }
  }

  updateClothPhysics(clothData, deltaTime) {
    const { particles, constraints } = clothData

    // Apply forces (gravity)
    particles.forEach((particle) => {
      if (!particle.pinned) {
        const acceleration = {
          x: this.gravity.x,
          y: this.gravity.y,
          z: this.gravity.z,
        }

        // Verlet integration
        const newX =
          particle.position.x +
          (particle.position.x - particle.oldPosition.x) * this.damping +
          acceleration.x * deltaTime * deltaTime
        const newY =
          particle.position.y +
          (particle.position.y - particle.oldPosition.y) * this.damping +
          acceleration.y * deltaTime * deltaTime
        const newZ =
          particle.position.z +
          (particle.position.z - particle.oldPosition.z) * this.damping +
          acceleration.z * deltaTime * deltaTime

        particle.oldPosition.x = particle.position.x
        particle.oldPosition.y = particle.position.y
        particle.oldPosition.z = particle.position.z

        particle.position.x = newX
        particle.position.y = newY
        particle.position.z = newZ
      }
    })

    // Satisfy constraints
    for (let iteration = 0; iteration < this.constraintIterations; iteration++) {
      constraints.forEach((constraint) => {
        const p1 = particles[constraint.p1]
        const p2 = particles[constraint.p2]

        if (!p1 || !p2) return

        const dx = p2.position.x - p1.position.x
        const dy = p2.position.y - p1.position.y
        const dz = p2.position.z - p1.position.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance > 0) {
          const difference = (constraint.restLength - distance) / distance
          const translate = {
            x: dx * difference * constraint.stiffness * 0.5,
            y: dy * difference * constraint.stiffness * 0.5,
            z: dz * difference * constraint.stiffness * 0.5,
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

    // Collision detection with avatar
    this.avatarColliders.forEach((colliders) => {
      particles.forEach((particle) => {
        if (particle.pinned) return

        colliders.forEach((collider) => {
          if (collider.type === "sphere") {
            const dx = particle.position.x - collider.position.x
            const dy = particle.position.y - collider.position.y
            const dz = particle.position.z - collider.position.z
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

            if (distance < collider.radius) {
              const normal = {
                x: dx / distance,
                y: dy / distance,
                z: dz / distance,
              }
              particle.position.x = collider.position.x + normal.x * collider.radius
              particle.position.y = collider.position.y + normal.y * collider.radius
              particle.position.z = collider.position.z + normal.z * collider.radius
            }
          } else if (collider.type === "capsule") {
            // Simplified capsule collision (treat as sphere for now)
            const dx = particle.position.x - collider.position.x
            const dy = particle.position.y - collider.position.y
            const dz = particle.position.z - collider.position.z
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

            if (distance < collider.radius) {
              const normal = {
                x: dx / distance,
                y: dy / distance,
                z: dz / distance,
              }
              particle.position.x = collider.position.x + normal.x * collider.radius
              particle.position.y = collider.position.y + normal.y * collider.radius
              particle.position.z = collider.position.z + normal.z * collider.radius
            }
          }
        })
      })
    })
  }

  getClothVertices(clothId) {
    const clothData = this.clothMeshes.get(clothId)
    if (!clothData) return null

    try {
      const vertices = new Float32Array(clothData.particles.length * 3)
      clothData.particles.forEach((particle, index) => {
        vertices[index * 3] = particle.position.x
        vertices[index * 3 + 1] = particle.position.y
        vertices[index * 3 + 2] = particle.position.z
      })
      return vertices
    } catch (error) {
      console.error("❌ Failed to get cloth vertices:", error)
      return null
    }
  }

  setGravity(x, y, z) {
    this.gravity = { x, y, z }
    console.log(`🌍 Gravity set to: ${x}, ${y}, ${z}`)
  }

  setClothStiffness(clothId, stiffness) {
    const clothData = this.clothMeshes.get(clothId)
    if (!clothData) return

    try {
      clothData.constraints.forEach((constraint) => {
        if (constraint.type === "structural") {
          constraint.stiffness = stiffness
        } else if (constraint.type === "shear") {
          constraint.stiffness = stiffness * 0.75
        } else if (constraint.type === "bend") {
          constraint.stiffness = stiffness * 0.5
        }
      })
      console.log(`🧵 Cloth stiffness updated to: ${stiffness}`)
    } catch (error) {
      console.error("❌ Failed to set cloth stiffness:", error)
    }
  }

  removeCloth(clothId) {
    this.clothMeshes.delete(clothId)
    console.log(`🗑️ Cloth ${clothId} removed`)
  }

  cleanup() {
    this.clothMeshes.clear()
    this.avatarColliders.clear()
    this.particles = []
    this.constraints = []
    this.isInitialized = false
    console.log("✅ Simple Physics cleanup complete")
  }

  // Additional methods for debugging and status
  getPhysicsType() {
    return "Simple Physics (Verlet Integration)"
  }

  getDetailedStatus() {
    const totalParticles = Array.from(this.clothMeshes.values()).reduce((sum, cloth) => sum + cloth.particles.length, 0)
    const totalConstraints = Array.from(this.clothMeshes.values()).reduce(
      (sum, cloth) => sum + cloth.constraints.length,
      0,
    )

    return {
      engine: "Simple Physics",
      initialized: this.isInitialized,
      clothMeshes: this.clothMeshes.size,
      avatarColliders: this.avatarColliders.size,
      physicsDetails: {
        totalParticles,
        totalConstraints,
        gravity: this.gravity,
        damping: this.damping,
        timeStep: this.timeStep,
        constraintIterations: this.constraintIterations,
      },
    }
  }

  logFullStatus() {
    const status = this.getDetailedStatus()
    console.log("📊 Simple Physics Full Status:")
    console.log("   Engine:", status.engine)
    console.log("   Initialized:", status.initialized)
    console.log("   Cloth Meshes:", status.clothMeshes)
    console.log("   Avatar Colliders:", status.avatarColliders)
    console.log("   Total Particles:", status.physicsDetails.totalParticles)
    console.log("   Total Constraints:", status.physicsDetails.totalConstraints)
    console.log("   Gravity:", status.physicsDetails.gravity)
    console.log("   Damping:", status.physicsDetails.damping)
    console.log("   Time Step:", status.physicsDetails.timeStep)
    console.log("   Constraint Iterations:", status.physicsDetails.constraintIterations)

    // Log individual cloth details
    this.clothMeshes.forEach((clothData, clothId) => {
      console.log(`   Cloth ${clothId}:`)
      console.log(`     • Particles: ${clothData.particles.length}`)
      console.log(`     • Constraints: ${clothData.constraints.length}`)
      console.log(`     • Grid: ${clothData.gridWidth}x${clothData.gridHeight}`)
      console.log(`     • Size: ${clothData.physicalWidth}m x ${clothData.physicalHeight}m`)
    })
  }
}

// Export for use in main application
window.SimpleClothPhysics = SimpleClothPhysics
