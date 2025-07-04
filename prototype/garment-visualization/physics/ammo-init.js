// Ammo.js Physics Engine Initialization
// Handles loading and initializing the Ammo.js physics library

class AmmoPhysics {
  constructor() {
    this.AmmoLib = null
    this.physicsWorld = null
    this.solver = null
    this.dispatcher = null
    this.overlappingPairCache = null
    this.softBodySolver = null
    this.collisionConfiguration = null
    this.isInitialized = false
    this.clothBodies = new Map()
    this.avatarColliders = new Map()
    this.clothIdCounter = 0
  }

  async loadAmmoFromUrl(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = url
      script.onload = () => {
        if (typeof window.Ammo !== "undefined") {
          resolve()
        } else {
          reject(new Error("Ammo not found after loading script"))
        }
      }
      script.onerror = () => reject(new Error("Failed to load script"))
      document.head.appendChild(script)
    })
  }

  async initPhysicsWorld() {
    try {
      console.log("🔄 Loading Ammo.js...")

      // Try to load Ammo.js from CDN
      const ammoUrls = [
        "https://cdn.jsdelivr.net/npm/ammo.js@0.0.10/ammo.js",
        "https://unpkg.com/ammo.js@0.0.10/ammo.js",
        "https://cdnjs.cloudflare.com/ajax/libs/ammo.js/0.0.10/ammo.js",
        "https://cdn.babylonjs.com/ammo.js",
        "https://kripken.github.io/ammo.js/builds/ammo.js",
      ]

      let ammoLoaded = false
      for (const url of ammoUrls) {
        try {
          await this.loadAmmoFromUrl(url)
          ammoLoaded = true
          console.log(`✅ Ammo.js loaded from: ${url}`)
          break
        } catch (error) {
          console.log(`❌ Failed to load from ${url}:`, error.message)
        }
      }

      if (!ammoLoaded) {
        throw new Error("All Ammo.js CDN sources failed")
      }

      // Initialize Ammo.js - check if it's a function
      if (typeof window.Ammo !== "function") {
        throw new Error("Ammo is not a function - invalid Ammo.js version")
      }

      this.AmmoLib = await window.Ammo()
      console.log("✅ Ammo.js initialized")

      // Create physics world with soft body support
      const collisionConfiguration = new this.AmmoLib.btSoftBodyRigidBodyCollisionConfiguration()
      const dispatcher = new this.AmmoLib.btCollisionDispatcher(collisionConfiguration)
      const overlappingPairCache = new this.AmmoLib.btDbvtBroadphase()
      const solver = new this.AmmoLib.btSequentialImpulseConstraintSolver()
      const softBodySolver = new this.AmmoLib.btDefaultSoftBodySolver()

      this.physicsWorld = new this.AmmoLib.btSoftRigidDynamicsWorld(
        dispatcher,
        overlappingPairCache,
        solver,
        collisionConfiguration,
        softBodySolver,
      )

      // Set gravity
      const gravity = new this.AmmoLib.btVector3(0, -9.81, 0)
      this.physicsWorld.setGravity(gravity)
      this.physicsWorld.getWorldInfo().set_m_gravity(gravity)

      // Configure world info for soft bodies
      const worldInfo = this.physicsWorld.getWorldInfo()
      worldInfo.set_air_density(1.2)
      worldInfo.set_water_density(0)
      worldInfo.set_water_offset(0)
      worldInfo.set_water_normal(new this.AmmoLib.btVector3(0, 0, 0))

      this.isInitialized = true
      console.log("✅ Ammo.js physics world created with soft body support")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize Ammo.js:", error)
      return false
    }
  }

  createAvatarCollider(position = { x: 0, y: 0, z: 0 }, scale = { x: 0.4, y: 0.9, z: 0.2 }) {
    if (!this.isInitialized) return null

    try {
      // Create a capsule shape for the avatar
      const shape = new this.AmmoLib.btCapsuleShape(scale.x, scale.y)

      // Create motion state
      const transform = new this.AmmoLib.btTransform()
      transform.setIdentity()
      transform.setOrigin(new this.AmmoLib.btVector3(position.x, position.y, position.z))

      const motionState = new this.AmmoLib.btDefaultMotionState(transform)

      // Create rigid body (static)
      const localInertia = new this.AmmoLib.btVector3(0, 0, 0)
      const rbInfo = new this.AmmoLib.btRigidBodyConstructionInfo(0, motionState, shape, localInertia)
      const body = new this.AmmoLib.btRigidBody(rbInfo)

      // Add to world
      this.physicsWorld.addRigidBody(body)

      const colliderId = `avatar_${Date.now()}`
      this.avatarColliders.set(colliderId, body)

      console.log("✅ Avatar collider created")
      return colliderId
    } catch (error) {
      console.error("❌ Failed to create avatar collider:", error)
      return null
    }
  }

  createClothFromGeometry(vertices, indices, position = { x: 0, y: 1, z: 0 }) {
    if (!this.isInitialized) {
      console.error("❌ Ammo.js not initialized")
      return null
    }

    try {
      console.log("🔄 Creating Ammo.js cloth body...")

      // Create a simple cloth patch using Ammo.js helper
      const clothResolution = 10
      const clothWidth = 1.0
      const clothHeight = 1.2

      // Define cloth corners
      const clothCorner00 = new this.AmmoLib.btVector3(
        position.x - clothWidth / 2,
        position.y,
        position.z - clothHeight / 2,
      )
      const clothCorner01 = new this.AmmoLib.btVector3(
        position.x - clothWidth / 2,
        position.y,
        position.z + clothHeight / 2,
      )
      const clothCorner10 = new this.AmmoLib.btVector3(
        position.x + clothWidth / 2,
        position.y,
        position.z - clothHeight / 2,
      )
      const clothCorner11 = new this.AmmoLib.btVector3(
        position.x + clothWidth / 2,
        position.y,
        position.z + clothHeight / 2,
      )

      // Create cloth patch
      const clothBody = this.AmmoLib.btSoftBodyHelpers.CreatePatch(
        this.physicsWorld.getWorldInfo(),
        clothCorner00,
        clothCorner01,
        clothCorner10,
        clothCorner11,
        clothResolution,
        clothResolution,
        0, // fixed corners (none initially)
        true, // generate diagonal links
      )

      if (!clothBody) {
        throw new Error("Failed to create cloth patch")
      }

      // Configure cloth properties
      const sbConfig = clothBody.get_m_cfg()
      sbConfig.set_piterations(2)
      sbConfig.set_viterations(0)
      sbConfig.set_diterations(0)
      sbConfig.set_citerations(4)

      // Set material properties
      sbConfig.set_kDF(0.2) // Dynamic friction
      sbConfig.set_kDP(0.0) // Damping
      sbConfig.set_kPR(0.0) // Pressure
      sbConfig.set_kVC(0.0) // Volume conservation
      sbConfig.set_kDG(0.0) // Drag
      sbConfig.set_kLF(0.0) // Lift
      sbConfig.set_kAHR(0.7) // Anchor hardness
      sbConfig.set_kSHR(1.0) // Soft vs rigid hardness

      // Set mass and pin top corners
      clothBody.setTotalMass(1, false)

      // Pin top corners to simulate hanging
      clothBody.setMass(0, 0) // Top-left corner
      clothBody.setMass(clothResolution - 1, 0) // Top-right corner

      // Add to physics world
      this.physicsWorld.addSoftBody(clothBody, 1, -1)

      const clothId = `cloth_${this.clothIdCounter++}`
      this.clothBodies.set(clothId, {
        body: clothBody,
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices),
        resolution: clothResolution,
      })

      console.log(`✅ Ammo.js cloth created with ID: ${clothId}`)
      return { id: clothId, body: clothBody }
    } catch (error) {
      console.error("❌ Failed to create Ammo.js cloth body:", error)

      // Log available methods for debugging
      if (this.AmmoLib && this.AmmoLib.btSoftBodyHelpers) {
        console.log("Available Ammo.js helpers:", Object.getOwnPropertyNames(this.AmmoLib.btSoftBodyHelpers))
      }

      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized || !this.physicsWorld) return

    try {
      // Step the physics simulation
      this.physicsWorld.stepSimulation(deltaTime, 10, 1 / 120)
    } catch (error) {
      console.error("❌ Physics update error:", error)
    }
  }

  getClothVertices(clothId) {
    const clothData = this.clothBodies.get(clothId)
    if (!clothData) return null

    try {
      const clothBody = clothData.body
      const nodes = clothBody.get_m_nodes()
      const nodeCount = nodes.size()

      const vertices = new Float32Array(nodeCount * 3)

      for (let i = 0; i < nodeCount; i++) {
        const node = nodes.at(i)
        const pos = node.get_m_x()

        vertices[i * 3] = pos.x()
        vertices[i * 3 + 1] = pos.y()
        vertices[i * 3 + 2] = pos.z()
      }

      return vertices
    } catch (error) {
      console.error("❌ Failed to get cloth vertices:", error)
      return null
    }
  }

  setGravity(x, y, z) {
    if (this.physicsWorld) {
      const gravity = new this.AmmoLib.btVector3(x, y, z)
      this.physicsWorld.setGravity(gravity)
      this.physicsWorld.getWorldInfo().set_m_gravity(gravity)
    }
  }

  setClothStiffness(clothId, stiffness) {
    const clothData = this.clothBodies.get(clothId)
    if (!clothData) return

    try {
      const clothBody = clothData.body
      const materials = clothBody.get_m_materials()

      if (materials.size() > 0) {
        const material = materials.at(0)
        material.set_m_kLST(stiffness) // Linear stiffness
        material.set_m_kAST(stiffness) // Angular stiffness
        material.set_m_kVST(stiffness) // Volume stiffness
      }
    } catch (error) {
      console.error("❌ Failed to set cloth stiffness:", error)
    }
  }

  removeCloth(clothId) {
    const clothData = this.clothBodies.get(clothId)
    if (clothData) {
      this.physicsWorld.removeSoftBody(clothData.body)
      this.clothBodies.delete(clothId)
    }
  }

  cleanup() {
    // Clean up cloth bodies
    this.clothBodies.forEach((clothData, clothId) => {
      this.physicsWorld.removeSoftBody(clothData.body)
    })
    this.clothBodies.clear()

    // Clean up avatar colliders
    this.avatarColliders.forEach((body, colliderId) => {
      this.physicsWorld.removeRigidBody(body)
    })
    this.avatarColliders.clear()

    // Clean up physics world
    if (this.physicsWorld) {
      // Note: Ammo.js cleanup is complex, we'll just null the reference
      this.physicsWorld = null
    }

    this.isInitialized = false
    console.log("✅ Ammo.js cleanup complete")
  }
}

// Export for use in main application
window.AmmoPhysics = AmmoPhysics
