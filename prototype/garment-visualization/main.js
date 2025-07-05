// Main application entry point
import { AppState } from "./modules/app-state.js"
import { Utils } from "./modules/utils.js"
import { ModelManager } from "./modules/model-manager.js"
import { EnvironmentManager } from "./modules/environment-manager.js"
import { PhysicsManager } from "./modules/physics-manager.js"
import { UIControls } from "./modules/ui-controls.js"

class LucifexApp {
  constructor() {
    // Initialize core modules
    this.state = new AppState()
    this.utils = new Utils()
    this.modelManager = new ModelManager(this.state)
    this.environmentManager = new EnvironmentManager(this.state)
    this.physicsManager = new PhysicsManager(this.state)
    this.uiControls = new UIControls(this.state)

    console.log("🚀 Lucifex Garment Visualizer initializing...")
  }

  async initialize() {
    try {
      // Initialize all modules
      await this.utils.initialize()
      await this.modelManager.initialize()
      await this.environmentManager.initialize()
      await this.physicsManager.initialize()
      await this.uiControls.initialize()

      console.log("✅ Lucifex Garment Visualizer initialized successfully")

      // Check for available models and load them
      await this.modelManager.checkForAvailableModels()

      // Set up initial UI state
      this.setupInitialUI()
    } catch (error) {
      console.error("❌ Failed to initialize Lucifex:", error)
      this.utils.updateStatus("❌ Initialization failed")
    }
  }

  setupInitialUI() {
    // Set initial tab
    const firstTab = document.querySelector('.tab[data-tab="avatar"]')
    if (firstTab) {
      firstTab.click()
    }

    // Set initial model type
    const combinedBtn = document.querySelector('.model-btn[data-model-type="both"]')
    if (combinedBtn) {
      combinedBtn.click()
    }

    // Initialize value displays
    const rangeInputs = document.querySelectorAll('input[type="range"]')
    rangeInputs.forEach((input) => {
      const valueId = input.id + "-value"
      this.utils.updateValueDisplay(input.id, valueId)
    })
  }

  cleanup() {
    // Clean up all modules
    this.uiControls.cleanup()
    this.physicsManager.cleanup()
    this.environmentManager.cleanup()
    this.modelManager.cleanup()
    this.utils.cleanup()
    this.state.reset()

    console.log("🧹 Lucifex cleaned up")
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  // Make app globally available
  window.lucifexApp = new LucifexApp()

  // Initialize the application
  await window.lucifexApp.initialize()
})

// Live reload for development
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  console.log("Live reload enabled.")
  const ws = new WebSocket("ws://localhost:35729/")
  ws.onmessage = (event) => {
    if (event.data === "reload") {
      location.reload()
    }
  }
  ws.onerror = () => {
    console.log("WebSocket connection to 'ws://localhost:35729/' failed:")
  }
}

// Handle page unload
window.addEventListener("beforeunload", () => {
  if (window.lucifexApp) {
    window.lucifexApp.cleanup()
  }
})
