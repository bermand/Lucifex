// Main application entry point
import { AppState } from "./modules/app-state.js"
import { Utils } from "./modules/utils.js"
import { ModelManager } from "./modules/model-manager.js"
import { EnvironmentManager } from "./modules/environment-manager.js"
import { PhysicsManager } from "./modules/physics-manager.js"
import { UIControls } from "./modules/ui-controls.js"

class LucifexApp {
  constructor() {
    this.state = new AppState()
    this.utils = new Utils(this.state)
    this.modelManager = new ModelManager(this.state)
    this.environmentManager = new EnvironmentManager(this.state)
    this.physicsManager = new PhysicsManager(this.state)
    this.uiControls = new UIControls(this.state)

    // Make available globally for modules to access
    window.lucifexApp = this
  }

  async initialize() {
    try {
      console.log("🚀 Lucifex Garment Visualizer initializing...")

      // Initialize all managers
      await this.modelManager.initialize()
      await this.environmentManager.initialize()
      await this.physicsManager.initialize()
      await this.uiControls.initialize()

      // Check for available models and load them
      await this.modelManager.checkForAvailableModels()

      console.log("✅ Lucifex Garment Visualizer initialized successfully")

      // Set up live reload for development
      this.setupLiveReload()
    } catch (error) {
      console.error("❌ Failed to initialize Lucifex App:", error)
      this.utils.updateStatus("❌ Initialization failed")
    }
  }

  setupLiveReload() {
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      console.log("Live reload enabled.")

      // Simple live reload check every 2 seconds
      setInterval(() => {
        fetch(location.href, { method: "HEAD" }).catch(() => location.reload())
      }, 2000)
    }
  }

  cleanup() {
    this.modelManager?.cleanup()
    this.physicsManager?.cleanup()
    this.uiControls?.cleanup()
  }
}

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  const app = new LucifexApp()
  await app.initialize()
})

// Handle page unload
window.addEventListener("beforeunload", () => {
  if (window.lucifexApp) {
    window.lucifexApp.cleanup()
  }
})
