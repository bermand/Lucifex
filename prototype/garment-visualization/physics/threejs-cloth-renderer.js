// Three.js Cloth Renderer
// Renders physics simulation using Three.js for actual visual movement

import * as THREE from "three"

class ThreeJSClothRenderer {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.clothMesh = null
    this.avatarMesh = null
    this.isInitialized = false
    this.container = null
    this.animationFrame = null
    this.clothSimulation = null
  }

  async initialize(container, clothSimulation) {
    try {
      console.log("🔄 Initializing Three.js Cloth Renderer...")

      this.container = container
      this.clothSimulation = clothSimulation

      // Create Three.js scene
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xf0f0f0)

      // Create camera
      this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
      this.camera.position.set(0, 1, 3)
      this.camera.lookAt(0, 1, 0)

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      this.renderer.setSize(container.clientWidth, container.clientHeight)
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

      // Add renderer to container
      container.appendChild(this.renderer.domElement)

      // Add lights
      this.setupLighting()

      // Add avatar representation
      this.createAvatarMesh()

      // Add cloth mesh
      this.createClothMesh()

      // Add controls
      this.setupControls()

      // Handle resize
      window.addEventListener("resize", () => this.handleResize())

      this.isInitialized = true
      console.log("✅ Three.js Cloth Renderer initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize Three.js renderer:", error)
      return false
    }
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    // Point light for fill
    const pointLight = new THREE.PointLight(0xffffff, 0.4)
    pointLight.position.set(-5, 5, -5)
    this.scene.add(pointLight)
  }

  createAvatarMesh() {
    // Create simple avatar representation
    const avatarGroup = new THREE.Group()

    // Head
    const headGeometry = new THREE.SphereGeometry(0.12, 16, 16)
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.set(0, 0.7, 0)
    head.castShadow = true
    avatarGroup.add(head)

    // Upper torso
    const torsoGeometry = new THREE.CapsuleGeometry(0.32, 0.4, 8, 16)
    const torsoMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac })
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial)
    torso.position.set(0, 0.3, 0)
    torso.castShadow = true
    avatarGroup.add(torso)

    // Lower torso
    const lowerTorsoGeometry = new THREE.CapsuleGeometry(0.28, 0.3, 8, 16)
    const lowerTorso = new THREE.Mesh(lowerTorsoGeometry, torsoMaterial)
    lowerTorso.position.set(0, -0.1, 0)
    lowerTorso.castShadow = true
    avatarGroup.add(lowerTorso)

    // Hips
    const hipsGeometry = new THREE.CapsuleGeometry(0.24, 0.2, 8, 16)
    const hips = new THREE.Mesh(hipsGeometry, torsoMaterial)
    hips.position.set(0, -0.4, 0)
    hips.castShadow = true
    avatarGroup.add(hips)

    this.avatarMesh = avatarGroup
    this.scene.add(avatarGroup)
  }

  createClothMesh() {
    if (!this.clothSimulation || !this.clothSimulation.physicsEngine) {
      console.log("⚠️ No cloth simulation available for rendering")
      return
    }

    // Get cloth data from physics simulation
    const clothData = Array.from(this.clothSimulation.physicsEngine.clothMeshes.values())[0]
    if (!clothData) {
      console.log("⚠️ No cloth data available")
      return
    }

    console.log(`🎨 Creating cloth mesh with ${clothData.particles.length} particles`)

    // Create geometry
    const geometry = new THREE.BufferGeometry()

    // Create vertices array
    const vertices = new Float32Array(clothData.particles.length * 3)
    clothData.particles.forEach((particle, index) => {
      vertices[index * 3] = particle.position.x
      vertices[index * 3 + 1] = particle.position.y
      vertices[index * 3 + 2] = particle.position.z
    })

    // Create indices for triangles
    const indices = []
    const gridWidth = clothData.gridWidth
    const gridHeight = clothData.gridHeight

    // Helper function to get particle index by grid position
    const getParticleIndex = (gx, gy) => {
      return clothData.particles.findIndex((p) => p.gridX === gx && p.gridY === gy)
    }

    // Create triangles
    for (let y = 0; y < gridHeight - 1; y++) {
      for (let x = 0; x < gridWidth - 1; x++) {
        const topLeft = getParticleIndex(x, y)
        const topRight = getParticleIndex(x + 1, y)
        const bottomLeft = getParticleIndex(x, y + 1)
        const bottomRight = getParticleIndex(x + 1, y + 1)

        // Only create triangles if all vertices exist
        if (topLeft >= 0 && topRight >= 0 && bottomLeft >= 0 && bottomRight >= 0) {
          // First triangle
          indices.push(topLeft, bottomLeft, topRight)
          // Second triangle
          indices.push(topRight, bottomLeft, bottomRight)
        }
      }
    }

    console.log(`🎨 Created ${indices.length / 3} triangles for cloth mesh`)

    // Set geometry attributes
    geometry.setIndex(indices)
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()

    // Create material
    const material = new THREE.MeshLambertMaterial({
      color: 0x4a90e2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    })

    // Create mesh
    this.clothMesh = new THREE.Mesh(geometry, material)
    this.clothMesh.castShadow = true
    this.clothMesh.receiveShadow = true
    this.scene.add(this.clothMesh)

    console.log("✅ Cloth mesh created and added to scene")
  }

  setupControls() {
    // Add orbit controls if available
    if (window.THREE && THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05
      this.controls.target.set(0, 1, 0)
    }
  }

  updateClothMesh() {
    if (!this.clothMesh || !this.clothSimulation || !this.clothSimulation.physicsEngine) {
      return
    }

    try {
      // Get updated cloth data
      const clothData = Array.from(this.clothSimulation.physicsEngine.clothMeshes.values())[0]
      if (!clothData) return

      // Update vertex positions
      const positions = this.clothMesh.geometry.attributes.position
      clothData.particles.forEach((particle, index) => {
        positions.setXYZ(index, particle.position.x, particle.position.y, particle.position.z)
      })

      // Mark positions as needing update
      positions.needsUpdate = true

      // Recompute normals for proper lighting
      this.clothMesh.geometry.computeVertexNormals()
    } catch (error) {
      console.error("❌ Failed to update cloth mesh:", error)
    }
  }

  startRendering() {
    if (!this.isInitialized) return

    const render = () => {
      if (!this.isInitialized) return

      // Update controls
      if (this.controls) {
        this.controls.update()
      }

      // Update cloth mesh with physics data
      this.updateClothMesh()

      // Render scene
      this.renderer.render(this.scene, this.camera)

      this.animationFrame = requestAnimationFrame(render)
    }

    render()
    console.log("▶️ Three.js rendering started")
  }

  stopRendering() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    console.log("⏹️ Three.js rendering stopped")
  }

  handleResize() {
    if (!this.isInitialized || !this.container) return

    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  cleanup() {
    this.stopRendering()

    if (this.renderer && this.container) {
      this.container.removeChild(this.renderer.domElement)
    }

    if (this.scene) {
      // Dispose of geometries and materials
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose()
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
    }

    this.scene = null
    this.camera = null
    this.renderer = null
    this.clothMesh = null
    this.avatarMesh = null
    this.isInitialized = false

    console.log("✅ Three.js renderer cleanup complete")
  }
}

// Export for use in main application
window.ThreeJSClothRenderer = ThreeJSClothRenderer
