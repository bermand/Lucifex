// Main application entry point
import { UIControls } from "./modules/ui-controls.js"
import { ModelManager } from "./modules/model-manager.js"
import { PhysicsManager } from "./modules/physics-manager.js"
import { EnvironmentManager } from "./modules/environment-manager.js"
import { AppState } from "./modules/app-state.js"
import { Utils } from "./modules/utils.js"

class LucifexApp {
  constructor() {
    this.state = new AppState()
    this.utils = new Utils()
    this.modelManager = new ModelManager(this.state)
    this.environmentManager = new EnvironmentManager(this.state)
    this.physicsManager = new PhysicsManager(this.state)
    this.uiControls = new UIControls(this.state, {
      modelManager: this.modelManager,
      environmentManager: this.environmentManager,
      physicsManager: this.physicsManager,
      utils: this.utils,
    })
  }

  async initialize() {
    try {
      console.log("🚀 Lucifex Garment Visualizer initializing...")

      // Initialize all modules
      await this.modelManager.initialize()
      await this.environmentManager.initialize()
      await this.physicsManager.initialize()
      await this.uiControls.initialize()

      // Check for available models
      await this.modelManager.checkForAvailableModels()

      console.log("✅ Lucifex Garment Visualizer initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize Lucifex App:", error)
      this.utils.updateStatus("❌ Failed to initialize application")
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  const app = new LucifexApp()
  await app.initialize()

  // Make app globally available for debugging
  window.lucifexApp = app
})

// Live reload for development
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  console.log("Live reload enabled.")

  setInterval(() => {
    fetch(location.href, { method: "HEAD" }).catch(() => location.reload())
  }, 2000)
}
