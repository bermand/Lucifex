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
    this.rigidBodies = new Map()
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
      await this.loadAmmo()
    } catch (error) {
      console.log("🔄 Ammo.js failed to load, will use simple physics fallback")
      return false
    }

    try {
      // Collision configuration for soft body + rigid body
      this.collisionConfiguration = new this.AmmoLib.btSoftBodyRigidBodyCollisionConfiguration()
      this.dispatcher = new this.AmmoLib.btCollisionDispatcher(this.collisionConfiguration)
      this.overlappingPairCache = new this.AmmoLib.btDbvtBroadphase()
      this.solver = new this.AmmoLib.btSequentialImpulseConstraintSolver()
      this.softBodySolver = new this.AmmoLib.btDefaultSoftBodySolver()

      // Create soft-rigid dynamics world
      this.physicsWorld = new this.AmmoLib.btSoftRigidDynamicsWorld(
        this.dispatcher,
        this.overlappingPairCache,
        this.solver,
        this.collisionConfiguration,
        this.softBodySolver,
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
      console.log("✅ Ammo.js physics world initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize Ammo.js physics world:", error)
      return false
    }
  }

  createAvatarCollider(position = { x: 0, y: 0, z: 0 }, scale = { x: 0.4, y: 0.9, z: 0.2 }) {
    if (!this.isInitialized) return null

    try {
      // Create a capsule shape for the avatar body
      const shape = new this.AmmoLib.btCapsuleShape(scale.x, scale.y)

      const transform = new this.AmmoLib.btTransform()
      transform.setIdentity()
      transform.setOrigin(new this.AmmoLib.btVector3(position.x, position.y, position.z))

      const motionState = new this.AmmoLib.btDefaultMotionState(transform)

      // Zero mass = static body (avatar doesn't move)
      const rbInfo = new this.AmmoLib.btRigidBodyConstructionInfo(
        0,
        motionState,
        shape,
        new this.AmmoLib.btVector3(0, 0, 0),
      )

      const body = new this.AmmoLib.btRigidBody(rbInfo)
      body.setFriction(0.8)
      body.setRestitution(0.1)

      this.physicsWorld.addRigidBody(body)
      this.rigidBodies.set("avatar", body)

      console.log("✅ Avatar collider created")
      return body
    } catch (error) {
      console.error("❌ Failed to create avatar collider:", error)
      return null
    }
  }

  createClothFromGeometry(vertices, indices, position = { x: 0, y: 1, z: 0 }) {
    if (!this.isInitialized || !vertices || !indices) return null

    try {
      // Use the simpler patch-based approach for cloth creation
      // Create a rectangular cloth patch instead of complex mesh
      const res = 10 // Resolution of cloth grid
      const clothWidth = 1.0
      const clothHeight = 1.2

      // Create soft body using helper function for patch
      const softBody = this.AmmoLib.btSoftBodyHelpers.CreatePatch(
        this.physicsWorld.getWorldInfo(),
        new this.AmmoLib.btVector3(position.x - clothWidth / 2, position.y, position.z - clothHeight / 2), // corner00
        new this.AmmoLib.btVector3(position.x + clothWidth / 2, position.y, position.z - clothHeight / 2), // corner10
        new this.AmmoLib.btVector3(position.x - clothWidth / 2, position.y, position.z + clothHeight / 2), // corner01
        new this.AmmoLib.btVector3(position.x + clothWidth / 2, position.y, position.z + clothHeight / 2), // corner11
        res, // resx
        res, // resy
        0, // fixeds (0 = no fixed points initially)
        true, // gendiags
      )

      // Pin the top corners to simulate hanging
      softBody.setMass(0, 0) // Top-left corner
      softBody.setMass(res - 1, 0) // Top-right corner

      // Configure cloth properties
      const material = softBody.get_m_materials().at(0)
      material.set_m_kLST(0.4) // Linear stiffness (lower = more stretchy)
      material.set_m_kAST(0.4) // Area/Angular stiffness
      material.set_m_kVST(0.4) // Volume stiffness

      // Set mass and other properties
      softBody.setTotalMass(0.5, false)
      softBody.setFriction(0.8)

      const cfg = softBody.get_m_cfg()
      cfg.set_piterations(10) // Position iterations
      cfg.set_viterations(10) // Velocity iterations
      cfg.set_diterations(10) // Drift iterations
      cfg.set_collisions(0x11) // Enable collision with rigid bodies

      // Add to physics world
      this.physicsWorld.addSoftBody(softBody, 1, -1)

      const clothId = `cloth_${Date.now()}`
      this.clothBodies.set(clothId, {
        body: softBody,
        originalVertices: vertices,
        vertexCount: (res + 1) * (res + 1), // Grid vertices
        resolution: res,
      })

      console.log("✅ Ammo.js cloth patch created with", (res + 1) * (res + 1), "vertices")
      return { id: clothId, body: softBody }
    } catch (error) {
      console.error("❌ Failed to create Ammo.js cloth body:", error)
      console.log("Available Ammo.js helpers:", Object.keys(this.AmmoLib.btSoftBodyHelpers || {}))
      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized || !this.physicsWorld) return

    try {
      // Step simulation with smaller substeps for stability
      this.physicsWorld.stepSimulation(deltaTime, 10, 1 / 120)
    } catch (error) {
      console.error("❌ Ammo.js physics update error:", error)
    }
  }

  getClothVertices(clothId) {
    const clothData = this.clothBodies.get(clothId)
    if (!clothData) return null

    try {
      const softBody = clothData.body
      const nodes = softBody.get_m_nodes()
      const vertexCount = clothData.vertexCount
      const updatedVertices = new Float32Array(vertexCount * 3)

      for (let i = 0; i < vertexCount; i++) {
        const node = nodes.at(i)
        const pos = node.get_m_x()

        updatedVertices[i * 3] = pos.x()
        updatedVertices[i * 3 + 1] = pos.y()
        updatedVertices[i * 3 + 2] = pos.z()
      }

      return updatedVertices
    } catch (error) {
      console.error("❌ Failed to get Ammo.js cloth vertices:", error)
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
    if (clothData) {
      const material = clothData.body.get_m_materials().at(0)
      material.set_m_kLST(stiffness)
      material.set_m_kAST(stiffness)
      material.set_m_kVST(stiffness)
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
    // Clean up all physics objects
    this.clothBodies.forEach((clothData, id) => {
      this.physicsWorld.removeSoftBody(clothData.body)
    })
    this.clothBodies.clear()

    this.rigidBodies.forEach((body, id) => {
      this.physicsWorld.removeRigidBody(body)
    })
    this.rigidBodies.clear()

    if (this.physicsWorld) {
      // Note: Ammo.js cleanup is complex, for now we just clear references
      this.physicsWorld = null
    }

    this.isInitialized = false
    console.log("✅ Ammo.js physics cleanup completed")
  }
}

// Export for use in main application - using window global instead of ES6 export
window.AmmoPhysics = AmmoPhysics
