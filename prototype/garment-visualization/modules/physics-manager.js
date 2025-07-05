// Physics simulation management
export class PhysicsManager {
  constructor(state) {
    this.state = state
    console.log("🧬 PhysicsManager initialized")
  }

  async initialize() {
    try {
      await this.loadPhysicsModules()
      console.log("✅ PhysicsManager initialized")
    } catch (error) {
      console.error("❌ Failed to initialize PhysicsManager:", error)
    }
  }

  async loadPhysicsModules() {
    try {
      // Load simple physics fallback first
      if (!window.SimpleClothPhysics) {
        await this.loadScript("./physics/simple-cloth-physics.js", "SimpleClothPhysics")
      }

      // Load cloth simulation
      if (!window.ClothSimulation) {
        await this.loadScript("./physics/cloth-simulation.js", "ClothSimulation")
      }

      // Load visual debug
      if (!window.PhysicsVisualDebug) {
        await this.loadScript("./physics/visual-debug.js", "PhysicsVisualDebug")
      }

      // Load physics test
      if (!window.PhysicsTest) {
        await this.loadScript("./physics/physics-test.js", "PhysicsTest")
      }

      // Load drop test
      if (!window.PhysicsDropTest) {
        await this.loadScript("./physics/drop-test.js", "PhysicsDropTest")
      }

      // Load mesh updater
      if (!window.PhysicsMeshUpdater) {
        await this.loadScript("./physics/mesh-updater.js", "PhysicsMeshUpdater")
      }

      console.log("✅ All physics modules loaded successfully")

      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("✅ Physics modules loaded - ready to simulate")
      }

      return true
    } catch (error) {
      console.error("❌ Failed to load physics modules:", error)

      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("❌ Failed to load physics modules")
      }

      return false
    }
  }

  async loadScript(src, expectedGlobal) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = src
      document.head.appendChild(script)

      script.onload = () => {
        if (window[expectedGlobal]) {
          console.log(`✅ ${expectedGlobal} loaded`)
          resolve()
        } else {
          reject(new Error(`${expectedGlobal} not found after loading script`))
        }
      }

      script.onerror = () => reject(new Error(`Failed to load ${src}`))
    })
  }

  togglePhysics() {
    if (!this.state.isPhysicsEnabled) {
      this.enablePhysics()
    } else {
      this.disablePhysics()
    }
  }

  async enablePhysics() {
    if (!this.state.currentGarmentUrl) {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("❌ Need garment loaded to enable physics")
      }
      return
    }

    try {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("🔄 Initializing physics simulation...")
      }

      // Initialize cloth simulation using ClothSimulation class
      if (window.ClothSimulation) {
        const clothSimulation = new window.ClothSimulation()
        const success = await clothSimulation.initialize()

        if (success) {
          // Setup avatar physics if we have an avatar
          if (this.state.avatarViewer) {
            await clothSimulation.setupAvatarPhysics(this.state.avatarViewer)
          }

          // Setup garment physics
          if (this.state.garmentViewer) {
            await clothSimulation.setupGarmentPhysics(this.state.garmentViewer)
          }

          // Start the simulation
          clothSimulation.startSimulation()

          this.state.setClothSimulation(clothSimulation)
          this.state.setPhysicsEnabled(true)

          const physicsToggle = document.getElementById("physics-toggle")
          if (physicsToggle) {
            physicsToggle.textContent = "Disable Physics"
            physicsToggle.classList.add("active")
          }

          const physicsControls = document.getElementById("physics-controls")
          if (physicsControls) {
            physicsControls.style.display = "block"
          }

          if (utils) {
            utils.updatePhysicsStatus("✅ Physics simulation active - cloth draping!")
            utils.showPhysicsEffect("🎬 Physics Enabled!\nCloth is falling and draping naturally")
          }
        } else {
          throw new Error("Failed to initialize cloth simulation")
        }
      } else {
        throw new Error("ClothSimulation not available")
      }
    } catch (error) {
      console.error("Physics enable error:", error)
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("❌ Failed to enable physics")
      }
    }
  }

  disablePhysics() {
    if (this.state.clothSimulation) {
      this.state.clothSimulation.stopSimulation()
      this.state.clothSimulation.cleanup()
      this.state.setClothSimulation(null)
    }

    if (this.state.physicsMeshUpdater) {
      this.state.physicsMeshUpdater.cleanup()
      this.state.setPhysicsMeshUpdater(null)
    }

    this.state.setPhysicsEnabled(false)

    const physicsToggle = document.getElementById("physics-toggle")
    if (physicsToggle) {
      physicsToggle.textContent = "Enable Physics"
      physicsToggle.classList.remove("active")
    }

    const physicsControls = document.getElementById("physics-controls")
    if (physicsControls) {
      physicsControls.style.display = "none"
    }

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updatePhysicsStatus("Physics simulation disabled")
    }
  }

  resetPhysics() {
    if (this.state.clothSimulation) {
      this.state.clothSimulation.resetSimulation()

      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("✅ Physics reset - cloth repositioned")
        utils.showPhysicsEffect("🔄 Physics Reset!\nCloth returned to starting position")
      }
    }
  }

  updatePhysicsSettings() {
    if (!this.state.clothSimulation) return

    const stiffness = Number.parseFloat(document.getElementById("cloth-stiffness")?.value || "0.4")
    const gravity = Number.parseFloat(document.getElementById("gravity-strength")?.value || "9.81")

    this.state.clothSimulation.setGravity(0, -gravity, 0)
    this.state.clothSimulation.setClothStiffness(null, stiffness)
  }

  togglePhysicsDebug() {
    if (!window.PhysicsVisualDebug) {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("❌ Physics debug not available")
      }
      return
    }

    if (!this.state.physicsVisualDebug) {
      const physicsVisualDebug = new window.PhysicsVisualDebug()
      physicsVisualDebug.initialize()
      this.state.setPhysicsVisualDebug(physicsVisualDebug)
    }

    this.state.setPhysicsDebugEnabled(!this.state.isPhysicsDebugEnabled)

    const debugToggle = document.getElementById("debug-toggle")
    const utils = window.lucifexApp?.utils

    if (this.state.isPhysicsDebugEnabled) {
      this.state.physicsVisualDebug.enable()
      if (debugToggle) {
        debugToggle.textContent = "Hide Physics"
        debugToggle.classList.add("active")
      }
      if (utils) {
        utils.updatePhysicsStatus("🔍 Physics debug visualization enabled")
      }
    } else {
      this.state.physicsVisualDebug.disable()
      if (debugToggle) {
        debugToggle.textContent = "Show Physics"
        debugToggle.classList.remove("active")
      }
      if (utils) {
        utils.updatePhysicsStatus("Physics debug visualization disabled")
      }
    }
  }

  logPhysicsStatus() {
    console.log("=== PHYSICS STATUS ===")
    console.log("Physics enabled:", this.state.isPhysicsEnabled)
    console.log("Cloth simulation:", this.state.clothSimulation)
    console.log("Physics debug:", this.state.physicsVisualDebug)
    console.log("Current garment:", this.state.currentGarmentUrl)
    console.log("Current avatar:", this.state.currentAvatarUrl)

    if (this.state.clothSimulation) {
      console.log("Simulation status:", this.state.clothSimulation.getStatus())
    }

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updatePhysicsStatus("📊 Physics status logged to console")
    }
  }

  startDropTest() {
    if (!window.PhysicsDropTest) {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("❌ Drop test not available")
      }
      return
    }

    if (!this.state.physicsDropTest) {
      const physicsDropTest = new window.PhysicsDropTest()
      physicsDropTest.initialize()
      this.state.setPhysicsDropTest(physicsDropTest)
    }

    this.state.physicsDropTest.startDropTest()

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updatePhysicsStatus("🎬 Drop test started - dramatic cloth falling!")
      utils.showPhysicsEffect("🎬 Drop Test Active!\nWatch the dramatic cloth fall!")
    }
  }

  startBasicTest() {
    if (!window.PhysicsTest) {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("❌ Basic test not available")
      }
      return
    }

    if (!this.state.physicsTest) {
      const physicsTest = new window.PhysicsTest()
      physicsTest.initialize()
      this.state.setPhysicsTest(physicsTest)
    }

    this.state.physicsTest.runBasicTest()

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updatePhysicsStatus("🧪 Basic physics test running")
    }
  }

  resetClothPosition() {
    if (this.state.clothSimulation) {
      this.state.clothSimulation.resetClothPosition()

      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("🔄 Cloth position reset - watch it fall again!")
        utils.showPhysicsEffect("🔄 Cloth Reset!\nWatch it fall and drape again!")
      }
    } else {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("❌ No active physics simulation to reset")
      }
    }
  }
}
