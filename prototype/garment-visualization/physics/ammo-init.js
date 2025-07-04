// Ammo.js Physics Engine Initialization
// Handles loading and initializing the Ammo.js physics library

class AmmoPhysics {
  constructor() {
    this.AmmoLib = null
    this.physicsWorld = null
    this.isInitialized = false
    this.clothBodies = new Map()
    this.avatarColliders = new Map()
    this.clothIdCounter = 0
  }

  async initPhysicsWorld() {
    try {
      console.log("🔄 Attempting to load Ammo.js...")

      // Method 1: Try local Ammo.js files first
      const localSuccess = await this.tryLocalAmmo()
      if (localSuccess) {
        return await this.createPhysicsWorld()
      }

      // Method 2: Try a more reliable CDN approach
      const cdnSuccess = await this.tryReliableCDN()
      if (cdnSuccess) {
        return await this.createPhysicsWorld()
      }

      // Method 3: Try dynamic import (modern browsers)
      const importSuccess = await this.tryDynamicImport()
      if (importSuccess) {
        return await this.createPhysicsWorld()
      }

      throw new Error("All Ammo.js loading methods failed")

    } catch (error) {
      console.error("❌ Failed to initialize Ammo.js:", error)
      console.log("💡 Recommendation: Use local Ammo.js files or stick with Simple Physics")
      return false
    }
  }

  async tryLocalAmmo() {
    try {
      // Check if Ammo.js is already loaded locally
      if (typeof window.Ammo === 'function') {
        console.log("✅ Ammo.js already available globally")
        this.AmmoLib = await window.Ammo()
        return true
      }

      // Try to load from local files
      const localPaths = [
        './libs/ammo.js',
        './physics/libs/ammo.js',
        '../libs/ammo.js',
        './ammo.js'
      ]

      for (const path of localPaths) {
        try {
          await this.loadScript(path)
          if (typeof window.Ammo === 'function') {
            console.log(`✅ Ammo.js loaded from local path: ${path}`)
            this.AmmoLib = await window.Ammo()
            return true
          }
        } catch (error) {
          console.log(`❌ Local path failed: ${path}`)
        }
      }

      return false
    } catch (error) {
      console.log("❌ Local Ammo.js loading failed:", error.message)
      return false
    }
  }

  async tryReliableCDN() {
    try {
      // Use only the most reliable CDN sources that properly handle WASM
      const reliableSources = [
        {
          url: "https://cdn.babylonjs.com/ammo.js",
          name: "Babylon.js CDN"
        }
      ]

      for (const source of reliableSources) {
        try {
          console.log(`🔄 Trying ${source.name}...`)
          await this.loadScript(source.url)
          
          if (typeof window.Ammo === 'function') {
            console.log(`✅ Ammo.js loaded from ${source.name}`)
            this.AmmoLib = await window.Ammo()
            return true
          }
        } catch (error) {
          console.log(`❌ ${source.name} failed:`, error.message)
        }
      }

      return false
    } catch (error) {
      console.log("❌ Reliable CDN loading failed:", error.message)
      return false
    }
  }

  async tryDynamicImport() {
    try {
      // Try modern ES6 dynamic import (if available)
      if (typeof import === 'function') {
        console.log("🔄 Trying dynamic import...")
        
        // This would work if we had Ammo.js as an ES6 module
        // const AmmoModule = await import('https://unpkg.com/ammo.js@0.21.0/builds/ammo.js')
        // For now, this is just a placeholder
        
        return false
      }
      return false
    } catch (error) {
      console.log("❌ Dynamic import failed:", error.message)
      return false
    }
  }

  async loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = resolve
      script.onerror = () => reject(new Error(`Failed to load ${url}`))
      
      // Set timeout to prevent hanging
      setTimeout(() => {
        reject(new Error(`Timeout loading ${url}`))
      }, 10000)
      
      document.head.appendChild(script)
    })
  }

  async createPhysicsWorld() {
    try {
      if (!this.AmmoLib) {
        throw new Error("Ammo.js not properly initialized")
      }

      console.log("🔄 Creating Ammo.js physics world...")

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
        softBodySolver
      )

      // Set gravity
      const gravity = new this.AmmoLib.btVector3(0, -9.81, 0)
      this.physicsWorld.setGravity(gravity)
      this.physicsWorld.getWorldInfo().set_m_gravity(gravity)

      this.isInitialized = true
      console.log("✅ Ammo.js physics world created successfully")
      return true

    } catch (error) {
      console.error("❌ Failed to create physics world:", error)
      return false
    }
  }

  createAvatarCollider(position = { x: 0, y: 0, z: 0 }, scale = { x: 0.4, y: 0.9, z: 0.2 }) {
    if (!this.isInitialized) return null

    try {
      const shape = new this.AmmoLib.btCapsuleShape(scale.x, scale.y)
      const transform = new this.AmmoLib.btTransform()
      transform.setIdentity()
      transform.setOrigin(new this.AmmoLib.btVector3(position.x, position.y, position.z))

      const motionState = new this.AmmoLib.btDefaultMotionState(transform)
      const localInertia = new this.AmmoLib.btVector3(0, 0, 0)
      const rbInfo = new this.AmmoLib.btRigidBodyConstructionInfo(0, motionState, shape, localInertia)
      const body = new this.AmmoLib.btRigidBody(rbInfo)

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

      const clothResolution = 10
      const clothWidth = 1.0
      const clothHeight = 1.2

      const clothCorner00 = new this.AmmoLib.btVector3(position.x - clothWidth / 2, position.y, position.z - clothHeight / 2)
      const clothCorner01 = new this.AmmoLib.btVector3(position.x - clothWidth / 2, position.y, position.z + clothHeight / 2)
      const clothCorner10 = new this.AmmoLib.btVector3(position.x + clothWidth / 2, position.y, position.z - clothHeight / 2)
      const clothCorner11 = new this.AmmoLib.btVector3(position.x + clothWidth / 2, position.y, position.z + clothHeight / 2)

      const clothBody = this.AmmoLib.btSoftBodyHelpers.CreatePatch(
        this.physicsWorld.getWorldInfo(),
        clothCorner00, clothCorner01, clothCorner10, clothCorner11,
        clothResolution, clothResolution,
        0, true
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

      clothBody.setTotalMass(1, false)
      clothBody.setMass(0, 0)
      clothBody.setMass(clothResolution - 1, 0)

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
      return null
    }
  }

  updatePhysics(deltaTime) {
    if (!this.isInitialized || !this.physicsWorld) return

    try {
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
        material.set_m_kLST(stiffness)
        material.set_m_kAST(stiffness)
        material.set_m_kVST(stiffness)
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
    this.clothBodies.forEach((clothData) => {
      this.physicsWorld.removeSoftBody(clothData.body)
    })
    this.clothBodies.clear()

    this.avatarColliders.forEach((body) => {
      this.physicsWorld.removeRigidBody(body)
    })
    this.avatarColliders.clear()

    if (this.physicsWorld) {
      this.physicsWorld = null
    }

    this.isInitialized = false
    console.log("✅ Ammo.js cleanup complete")
  }
}

// Export for use in main application
window.AmmoPhysics = AmmoPhysics
