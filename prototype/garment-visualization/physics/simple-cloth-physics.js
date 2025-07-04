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
    this.damping = 0.995 // Reduced damping for more movement
    this.timeStep = 1 / 60
    this.constraintIterations = 2 // Reduced for more flexibility
    this.windForce = { x: 0, y: 0, z: 0 }
    this.windEnabled = true
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
      const clothWidth = 16 // Reduced for better performance
      const clothHeight = 20 // Reduced for better performance
      const clothParticles = []
      const clothConstraints = []

      // Physical dimensions
      const physicalWidth = 1.0 // meters
      const physicalHeight = 1.2 // meters
      const spacing = physicalWidth / (clothWidth - 1)

      // Create particles in t-shirt shape
      for (let y = 0; y < clothHeight; y++) {
        for (let x = 0; x < clothWidth; x++) {
          const normalizedY = y / (clothHeight - 1)
          const normalizedX = x / (clothWidth - 1)

          // Create t-shirt silhouette
          let shouldCreateParticle = true

          // Neck opening (top center)
          if (y < 2 && x > 6 && x < 10) {
            shouldCreateParticle = false
          }

          // Armholes (sides, upper portion)
          if (y < 6) {
            const armholeWidth = Math.max(0, 2 - y * 0.3)
            if (x < armholeWidth || x >= clothWidth - armholeWidth) {
              shouldCreateParticle = false
            }
          }

          // Body tapering (make it more fitted)
          if (y > 12) {
            const taperAmount = (y - 12) * 0.1
            const minX = Math.floor(taperAmount)
            const maxX = clothWidth - 1 - Math.floor(taperAmount)
            if (x < minX || x > maxX) {
              shouldCreateParticle = false
            }
          }

          if (shouldCreateParticle) {
            // Add some initial random disturbance to break symmetry
            const randomX = (Math.random() - 0.5) * 0.02
            const randomY = (Math.random() - 0.5) * 0.02
            const randomZ = (Math.random() - 0.5) * 0.02

            const particle = {
              id: clothParticles.length,
              position: {
                x: position.x + (normalizedX - 0.5) * physicalWidth + randomX,
                y: position.y - normalizedY * physicalHeight + randomY,
                z: position.z + randomZ,
              },
              oldPosition: {
                x: position.x + (normalizedX - 0.5) * physicalWidth + randomX,
                y: position.y - normalizedY * physicalHeight + randomY,
                z: position.z + randomZ,
              },
              // Only pin specific shoulder points, not entire top row
              pinned: y === 0 && (x === 3 || x === clothWidth - 4), // Only pin shoulder points
              mass: 1.0,
              gridX: x,
              gridY: y,
              // Add initial velocity for movement
              velocity: {
                x: (Math.random() - 0.5) * 0.1,
                y: (Math.random() - 0.5) * 0.1,
                z: (Math.random() - 0.5) * 0.1,
              },
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
                stiffness: 0.9, // Increased stiffness
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
                stiffness: 0.9, // Increased stiffness
              })
            }
          }

          // Diagonal constraints (shear) - reduced for more flexibility
          if (x < clothWidth - 1 && y < clothHeight - 1) {
            const diagParticle = getParticleAt(x + 1, y + 1)
            if (diagParticle) {
              clothConstraints.push({
                type: "shear",
                p1: particle.id,
                p2: diagParticle.id,
                restLength: spacing * Math.sqrt(2),
                stiffness: 0.7, // Increased stiffness
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
                stiffness: 0.7, // Increased stiffness
              })
            }
          }

          // Bend constraints (skip one particle) - reduced for more flexibility
          if (x < clothWidth - 2) {
            const bendParticle = getParticleAt(x + 2, y)
            if (bendParticle) {
              clothConstraints.push({
                type: "bend",
                p1: particle.id,
                p2: bendParticle.id,
                restLength: spacing * 2,
                stiffness: 0.4, // Increased stiffness
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
                stiffness: 0.4, // Increased stiffness
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

      // Start wind simulation
      this.startWindSimulation()

      console.log(`✅ Simple Physics t-shirt cloth created:`)
      console.log(`   • Cloth ID: ${clothId}`)
      console.log(`   • Particles: ${clothParticles.length}`)
      console.log(`   • Constraints: ${clothConstraints.length}`)
      console.log(`   • Grid: ${clothWidth}x${clothHeight}`)
      console.log(`   • Physical size: ${physicalWidth}m x ${physicalHeight}m`)
      console.log(`   • Pinned particles: ${clothParticles.filter((p) => p.pinned).length}`)

      return { id: clothId, particles: clothParticles, constraints: clothConstraints }
    } catch (error) {
      console.error("❌ Failed to create Simple Physics cloth body:", error)
      return null
    }
  }

  startWindSimulation() {
    // Create gentle wind oscillation
    setInterval(() => {
      if (this.windEnabled) {
        const time = Date.now() * 0.001
        this.windForce = {
          x: Math.sin(time * 0.5) * 2.0 + Math.sin(time * 1.3) * 0.5,
          y: Math.sin(time * 0.3) * 0.5,
          z: Math.cos(time * 0.7) * 1.0 + Math.cos(time * 1.1) * 0.3,
        }
      }
    }, 50) // Update wind every 50ms
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

    // Apply forces (gravity + wind)
    particles.forEach((particle) => {
      if (!particle.pinned) {
        const totalForce = {
          x: this.gravity.x + this.windForce.x,
          y: this.gravity.y + this.windForce.y,
          z: this.gravity.z + this.windForce.z,
        }

        // Verlet integration with explicit velocity tracking
        const newX =
          particle.position.x +
          (particle.position.x - particle.oldPosition.x) * this.damping +
          totalForce.x * deltaTime * deltaTime

        const newY =
          particle.position.y +
          (particle.position.y - particle.oldPosition.y) * this.damping +
          totalForce.y * deltaTime * deltaTime

        const newZ =
          particle.position.z +
          (particle.position.z - particle.oldPosition.z) * this.damping +
          totalForce.z * deltaTime * deltaTime

        // Store old position
        particle.oldPosition.x = particle.position.x
        particle.oldPosition.y = particle.position.y
        particle.oldPosition.z = particle.position.z

        // Update position
        particle.position.x = newX
        particle.position.y = newY
        particle.position.z = newZ

        // Update velocity for debugging
        particle.velocity = {
          x: (particle.position.x - particle.oldPosition.x) / deltaTime,
          y: (particle.position.y - particle.oldPosition.y) / deltaTime,
          z: (particle.position.z - particle.oldPosition.z) / deltaTime,
        }
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

        if (distance > 0.001) {
          // Avoid division by zero
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

            if (distance < collider.radius + 0.01) {
              // Add small buffer
              const normal = {
                x: dx / (distance || 0.001),
                y: dy / (distance || 0.001),
                z: dz / (distance || 0.001),
              }
              const pushDistance = collider.radius + 0.01 - distance
              particle.position.x += normal.x * pushDistance
              particle.position.y += normal.y * pushDistance
              particle.position.z += normal.z * pushDistance
            }
          } else if (collider.type === "capsule") {
            // Simplified capsule collision (treat as sphere for now)
            const dx = particle.position.x - collider.position.x
            const dy = particle.position.y - collider.position.y
            const dz = particle.position.z - collider.position.z
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

            if (distance < collider.radius + 0.01) {
              // Add small buffer
              const normal = {
                x: dx / (distance || 0.001),
                y: dy / (distance || 0.001),
                z: dz / (distance || 0.001),
              }
              const pushDistance = collider.radius + 0.01 - distance
              particle.position.x += normal.x * pushDistance
              particle.position.y += normal.y * pushDistance
              particle.position.z += normal.z * pushDistance
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
          constraint.stiffness = stiffness * 0.8
        } else if (constraint.type === "bend") {
          constraint.stiffness = stiffness * 0.5
        }
      })
      console.log(`🧵 Cloth stiffness updated to: ${stiffness}`)
    } catch (error) {
      console.error("❌ Failed to set cloth stiffness:", error)
    }
  }

  setWindForce(x, y, z) {
    this.windForce = { x, y, z }
    console.log(`💨 Wind force set to: ${x}, ${y}, ${z}`)
  }

  enableWind(enabled) {
    this.windEnabled = enabled
    if (!enabled) {
      this.windForce = { x: 0, y: 0, z: 0 }
    }
    console.log(`💨 Wind ${enabled ? "enabled" : "disabled"}`)
  }

  // Add method to disturb cloth for testing
  disturbCloth(clothId, force = 5.0) {
    const clothData = this.clothMeshes.get(clothId)
    if (!clothData) return

    // Add random disturbance to non-pinned particles
    clothData.particles.forEach((particle) => {
      if (!particle.pinned && Math.random() < 0.3) {
        // 30% of particles
        particle.position.x += (Math.random() - 0.5) * force * 0.1
        particle.position.y += (Math.random() - 0.5) * force * 0.1
        particle.position.z += (Math.random() - 0.5) * force * 0.1
      }
    })

    console.log(`🌪️ Cloth disturbed with force: ${force}`)
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
    this.windEnabled = false
    console.log("✅ Simple Physics cleanup complete")
  }

  // Additional methods for debugging and status
  getPhysicsType() {
    return "Simple Physics (Verlet Integration + Wind)"
  }

  getDetailedStatus() {
    const totalParticles = Array.from(this.clothMeshes.values()).reduce((sum, cloth) => sum + cloth.particles.length, 0)
    const totalConstraints = Array.from(this.clothMeshes.values()).reduce(
      (sum, cloth) => sum + cloth.constraints.length,
      0,
    )

    // Calculate average velocity for movement detection
    let totalVelocity = 0
    let velocityCount = 0
    this.clothMeshes.forEach((clothData) => {
      clothData.particles.forEach((particle) => {
        if (particle.velocity && !particle.pinned) {
          const speed = Math.sqrt(
            particle.velocity.x * particle.velocity.x +
              particle.velocity.y * particle.velocity.y +
              particle.velocity.z * particle.velocity.z,
          )
          totalVelocity += speed
          velocityCount++
        }
      })
    })

    const averageVelocity = velocityCount > 0 ? totalVelocity / velocityCount : 0

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
        windForce: this.windForce,
        windEnabled: this.windEnabled,
        averageVelocity: averageVelocity.toFixed(4),
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
    console.log("   Wind Force:", status.physicsDetails.windForce)
    console.log("   Wind Enabled:", status.physicsDetails.windEnabled)
    console.log("   Average Velocity:", status.physicsDetails.averageVelocity, "m/s")

    // Log individual cloth details
    this.clothMeshes.forEach((clothData, clothId) => {
      const pinnedCount = clothData.particles.filter((p) => p.pinned).length
      const freeCount = clothData.particles.length - pinnedCount

      console.log(`   Cloth ${clothId}:`)
      console.log(`     • Particles: ${clothData.particles.length} (${pinnedCount} pinned, ${freeCount} free)`)
      console.log(`     • Constraints: ${clothData.constraints.length}`)
      console.log(`     • Grid: ${clothData.gridWidth}x${clothData.gridHeight}`)
      console.log(`     • Size: ${clothData.physicalWidth}m x ${clothData.physicalHeight}m`)
    })
  }
}

// Export for use in main application
window.SimpleClothPhysics = SimpleClothPhysics
