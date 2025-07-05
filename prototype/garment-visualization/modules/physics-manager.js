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
      // Since the physics modules don't exist as ES6 modules,
      // we'll create placeholder functionality
      const modules = [
        "SimpleClothPhysics",
        "ClothSimulation",
        "PhysicsVisualDebug",
        "PhysicsTest",
        "PhysicsDropTest",
        "PhysicsMeshUpdater",
      ]

      for (const moduleName of modules) {
        try {
          // Try to load the module, but don't fail if it doesn't exist
          const modulePath = `./physics/${moduleName
            .toLowerCase()
            .replace(/([A-Z])/g, "-$1")
            .substring(1)}.js`
          await import(modulePath)
          console.log(`✅ ${moduleName} loaded`)
        } catch (error) {
          console.log(`❌ Failed to load ${moduleName}:`, error)
          // Create a placeholder for missing modules
          this.createPlaceholderModule(moduleName)
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

  createPlaceholderModule(moduleName) {
    // Create basic placeholder functionality for missing physics modules
    switch (moduleName) {
      case "ClothSimulation":
        this.state.setClothSimulation({
          reset: () => console.log("🔄 Cloth simulation reset (placeholder)"),
          resetCloth: () => console.log("📍 Cloth reset (placeholder)"),
          updateSetting: (setting, value) => console.log(`Physics ${setting}: ${value} (placeholder)`),
        })
        break
      case "PhysicsTest":
        this.state.setPhysicsTest({
          runBasicTest: () => console.log("🧪 Running basic physics test (placeholder)"),
        })
        break
      case "PhysicsDropTest":
        this.state.setPhysicsDropTest({
          runTest: () => console.log("🎬 Running drop test (placeholder)"),
        })
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
      button.innerHTML = `<span class="btn-icon">🔍</span> ${this.state.isPhysicsDebugEnabled ? "Hide Debug" : "Show Debug"}`
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
        this.createPlaceholderModule("PhysicsDropTest")
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

    this.state.setPhysicsEnabled(false)
    this.state.setPhysicsDebugEnabled(false)

    console.log("🧬 PhysicsManager cleaned up")
  }
}
