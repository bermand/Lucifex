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
    window.Ammo = null // Declare the Ammo variable before using it
  }

  async loadAmmo() {
    return new Promise((resolve, reject) => {
      // Try multiple CDN sources for Ammo.js
      const ammoSources = [
        "https://cdn.jsdelivr.net/npm/ammo@0.0.10/ammo.js",
        "https://unpkg.com/ammo@0.0.10/ammo.js",
        "https://cdnjs.cloudflare.com/ajax/libs/ammo.js/0.0.10/ammo.min.js",
        "https://threejs.org/examples/js/libs/ammo.js",
      ]

      let currentSourceIndex = 0

      const tryLoadAmmo = () => {
        if (currentSourceIndex >= ammoSources.length) {
          reject(new Error("Failed to load Ammo.js from all CDN sources"))
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
                reject(error)
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

        document.head.appendChild(script)
      }

      tryLoadAmmo()
    })
  }

  async initPhysicsWorld() {
    if (!this.AmmoLib) {
      await this.loadAmmo()
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
      console.log("✅ Physics world initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize physics world:", error)
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
      const ammoPositions = new this.AmmoLib.btVector3Vector()
      const ammoIndices = new this.AmmoLib.btIntArray()

      // Convert vertices to Ammo format
      for (let i = 0; i < vertices.length; i += 3) {
        const v = new this.AmmoLib.btVector3(
          vertices[i] + position.x,
          vertices[i + 1] + position.y,
          vertices[i + 2] + position.z,
        )
        ammoPositions.push_back(v)
      }

      // Convert indices to Ammo format
      for (let i = 0; i < indices.length; i++) {
        ammoIndices.push_back(indices[i])
      }

      // Create soft body from triangle mesh
      const softBody = this.AmmoLib.btSoftBodyHelpers.CreateFromTriMesh(
        this.physicsWorld.getWorldInfo(),
        ammoPositions,
        ammoIndices,
        indices.length / 3,
        true,
      )

      // Configure cloth properties
      const material = softBody.get_m_materials().at(0)
      material.set_m_kLST(0.4) // Linear stiffness (lower = more stretchy)
      material.set_m_kAST(0.4) // Area/Angular stiffness
      material.set_m_kVST(0.4) // Volume stiffness

      // Set mass and other properties
      softBody.setTotalMass(0.5, false)
      softBody.setFriction(0.8)
      softBody.get_m_cfg().set_piterations(10) // Position iterations
      softBody.get_m_cfg().set_viterations(10) // Velocity iterations
      softBody.get_m_cfg().set_diterations(10) // Drift iterations

      // Enable collision with rigid bodies
      softBody.get_m_cfg().set_collisions(0x11) // SDF_RS + VF_SS

      // Add to physics world
      this.physicsWorld.addSoftBody(softBody, 1, -1)

      const clothId = `cloth_${Date.now()}`
      this.clothBodies.set(clothId, {
        body: softBody,
        originalVertices: vertices,
        vertexCount: vertices.length / 3,
      })

      console.log("✅ Cloth body created with", vertices.length / 3, "vertices")
      return { id: clothId, body: softBody }
    } catch (error) {
      console.error("❌ Failed to create cloth body:", error)
      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized || !this.physicsWorld) return

    try {
      // Step simulation with smaller substeps for stability
      this.physicsWorld.stepSimulation(deltaTime, 10, 1 / 120)
    } catch (error) {
      console.error("❌ Physics update error:", error)
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
      console.error("❌ Failed to get cloth vertices:", error)
      return null
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
    console.log("✅ Physics cleanup completed")
  }
}

// Export for use in main application - using window global instead of ES6 export
window.AmmoPhysics = AmmoPhysics
