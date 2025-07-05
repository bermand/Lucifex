// Model loading and management
export class ModelManager {
  constructor(state, utils) {
    this.state = state
    this.utils = utils
    console.log("🎭 ModelManager initialized")
  }

  async initialize() {
    console.log("✅ ModelManager initialized")
    await this.checkAvailableModels()
  }

  async checkAvailableModels() {
    this.utils.updateStatus("🔍 Checking for available models...")

    // Check for default avatar
    try {
      const avatarResponse = await fetch("../assets/avatars/male.glb")
      if (avatarResponse.ok) {
        console.log("✅ Found avatar: male.glb")
        this.state.setAvatarUrl("../assets/avatars/male.glb")
      }
    } catch (error) {
      console.log("⚠️ Default avatar not found")
    }

    // Check for default garments
    const garments = ["tshirt.glb", "tshirt-1.glb", "thsirt.gltf"]
    for (const garment of garments) {
      try {
        const garmentResponse = await fetch(`../assets/garments/${garment}`)
        if (garmentResponse.ok) {
          console.log(`✅ Found garment: ${garment}`)
          this.state.setGarmentUrl(`../assets/garments/${garment}`)
          break
        }
      } catch (error) {
        console.log(`⚠️ Garment ${garment} not found`)
      }
    }

    if (this.state.hasAvatar && this.state.hasGarment) {
      this.utils.updateStatus("🎯 Both models found - loading combined view...")
      this.state.setCurrentModelType("both")
      await this.createCombinedView()
    } else if (this.state.hasAvatar) {
      this.utils.updateStatus("👤 Avatar found - loading avatar view...")
      this.state.setCurrentModelType("avatar")
      await this.loadSingleModel("avatar")
    } else if (this.state.hasGarment) {
      this.utils.updateStatus("👕 Garment found - loading garment view...")
      this.state.setCurrentModelType("garment")
      await this.loadSingleModel("garment")
    } else {
      this.utils.updateStatus("⚠️ No models found - please upload models")
      this.utils.updateModelStatus("Not Found")
    }
  }

  async loadAvatar(url) {
    try {
      this.state.setAvatarUrl(url)
      this.utils.updateStatus("👤 Loading avatar...")

      if (this.state.hasGarment) {
        await this.createCombinedView()
      } else {
        await this.loadSingleModel("avatar")
      }

      this.utils.updateStatus("✅ Avatar loaded successfully")
    } catch (error) {
      console.error("Error loading avatar:", error)
      this.utils.updateStatus("❌ Failed to load avatar")
    }
  }

  async loadGarment(url) {
    try {
      this.state.setGarmentUrl(url)
      this.utils.updateStatus("👕 Loading garment...")

      if (this.state.hasAvatar) {
        await this.createCombinedView()
      } else {
        await this.loadSingleModel("garment")
      }

      this.utils.updateStatus("✅ Garment loaded successfully")
    } catch (error) {
      console.error("Error loading garment:", error)
      this.utils.updateStatus("❌ Failed to load garment")
    }
  }

  async loadSingleModel(type) {
    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    if (mainViewer && combinedContainer) {
      // Hide combined view
      combinedContainer.style.display = "none"

      // Show single viewer
      mainViewer.style.display = "block"

      // Set the model source
      const url = type === "avatar" ? this.state.avatarUrl : this.state.garmentUrl
      mainViewer.setAttribute("src", url)

      // Update model info
      this.updateModelInfo(type, url)

      this.utils.updateModelStatus("Ready")
    }
  }

  async createCombinedView() {
    this.utils.updateStatus("🔄 Creating combined view with unified background...")

    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    if (mainViewer && combinedContainer) {
      // Hide single viewer
      mainViewer.style.display = "none"

      // Show combined container
      combinedContainer.style.display = "block"

      // Clear existing viewers
      combinedContainer.innerHTML = ""

      // Create unified background container
      const backgroundContainer = document.createElement("div")
      backgroundContainer.className = "unified-background"
      backgroundContainer.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 8px;
        overflow: hidden;
      `

      // Create avatar viewer
      if (this.state.hasAvatar) {
        const avatarViewer = this.utils.createModelViewer("avatar-viewer", {
          src: this.state.avatarUrl,
          alt: "Avatar Model",
          environment: "neutral",
        })

        avatarViewer.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          z-index: 1;
        `

        backgroundContainer.appendChild(avatarViewer)
        this.state.setAvatarViewer(avatarViewer)
      }

      // Create garment viewer
      if (this.state.hasGarment) {
        const garmentViewer = this.utils.createModelViewer("garment-viewer", {
          src: this.state.garmentUrl,
          alt: "Garment Model",
          environment: "neutral",
        })

        garmentViewer.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          z-index: 2;
          transform: scale(1.0);
          transition: transform 0.3s ease;
        `

        backgroundContainer.appendChild(garmentViewer)
        this.state.setGarmentViewer(garmentViewer)
      }

      combinedContainer.appendChild(backgroundContainer)
      this.state.setCombinedViewerContainer(combinedContainer)

      // Update model info
      this.updateModelInfo("combined", "Avatar + Garment")

      this.utils.updateStatus("✅ Combined view created with unified background")
      this.utils.updateModelStatus("Ready")
      this.utils.updateCombinationStatus("Ready")

      console.log("Combined view created successfully")
    }
  }

  updateModelInfo(type, source) {
    const modelName = document.getElementById("model-name")
    const modelType = document.getElementById("model-type")
    const modelStatus = document.getElementById("model-status")

    if (modelName) {
      if (type === "combined") {
        modelName.textContent = "Combined View"
      } else {
        const filename = source.split("/").pop()
        modelName.textContent = filename
      }
    }

    if (modelType) {
      modelType.textContent = type.charAt(0).toUpperCase() + type.slice(1)
    }

    if (modelStatus) {
      modelStatus.textContent = "Loaded"
    }
  }

  switchModelType(type) {
    this.state.setCurrentModelType(type)

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
        if (this.state.hasAvatar && this.state.hasGarment) {
          this.createCombinedView()
        }
        break
    }
  }

  // Control methods
  updateGarmentScale(scale) {
    const garmentViewer = this.state.garmentViewer
    if (garmentViewer) {
      garmentViewer.style.transform = `scale(${scale})`
    }
  }

  updateGarmentPosition(x, y) {
    const garmentViewer = this.state.garmentViewer
    if (garmentViewer) {
      const currentTransform = garmentViewer.style.transform || "scale(1.0)"
      const scaleMatch = currentTransform.match(/scale$$[^)]*$$/)
      const scaleTransform = scaleMatch ? scaleMatch[0] : "scale(1.0)"

      garmentViewer.style.transform = `${scaleTransform} translateX(${x * 100}px) translateY(${y * 100}px)`
    }
  }

  updateAvatarScale(scale) {
    const avatarViewer = this.state.avatarViewer
    if (avatarViewer) {
      avatarViewer.style.transform = `scale(${scale})`
    }
  }

  updateOpacity(type, opacity) {
    const viewer = type === "avatar" ? this.state.avatarViewer : this.state.garmentViewer
    if (viewer) {
      viewer.style.opacity = opacity
    }
  }

  // Screenshot functionality
  async takeScreenshot() {
    try {
      let targetElement

      if (this.state.currentModelType === "both" && this.state.combinedViewerContainer) {
        targetElement = this.state.combinedViewerContainer
      } else {
        targetElement = document.getElementById("main-viewer")
      }

      if (targetElement) {
        const blob = await this.utils.takeScreenshot(targetElement)
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
          this.utils.downloadBlob(blob, `lucifex-screenshot-${timestamp}.png`)
          this.utils.updateStatus("📸 Screenshot saved")
        } else {
          throw new Error("Failed to capture screenshot")
        }
      }
    } catch (error) {
      console.error("Screenshot error:", error)
      this.utils.updateStatus("❌ Screenshot failed")
    }
  }

  // Export functionality
  async exportScene() {
    try {
      const sceneData = {
        timestamp: new Date().toISOString(),
        avatar: this.state.avatarUrl,
        garment: this.state.garmentUrl,
        modelType: this.state.currentModelType,
        environment: this.state.currentEnvironment,
        physics: {
          enabled: this.state.isPhysicsEnabled,
          debugEnabled: this.state.isPhysicsDebugEnabled,
        },
      }

      const blob = new Blob([JSON.stringify(sceneData, null, 2)], {
        type: "application/json",
      })

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      this.utils.downloadBlob(blob, `lucifex-scene-${timestamp}.json`)
      this.utils.updateStatus("💾 Scene exported")
    } catch (error) {
      console.error("Export error:", error)
      this.utils.updateStatus("❌ Export failed")
    }
  }

  cleanup() {
    // Clean up any resources
    this.state.setAvatarViewer(null)
    this.state.setGarmentViewer(null)
    this.state.setCombinedViewerContainer(null)
    console.log("🧹 ModelManager cleaned up")
  }
}
