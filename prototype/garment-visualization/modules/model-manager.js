// Model loading and management
export class ModelManager {
  constructor(state, utils) {
    this.state = state
    this.utils = utils
    console.log("🎭 ModelManager initialized")
  }

  initialize() {
    this.checkForAvailableModels()
    console.log("✅ ModelManager initialized")
  }

  async checkForAvailableModels() {
    this.utils.updateStatus("🔍 Checking for available models...")

    // Check for default avatar
    const avatarExists = await this.utils.checkFileExists("../assets/avatars/male.glb")
    if (avatarExists) {
      console.log("✅ Found avatar: male.glb")
      this.state.setAvatarUrl("../assets/avatars/male.glb")
    }

    // Check for default garment
    const garmentExists = await this.utils.checkFileExists("../assets/garments/tshirt-1.glb")
    if (garmentExists) {
      console.log("✅ Found garment: tshirt-1.glb")
      this.state.setGarmentUrl("../assets/garments/tshirt-1.glb")
    }

    if (this.state.hasAvatar && this.state.hasGarment) {
      this.utils.updateStatus("🎯 Both models found - loading combined view...")
      this.state.setCurrentModelType("both")
      this.createCombinedView()
    } else if (this.state.hasAvatar) {
      this.utils.updateStatus("👤 Avatar found - loading avatar view...")
      this.state.setCurrentModelType("avatar")
      this.updateModelDisplay("avatar")
    } else if (this.state.hasGarment) {
      this.utils.updateStatus("👕 Garment found - loading garment view...")
      this.state.setCurrentModelType("garment")
      this.updateModelDisplay("garment")
    } else {
      this.utils.updateStatus("⚠️ No default models found")
    }
  }

  async loadPresetAvatar(avatarType) {
    const avatarUrl = `../assets/avatars/${avatarType}.glb`
    this.utils.updateStatus(`Loading preset avatar: ${avatarType}.glb`)

    const exists = await this.utils.checkFileExists(avatarUrl)
    if (exists) {
      this.state.setAvatarUrl(avatarUrl)
      this.updateModelDisplay(this.state.getCurrentModelType())
      this.utils.updateStatus(`✅ Avatar loaded: ${avatarType}.glb`)
    } else {
      this.utils.updateStatus(`❌ Avatar not found: ${avatarType}.glb`)
    }
  }

  async loadPresetGarment(garmentType) {
    const garmentUrl = `../assets/garments/${garmentType}.glb`
    this.utils.updateStatus(`Loading preset garment: ${garmentType}.glb`)

    const exists = await this.utils.checkFileExists(garmentUrl)
    if (exists) {
      this.state.setGarmentUrl(garmentUrl)
      this.updateModelDisplay(this.state.getCurrentModelType())
      this.utils.updateStatus(`✅ Garment loaded: ${garmentType}.glb`)
    } else {
      this.utils.updateStatus(`❌ Garment not found: ${garmentType}.glb`)
    }
  }

  loadCustomAvatar(url, filename) {
    this.state.setAvatarUrl(url)
    this.updateModelDisplay(this.state.getCurrentModelType())
    this.utils.updateStatus(`✅ Custom avatar loaded: ${filename}`)
  }

  loadCustomGarment(url, filename) {
    this.state.setGarmentUrl(url)
    this.updateModelDisplay(this.state.getCurrentModelType())
    this.utils.updateStatus(`✅ Custom garment loaded: ${filename}`)
  }

  updateModelDisplay(modelType) {
    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    switch (modelType) {
      case "avatar":
        this.showSingleModel(this.state.getAvatarUrl(), "Avatar")
        break
      case "garment":
        this.showSingleModel(this.state.getGarmentUrl(), "Garment")
        break
      case "both":
        this.createCombinedView()
        break
      default:
        this.utils.updateStatus("❌ Unknown model type")
    }
  }

  showSingleModel(url, type) {
    if (!url) {
      this.utils.updateStatus(`❌ No ${type.toLowerCase()} URL available`)
      return
    }

    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    if (mainViewer && combinedContainer) {
      // Hide combined view, show single viewer
      combinedContainer.style.display = "none"
      mainViewer.style.display = "block"
      mainViewer.src = url

      this.state.setMainViewer(mainViewer)
      this.utils.updateModelInfo(`${type} Model`, type)
      this.utils.updateStatus(`✅ ${type} displayed`)
    }
  }

  createCombinedView() {
    if (!this.state.hasAvatar || !this.state.hasGarment) {
      this.utils.updateStatus("❌ Both avatar and garment required for combined view")
      return
    }

    this.utils.updateStatus("🔄 Creating combined view with unified background...")

    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    if (mainViewer && combinedContainer) {
      // Hide single viewer, show combined container
      mainViewer.style.display = "none"
      combinedContainer.style.display = "block"

      // Clear existing content
      combinedContainer.innerHTML = ""

      // Create unified background and viewers
      const avatarViewer = document.createElement("model-viewer")
      const garmentViewer = document.createElement("model-viewer")

      // Configure avatar viewer
      avatarViewer.src = this.state.getAvatarUrl()
      avatarViewer.alt = "Avatar"
      avatarViewer.setAttribute("camera-controls", "")
      avatarViewer.setAttribute("auto-rotate", "")
      avatarViewer.setAttribute("shadow-intensity", "1")
      avatarViewer.setAttribute("exposure", "1")
      avatarViewer.setAttribute("environment-image", "neutral")
      avatarViewer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        --poster-color: transparent;
      `

      // Configure garment viewer
      garmentViewer.src = this.state.getGarmentUrl()
      garmentViewer.alt = "Garment"
      garmentViewer.setAttribute("camera-controls", "")
      garmentViewer.setAttribute("auto-rotate", "")
      garmentViewer.setAttribute("shadow-intensity", "1")
      garmentViewer.setAttribute("exposure", "1")
      garmentViewer.setAttribute("environment-image", "neutral")
      garmentViewer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        --poster-color: transparent;
      `

      // Add viewers to container
      combinedContainer.appendChild(avatarViewer)
      combinedContainer.appendChild(garmentViewer)

      // Store references
      this.state.setCombinedViewerContainer(combinedContainer)
      this.state.setMainViewer(garmentViewer) // Use garment as main for controls

      this.utils.updateModelInfo("Combined View", "Avatar + Garment")
      this.utils.updateStatus("✅ Combined view created with unified background")
      console.log("Combined view created successfully")
    }
  }

  updateAvatarScale(scale) {
    const combinedContainer = this.state.combinedViewerContainer
    if (combinedContainer) {
      const avatarViewer = combinedContainer.querySelector("model-viewer:first-child")
      if (avatarViewer) {
        avatarViewer.style.transform = `scale(${scale})`
      }
    }
    this.utils.updateStatus(`Avatar scale: ${scale}`)
  }

  updateAvatarOpacity(opacity) {
    const combinedContainer = this.state.combinedViewerContainer
    if (combinedContainer) {
      const avatarViewer = combinedContainer.querySelector("model-viewer:first-child")
      if (avatarViewer) {
        avatarViewer.style.opacity = opacity
      }
    }
    this.utils.updateStatus(`Avatar opacity: ${opacity}`)
  }

  updateGarmentScale(scale) {
    const combinedContainer = this.state.combinedViewerContainer
    if (combinedContainer) {
      const garmentViewer = combinedContainer.querySelector("model-viewer:last-child")
      if (garmentViewer) {
        garmentViewer.style.transform = `scale(${scale})`
      }
    }
    this.utils.updateStatus(`Garment scale: ${scale}`)
  }

  updateGarmentOpacity(opacity) {
    const combinedContainer = this.state.combinedViewerContainer
    if (combinedContainer) {
      const garmentViewer = combinedContainer.querySelector("model-viewer:last-child")
      if (garmentViewer) {
        garmentViewer.style.opacity = opacity
      }
    }
    this.utils.updateStatus(`Garment opacity: ${opacity}`)
  }

  updateGarmentScaleInCombined(scale) {
    this.updateGarmentScale(scale)
  }

  updateGarmentPosition(axis, offset) {
    const combinedContainer = this.state.combinedViewerContainer
    if (combinedContainer) {
      const garmentViewer = combinedContainer.querySelector("model-viewer:last-child")
      if (garmentViewer) {
        const currentTransform = garmentViewer.style.transform || ""
        const scaleMatch = currentTransform.match(/scale$$[^)]*$$/)
        const baseTransform = scaleMatch ? scaleMatch[0] : "scale(1)"

        if (axis === "x") {
          garmentViewer.style.transform = `${baseTransform} translateX(${offset * 100}px)`
        } else if (axis === "y") {
          garmentViewer.style.transform = `${baseTransform} translateY(${offset * 100}px)`
        }
      }
    }
    this.utils.updateStatus(`Garment ${axis.toUpperCase()} position: ${offset}`)
  }

  generateCombinedView() {
    if (this.state.hasAvatar && this.state.hasGarment) {
      this.createCombinedView()
      this.utils.updateStatus("🎯 Combined view generated")
    } else {
      this.utils.updateStatus("❌ Both avatar and garment required")
    }
  }

  resetCombination() {
    // Reset all combined controls to default values
    const controls = [
      { id: "garment-scale-combined", value: 1.0 },
      { id: "garment-offset-x", value: 0.0 },
      { id: "garment-offset-y", value: 0.0 },
    ]

    controls.forEach(({ id, value }) => {
      const control = document.getElementById(id)
      if (control) {
        control.value = value
        const displayId = id + "-value"
        this.utils.updateValueDisplay(id, displayId)
      }
    })

    // Reset visual transforms
    this.updateGarmentScaleInCombined(1.0)
    this.updateGarmentPosition("x", 0.0)
    this.updateGarmentPosition("y", 0.0)

    this.utils.updateStatus("🔄 Combination reset to defaults")
  }

  cleanup() {
    // Clean up any resources
    console.log("🎭 ModelManager cleaned up")
  }
}
