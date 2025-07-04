// Ammo.js Physics Engine Initialization
// Handles loading and initializing the Ammo.js physics library

// Import Ammo.js library
const Ammo = require("ammo.js")

class AmmoPhysics {
  constructor() {
    this.AmmoLib = null
    this.world = null
    this.isInitialized = false
    this.clothBodies = new Map()
    this.avatarColliders = new Map()
    this.clothIdCounter = 0
  }

  async initPhysicsWorld() {
    try {
      console.log("🔄 Attempting to initialize Ammo.js...")

      // Check if Ammo is available
      if (typeof Ammo === "undefined") {
        console.log("⚠️ Ammo.js not available, skipping...")
        return false
      }

      // Initialize Ammo
      await Ammo()

      // Create collision configuration
      const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
      const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
      const overlappingPairCache = new Ammo.btDbvtBroadphase()
      const solver = new Ammo.btSequentialImpulseConstraintSolver()

      // Create dynamics world
      this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration)

      // Set gravity
      this.world.setGravity(new Ammo.btVector3(0, -9.81, 0))

      this.isInitialized = true
      console.log("✅ Ammo.js physics world initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize Ammo.js:", error)
      return false
    }
  }

  createAvatarCollider(position, scale) {
    if (!this.isInitialized) return null

    try {
      // Create capsule shape for avatar
      const shape = new Ammo.btCapsuleShape(scale.x, scale.y)

      // Create motion state
      const transform = new Ammo.btTransform()
      transform.setIdentity()
      transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z))

      const motionState = new Ammo.btDefaultMotionState(transform)

      // Create rigid body (static)
      const mass = 0 // Static body
      const localInertia = new Ammo.btVector3(0, 0, 0)

      const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)

      const body = new Ammo.btRigidBody(rbInfo)
      this.world.addRigidBody(body)

      const colliderId = `avatar_${Date.now()}`
      this.avatarColliders.set(colliderId, body)

      console.log("✅ Ammo.js avatar collider created")
      return colliderId
    } catch (error) {
      console.error("❌ Failed to create Ammo.js avatar collider:", error)
      return null
    }
  }

  createClothFromGeometry(vertices, indices, position) {
    if (!this.isInitialized) return null

    try {
      console.log("🔄 Creating Ammo.js cloth body...")

      // Create soft body world info
      const softBodyWorldInfo = new Ammo.btSoftBodyWorldInfo()
      softBodyWorldInfo.set_m_gravity(new Ammo.btVector3(0, -9.81, 0))

      // Create cloth patch
      const clothResX = 20
      const clothResY = 25
      const clothSizeX = 1.2
      const clothSizeY = 1.5

      const clothCorner00 = new Ammo.btVector3(position.x - clothSizeX / 2, position.y, position.z)
      const clothCorner01 = new Ammo.btVector3(position.x - clothSizeX / 2, position.y - clothSizeY, position.z)
      const clothCorner10 = new Ammo.btVector3(position.x + clothSizeX / 2, position.y, position.z)
      const clothCorner11 = new Ammo.btVector3(position.x + clothSizeX / 2, position.y - clothSizeY, position.z)

      const clothBody = Ammo.btSoftBodyHelpers.CreatePatch(
        softBodyWorldInfo,
        clothCorner00,
        clothCorner01,
        clothCorner10,
        clothCorner11,
        clothResX,
        clothResY,
        0, // fixeds (corners)
        true, // gendiags
      )

      // Configure cloth properties
      const sbConfig = clothBody.get_m_cfg()
      sbConfig.set_kVCF(1) // Velocities correction factor
      sbConfig.set_kDP(0) // Damping coefficient
      sbConfig.set_kDG(0) // Drag coefficient
      sbConfig.set_kLF(0) // Lift coefficient
      sbConfig.set_kPR(0) // Pressure coefficient
      sbConfig.set_kVC(0) // Volume conversation coefficient
      sbConfig.set_kDF(0.2) // Dynamic friction coefficient
      sbConfig.set_kMT(0) // Pose matching coefficient
      sbConfig.set_kCHR(1.0) // Rigid contacts hardness
      sbConfig.set_kKHR(0.1) // Kinetic contacts hardness
      sbConfig.set_kSHR(1.0) // Soft contacts hardness
      sbConfig.set_kAHR(0.7) // Anchors hardness

      // Set material properties
      const material = clothBody.get_m_materials().at(0)
      material.set_m_kLST(0.4) // Linear stiffness coefficient
      material.set_m_kAST(0.4) // Area/Angular stiffness coefficient
      material.set_m_kVST(0.4) // Volume stiffness coefficient

      // Add to world
      this.world.addSoftBody(clothBody, 1, -1)

      const clothId = `cloth_${this.clothIdCounter++}`
      this.clothBodies.set(clothId, clothBody)

      console.log("✅ Ammo.js cloth body created")
      return { id: clothId, body: clothBody }
    } catch (error) {
      console.error("❌ Failed to create Ammo.js cloth body:", error)
      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized || !this.world) return

    try {
      this.world.stepSimulation(deltaTime, 10)
    } catch (error) {
      console.error("❌ Ammo.js physics update error:", error)
    }
  }

  getClothVertices(clothId) {
    const clothBody = this.clothBodies.get(clothId)
    if (!clothBody) return null

    try {
      const nodes = clothBody.get_m_nodes()
      const numNodes = nodes.size()
      const vertices = new Float32Array(numNodes * 3)

      for (let i = 0; i < numNodes; i++) {
        const node = nodes.at(i)
        const pos = node.get_m_x()

        vertices[i * 3] = pos.x()
        vertices[i * 3 + 1] = pos.y()
        vertices[i * 3 + 2] = pos.z()
      }

      return vertices
    } catch (error) {
      console.error("❌ Failed to get Ammo.js cloth vertices:", error)
      return null
    }
  }

  setGravity(x, y, z) {
    if (this.world) {
      this.world.setGravity(new Ammo.btVector3(x, y, z))
      console.log(`🌍 Ammo.js gravity set to: ${x}, ${y}, ${z}`)
    }
  }

  setClothStiffness(clothId, stiffness) {
    const clothBody = this.clothBodies.get(clothId)
    if (!clothBody) return

    try {
      const material = clothBody.get_m_materials().at(0)
      material.set_m_kLST(stiffness)
      material.set_m_kAST(stiffness)
      material.set_m_kVST(stiffness)
      console.log(`🧵 Ammo.js cloth stiffness set to: ${stiffness}`)
    } catch (error) {
      console.error("❌ Failed to set Ammo.js cloth stiffness:", error)
    }
  }

  removeCloth(clothId) {
    const clothBody = this.clothBodies.get(clothId)
    if (clothBody && this.world) {
      this.world.removeSoftBody(clothBody)
      this.clothBodies.delete(clothId)
      console.log(`🗑️ Ammo.js cloth ${clothId} removed`)
    }
  }

  cleanup() {
    if (this.world) {
      // Remove all bodies
      this.clothBodies.forEach((body) => {
        this.world.removeSoftBody(body)
      })

      this.avatarColliders.forEach((body) => {
        this.world.removeRigidBody(body)
      })

      this.clothBodies.clear()
      this.avatarColliders.clear()

      // Destroy world
      Ammo.destroy(this.world)
      this.world = null
    }

    this.isInitialized = false
    console.log("✅ Ammo.js cleanup complete")
  }

  getPhysicsType() {
    return "Ammo.js (Bullet Physics)"
  }

  getDetailedStatus() {
    return {
      engine: "Ammo.js",
      initialized: this.isInitialized,
      clothMeshes: this.clothBodies.size,
      avatarColliders: this.avatarColliders.size,
      physicsDetails: {
        totalParticles: 0, // Would need to calculate from cloth bodies
        totalConstraints: 0, // Would need to calculate from cloth bodies
        gravity: { x: 0, y: -9.81, z: 0 },
        damping: 0.99,
        timeStep: 1 / 60,
      },
    }
  }

  logFullStatus() {
    const status = this.getDetailedStatus()
    console.log("📊 Ammo.js Full Status:")
    console.log("   Engine:", status.engine)
    console.log("   Initialized:", status.initialized)
    console.log("   Cloth Bodies:", status.clothMeshes)
    console.log("   Avatar Colliders:", status.avatarColliders)
  }
}

// Export for use in main application
window.AmmoPhysics = AmmoPhysics
