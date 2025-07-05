// Main application entry point
import { AppState } from "./modules/app-state.js"
import { Utils } from "./modules/utils.js"
import { ModelManager } from "./modules/model-manager.js"
import { EnvironmentManager } from "./modules/environment-manager.js"
import { PhysicsManager } from "./modules/physics-manager.js"
import { UIControls } from "./modules/ui-controls.js"

class LucifexApp {
  constructor() {
    // Initialize state
    this.state = new AppState()

    // Initialize managers
    this.utils = new Utils(this.state)
    this.modelManager = new ModelManager(this.state)
    this.environmentManager = new EnvironmentManager(this.state)
    this.physicsManager = new PhysicsManager(this.state)
    this.uiControls = new UIControls(this.state)

    console.log("🚀 Lucifex Garment Visualizer initializing...")
  }

  async initialize() {
    try {
      // Initialize all managers in order
      await this.utils.initialize()
      await this.modelManager.initialize()
      await this.environmentManager.initialize()
      await this.physicsManager.initialize()
      await this.uiControls.initialize()

      console.log("✅ Lucifex Garment Visualizer initialized successfully")

      // Check for available models and load them
      await this.modelManager.checkForAvailableModels()

      return true
    } catch (error) {
      console.error("❌ Failed to initialize Lucifex Garment Visualizer:", error)
      return false
    }
  }

  cleanup() {
    this.uiControls?.cleanup()
    this.physicsManager?.cleanup()
    this.modelManager?.cleanup()
    this.environmentManager?.cleanup()
    this.utils?.cleanup()
    this.state?.reset()
  }
}

// Initialize the application
const app = new LucifexApp()

// Make app globally available for debugging and module access
window.lucifexApp = app

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => app.initialize())
} else {
  app.initialize()
}

// Live reload for development
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  console.log("Live reload enabled.")
  const ws = new WebSocket("ws://localhost:35729")
  ws.onmessage = (event) => {
    if (event.data === "reload") {
      location.reload()
    }
  }
}

export { LucifexApp }
