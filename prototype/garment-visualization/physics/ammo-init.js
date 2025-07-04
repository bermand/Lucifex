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

  async loadAmmo() {
    return new Promise((resolve, reject) => {
      // Try multiple working CDN sources for Ammo.js
      const ammoSources = [
        "https://cdn.babylonjs.com/ammo.js",
        "https://kripken.github.io/ammo.js/builds/ammo.js",
        "https://rawcdn.githack.com/kripken/ammo.js/main/builds/ammo.js",
        "https://unpkg.com/ammo.js@0.21.0/builds/ammo.js",
        "https://cdn.jsdelivr.net/npm/ammo.js@0.21.0/builds/ammo.js",
      ]

      let currentSourceIndex = 0

      const tryLoadAmmo = () => {
        if (currentSourceIndex >= ammoSources.length) {
          // If all CDN sources fail, reject to fall back to simple physics
          console.warn("All Ammo.js CDN sources failed")
          reject(new Error("All Ammo.js sources failed"))
          return
        }

        const script = document.createElement("script")
        script.src = ammoSources[currentSourceIndex]

        console.log(`Trying Ammo.js source ${currentSourceIndex + 1}/${ammoSources.length}: ${script.src}`)

        script.onload = () => {
          // Check if Ammo is available
          if (typeof window.Ammo !== "undefined") {
            console.log(`✅ Ammo.js loaded from source ${currentSourceIndex + 1}`)

            // Initialize Ammo
            window
              .Ammo()
              .then((AmmoLib) => {
                this.AmmoLib = AmmoLib
                console.log("✅ Ammo.js initialized successfully")
                resolve(AmmoLib)
              })
              .catch((error) => {
                console.error("❌ Ammo.js initialization failed:", error)
                currentSourceIndex++
                tryLoadAmmo()
              })
          } else {
            console.warn(`⚠️ Ammo.js loaded but Ammo is undefined from source ${currentSourceIndex + 1}`)
            currentSourceIndex++
            tryLoadAmmo()
          }
        }

        script.onerror = () => {
          console.warn(`❌ Failed to load from source ${currentSourceIndex + 1}: ${ammoSources[currentSourceIndex]}`)
          currentSourceIndex++
          tryLoadAmmo()
        }

        // Set a timeout for each attempt
        setTimeout(() => {
          if (!this.AmmoLib) {
            console.warn(`⏰ Timeout loading from source ${currentSourceIndex + 1}`)
            script.onerror()
          }
        }, 10000) // 10 second timeout per source

        document.head.appendChild(script)
      }

      tryLoadAmmo()
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

      // Initialize Ammo.js
      this.AmmoLib = await window.Ammo()
      console.log("✅ Ammo.js initialized")

      // Create physics world
      const collisionConfiguration = new this.AmmoLib.btDefaultCollisionConfiguration()
      const dispatcher = new this.AmmoLib.btCollisionDispatcher(collisionConfiguration)
      const overlappingPairCache = new this.AmmoLib.btDbvtBroadphase()
      const solver = new this.AmmoLib.btSequentialImpulseConstraintSolver()

      this.physicsWorld = new this.AmmoLib.btDiscreteDynamicsWorld(
        dispatcher,
        overlappingPairCache,
        solver,
        collisionConfiguration,
      )

      // Set gravity
      this.physicsWorld.setGravity(new this.AmmoLib.btVector3(0, -9.81, 0))

      this.isInitialized = true
      console.log("✅ Ammo.js physics world created")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize Ammo.js:", error)
      return false
    }
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

      // Create a simple cloth patch instead of complex mesh
      const clothWidth = 10
      const clothHeight = 12
      const clothResolution = 8

      // Use Ammo.js helper to create cloth patch
      const clothCorner00 = new this.AmmoLib.btVector3(-0.5, 1.5, -0.3)
      const clothCorner01 = new this.AmmoLib.btVector3(-0.5, 1.5, 0.3)
      const clothCorner10 = new this.AmmoLib.btVector3(0.5, 1.5, -0.3)
      const clothCorner11 = new this.AmmoLib.btVector3(0.5, 1.5, 0.3)

      const clothBody = this.AmmoLib.btSoftBodyHelpers.CreatePatch(
        this.physicsWorld.getWorldInfo(),
        clothCorner00,
        clothCorner01,
        clothCorner10,
        clothCorner11,
        clothResolution,
        clothResolution,
        0, // fixed corners (none)
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

      // Pin top corners to simulate hanging
      clothBody.setTotalMass(1, false)
      clothBody.appendAnchor(0, this.avatarColliders.values().next().value || null, false, 1)
      clothBody.appendAnchor(clothResolution - 1, this.avatarColliders.values().next().value || null, false, 1)

      // Add to physics world
      this.physicsWorld.addSoftBody(clothBody, 1, -1)

      const clothId = `cloth_${this.clothIdCounter++}`
      this.clothBodies.set(clothId, {
        body: clothBody,
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices),
      })

      console.log(`✅ Ammo.js cloth created with ID: ${clothId}`)
      return { id: clothId, body: clothBody }
    } catch (error) {
      console.error("❌ Failed to create Ammo.js cloth body:", error)

      // Log available methods for debugging
      if (this.AmmoLib) {
        console.log("Available Ammo.js methods:", Object.getOwnPropertyNames(this.AmmoLib))
      }

      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized || !this.physicsWorld) return

    try {
      // Step the physics simulation
      this.physicsWorld.stepSimulation(deltaTime, 10)
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
      this.physicsWorld.setGravity(new this.AmmoLib.btVector3(x, y, z))
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
