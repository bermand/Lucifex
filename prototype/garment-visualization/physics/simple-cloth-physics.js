// Simple Cloth Physics Engine
// Uses Verlet integration for realistic cloth simulation without external dependencies

class SimpleClothPhysics {
  constructor() {
    this.particles = []
    this.constraints = []
    this.isInitialized = false
    this.isRunning = false
    this.clothIdCounter = 0
    this.clothMeshes = new Map()
    this.avatarColliders = new Map()
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.99 // Updated damping value
    this.timeStep = 1 / 60
    this.iterations = 3 // Updated constraint iterations
    this.simulationTime = 0

    console.log("🧬 SimpleClothPhysics initialized")
  }

  async initialize() {
    try {
      this.isInitialized = true
      console.log("✅ SimpleClothPhysics ready")
      return true
    } catch (error) {
      console.error("❌ SimpleClothPhysics initialization failed:", error)
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
          position: { x: position.x, y: position.y + 0.8, z: position.z },
          radius: 0.15,
        },
        // Neck
        {
          type: "sphere",
          position: { x: position.x, y: position.y + 0.6, z: position.z },
          radius: 0.08,
        },
        // Upper chest
        {
          type: "sphere",
          position: { x: position.x, y: position.y + 0.4, z: position.z },
          radius: scale.x * 0.9,
        },
        // Mid chest
        {
          type: "sphere",
          position: { x: position.x, y: position.y + 0.2, z: position.z },
          radius: scale.x * 0.85,
        },
        // Lower chest
        {
          type: "sphere",
          position: { x: position.x, y: position.y, z: position.z },
          radius: scale.x * 0.8,
        },
        // Upper abdomen
        {
          type: "sphere",
          position: { x: position.x, y: position.y - 0.2, z: position.z },
          radius: scale.x * 0.75,
        },
        // Lower abdomen
        {
          type: "sphere",
          position: { x: position.x, y: position.y - 0.4, z: position.z },
          radius: scale.x * 0.7,
        },
        // Left shoulder
        {
          type: "sphere",
          position: { x: position.x - 0.25, y: position.y + 0.3, z: position.z },
          radius: 0.12,
        },
        // Right shoulder
        {
          type: "sphere",
          position: { x: position.x + 0.25, y: position.y + 0.3, z: position.z },
          radius: 0.12,
        },
        // Left arm upper
        {
          type: "sphere",
          position: { x: position.x - 0.35, y: position.y + 0.1, z: position.z },
          radius: 0.08,
        },
        // Right arm upper
        {
          type: "sphere",
          position: { x: position.x + 0.35, y: position.y + 0.1, z: position.z },
          radius: 0.08,
        },
        // Left arm lower
        {
          type: "sphere",
          position: { x: position.x - 0.4, y: position.y - 0.15, z: position.z },
          radius: 0.07,
        },
        // Right arm lower
        {
          type: "sphere",
          position: { x: position.x + 0.4, y: position.y - 0.15, z: position.z },
          radius: 0.07,
        },
      ]

      const colliderId = `avatar_${Date.now()}`
      this.avatarColliders.set(colliderId, colliders)

      console.log("✅ Enhanced avatar collider created with", colliders.length, "collision spheres")
      return colliderId
    } catch (error) {
      console.error("❌ Failed to create avatar collider:", error)
      return null
    }
  }

  createClothFromGeometry(vertices, indices, position = { x: 0, y: 1.5, z: 0 }) {
    if (!this.isInitialized) {
      console.error("❌ Simple Physics not initialized")
      return null
    }

    try {
      console.log("🔄 Creating Simple Physics cloth body with improved draping...")

      // Create a more realistic t-shirt shaped cloth
      const clothWidth = 20 // More particles for better draping
      const clothHeight = 24 // More particles for better draping
      const clothParticles = []
      const clothConstraints = []

      // Physical dimensions
      const physicalWidth = 1.2 // Slightly wider
      const physicalHeight = 1.4 // Slightly longer
      const spacing = physicalWidth / (clothWidth - 1)

      // Start higher up so gravity has more effect
      const startY = position.y + 2.0 // Even higher starting position for better fall effect

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
          if (y > 16) {
            const taperAmount = (y - 16) * 0.1
            const minX = Math.floor(taperAmount)
            const maxX = clothWidth - 1 - Math.floor(taperAmount)
            if (x < minX || x > maxX) {
              shouldCreateParticle = false
            }
          }

          if (shouldCreateParticle) {
            // Add initial random velocity for natural movement
            const randomVelX = (Math.random() - 0.5) * 0.1
            const randomVelY = (Math.random() - 0.5) * 0.1
            const randomVelZ = (Math.random() - 0.5) * 0.1

            const particle = {
              id: clothParticles.length,
              position: {
                x: position.x + (normalizedX - 0.5) * physicalWidth,
                y: startY - normalizedY * physicalHeight,
                z: position.z + (Math.random() - 0.5) * 0.1,
              },
              oldPosition: {
                x: position.x + (normalizedX - 0.5) * physicalWidth + randomVelX,
                y: startY - normalizedY * physicalHeight + randomVelY,
                z: position.z + randomVelZ,
              },
              pinned: y === 0 && (x === 3 || x === clothWidth - 4), // Pin shoulder points
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
                stiffness: 0.8, // Increased stiffness for better shape retention
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
                stiffness: 0.8, // Increased stiffness for better shape retention
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
                stiffness: 0.4, // Moderate shear stiffness
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
                stiffness: 0.4, // Moderate shear stiffness
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
                stiffness: 0.2, // Moderate bend stiffness
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
                stiffness: 0.2, // Moderate bend stiffness
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

      console.log(`✅ Enhanced t-shirt cloth created:`)
      console.log(`   • Cloth ID: ${clothId}`)
      console.log(`   • Particles: ${clothParticles.length}`)
      console.log(`   • Constraints: ${clothConstraints.length}`)
      console.log(`   • Grid: ${clothWidth}x${clothHeight}`)
      console.log(`   • Physical size: ${physicalWidth}m x ${physicalHeight}m`)
      console.log(`   • Start position: Y=${startY}m (should drape on avatar)`)
      console.log(`   • Pinned particles: ${clothParticles.filter((p) => p.pinned).length}`)

      return { id: clothId, particles: clothParticles, constraints: clothConstraints }
    } catch (error) {
      console.error("❌ Failed to create Simple Physics cloth body:", error)
      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized || !this.isRunning) return

    try {
      const dt = Math.min(deltaTime, this.timeStep)
      this.simulationTime += dt

      // Update all cloth meshes
      this.clothMeshes.forEach((clothData) => {
        this.updateClothPhysics(clothData, dt)
      })

      // Log movement every few seconds for debugging
      if (Math.floor(this.simulationTime) % 3 === 0 && this.simulationTime % 1 < dt) {
        this.logMovementDebug()
      }
    } catch (error) {
      console.error("❌ Physics update error:", error)
    }
  }

  updateClothPhysics(clothData, deltaTime) {
    const { particles, constraints } = clothData

    // Apply forces (gravity and wind)
    particles.forEach((particle, index) => {
      if (!particle.pinned) {
        // Add stronger wind force for more dramatic movement
        const windForce = {
          x: Math.sin(this.simulationTime * 2 + index * 0.1) * 1.0, // Increased from 0.5
          y: Math.sin(this.simulationTime * 1.5) * 0.2, // Increased from 0.1
          z: Math.cos(this.simulationTime * 2.2 + index * 0.12) * 0.6, // Increased from 0.3
        }

        const acceleration = {
          x: this.gravity.x + windForce.x,
          y: this.gravity.y + windForce.y,
          z: this.gravity.z + windForce.z,
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

    // Satisfy constraints with more iterations for better collision
    for (let iteration = 0; iteration < this.iterations; iteration++) {
      constraints.forEach((constraint) => {
        const p1 = particles[constraint.p1]
        const p2 = particles[constraint.p2]

        if (!p1 || !p2) return

        const dx = p2.position.x - p1.position.x
        const dy = p2.position.y - p1.position.y
        const dz = p2.position.z - p1.position.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance > 0) {
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
      })
    }

    // Enhanced collision detection with avatar
    this.avatarColliders.forEach((colliders) => {
      particles.forEach((particle) => {
        if (particle.pinned) return

        colliders.forEach((collider) => {
          if (collider.type === "sphere") {
            const dx = particle.position.x - collider.position.x
            const dy = particle.position.y - collider.position.y
            const dz = particle.position.z - collider.position.z
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

            const collisionDistance = collider.radius + 0.05 // Larger buffer for better draping

            if (distance < collisionDistance) {
              const normal = {
                x: distance > 0 ? dx / distance : 0,
                y: distance > 0 ? dy / distance : 1,
                z: distance > 0 ? dz / distance : 0,
              }

              // Push particle out of collision
              const pushOut = collisionDistance
              particle.position.x = collider.position.x + normal.x * pushOut
              particle.position.y = collider.position.y + normal.y * pushOut
              particle.position.z = collider.position.z + normal.z * pushOut

              // Add friction and damping for realistic draping
              const friction = 0.8
              particle.oldPosition.x = particle.position.x + normal.x * 0.02 * friction
              particle.oldPosition.y = particle.position.y + normal.y * 0.02 * friction
              particle.oldPosition.z = particle.position.z + normal.z * 0.02 * friction

              // Log collision for debugging
              if (Math.random() < 0.001) {
                // Log occasionally
                console.log(
                  `🎯 Collision detected: particle at (${particle.position.x.toFixed(2)}, ${particle.position.y.toFixed(2)}, ${particle.position.z.toFixed(2)}) with collider at (${collider.position.x.toFixed(2)}, ${collider.position.y.toFixed(2)}, ${collider.position.z.toFixed(2)})`,
                )
              }
            }
          }
        })
      })
    })
  }

  logMovementDebug() {
    this.clothMeshes.forEach((clothData, clothId) => {
      const { particles } = clothData

      let totalVelocity = 0
      let maxVelocity = 0
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      let collisionCount = 0

      particles.forEach((particle) => {
        const velX = particle.position.x - particle.oldPosition.x
        const velY = particle.position.y - particle.oldPosition.y
        const velZ = particle.position.z - particle.oldPosition.z
        const velocity = Math.sqrt(velX * velX + velY * velY + velZ * velZ)

        totalVelocity += velocity
        maxVelocity = Math.max(maxVelocity, velocity)
        minY = Math.min(minY, particle.position.y)
        maxY = Math.max(maxY, particle.position.y)

        // Check if particle is likely colliding (low Y position)
        if (particle.position.y < 0.5) {
          collisionCount++
        }
      })

      const avgVelocity = totalVelocity / particles.length

      console.log(`🔍 Enhanced Movement Debug for ${clothId}:`)
      console.log(`   • Average velocity: ${avgVelocity.toFixed(6)}m/frame`)
      console.log(`   • Max velocity: ${maxVelocity.toFixed(6)}m/frame`)
      console.log(`   • Y range: ${minY.toFixed(3)}m to ${maxY.toFixed(3)}m`)
      console.log(`   • Particles likely colliding: ${collisionCount}/${particles.length}`)
      console.log(`   • Simulation time: ${this.simulationTime.toFixed(1)}s`)
      console.log(`   • Gravity: ${this.gravity.y}m/s²`)
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
          constraint.stiffness = stiffness * 0.8 // Keep structural strong
        } else if (constraint.type === "shear") {
          constraint.stiffness = stiffness * 0.4 // Moderate shear
        } else if (constraint.type === "bend") {
          constraint.stiffness = stiffness * 0.2 // Flexible bending
        }
      })
      console.log(`🧵 Enhanced cloth stiffness updated to: ${stiffness}`)
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
    this.isRunning = false
    this.simulationTime = 0
    console.log("✅ Enhanced Simple Physics cleanup complete")
  }

  // Additional methods for debugging and status
  getPhysicsType() {
    return "Enhanced Simple Physics (Verlet Integration with Improved Collision)"
  }

  getDetailedStatus() {
    const totalParticles = Array.from(this.clothMeshes.values()).reduce((sum, cloth) => sum + cloth.particles.length, 0)
    const totalConstraints = Array.from(this.clothMeshes.values()).reduce(
      (sum, cloth) => sum + cloth.constraints.length,
      0,
    )

    return {
      engine: "Enhanced Simple Physics",
      initialized: this.isInitialized,
      running: this.isRunning,
      clothMeshes: this.clothMeshes.size,
      avatarColliders: this.avatarColliders.size,
      simulationTime: this.simulationTime,
      physicsDetails: {
        totalParticles,
        totalConstraints,
        gravity: this.gravity,
        damping: this.damping,
        timeStep: this.timeStep,
        iterations: this.iterations,
      },
    }
  }

  logFullStatus() {
    const status = this.getDetailedStatus()
    console.log("📊 Enhanced Simple Physics Full Status:")
    console.log("   Engine:", status.engine)
    console.log("   Initialized:", status.initialized)
    console.log("   Running:", status.running)
    console.log("   Simulation Time:", status.simulationTime.toFixed(1) + "s")
    console.log("   Cloth Meshes:", status.clothMeshes)
    console.log("   Avatar Colliders:", status.avatarColliders)
    console.log("   Total Particles:", status.physicsDetails.totalParticles)
    console.log("   Total Constraints:", status.physicsDetails.totalConstraints)
    console.log("   Gravity:", status.physicsDetails.gravity)
    console.log("   Damping:", status.physicsDetails.damping)
    console.log("   Time Step:", status.physicsDetails.timeStep)
    console.log("   Iterations:", status.physicsDetails.iterations)

    // Log individual cloth details
    this.clothMeshes.forEach((clothData, clothId) => {
      const pinnedCount = clothData.particles.filter((p) => p.pinned).length
      console.log(`   Cloth ${clothId}:`)
      console.log(`     • Particles: ${clothData.particles.length} (${pinnedCount} pinned)`)
      console.log(`     • Constraints: ${clothData.constraints.length}`)
      console.log(`     • Grid: ${clothData.gridWidth}x${clothData.gridHeight}`)
      console.log(`     • Size: ${clothData.physicalWidth}m x ${clothData.physicalHeight}m`)
    })

    // Log avatar collider details
    this.avatarColliders.forEach((colliders, colliderId) => {
      console.log(`   Avatar Collider ${colliderId}:`)
      console.log(`     • Collision spheres: ${colliders.length}`)
      colliders.forEach((collider, index) => {
        console.log(
          `     • Sphere ${index}: pos(${collider.position.x.toFixed(2)}, ${collider.position.y.toFixed(2)}, ${collider.position.z.toFixed(2)}) radius=${collider.radius.toFixed(2)}`,
        )
      })
    })
  }

  start() {
    this.isRunning = true
    console.log("▶️ SimpleClothPhysics started")
  }

  stop() {
    this.isRunning = false
    console.log("⏹️ SimpleClothPhysics stopped")
  }

  reset() {
    this.stop()
    // Reset would reinitialize particles
    console.log("🔄 SimpleClothPhysics reset")
  }

  getParticles() {
    return this.particles
  }

  getConstraints() {
    return this.constraints
  }

  updateSettings(settings) {
    if (settings.gravity !== undefined) this.gravity.y = -settings.gravity
    if (settings.stiffness !== undefined) this.damping = settings.stiffness
    console.log("🔧 SimpleClothPhysics settings updated")
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      particleCount: this.particles.length,
      constraintCount: this.constraints.length,
    }
  }

  setMeshUpdater(meshUpdater) {
    this.meshUpdater = meshUpdater
    console.log("🔗 Mesh updater connected")
  }

  resetClothPosition() {
    this.reset()
    this.start()
  }
}

// Export for global use
window.SimpleClothPhysics = SimpleClothPhysics
console.log("✅ SimpleClothPhysics class loaded")
