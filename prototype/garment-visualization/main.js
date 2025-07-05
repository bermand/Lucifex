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
    console.log("🚀 Lucifex Garment Visualizer initializing...")
  }

  async initialize() {
    try {
      // Initialize core modules
      this.state = new AppState()
      this.utils = new Utils()
      this.modelManager = new ModelManager(this.state, this.utils)
      this.environmentManager = new EnvironmentManager(this.state, this.utils)
      this.physicsManager = new PhysicsManager(this.state)
      this.uiControls = new UIControls(
        this.state,
        this.modelManager,
        this.environmentManager,
        this.physicsManager,
        this.utils,
      )

      // Initialize all modules
      await this.utils.initialize()
      await this.modelManager.initialize()
      await this.environmentManager.initialize()
      await this.physicsManager.initialize()
      await this.uiControls.initialize()

      // Setup keyboard shortcuts
      this.uiControls.setupKeyboardShortcuts()

      console.log("✅ Lucifex Garment Visualizer initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize Lucifex Garment Visualizer:", error)
      this.utils?.updateStatus("❌ Initialization failed")
    }
  }

  // Get current application state
  getState() {
    return this.state?.getState()
  }

  // Reset application
  reset() {
    this.state?.reset()
    this.utils?.updateStatus("🔄 Application reset")
  }

  // Cleanup resources
  cleanup() {
    this.uiControls?.cleanup()
    this.physicsManager?.cleanup()
    this.environmentManager?.cleanup()
    this.modelManager?.cleanup()
    this.utils?.cleanup()
    this.state?.reset()
    console.log("🧹 Lucifex Garment Visualizer cleaned up")
  }
}

// Initialize the application
const app = new LucifexApp()

// Make app globally available for debugging
window.lucifexApp = app

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    app.initialize()
  })
} else {
  app.initialize()
}

// Handle page unload
window.addEventListener("beforeunload", () => {
  app.cleanup()
})

// Live reload for development
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  console.log("Live reload enabled.")
  try {
    const ws = new WebSocket("ws://localhost:35729/")
    ws.onmessage = (event) => {
      if (event.data === "reload") {
        location.reload()
      }
    }
    ws.onerror = () => {
      console.log("WebSocket connection to 'ws://localhost:35729/' failed:")
    }
  } catch (error) {
    console.log("WebSocket connection to 'ws://localhost:35729/' failed:")
  }
}

export default app
