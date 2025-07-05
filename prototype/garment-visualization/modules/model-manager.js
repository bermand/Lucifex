// Model loading and management
export class ModelManager {
  constructor(state) {
    this.state = state
    console.log("🎭 ModelManager initialized")
  }

  async initialize() {
    try {
      // Get main viewer reference
      this.state.setMainViewer(document.getElementById("main-viewer"))
      console.log("✅ ModelManager initialized")
    } catch (error) {
      console.error("❌ Failed to initialize ModelManager:", error)
    }
  }

  async checkForAvailableModels() {
    const utils = window.lucifexApp?.utils
    if (!utils) return

    utils.updateStatus("🔍 Checking for available models...")

    try {
      // Check for default avatar
      const avatarExists = await utils.checkFileExists("../assets/avatars/male.glb")
      if (avatarExists) {
        console.log("✅ Found avatar: male.glb")
        this.state.setAvatarUrl("../assets/avatars/male.glb")

        // Auto-select the male avatar button
        utils.setActiveButtonByData(".avatar-option", "data-avatar", "male")
      }

      // Check for default garment
      const garmentExists = await utils.checkFileExists("../assets/garments/tshirt-1.glb")
      if (garmentExists) {
        console.log("✅ Found garment: tshirt-1.glb")
        this.state.setGarmentUrl("../assets/garments/tshirt-1.glb")

        // Auto-select the tshirt-1 garment button
        utils.setActiveButtonByData(".preset-btn[data-garment]", "data-garment", "tshirt-1")
      }

      // Load models based on what was found
      if (avatarExists && garmentExists) {
        utils.updateStatus("🎯 Both models found - loading combined view...")
        this.state.setModelType("both")
        utils.setActiveButtonByData(".model-btn", "data-model-type", "both")
        await this.generateCombinedView()
      } else if (avatarExists) {
        utils.updateStatus("👤 Avatar found - loading avatar view...")
        this.state.setModelType("avatar")
        utils.setActiveButtonByData(".model-btn", "data-model-type", "avatar")
        this.loadSingleModel(this.state.currentAvatarUrl, "avatar")
      } else if (garmentExists) {
        utils.updateStatus("👕 Garment found - loading garment view...")
        this.state.setModelType("garment")
        utils.setActiveButtonByData(".model-btn", "data-model-type", "garment")
        this.loadSingleModel(this.state.currentGarmentUrl, "garment")
      } else {
        utils.updateStatus("📁 No default models found - ready for file upload")
      }

      // Update combination status
      utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)
    } catch (error) {
      console.error("Error checking for models:", error)
      utils.updateStatus("⚠️ Error checking for default models")
    }
  }

  loadSingleModel(url, type) {
    const utils = window.lucifexApp?.utils
    const viewer = this.state.mainViewer

    if (!viewer) {
      console.error("Main viewer not found")
      return
    }

    // Hide combined container if it exists
    const combinedContainer = document.getElementById("combined-container")
    if (combinedContainer) {
      combinedContainer.style.display = "none"
    }

    // Show and configure main viewer
    viewer.style.display = "block"
    viewer.src = url

    // Apply environment settings
    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.applyEnvironmentToViewer(viewer)
    }

    if (utils) {
      utils.updateModelInfo(url, type)
      utils.updateStatus(`✅ ${type} loaded successfully`)
    }

    console.log(`Model loaded: ${type} from ${url}`)
  }

  async generateCombinedView() {
    const utils = window.lucifexApp?.utils

    if (!this.state.canCombine) {
      if (utils) {
        utils.updateStatus("❌ Need both avatar and garment to create combined view")
      }
      return
    }

    if (utils) {
      utils.updateStatus("🔄 Creating combined view with unified background...")
    }

    try {
      // Hide main viewer
      if (this.state.mainViewer) {
        this.state.mainViewer.style.display = "none"
      }

      // Remove existing combined container
      const existingContainer = document.getElementById("combined-container")
      if (existingContainer) {
        existingContainer.remove()
      }

      // Create new combined container with unified background
      const combinedContainer = document.createElement("div")
      combinedContainer.id = "combined-container"
      combinedContainer.innerHTML = `
        <model-viewer 
          id="avatar-viewer"
          class="model-avatar"
          src="${this.state.currentAvatarUrl}"
          camera-controls 
          touch-action="pan-y"
          auto-rotate
          auto-rotate-delay="3000"
          rotation-per-second="30deg"
          shadow-intensity="1"
          shadow-softness="0.5"
          exposure="1"
          tone-mapping="aces"
          environment-image="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr"
          skybox-image="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr">
        </model-viewer>
        <model-viewer 
          id="garment-viewer"
          class="model-garment"
          src="${this.state.currentGarmentUrl}"
          camera-controls 
          touch-action="pan-y"
          auto-rotate
          auto-rotate-delay="3000"
          rotation-per-second="30deg"
          shadow-intensity="1"
          shadow-softness="0.5"
          exposure="1"
          tone-mapping="aces">
        </model-viewer>
      `

      // Insert into viewer container
      const viewerContainer = document.querySelector(".viewer-container")
      if (viewerContainer) {
        viewerContainer.appendChild(combinedContainer)
      }

      // Wait for model-viewer elements to be ready
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Store references
      this.state.setAvatarViewer(document.getElementById("avatar-viewer"))
      this.state.setGarmentViewer(document.getElementById("garment-viewer"))

      // Apply initial settings
      this.updateModelOpacity("avatar", 0.7)
      this.updateModelOpacity("garment", 1.0)

      // Apply environment settings to both viewers
      const environmentManager = window.lucifexApp?.environmentManager
      if (environmentManager) {
        environmentManager.applyEnvironmentToViewer(this.state.avatarViewer)
        environmentManager.applyEnvironmentToViewer(this.state.garmentViewer)
      }

      if (utils) {
        utils.updateStatus("✅ Combined view created with unified background")
        utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)
        utils.updateModelInfo(`${this.state.currentAvatarUrl} + ${this.state.currentGarmentUrl}`, "combined")
      }

      console.log("Combined view created successfully")
    } catch (error) {
      console.error("Error creating combined view:", error)
      if (utils) {
        utils.updateStatus("❌ Error creating combined view")
      }
    }
  }

  generateCombinedModel() {
    if (!this.state.canCombine) {
      const utils = window.lucifexApp?.utils
      if (utils) {
        utils.updateStatus("❌ Need both avatar and garment to generate combined model")
      }
      return
    }

    this.generateCombinedView()
  }

  resetCombination() {
    const utils = window.lucifexApp?.utils

    // Reset to single model view
    const combinedContainer = document.getElementById("combined-container")
    if (combinedContainer) {
      combinedContainer.style.display = "none"
    }

    if (this.state.mainViewer) {
      this.state.mainViewer.style.display = "block"
      this.state.mainViewer.src = ""
    }

    // Clear viewer references
    this.state.setAvatarViewer(null)
    this.state.setGarmentViewer(null)

    if (utils) {
      utils.updateStatus("Combination reset")
      utils.updateModelInfo("", "none")
    }
  }

  // Model scaling
  updateModelScale(type, scale) {
    if (type === "avatar" && this.state.avatarViewer) {
      this.state.avatarViewer.style.transform = `scale(${scale})`
    } else if (type === "garment" && this.state.garmentViewer) {
      const offsetX = Number.parseFloat(document.getElementById("garment-offset-x")?.value || 0)
      const offsetY = Number.parseFloat(document.getElementById("garment-offset-y")?.value || 0)
      this.state.garmentViewer.style.transform = `scale(${scale}) translate(${offsetX * 100}px, ${offsetY * -100}px)`
    } else if (type === "avatar" && this.state.mainViewer && this.state.currentModelType === "avatar") {
      this.state.mainViewer.style.transform = `scale(${scale})`
    } else if (type === "garment" && this.state.mainViewer && this.state.currentModelType === "garment") {
      this.state.mainViewer.style.transform = `scale(${scale})`
    }
  }

  // Model opacity
  updateModelOpacity(type, opacity) {
    if (type === "avatar" && this.state.avatarViewer) {
      this.state.avatarViewer.style.opacity = opacity
    } else if (type === "garment" && this.state.garmentViewer) {
      this.state.garmentViewer.style.opacity = opacity
    }
  }

  // Garment positioning
  updateGarmentPosition() {
    if (!this.state.garmentViewer) return

    const offsetX = Number.parseFloat(document.getElementById("garment-offset-x")?.value || 0)
    const offsetY = Number.parseFloat(document.getElementById("garment-offset-y")?.value || 0)
    const scale = Number.parseFloat(document.getElementById("garment-scale-combined")?.value || 1)

    this.state.garmentViewer.style.transform = `scale(${scale}) translate(${offsetX * 100}px, ${offsetY * -100}px)`
  }

  // Cleanup
  cleanup() {
    // Clean up object URLs
    const utils = window.lucifexApp?.utils
    if (utils) {
      if (this.state.currentAvatarUrl && this.state.currentAvatarUrl.startsWith("blob:")) {
        utils.revokeObjectURL(this.state.currentAvatarUrl)
      }
      if (this.state.currentGarmentUrl && this.state.currentGarmentUrl.startsWith("blob:")) {
        utils.revokeObjectURL(this.state.currentGarmentUrl)
      }
    }

    // Remove combined container
    const combinedContainer = document.getElementById("combined-container")
    if (combinedContainer) {
      combinedContainer.remove()
    }
  }
}
