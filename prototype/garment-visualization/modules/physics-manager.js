// Physics simulation management
export class PhysicsManager {
  constructor(state) {
    this.state = state
    console.log("🧬 PhysicsManager initialized")
  }

  async initialize() {
    await this.loadPhysicsModules()
    console.log("✅ PhysicsManager initialized")
  }

  async loadPhysicsModules() {
    try {
      // Load physics modules using script tags
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
          if (!window[module.name]) {
            await this.loadScript(module.path)
          }

          if (window[module.name]) {
            console.log(`✅ ${module.name} loaded`)
          } else {
            console.warn(`⚠️ ${module.name} not found after loading`)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to load ${module.name}:`, error)
        }
      }

      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("All modules loaded successfully")
      }

      console.log("✅ All physics modules loaded successfully")
    } catch (error) {
      console.error("❌ Failed to load physics modules:", error)
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Failed to load modules")
      }
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  async togglePhysics() {
    if (this.state.isPhysicsEnabled) {
      this.disablePhysics()
    } else {
      await this.enablePhysics()
    }
  }

  async enablePhysics() {
    if (!this.state.hasGarment) {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Need garment loaded to enable physics")
        utils.updateStatus("❌ Load a garment first to enable physics")
      }
      return
    }

    try {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Initializing physics simulation...")
        utils.updateStatus("🧬 Initializing physics...")
      }

      // Initialize cloth simulation
      if (window.ClothSimulation && !this.state.clothSimulation) {
        const clothSim = new window.ClothSimulation()
        await clothSim.initialize()
        this.state.setClothSimulation(clothSim)
      }

      // Initialize mesh updater
      if (window.PhysicsMeshUpdater && !this.state.physicsMeshUpdater) {
        const meshUpdater = new window.PhysicsMeshUpdater()
        const garmentViewer = this.state.garmentViewer || document.getElementById("combined-garment-viewer")
        if (garmentViewer) {
          await meshUpdater.initialize(garmentViewer)
          this.state.setPhysicsMeshUpdater(meshUpdater)
        }
      }

      // Initialize visual debug
      if (window.PhysicsVisualDebug && !this.state.physicsVisualDebug) {
        const visualDebug = new window.PhysicsVisualDebug()
        await visualDebug.initialize()
        this.state.setPhysicsVisualDebug(visualDebug)
      }

      // Start simulation
      if (this.state.clothSimulation) {
        this.state.clothSimulation.startSimulation()
      }

      this.state.setPhysicsEnabled(true)

      // Update UI
      const physicsToggleBtn = document.getElementById("physics-toggle")
      if (physicsToggleBtn) {
        physicsToggleBtn.textContent = "⏸️ Disable Physics"
        physicsToggleBtn.classList.add("active")
      }

      const physicsControls = document.getElementById("physics-controls")
      if (physicsControls) {
        physicsControls.style.display = "block"
      }

      if (utils) {
        utils.updatePhysicsStatus("Physics simulation active")
        utils.updateStatus("Physics enabled")
        utils.showPhysicsEffect("🧬 Physics Enabled!\nCloth simulation active")
      }
    } catch (error) {
      console.error("Failed to enable physics:", error)
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Failed to enable physics")
        utils.updateStatus("❌ Failed to enable physics")
      }
    }
  }

  disablePhysics() {
    // Stop simulation
    if (this.state.clothSimulation) {
      this.state.clothSimulation.stopSimulation()
    }

    // Clean up
    if (this.state.physicsMeshUpdater) {
      this.state.physicsMeshUpdater.cleanup()
      this.state.setPhysicsMeshUpdater(null)
    }

    this.state.setPhysicsEnabled(false)

    // Update UI
    const physicsToggleBtn = document.getElementById("physics-toggle")
    if (physicsToggleBtn) {
      physicsToggleBtn.textContent = "🧬 Enable Physics"
      physicsToggleBtn.classList.remove("active")
    }

    const physicsControls = document.getElementById("physics-controls")
    if (physicsControls) {
      physicsControls.style.display = "none"
    }

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updatePhysicsStatus("Physics disabled")
      utils.updateStatus("Physics disabled")
    }
  }

  resetPhysics() {
    if (this.state.clothSimulation && this.state.clothSimulation.resetSimulation) {
      this.state.clothSimulation.resetSimulation()

      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Physics reset")
        utils.updateStatus("🔄 Physics reset")
        utils.showPhysicsEffect("🔄 Physics Reset!\nCloth returned to starting position")
      }
    }
  }

  resetClothPosition() {
    if (this.state.clothSimulation && this.state.clothSimulation.resetClothPosition) {
      this.state.clothSimulation.resetClothPosition()

      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Cloth position reset")
        utils.updateStatus("📍 Cloth position reset")
        utils.showPhysicsEffect("📍 Cloth Reset!\nWatch it fall and drape again!")
      }
    }
  }

  togglePhysicsDebug() {
    if (!this.state.physicsVisualDebug) {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Physics debug not available")
      }
      return
    }

    this.state.setPhysicsDebugEnabled(!this.state.isPhysicsDebugEnabled)

    if (this.state.isPhysicsDebugEnabled) {
      this.state.physicsVisualDebug.enable()

      const debugToggleBtn = document.getElementById("debug-toggle")
      if (debugToggleBtn) {
        debugToggleBtn.textContent = "🔍 Hide Debug"
        debugToggleBtn.classList.add("active")
      }

      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Debug visualization enabled")
      }
    } else {
      this.state.physicsVisualDebug.disable()

      const debugToggleBtn = document.getElementById("debug-toggle")
      if (debugToggleBtn) {
        debugToggleBtn.textContent = "🔍 Show Debug"
        debugToggleBtn.classList.remove("active")
      }

      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Debug visualization disabled")
      }
    }
  }

  logPhysicsStatus() {
    console.log("=== Physics Status ===")
    console.log("Physics Enabled:", this.state.isPhysicsEnabled)
    console.log("Debug Enabled:", this.state.isPhysicsDebugEnabled)
    console.log("Cloth Simulation:", !!this.state.clothSimulation)
    console.log("Mesh Updater:", !!this.state.physicsMeshUpdater)
    console.log("Visual Debug:", !!this.state.physicsVisualDebug)

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("Physics status logged to console")
    }
  }

  startDropTest() {
    if (!window.PhysicsDropTest) {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Drop test not available")
      }
      return
    }

    if (!this.state.physicsDropTest) {
      const dropTest = new window.PhysicsDropTest()
      dropTest.initialize()
      this.state.setPhysicsDropTest(dropTest)
    }

    this.state.physicsDropTest.startDropTest()

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updatePhysicsStatus("Drop test started")
      utils.updateStatus("🎬 Drop test started")
      utils.showPhysicsEffect("🎬 Drop Test!\nDramatic cloth falling demo")
    }
  }

  startBasicTest() {
    if (!window.PhysicsTest) {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updatePhysicsStatus("Basic test not available")
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
      utils.updatePhysicsStatus("Basic test running")
      utils.updateStatus("🧪 Basic physics test running")
    }
  }

  updatePhysicsSettings() {
    if (!this.state.clothSimulation) return

    const stiffness = Number.parseFloat(document.getElementById("cloth-stiffness")?.value || 0.3)
    const gravity = Number.parseFloat(document.getElementById("gravity-strength")?.value || 0.8)

    if (this.state.clothSimulation.setGravity) {
      this.state.clothSimulation.setGravity(0, -gravity, 0)
    }

    if (this.state.clothSimulation.setClothStiffness) {
      this.state.clothSimulation.setClothStiffness(null, stiffness)
    }
  }

  cleanup() {
    this.disablePhysics()

    // Clean up all physics objects
    this.state.setClothSimulation(null)
    this.state.setPhysicsVisualDebug(null)
    this.state.setPhysicsMeshUpdater(null)
    this.state.setPhysicsTest(null)
    this.state.setPhysicsDropTest(null)
  }
}
