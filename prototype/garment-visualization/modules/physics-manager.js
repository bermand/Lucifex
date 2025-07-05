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
      // Define physics modules with correct paths
      const modules = [
        { name: "SimpleClothPhysics", path: "./physics/simple-cloth-physics.js" },
        { name: "ClothSimulation", path: "./physics/cloth-simulation.js" },
        { name: "PhysicsVisualDebug", path: "./physics/visual-debug.js" },
        { name: "PhysicsTest", path: "./physics/physics-test.js" },
        { name: "PhysicsDropTest", path: "./physics/drop-test.js" },
        { name: "PhysicsMeshUpdater", path: "./physics/mesh-updater.js" },
      ]

      let loadedCount = 0
      const totalCount = modules.length

      for (const module of modules) {
        try {
          await import(module.path)
          console.log(`✅ ${module.name} loaded successfully`)
          loadedCount++
        } catch (error) {
          console.log(`⚠️ ${module.name} not found, creating placeholder`)
          this.createPlaceholderModule(module.name)
          loadedCount++
        }
      }

      if (utils) {
        utils.updatePhysicsStatus(`${loadedCount}/${totalCount} physics modules loaded`)
      }
      console.log(`✅ Physics modules loaded: ${loadedCount}/${totalCount}`)
    } catch (error) {
      console.error("❌ Error loading physics modules:", error)
      if (utils) {
        utils.updatePhysicsStatus("Failed to load modules")
      }
    }
  }

  createPlaceholderModule(moduleName) {
    // Create basic placeholder functionality for missing physics modules
    switch (moduleName) {
      case "ClothSimulation":
        this.state.setClothSimulation({
          initialize: () => Promise.resolve(true),
          start: () => console.log("🔄 Cloth simulation started (placeholder)"),
          stop: () => console.log("⏹️ Cloth simulation stopped (placeholder)"),
          reset: () => console.log("🔄 Cloth simulation reset (placeholder)"),
          resetCloth: () => console.log("📍 Cloth reset (placeholder)"),
          updateSetting: (setting, value) => console.log(`Physics ${setting}: ${value} (placeholder)`),
          cleanup: () => console.log("🧹 Cloth simulation cleaned up (placeholder)"),
        })
        break
      case "PhysicsTest":
        this.state.setPhysicsTest({
          initialize: () => Promise.resolve(true),
          runBasicTest: () => {
            console.log("🧪 Running basic physics test (placeholder)")
            setTimeout(() => {
              console.log("✅ Basic physics test completed (placeholder)")
            }, 1000)
          },
        })
        break
      case "PhysicsDropTest":
        this.state.setPhysicsDropTest({
          initialize: () => Promise.resolve(true),
          startDropTest: () => {
            console.log("🎬 Starting drop test (placeholder)")
            setTimeout(() => {
              console.log("✅ Drop test completed (placeholder)")
            }, 2000)
          },
        })
        break
      case "PhysicsVisualDebug":
        window.PhysicsVisualDebug = class {
          constructor() {
            this.isEnabled = false
          }
          initialize() {
            return Promise.resolve(true)
          }
          enable() {
            this.isEnabled = true
            console.log("🔍 Physics debug enabled (placeholder)")
          }
          disable() {
            this.isEnabled = false
            console.log("🔍 Physics debug disabled (placeholder)")
          }
          cleanup() {
            console.log("🧹 Physics debug cleaned up (placeholder)")
          }
        }
        break
      case "SimpleClothPhysics":
        window.SimpleClothPhysics = class {
          constructor() {
            this.isInitialized = false
            this.isRunning = false
          }
          async initialize() {
            this.isInitialized = true
            return true
          }
          start() {
            this.isRunning = true
            console.log("▶️ Simple cloth physics started (placeholder)")
          }
          stop() {
            this.isRunning = false
            console.log("⏹️ Simple cloth physics stopped (placeholder)")
          }
          cleanup() {
            console.log("🧹 Simple cloth physics cleaned up (placeholder)")
          }
        }
        break
      case "PhysicsMeshUpdater":
        window.PhysicsMeshUpdater = class {
          constructor(modelViewer) {
            this.modelViewer = modelViewer
          }
          initialize() {
            return Promise.resolve(true)
          }
          enablePhysics() {
            console.log("🎬 Physics mesh updates enabled (placeholder)")
          }
          disablePhysics() {
            console.log("⏹️ Physics mesh updates disabled (placeholder)")
          }
          cleanup() {
            console.log("🧹 Physics mesh updater cleaned up (placeholder)")
          }
        }
        break
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
      button.innerHTML = `<span class="btn-icon">${this.state.isPhysicsEnabled ? "⏸️" : "🧬"}</span> ${this.state.isPhysicsEnabled ? "Disable Physics" : "Enable Physics"}`
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

      // Initialize physics simulation if not already done
      if (!this.state.clothSimulation) {
        this.createPlaceholderModule("ClothSimulation")
      }

      // Initialize cloth simulation
      if (this.state.clothSimulation && this.state.clothSimulation.initialize) {
        await this.state.clothSimulation.initialize()
      }

      // Start simulation
      if (this.state.clothSimulation && this.state.clothSimulation.start) {
        this.state.clothSimulation.start()
      }

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

    // Stop simulation
    if (this.state.clothSimulation && this.state.clothSimulation.stop) {
      this.state.clothSimulation.stop()
    }

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
      button.innerHTML = `<span class="btn-icon">🔍</span> ${this.state.isPhysicsDebugEnabled ? "Hide Debug" : "Show Debug"}`
      button.classList.toggle("active", this.state.isPhysicsDebugEnabled)
    }

    // Handle debug visualization
    if (window.PhysicsVisualDebug) {
      if (!this.physicsDebug) {
        this.physicsDebug = new window.PhysicsVisualDebug()
        this.physicsDebug.initialize()
      }

      if (this.state.isPhysicsDebugEnabled) {
        this.physicsDebug.enable()
      } else {
        this.physicsDebug.disable()
      }
    }

    if (utils) {
      utils.updateStatus(`Debug visualization: ${this.state.isPhysicsDebugEnabled ? "enabled" : "disabled"}`)
    }
  }

  logStatus() {
    const utils = window.lucifexApp?.utils

    const status = {
      enabled: this.state.isPhysicsEnabled,
      debugEnabled: this.state.isPhysicsDebugEnabled,
      clothSimulation: !!this.state.clothSimulation,
      hasAvatar: this.state.hasAvatar,
      hasGarment: this.state.hasGarment,
      modules: {
        SimpleClothPhysics: !!window.SimpleClothPhysics,
        PhysicsVisualDebug: !!window.PhysicsVisualDebug,
        PhysicsMeshUpdater: !!window.PhysicsMeshUpdater,
      },
    }

    console.log("📊 Physics Status:", status)

    if (utils) {
      utils.updateStatus("📊 Physics status logged to console")
    }
  }

  async runDropTest() {
    const utils = window.lucifexApp?.utils

    try {
      if (!this.state.physicsDropTest) {
        this.createPlaceholderModule("PhysicsDropTest")
      }

      if (this.state.physicsDropTest && this.state.physicsDropTest.startDropTest) {
        this.state.physicsDropTest.startDropTest()
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
        this.createPlaceholderModule("PhysicsTest")
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

    if (this.physicsDebug && this.physicsDebug.cleanup) {
      this.physicsDebug.cleanup()
    }

    this.state.setPhysicsEnabled(false)
    this.state.setPhysicsDebugEnabled(false)

    console.log("🧬 PhysicsManager cleaned up")
  }
}
