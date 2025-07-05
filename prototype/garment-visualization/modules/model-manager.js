// Model loading and management
export class ModelManager {
  constructor(state) {
    this.state = state
    console.log("🎭 ModelManager initialized")
  }

  async initialize() {
    console.log("✅ ModelManager initialized")
  }

  async checkForAvailableModels() {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("🔍 Checking for available models...")
    }

    // Check for default avatar
    try {
      const avatarResponse = await fetch("../assets/avatars/male.glb", { method: "HEAD" })
      if (avatarResponse.ok) {
        console.log("✅ Found avatar: male.glb")
        this.state.setAvatarUrl("../assets/avatars/male.glb")
        this.setActiveAvatarButton("male")
      }
    } catch (error) {
      console.log("⚠️ Default avatar not found:", error)
    }

    // Check for default garment
    try {
      const garmentResponse = await fetch("../assets/garments/tshirt-1.glb", { method: "HEAD" })
      if (garmentResponse.ok) {
        console.log("✅ Found garment: tshirt-1.glb")
        this.state.setGarmentUrl("../assets/garments/tshirt-1.glb")
        this.setActiveGarmentButton("tshirt-1")
      }
    } catch (error) {
      console.log("⚠️ Default garment not found:", error)
    }

    // If both models are available, load combined view
    if (this.state.canCombine) {
      if (utils) {
        utils.updateStatus("🎯 Both models found - loading combined view...")
        utils.updateCombinationStatus(true, true)
      }
      this.state.setModelType("both")
      await this.generateCombinedView()
    } else if (this.state.hasAvatar) {
      this.state.setModelType("avatar")
      await this.loadSingleModel(this.state.currentAvatarUrl, "avatar")
    } else if (this.state.hasGarment) {
      this.state.setModelType("garment")
      await this.loadSingleModel(this.state.currentGarmentUrl, "garment")
    }
  }

  setActiveAvatarButton(avatarType) {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.setActiveButtonByData(".avatar-option", "data-avatar", avatarType)
    }
  }

  setActiveGarmentButton(garmentType) {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.setActiveButtonByData(".preset-btn[data-garment]", "data-garment", garmentType)
    }
  }

  async loadSingleModel(url, type) {
    const utils = window.lucifexApp?.utils

    try {
      if (type === "avatar") {
        const viewer = document.getElementById("avatar-viewer")
        if (viewer) {
          viewer.src = url
          this.state.setAvatarViewer(viewer)
          this.state.setMainViewer(viewer)

          viewer.addEventListener("load", () => {
            if (utils) {
              utils.updateStatus("✅ avatar loaded successfully")
            }
            console.log("Model loaded: avatar from", url)
          })
        }
      } else if (type === "garment") {
        const viewer = document.getElementById("garment-viewer")
        if (viewer) {
          viewer.src = url
          this.state.setGarmentViewer(viewer)
          this.state.setMainViewer(viewer)

          viewer.addEventListener("load", () => {
            if (utils) {
              utils.updateStatus("✅ garment loaded successfully")
            }
            console.log("Model loaded: garment from", url)
          })
        }
      }
    } catch (error) {
      console.error(`Error loading ${type}:`, error)
      if (utils) {
        utils.updateStatus(`❌ Failed to load ${type}`)
      }
    }
  }

  async generateCombinedView() {
    const utils = window.lucifexApp?.utils

    if (!this.state.canCombine) {
      if (utils) {
        utils.updateStatus("❌ Need both avatar and garment to create combined view")
      }
      return
    }

    try {
      if (utils) {
        utils.updateStatus("🔄 Creating combined view with unified background...")
      }

      // Get the combined viewer container
      const combinedContainer = document.getElementById("combined-viewer-container")
      if (!combinedContainer) {
        console.error("Combined viewer container not found")
        return
      }

      // Clear existing content
      combinedContainer.innerHTML = ""

      // Create shared background container
      const backgroundContainer = document.createElement("div")
      backgroundContainer.className = "shared-background-container"
      backgroundContainer.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        overflow: hidden;
      `

      // Create avatar viewer
      const avatarViewer = document.createElement("model-viewer")
      avatarViewer.id = "combined-avatar-viewer"
      avatarViewer.src = this.state.currentAvatarUrl
      avatarViewer.setAttribute("alt", "Avatar model")
      avatarViewer.setAttribute("camera-controls", "")
      avatarViewer.setAttribute("auto-rotate", "")
      avatarViewer.setAttribute("shadow-intensity", "1")
      avatarViewer.setAttribute("exposure", "1")
      avatarViewer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        --poster-color: transparent;
      `

      // Create garment viewer
      const garmentViewer = document.createElement("model-viewer")
      garmentViewer.id = "combined-garment-viewer"
      garmentViewer.src = this.state.currentGarmentUrl
      garmentViewer.setAttribute("alt", "Garment model")
      garmentViewer.setAttribute("camera-controls", "")
      garmentViewer.setAttribute("auto-rotate", "")
      garmentViewer.setAttribute("shadow-intensity", "0")
      garmentViewer.setAttribute("exposure", "1")
      garmentViewer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        --poster-color: transparent;
        background: transparent;
      `

      // Add viewers to background container
      backgroundContainer.appendChild(avatarViewer)
      backgroundContainer.appendChild(garmentViewer)
      combinedContainer.appendChild(backgroundContainer)

      // Update state
      this.state.setAvatarViewer(avatarViewer)
      this.state.setGarmentViewer(garmentViewer)
      this.state.setMainViewer(garmentViewer) // Use garment viewer as main for physics

      // Wait for models to load
      await Promise.all([
        new Promise((resolve) => {
          avatarViewer.addEventListener("load", resolve, { once: true })
        }),
        new Promise((resolve) => {
          garmentViewer.addEventListener("load", resolve, { once: true })
        }),
      ])

      if (utils) {
        utils.updateStatus("✅ Combined view created with unified background")
      }

      console.log("Combined view created successfully")
    } catch (error) {
      console.error("Error creating combined view:", error)
      if (utils) {
        utils.updateStatus("❌ Failed to create combined view")
      }
    }
  }

  generateCombinedModel() {
    this.generateCombinedView()
  }

  resetCombination() {
    const utils = window.lucifexApp?.utils

    // Reset to individual view
    this.state.setModelType("avatar")

    if (this.state.hasAvatar) {
      this.loadSingleModel(this.state.currentAvatarUrl, "avatar")
    }

    if (utils) {
      utils.updateStatus("🔄 Combination reset")
    }
  }

  updateModelScale(type, scale) {
    let viewer = null

    if (type === "avatar") {
      viewer = this.state.avatarViewer || document.getElementById("combined-avatar-viewer")
    } else if (type === "garment") {
      viewer = this.state.garmentViewer || document.getElementById("combined-garment-viewer")
    }

    if (viewer && viewer.model) {
      viewer.model.scale.setScalar(scale)
    }
  }

  updateModelOpacity(type, opacity) {
    let viewer = null

    if (type === "avatar") {
      viewer = this.state.avatarViewer || document.getElementById("combined-avatar-viewer")
    } else if (type === "garment") {
      viewer = this.state.garmentViewer || document.getElementById("combined-garment-viewer")
    }

    if (viewer) {
      viewer.style.opacity = opacity
    }
  }

  updateGarmentPosition() {
    const garmentViewer = this.state.garmentViewer || document.getElementById("combined-garment-viewer")
    if (!garmentViewer || !garmentViewer.model) return

    const offsetX = Number.parseFloat(document.getElementById("garment-offset-x")?.value || 0)
    const offsetY = Number.parseFloat(document.getElementById("garment-offset-y")?.value || 0)

    garmentViewer.model.position.set(offsetX, offsetY, 0)
  }

  cleanup() {
    // Clean up viewers
    this.state.setMainViewer(null)
    this.state.setAvatarViewer(null)
    this.state.setGarmentViewer(null)
  }
}
