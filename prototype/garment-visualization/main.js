// Main application entry point
import { AppState } from "./modules/app-state.js"
import { Utils } from "./modules/utils.js"
import { ModelManager } from "./modules/model-manager.js"
import { EnvironmentManager } from "./modules/environment-manager.js"
import { PhysicsManager } from "./modules/physics-manager.js"
import { UIControls } from "./modules/ui-controls.js"

class LucifexApp {
  constructor() {
    this.state = null
    this.utils = null
    this.modelManager = null
    this.environmentManager = null
    this.physicsManager = null
    this.uiControls = null
  }

  async initialize() {
    try {
      console.log("🚀 Lucifex Garment Visualizer initializing...")

      // Initialize core modules
      this.state = new AppState()
      this.utils = new Utils(this.state)
      this.modelManager = new ModelManager(this.state)
      this.environmentManager = new EnvironmentManager(this.state)
      this.physicsManager = new PhysicsManager(this.state)
      this.uiControls = new UIControls(this.state)

      // Initialize all modules
      await this.modelManager.initialize()
      await this.environmentManager.initialize()
      await this.physicsManager.initialize()
      await this.uiControls.initialize()

      console.log("✅ Lucifex Garment Visualizer initialized successfully")

      // Check for available models and load them
      await this.modelManager.checkForAvailableModels()
    } catch (error) {
      console.error("❌ Failed to initialize Lucifex:", error)
    }
  }

  cleanup() {
    if (this.uiControls) this.uiControls.cleanup()
    if (this.physicsManager) this.physicsManager.cleanup()
    if (this.environmentManager) this.environmentManager.cleanup()
    if (this.modelManager) this.modelManager.cleanup()
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  const app = new LucifexApp()
  await app.initialize()

  // Make app globally available for debugging and module access
  window.lucifexApp = app
})

// Live reload for development
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  console.log("Live reload enabled.")
  try {
    const ws = new WebSocket("ws://localhost:8080")
    ws.onmessage = () => location.reload()
  } catch (e) {
    // WebSocket connection failed, continue without live reload
  }
}
