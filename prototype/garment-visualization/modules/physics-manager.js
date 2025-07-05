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
    const utils = window.lucifexApp?.utils

    try {
      // Load all physics modules using script tags instead of imports
      const modules = [
        { name: "SimpleClothPhysics", path: "./physics/simple-cloth-physics.js" },
        { name: "ClothSimulation", path: "./physics/cloth-simulation.js" },
        { name: "PhysicsVisualDebug", path: "./physics/visual-debug.js" },
        { name: "PhysicsTest", path: "./physics/physics-test.js" },
        { name: "PhysicsDropTest", path: "./physics/drop-test.js" },
        { name: "PhysicsMeshUpdater", path: "./physics/mesh-updater.js" },
      ]

      for (const module of modules) {
        try {
          await this.loadScript(module.path, module.name)
        } catch (error) {
          console.warn(`⚠️ Failed to load ${module.name}:`, error)
        }
      }

      if (utils) {
        utils.updatePhysicsStatus("All modules loaded successfully")
      }

      console.log("✅ All physics modules loaded successfully")
    } catch (error) {
      console.error("❌ Error loading physics modules:", error)
      if (utils) {
        utils.updatePhysicsStatus("Error loading physics modules")
      }
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

  async togglePhysics() {
    const utils = window.lucifexApp?.utils

    if (!this.state.isPhysicsEnabled) {
      await this.enablePhysics()
    } else {
      this.disablePhysics()
    }

    // Update button state
    const button = document.getElementById("physics-toggle")
    if (button) {
      if (this.state.isPhysicsEnabled) {
        button.classList.add("active")
        button.textContent = "🔴 Disable Physics"
      } else {
        button.classList.remove("active")
        button.textContent = "🧬 Enable Physics"
      }
    }

    if (utils) {
      utils.updateStatus(`Physics ${this.state.isPhysicsEnabled ? "enabled" : "disabled"}`)
    }
  }

  async enablePhysics() {
    const utils = window.lucifexApp?.utils

    try {
      if (!this.state.isInCombinedMode) {
        if (utils) {
          utils.updateStatus("❌ Physics requires combined view mode")
        }
        return
      }

      this.state.setPhysicsEnabled(true)

      // Initialize physics components
      if (window.ClothSimulation && !this.state.clothSimulation) {
        this.state.setClothSimulation(new window.ClothSimulation())
        await this.state.clothSimulation.initialize()
      }

      if (window.PhysicsMeshUpdater && !this.state.physicsMeshUpdater && this.state.garmentViewer) {
        this.state.setPhysicsMeshUpdater(new window.PhysicsMeshUpdater())
        this.state.physicsMeshUpdater.initialize(this.state.garmentViewer)
      }

      if (window.PhysicsVisualDebug && !this.state.physicsVisualDebug) {
        this.state.setPhysicsVisualDebug(new window.PhysicsVisualDebug())
        this.state.physicsVisualDebug.initialize()
      }

      // Start physics simulation
      if (this.state.clothSimulation) {
        this.state.clothSimulation.startSimulation()
      }

      if (utils) {
        utils.updatePhysicsStatus("Physics simulation active")
        utils.showPhysicsEffect("Physics Enabled - Cloth simulation active")
      }
    } catch (error) {
      console.error("Error enabling physics:", error)
      if (utils) {
        utils.updatePhysicsStatus("Error enabling physics")
      }
    }
  }

  disablePhysics() {
    const utils = window.lucifexApp?.utils

    this.state.setPhysicsEnabled(false)

    // Stop physics simulation
    if (this.state.clothSimulation) {
      this.state.clothSimulation.stopSimulation()
    }

    if (utils) {
      utils.updatePhysicsStatus("Physics simulation stopped")
      utils.showPhysicsEffect("Physics Disabled")
    }
  }

  resetPhysics() {
    const utils = window.lucifexApp?.utils

    if (this.state.clothSimulation) {
      this.state.clothSimulation.resetSimulation()
    }

    if (this.state.physicsMeshUpdater) {
      this.state.physicsMeshUpdater.resetMesh()
    }

    if (utils) {
      utils.updateStatus("Physics simulation reset")
      utils.showPhysicsEffect("Physics Reset")
    }
  }

  resetClothPosition() {
    const utils = window.lucifexApp?.utils

    if (this.state.clothSimulation) {
      this.state.clothSimulation.resetClothPosition()
    }

    if (utils) {
      utils.updateStatus("Cloth position reset")
      utils.showPhysicsEffect("Cloth Position Reset")
    }
  }

  togglePhysicsDebug() {
    const utils = window.lucifexApp?.utils

    this.state.setPhysicsDebugEnabled(!this.state.isPhysicsDebugEnabled)

    if (this.state.physicsVisualDebug) {
      if (this.state.isPhysicsDebugEnabled) {
        this.state.physicsVisualDebug.show()
      } else {
        this.state.physicsVisualDebug.hide()
      }
    }

    // Update button state
    const button = document.getElementById("debug-toggle")
    if (button) {
      if (this.state.isPhysicsDebugEnabled) {
        button.classList.add("active")
        button.textContent = "🔍 Hide Debug"
      } else {
        button.classList.remove("active")
        button.textContent = "🔍 Show Debug"
      }
    }

    if (utils) {
      utils.updateStatus(`Physics debug ${this.state.isPhysicsDebugEnabled ? "enabled" : "disabled"}`)
    }
  }

  logPhysicsStatus() {
    const utils = window.lucifexApp?.utils

    console.log("=== Physics Status ===")
    console.log("Physics Enabled:", this.state.isPhysicsEnabled)
    console.log("Debug Enabled:", this.state.isPhysicsDebugEnabled)
    console.log("Cloth Simulation:", !!this.state.clothSimulation)
    console.log("Mesh Updater:", !!this.state.physicsMeshUpdater)
    console.log("Visual Debug:", !!this.state.physicsVisualDebug)

    if (utils) {
      utils.updateStatus("Physics status logged to console")
    }
  }

  startDropTest() {
    const utils = window.lucifexApp?.utils

    if (!this.state.isPhysicsEnabled) {
      if (utils) {
        utils.updateStatus("❌ Enable physics first")
      }
      return
    }

    if (window.PhysicsDropTest && !this.state.physicsDropTest) {
      this.state.setPhysicsDropTest(new window.PhysicsDropTest())
    }

    if (this.state.physicsDropTest) {
      this.state.physicsDropTest.startDropTest()
      if (utils) {
        utils.updateStatus("Drop test started")
        utils.showPhysicsEffect("Drop Test Active")
      }
    }
  }

  startBasicTest() {
    const utils = window.lucifexApp?.utils

    if (window.PhysicsTest && !this.state.physicsTest) {
      this.state.setPhysicsTest(new window.PhysicsTest())
    }

    if (this.state.physicsTest) {
      this.state.physicsTest.runBasicTest()
      if (utils) {
        utils.updateStatus("Basic physics test started")
        utils.showPhysicsEffect("Basic Test Active")
      }
    }
  }

  updatePhysicsSettings() {
    const clothStiffness = document.getElementById("cloth-stiffness")?.value || 0.3
    const gravityStrength = document.getElementById("gravity-strength")?.value || 0.8

    if (this.state.clothSimulation) {
      this.state.clothSimulation.updateSettings({
        stiffness: Number.parseFloat(clothStiffness),
        gravity: Number.parseFloat(gravityStrength),
      })
    }

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("Physics settings updated")
    }
  }

  cleanup() {
    this.disablePhysics()

    // Clean up all physics instances
    if (this.state.clothSimulation) {
      this.state.clothSimulation.cleanup()
    }

    if (this.state.physicsVisualDebug) {
      this.state.physicsVisualDebug.cleanup()
    }

    if (this.state.physicsTest) {
      this.state.physicsTest.cleanup()
    }

    if (this.state.physicsDropTest) {
      this.state.physicsDropTest.cleanup()
    }

    if (this.state.physicsMeshUpdater) {
      this.state.physicsMeshUpdater.cleanup()
    }
  }
}
