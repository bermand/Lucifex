// Model loading and management
export class ModelManager {
  constructor(state, utils) {
    this.state = state
    this.utils = utils
    console.log("🎭 ModelManager initialized")
  }

  async initialize() {
    console.log("✅ ModelManager initialized")
    await this.checkForAvailableModels()
  }

  async checkForAvailableModels() {
    this.utils.updateStatus("🔍 Checking for available models...")

    // Check for default avatar
    try {
      const avatarResponse = await fetch("../assets/avatars/male.glb", { method: "HEAD" })
      if (avatarResponse.ok) {
        console.log("✅ Found avatar: male.glb")
        this.state.setAvatarUrl("../assets/avatars/male.glb")
      }
    } catch (error) {
      console.log("⚠️ Default avatar not found")
    }

    // Check for default garment
    try {
      const garmentResponse = await fetch("../assets/garments/tshirt-1.glb", { method: "HEAD" })
      if (garmentResponse.ok) {
        console.log("✅ Found garment: tshirt-1.glb")
        this.state.setGarmentUrl("../assets/garments/tshirt-1.glb")
      }
    } catch (error) {
      console.log("⚠️ Default garment not found")
    }

    // Load combined view if both models are available
    if (this.state.hasBothModels) {
      this.utils.updateStatus("🎯 Both models found - loading combined view...")
      this.state.setModelType("both")
      await this.createCombinedView()
    } else if (this.state.hasAvatar) {
      this.utils.updateStatus("👤 Avatar found - loading avatar view...")
      this.state.setModelType("avatar")
      await this.loadSingleModel("avatar")
    } else if (this.state.hasGarment) {
      this.utils.updateStatus("👕 Garment found - loading garment view...")
      this.state.setModelType("garment")
      await this.loadSingleModel("garment")
    } else {
      this.utils.updateStatus("⚠️ No models found - please upload models")
    }
  }

  async loadPresetAvatar(avatarType) {
    const avatarUrls = {
      male: "../assets/avatars/male.glb",
      female: "../assets/avatars/female.glb",
    }

    const url = avatarUrls[avatarType]
    if (url) {
      this.state.setAvatarUrl(url)
      this.utils.updateStatus(`Loading preset avatar: ${avatarType}`)

      if (this.state.getModelType() === "both" && this.state.hasGarment) {
        await this.createCombinedView()
      } else {
        await this.loadSingleModel("avatar")
      }
    }
  }

  async loadPresetGarment(garmentType) {
    const garmentUrls = {
      tshirt: "../assets/garments/tshirt.glb",
      "tshirt-1": "../assets/garments/tshirt-1.glb",
      thsirt: "../assets/garments/thsirt.glb",
    }

    const url = garmentUrls[garmentType]
    if (url) {
      this.state.setGarmentUrl(url)
      this.utils.updateStatus(`Loading preset garment: ${garmentType}`)

      if (this.state.getModelType() === "both" && this.state.hasAvatar) {
        await this.createCombinedView()
      } else {
        await this.loadSingleModel("garment")
      }
    }
  }

  async loadCustomModel(file, type) {
    if (!this.utils.isValidModelFile(file)) {
      this.utils.updateStatus("❌ Invalid file type. Please upload .glb or .gltf files")
      return
    }

    this.utils.handleFileUpload(file, async (url, fileInfo) => {
      if (type === "avatar") {
        this.state.setAvatarUrl(url)
        this.utils.updateStatus(`Loading custom avatar: ${fileInfo.name}`)
      } else {
        this.state.setGarmentUrl(url)
        this.utils.updateStatus(`Loading custom garment: ${fileInfo.name}`)
      }

      if (this.state.getModelType() === "both" && this.state.hasBothModels) {
        await this.createCombinedView()
      } else {
        await this.loadSingleModel(type)
      }
    })
  }

  async loadSingleModel(type) {
    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    if (!mainViewer) return

    // Show single viewer, hide combined
    mainViewer.style.display = "block"
    combinedContainer.style.display = "none"

    const url = type === "avatar" ? this.state.getAvatarUrl() : this.state.getGarmentUrl()
    if (url) {
      mainViewer.src = url
      this.state.setMainViewer(mainViewer)
      this.utils.updateModelInfo(
        type === "avatar" ? "Avatar" : "Garment",
        type.charAt(0).toUpperCase() + type.slice(1),
        "Loaded",
      )
    }
  }

  async createCombinedView() {
    if (!this.state.hasBothModels) {
      this.utils.updateStatus("⚠️ Both avatar and garment required for combined view")
      return
    }

    this.utils.updateStatus("🔄 Creating combined view with unified background...")

    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    if (!combinedContainer) return

    // Hide single viewer, show combined
    mainViewer.style.display = "none"
    combinedContainer.style.display = "block"

    // Clear existing content
    combinedContainer.innerHTML = ""

    // Create unified background viewer with avatar
    const backgroundViewer = document.createElement("model-viewer")
    backgroundViewer.id = "avatar-viewer"
    backgroundViewer.setAttribute("alt", "Avatar")
    backgroundViewer.setAttribute("camera-controls", "")
    backgroundViewer.setAttribute("auto-rotate", "")
    backgroundViewer.setAttribute("shadow-intensity", "1")
    backgroundViewer.setAttribute("exposure", "1")
    backgroundViewer.setAttribute("environment-image", "neutral")
    backgroundViewer.src = this.state.getAvatarUrl()
    backgroundViewer.style.width = "100%"
    backgroundViewer.style.height = "100%"
    backgroundViewer.style.position = "absolute"
    backgroundViewer.style.top = "0"
    backgroundViewer.style.left = "0"

    // Create overlay viewer with garment
    const overlayViewer = document.createElement("model-viewer")
    overlayViewer.id = "garment-viewer"
    overlayViewer.setAttribute("alt", "Garment")
    overlayViewer.setAttribute("camera-controls", "")
    overlayViewer.setAttribute("disable-zoom", "")
    overlayViewer.src = this.state.getGarmentUrl()
    overlayViewer.style.width = "100%"
    overlayViewer.style.height = "100%"
    overlayViewer.style.position = "absolute"
    overlayViewer.style.top = "0"
    overlayViewer.style.left = "0"
    overlayViewer.style.background = "transparent"
    overlayViewer.style.pointerEvents = "none"

    // Add viewers to container
    combinedContainer.appendChild(backgroundViewer)
    combinedContainer.appendChild(overlayViewer)

    // Store references
    this.state.setCombinedViewerContainer(combinedContainer)

    // Update model info
    this.utils.updateModelInfo("Avatar + Garment", "Combined", "Ready")
    this.utils.updateCombinationStatus("Active")
    this.utils.updateStatus("✅ Combined view created with unified background")

    console.log("Combined view created successfully")
  }

  updateAvatarTransform(scale, opacity) {
    const avatarViewer = document.getElementById("avatar-viewer")
    if (avatarViewer) {
      avatarViewer.style.transform = `scale(${scale})`
      avatarViewer.style.opacity = opacity
    }
  }

  updateGarmentTransform(scale, opacity, offsetX = 0, offsetY = 0) {
    const garmentViewer = document.getElementById("garment-viewer")
    if (garmentViewer) {
      const transform = `scale(${scale}) translateX(${offsetX * 100}px) translateY(${offsetY * 100}px)`
      garmentViewer.style.transform = transform
      garmentViewer.style.opacity = opacity
    }
  }

  switchModelType(type) {
    this.state.setModelType(type)

    switch (type) {
      case "avatar":
        if (this.state.hasAvatar) {
          this.loadSingleModel("avatar")
        }
        break
      case "garment":
        if (this.state.hasGarment) {
          this.loadSingleModel("garment")
        }
        break
      case "both":
        if (this.state.hasBothModels) {
          this.createCombinedView()
        }
        break
    }
  }

  resetCombination() {
    this.state.setModelType("both")
    if (this.state.hasBothModels) {
      this.createCombinedView()
    }
    this.utils.updateStatus("🔄 Combination reset")
  }

  cleanup() {
    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    if (mainViewer) {
      mainViewer.src = ""
    }

    if (combinedContainer) {
      combinedContainer.innerHTML = ""
    }

    console.log("🎭 ModelManager cleaned up")
  }
}
