// Simple Cloth Physics Engine
// Verlet integration-based cloth simulation with improved collision detection

class SimpleClothPhysics {
  constructor() {
    this.isInitialized = false
    this.clothMeshes = new Map()
    this.avatarColliders = new Map()
    this.gravity = { x: 0, y: -9.81, z: 0 }
    this.damping = 0.99
    this.simulationTime = 0
    this.collisionResponse = 0.8 // How much the cloth bounces off colliders
    this.friction = 0.3 // Friction when sliding on colliders
  }

  async initPhysicsWorld() {
    try {
      console.log("🔄 Initializing Simple Physics World with improved collision...")
      this.isInitialized = true
      console.log("✅ Simple Physics World initialized successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize Simple Physics World:", error)
      return false
    }
  }

  createAvatarCollider(position, size) {
    const colliderId = `collider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const collider = {
      id: colliderId,
      type: "box",
      position: { ...position },
      size: { ...size },
      active: true,
    }

    this.avatarColliders.set(colliderId, collider)
    console.log(
      `✅ Avatar collider created: ${colliderId} at (${position.x}, ${position.y}, ${position.z}) size (${size.x}, ${size.y}, ${size.z})`,
    )

    return colliderId
  }

  createClothFromGeometry(vertices, indices, startPosition) {
    const clothId = `cloth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create a T-shirt shaped cloth mesh
    const width = 16 // particles wide
    const height = 20 // particles tall
    const particles = []
    const constraints = []

    // Create particles in T-shirt shape
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const normalizedX = x / (width - 1) // 0 to 1
        const normalizedY = y / (height - 1) // 0 to 1

        // Create T-shirt shape (wider at shoulders, narrower at waist)
        let shapeMultiplier = 1.0
        if (normalizedY < 0.3) {
          // Shoulder area - wider
          shapeMultiplier = 1.2
        } else if (normalizedY < 0.6) {
          // Torso area - normal width
          shapeMultiplier = 1.0
        } else {
          // Lower area - slightly wider
          shapeMultiplier = 1.1
        }

        const particle = {
          position: {
            x: startPosition.x + (normalizedX - 0.5) * 1.0 * shapeMultiplier,
            y: startPosition.y - normalizedY * 1.2,
            z: startPosition.z + (Math.random() - 0.5) * 0.1,
          },
          oldPosition: {
            x: startPosition.x + (normalizedX - 0.5) * 1.0 * shapeMultiplier + (Math.random() - 0.5) * 0.02,
            y: startPosition.y - normalizedY * 1.2 + 0.05,
            z: startPosition.z + (Math.random() - 0.5) * 0.1,
          },
          pinned: false,
          gridX: x,
          gridY: y,
          mass: 1.0,
          velocity: { x: 0, y: 0, z: 0 },
        }

        // Pin top corners and some top edge particles
        if (
          y === 0 &&
          (x === 0 || x === width - 1 || x === Math.floor(width / 3) || x === Math.floor((2 * width) / 3))
        ) {
          particle.pinned = true
        }

        particles.push(particle)
      }
    }

    // Create constraints (springs between particles)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x

        // Horizontal constraints
        if (x < width - 1) {
          const restLength = 1.0 / (width - 1)
          constraints.push({
            p1: index,
            p2: index + 1,
            restLength: restLength,
            stiffness: 0.8,
          })
        }

        // Vertical constraints
        if (y < height - 1) {
          const restLength = 1.2 / (height - 1)
          constraints.push({
            p1: index,
            p2: index + width,
            restLength: restLength,
            stiffness: 0.8,
          })
        }

        // Diagonal constraints for stability
        if (x < width - 1 && y < height - 1) {
          const restLength = Math.sqrt(2) / Math.max(width - 1, height - 1)
          constraints.push({
            p1: index,
            p2: index + width + 1,
            restLength: restLength,
            stiffness: 0.4,
          })
        }

        if (x > 0 && y < height - 1) {
          const restLength = Math.sqrt(2) / Math.max(width - 1, height - 1)
          constraints.push({
            p1: index,
            p2: index + width - 1,
            restLength: restLength,
            stiffness: 0.4,
          })
        }
      }
    }

    const clothMesh = {
      id: clothId,
      particles: particles,
      constraints: constraints,
      width: width,
      height: height,
      lastUpdate: Date.now(),
    }

    this.clothMeshes.set(clothId, clothMesh)

    console.log(
      `✅ Cloth mesh created: ${clothId} with ${particles.length} particles and ${constraints.length} constraints`,
    )

    return { id: clothId, particleCount: particles.length, constraintCount: constraints.length }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized) return

    const dt = Math.min(deltaTime, 1 / 60) // Cap deltaTime
    this.simulationTime += dt

    // Update each cloth mesh
    this.clothMeshes.forEach((clothMesh, clothId) => {
      this.updateClothMesh(clothMesh, dt)
    })
  }

  updateClothMesh(clothMesh, deltaTime) {
    const { particles, constraints } = clothMesh

    // Apply forces (gravity, wind, etc.)
    particles.forEach((particle) => {
      if (particle.pinned) return

      // Calculate velocity
      particle.velocity.x = (particle.position.x - particle.oldPosition.x) / deltaTime
      particle.velocity.y = (particle.position.y - particle.oldPosition.y) / deltaTime
      particle.velocity.z = (particle.position.z - particle.oldPosition.z) / deltaTime

      // Store old position
      const oldPos = { ...particle.position }

      // Apply gravity
      particle.position.x += particle.velocity.x * deltaTime
      particle.position.y += particle.velocity.y * deltaTime + this.gravity.y * deltaTime * deltaTime
      particle.position.z += particle.velocity.z * deltaTime

      // Apply damping
      particle.position.x = particle.position.x * this.damping + particle.oldPosition.x * (1 - this.damping)
      particle.position.z = particle.position.z * this.damping + particle.oldPosition.z * (1 - this.damping)

      // Update old position
      particle.oldPosition = oldPos
    })

    // Satisfy constraints (multiple iterations for stability)
    for (let iteration = 0; iteration < 3; iteration++) {
      constraints.forEach((constraint) => {
        const p1 = particles[constraint.p1]
        const p2 = particles[constraint.p2]

        if (p1.pinned && p2.pinned) return

        const dx = p2.position.x - p1.position.x
        const dy = p2.position.y - p1.position.y
        const dz = p2.position.z - p1.position.z

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (distance === 0) return

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
      })
    }

    // Handle collisions with avatar
    particles.forEach((particle) => {
      if (particle.pinned) return

      this.handleParticleCollisions(particle)
    })
  }

  handleParticleCollisions(particle) {
    this.avatarColliders.forEach((collider) => {
      if (!collider.active) return

      // Check collision with box collider
      if (collider.type === "box") {
        const dx = particle.position.x - collider.position.x
        const dy = particle.position.y - collider.position.y
        const dz = particle.position.z - collider.position.z

        // Check if particle is inside the collider
        if (Math.abs(dx) < collider.size.x && Math.abs(dy) < collider.size.y && Math.abs(dz) < collider.size.z) {
          // Find the closest face and push particle out
          const penetrationX = collider.size.x - Math.abs(dx)
          const penetrationY = collider.size.y - Math.abs(dy)
          const penetrationZ = collider.size.z - Math.abs(dz)

          // Find minimum penetration (closest face)
          const minPenetration = Math.min(penetrationX, penetrationY, penetrationZ)

          if (minPenetration === penetrationX) {
            // Push out along X axis
            const direction = dx > 0 ? 1 : -1
            particle.position.x = collider.position.x + direction * collider.size.x
            particle.velocity.x *= -this.collisionResponse
            particle.velocity.x *= 1 - this.friction // Apply friction
          } else if (minPenetration === penetrationY) {
            // Push out along Y axis
            const direction = dy > 0 ? 1 : -1
            particle.position.y = collider.position.y + direction * collider.size.y
            particle.velocity.y *= -this.collisionResponse
            particle.velocity.x *= 1 - this.friction // Apply friction
            particle.velocity.z *= 1 - this.friction // Apply friction
          } else {
            // Push out along Z axis
            const direction = dz > 0 ? 1 : -1
            particle.position.z = collider.position.z + direction * collider.size.z
            particle.velocity.z *= -this.collisionResponse
            particle.velocity.x *= 1 - this.friction // Apply friction
          }

          // Update old position to prevent jittering
          particle.oldPosition.x = particle.position.x - particle.velocity.x * 0.016
          particle.oldPosition.y = particle.position.y - particle.velocity.y * 0.016
          particle.oldPosition.z = particle.position.z - particle.velocity.z * 0.016
        }
      }
    })
  }

  getClothVertices(clothId) {
    const clothMesh = this.clothMeshes.get(clothId)
    if (!clothMesh) return null

    const vertices = []
    clothMesh.particles.forEach((particle) => {
      vertices.push(particle.position.x, particle.position.y, particle.position.z)
    })

    return vertices
  }

  setGravity(x, y, z) {
    this.gravity = { x, y, z }
    console.log(`🌍 Gravity set to: (${x}, ${y}, ${z})`)
  }

  setClothStiffness(clothId, stiffness) {
    const clothMesh = this.clothMeshes.get(clothId)
    if (!clothMesh) return

    clothMesh.constraints.forEach((constraint) => {
      constraint.stiffness = stiffness
    })

    console.log(`🧵 Cloth stiffness set to: ${stiffness}`)
  }

  getPhysicsType() {
    return "Simple Verlet Integration with Improved Collision"
  }

  getDetailedStatus() {
    return {
      engine: "Simple Physics",
      initialized: this.isInitialized,
      clothMeshes: this.clothMeshes.size,
      avatarColliders: this.avatarColliders.size,
      physicsDetails: {
        totalParticles: Array.from(this.clothMeshes.values()).reduce((sum, cloth) => sum + cloth.particles.length, 0),
        totalConstraints: Array.from(this.clothMeshes.values()).reduce(
          (sum, cloth) => sum + cloth.constraints.length,
          0,
        ),
        simulationTime: this.simulationTime.toFixed(2),
      },
    }
  }

  logFullStatus() {
    console.log("📊 Simple Physics Engine Full Status:")
    console.log(`   Initialized: ${this.isInitialized}`)
    console.log(`   Cloth Meshes: ${this.clothMeshes.size}`)
    console.log(`   Avatar Colliders: ${this.avatarColliders.size}`)
    console.log(`   Gravity: (${this.gravity.x}, ${this.gravity.y}, ${this.gravity.z})`)
    console.log(`   Simulation Time: ${this.simulationTime.toFixed(2)}s`)
    console.log(`   Collision Response: ${this.collisionResponse}`)
    console.log(`   Friction: ${this.friction}`)

    // Log collider details
    this.avatarColliders.forEach((collider, id) => {
      console.log(
        `   Collider ${id}: pos(${collider.position.x}, ${collider.position.y}, ${collider.position.z}) size(${collider.size.x}, ${collider.size.y}, ${collider.size.z})`,
      )
    })

    // Log cloth details
    this.clothMeshes.forEach((cloth, id) => {
      console.log(`   Cloth ${id}: ${cloth.particles.length} particles, ${cloth.constraints.length} constraints`)
    })
  }

  cleanup() {
    this.clothMeshes.clear()
    this.avatarColliders.clear()
    this.isInitialized = false
    console.log("✅ Simple Physics cleanup complete")
  }
}

// Export for use in main application
window.SimpleClothPhysics = SimpleClothPhysics
