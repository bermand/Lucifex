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
    const utils = window.lucifexApp?.utils

    try {
      // Load all physics modules
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
          const moduleImport = await import(module.path)
          const ModuleClass = moduleImport[module.name]

          if (ModuleClass) {
            console.log(`✅ ${module.name} loaded`)
          } else {
            console.warn(`⚠️ ${module.name} class not found in module`)
          }
        } catch (error) {
          console.error(`❌ Failed to load ${module.name}:`, error)
        }
      }

      if (utils) {
        utils.updatePhysicsStatus("All modules loaded successfully")
      }
      console.log("✅ All physics modules loaded successfully")
    } catch (error) {
      console.error("❌ Error loading physics modules:", error)
      if (utils) {
        utils.updatePhysicsStatus("Failed to load modules")
      }
    }
  }

  async togglePhysics() {
    const utils = window.lucifexApp?.utils

    if (!this.state.isPhysicsEnabled) {
      await this.enablePhysics()
    } else {
      this.disablePhysics()
    }

    // Update button text
    const button = document.getElementById("physics-toggle")
    if (button) {
      button.textContent = this.state.isPhysicsEnabled ? "⏸️ Disable Physics" : "🧬 Enable Physics"
    }

    // Show/hide physics controls
    const controls = document.getElementById("physics-controls")
    if (controls) {
      controls.style.display = this.state.isPhysicsEnabled ? "block" : "none"
    }

    // Update physics indicator
    const indicator = document.getElementById("physics-indicator")
    const statusText = indicator?.querySelector(".status-text")
    if (statusText) {
      statusText.textContent = `Physics: ${this.state.isPhysicsEnabled ? "Enabled" : "Disabled"}`
    }
    if (indicator) {
      indicator.className = `status-indicator ${this.state.isPhysicsEnabled ? "success" : "error"}`
    }

    if (utils) {
      utils.updatePhysicsStatus(this.state.isPhysicsEnabled ? "Enabled" : "Disabled")
    }
  }

  async enablePhysics() {
    const utils = window.lucifexApp?.utils

    try {
      if (utils) {
        utils.updateStatus("🧬 Enabling physics simulation...")
        utils.showPhysicsEffect("🧬 Physics Enabled!")
      }

      // Initialize physics simulation
      if (!this.state.clothSimulation) {
        const { ClothSimulation } = await import("./physics/cloth-simulation.js")
        this.state.setClothSimulation(new ClothSimulation())
      }

      // Initialize other physics components as needed
      this.state.setPhysicsEnabled(true)

      if (utils) {
        utils.updateStatus("✅ Physics simulation enabled")
      }
    } catch (error) {
      console.error("Error enabling physics:", error)
      if (utils) {
        utils.updateStatus("❌ Failed to enable physics")
      }
    }
  }

  disablePhysics() {
    const utils = window.lucifexApp?.utils

    this.state.setPhysicsEnabled(false)

    if (utils) {
      utils.updateStatus("⏸️ Physics simulation disabled")
      utils.showPhysicsEffect("⏸️ Physics Disabled")
    }
  }

  resetPhysics() {
    const utils = window.lucifexApp?.utils

    if (this.state.clothSimulation && this.state.clothSimulation.reset) {
      this.state.clothSimulation.reset()
    }

    if (utils) {
      utils.updateStatus("🔄 Physics simulation reset")
      utils.showPhysicsEffect("🔄 Physics Reset")
    }
  }

  resetCloth() {
    const utils = window.lucifexApp?.utils

    if (this.state.clothSimulation && this.state.clothSimulation.resetCloth) {
      this.state.clothSimulation.resetCloth()
    }

    if (utils) {
      utils.updateStatus("📍 Cloth position reset")
      utils.showPhysicsEffect("📍 Cloth Reset")
    }
  }

  toggleDebug() {
    this.state.setPhysicsDebugEnabled(!this.state.isPhysicsDebugEnabled)
    const utils = window.lucifexApp?.utils

    const button = document.getElementById("debug-toggle")
    if (button) {
      button.textContent = this.state.isPhysicsDebugEnabled ? "🔍 Hide Debug" : "🔍 Show Debug"
      button.classList.toggle("active", this.state.isPhysicsDebugEnabled)
    }

    if (utils) {
      utils.updateStatus(`Debug visualization: ${this.state.isPhysicsDebugEnabled ? "enabled" : "disabled"}`)
    }
  }

  logStatus() {
    const utils = window.lucifexApp?.utils

    console.log("📊 Physics Status:", {
      enabled: this.state.isPhysicsEnabled,
      debugEnabled: this.state.isPhysicsDebugEnabled,
      clothSimulation: !!this.state.clothSimulation,
      hasAvatar: this.state.hasAvatar,
      hasGarment: this.state.hasGarment,
    })

    if (utils) {
      utils.updateStatus("📊 Physics status logged to console")
    }
  }

  async runDropTest() {
    const utils = window.lucifexApp?.utils

    try {
      if (!this.state.physicsDropTest) {
        const { PhysicsDropTest } = await import("./physics/drop-test.js")
        this.state.setPhysicsDropTest(new PhysicsDropTest())
      }

      if (this.state.physicsDropTest && this.state.physicsDropTest.runTest) {
        this.state.physicsDropTest.runTest()
      }

      if (utils) {
        utils.updateStatus("🎬 Running drop test...")
        utils.showPhysicsEffect("🎬 Drop Test Started!")
      }
    } catch (error) {
      console.error("Error running drop test:", error)
      if (utils) {
        utils.updateStatus("❌ Drop test failed")
      }
    }
  }

  async runBasicTest() {
    const utils = window.lucifexApp?.utils

    try {
      if (!this.state.physicsTest) {
        const { PhysicsTest } = await import("./physics/physics-test.js")
        this.state.setPhysicsTest(new PhysicsTest())
      }

      if (this.state.physicsTest && this.state.physicsTest.runBasicTest) {
        this.state.physicsTest.runBasicTest()
      }

      if (utils) {
        utils.updateStatus("🧪 Running basic physics test...")
        utils.showPhysicsEffect("🧪 Basic Test Started!")
      }
    } catch (error) {
      console.error("Error running basic test:", error)
      if (utils) {
        utils.updateStatus("❌ Basic test failed")
      }
    }
  }

  updatePhysicsSetting(setting, value) {
    const utils = window.lucifexApp?.utils

    if (this.state.clothSimulation && this.state.clothSimulation.updateSetting) {
      this.state.clothSimulation.updateSetting(setting, value)
    }

    if (utils) {
      utils.updateStatus(`Physics ${setting}: ${value}`)
    }
  }

  cleanup() {
    if (this.state.clothSimulation && this.state.clothSimulation.cleanup) {
      this.state.clothSimulation.cleanup()
    }

    this.state.setPhysicsEnabled(false)
    this.state.setPhysicsDebugEnabled(false)

    console.log("🧬 PhysicsManager cleaned up")
  }
}
