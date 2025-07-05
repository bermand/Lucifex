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
        utils.updateStatus("✅ Found avatar: male.glb")
        this.state.setAvatarUrl("../assets/avatars/male.glb")
      }

      // Check for default garment
      const garmentExists = await utils.checkFileExists("../assets/garments/tshirt-1.glb")
      if (garmentExists) {
        utils.updateStatus("✅ Found garment: tshirt-1.glb")
        this.state.setGarmentUrl("../assets/garments/tshirt-1.glb")
      }

      if (avatarExists && garmentExists) {
        utils.updateStatus("🎯 Both models found - loading combined view...")
        await this.generateCombinedView()
      } else if (avatarExists) {
        utils.updateStatus("👤 Avatar found - loading avatar view...")
        this.loadSingleModel(this.state.currentAvatarUrl, "avatar")
      } else if (garmentExists) {
        utils.updateStatus("👕 Garment found - loading garment view...")
        this.loadSingleModel(this.state.currentGarmentUrl, "garment")
      } else {
        utils.updateStatus("📁 No default models found - ready for file upload")
      }
    } catch (error) {
      console.error("Error checking for models:", error)
      utils.updateStatus("⚠️ Error checking for default models")
    }
  }

  loadSingleModel(url, type) {
    const utils = window.lucifexApp?.utils
    const viewer = this.state.mainViewer

    if (!viewer) return

    viewer.src = url
    viewer.style.display = "block"

    // Hide combined container if it exists
    const combinedContainer = document.getElementById("combined-container")
    if (combinedContainer) {
      combinedContainer.style.display = "none"
    }

    if (utils) {
      utils.updateModelInfo(url, type)
      utils.updateStatus(`✅ ${type} loaded successfully`)
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

      document.body.appendChild(combinedContainer)

      // Store references
      this.state.setAvatarViewer(document.getElementById("avatar-viewer"))
      this.state.setGarmentViewer(document.getElementById("garment-viewer"))

      // Apply initial settings
      this.updateModelOpacity("avatar", 0.7)
      this.updateModelOpacity("garment", 1.0)

      if (utils) {
        utils.updateStatus("✅ Combined view created with unified background")
        utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)
      }
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

    if (utils) {
      utils.updateStatus("Combination reset")
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
    } else if (type === "avatar" && this.state.mainViewer) {
      if (this.state.mainViewer.style.display !== "none") {
        this.state.mainViewer.style.transform = `scale(${scale})`
      }
    } else if (type === "garment" && this.state.mainViewer) {
      if (this.state.mainViewer.style.display !== "none") {
        this.state.mainViewer.style.transform = `scale(${scale})`
      }
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
}
