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

    // Check for avatar models
    const avatarExists = await this.checkModelExists("../assets/avatars/male.glb")
    if (avatarExists) {
      console.log("✅ Found avatar: male.glb")
      this.state.setAvatarUrl("../assets/avatars/male.glb")
    }

    // Check for garment models
    const garmentExists = await this.checkModelExists("../assets/garments/tshirt-1.glb")
    if (garmentExists) {
      console.log("✅ Found garment: tshirt-1.glb")
      this.state.setGarmentUrl("../assets/garments/tshirt-1.glb")
    }

    // If both models exist, create combined view
    if (avatarExists && garmentExists) {
      if (utils) {
        utils.updateStatus("🎯 Both models found - loading combined view...")
      }
      this.state.setCurrentModelType("both")
      await this.createCombinedView()
    }
  }

  async checkModelExists(url) {
    const utils = window.lucifexApp?.utils
    return utils ? await utils.checkFileExists(url) : false
  }

  async loadAvatarModel(url, isFile = false) {
    const utils = window.lucifexApp?.utils

    try {
      if (isFile) {
        // Handle file upload
        const objectUrl = utils.createObjectURL(url)
        this.state.setAvatarUrl(objectUrl)

        if (utils) {
          utils.updateStatus(`Loading custom avatar: ${url.name}`)
          utils.updateFileInfo("avatar-file-info", url, "Avatar")
        }
      } else {
        // Handle preset URL
        this.state.setAvatarUrl(url)

        if (utils) {
          utils.updateStatus(`Loading preset avatar: ${url.split("/").pop()}`)
        }
      }

      // Update combination status
      if (utils) {
        utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)
      }

      // Create combined view if both models are loaded
      if (this.state.hasAvatar && this.state.hasGarment) {
        await this.createCombinedView()
      }

      return true
    } catch (error) {
      console.error("Error loading avatar:", error)
      if (utils) {
        utils.updateStatus("❌ Failed to load avatar")
      }
      return false
    }
  }

  async loadGarmentModel(url, isFile = false) {
    const utils = window.lucifexApp?.utils

    try {
      if (isFile) {
        // Handle file upload
        const objectUrl = utils.createObjectURL(url)
        this.state.setGarmentUrl(objectUrl)

        if (utils) {
          utils.updateStatus(`Loading custom garment: ${url.name}`)
          utils.updateFileInfo("garment-file-info", url, "Garment")
        }
      } else {
        // Handle preset URL
        this.state.setGarmentUrl(url)

        if (utils) {
          utils.updateStatus(`Loading preset garment: ${url.split("/").pop()}`)
        }
      }

      // Update combination status
      if (utils) {
        utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)
      }

      // Create combined view if both models are loaded
      if (this.state.hasAvatar && this.state.hasGarment) {
        await this.createCombinedView()
      }

      return true
    } catch (error) {
      console.error("Error loading garment:", error)
      if (utils) {
        utils.updateStatus("❌ Failed to load garment")
      }
      return false
    }
  }

  async createCombinedView() {
    const utils = window.lucifexApp?.utils

    if (!this.state.hasAvatar || !this.state.hasGarment) {
      if (utils) {
        utils.updateStatus("❌ Both avatar and garment required for combined view")
      }
      return false
    }

    try {
      if (utils) {
        utils.updateStatus("🔄 Creating combined view with unified background...")
      }

      const container = document.getElementById("combined-viewer-container")
      if (!container) {
        console.error("Combined viewer container not found")
        return false
      }

      // Clear existing content
      container.innerHTML = ""

      // Create avatar viewer
      const avatarViewer = document.createElement("model-viewer")
      avatarViewer.id = "avatar-viewer"
      avatarViewer.setAttribute("src", this.state.currentAvatarUrl)
      avatarViewer.setAttribute("alt", "Avatar Model")
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
        z-index: 1;
      `

      // Create garment viewer
      const garmentViewer = document.createElement("model-viewer")
      garmentViewer.id = "garment-viewer"
      garmentViewer.setAttribute("src", this.state.currentGarmentUrl)
      garmentViewer.setAttribute("alt", "Garment Model")
      garmentViewer.setAttribute("camera-controls", "")
      garmentViewer.setAttribute("auto-rotate", "")
      garmentViewer.setAttribute("shadow-intensity", "1")
      garmentViewer.setAttribute("exposure", "1")
      garmentViewer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
      `

      // Add viewers to container
      container.appendChild(avatarViewer)
      container.appendChild(garmentViewer)

      // Store references
      this.state.setCombinedViewerContainer(container)

      if (utils) {
        utils.updateStatus("✅ Combined view created with unified background")
        utils.updateModelInfo("Combined View", "Avatar + Garment")
      }

      console.log("Combined view created successfully")
      return true
    } catch (error) {
      console.error("Error creating combined view:", error)
      if (utils) {
        utils.updateStatus("❌ Failed to create combined view")
      }
      return false
    }
  }

  switchModelType(type) {
    const utils = window.lucifexApp?.utils

    this.state.setCurrentModelType(type)

    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    if (!mainViewer || !combinedContainer) {
      console.error("Viewer elements not found")
      return
    }

    switch (type) {
      case "avatar":
        if (this.state.hasAvatar) {
          mainViewer.setAttribute("src", this.state.currentAvatarUrl)
          mainViewer.style.display = "block"
          combinedContainer.style.display = "none"

          if (utils) {
            utils.updateModelInfo("Avatar Only", "Avatar")
          }
        }
        break

      case "garment":
        if (this.state.hasGarment) {
          mainViewer.setAttribute("src", this.state.currentGarmentUrl)
          mainViewer.style.display = "block"
          combinedContainer.style.display = "none"

          if (utils) {
            utils.updateModelInfo("Garment Only", "Garment")
          }
        }
        break

      case "both":
        if (this.state.hasAvatar && this.state.hasGarment) {
          mainViewer.style.display = "none"
          combinedContainer.style.display = "block"

          if (utils) {
            utils.updateModelInfo("Combined View", "Avatar + Garment")
          }
        }
        break
    }

    // Update active button
    if (utils) {
      utils.setActiveButtonByData(".model-btn", "data-model-type", type)
    }
  }

  updateModelScale(type, scale) {
    const viewers = this.getViewersForType(type)

    viewers.forEach((viewer) => {
      if (viewer && viewer.model) {
        // Use Three.js scale if available
        if (viewer.model.scale) {
          viewer.model.scale.setScalar(Number.parseFloat(scale))
        }
      } else {
        // Fallback to CSS transform
        if (viewer) {
          viewer.style.transform = `scale(${scale})`
        }
      }
    })
  }

  updateModelOpacity(type, opacity) {
    const viewers = this.getViewersForType(type)

    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.style.opacity = opacity
      }
    })
  }

  updateModelPosition(type, x, y) {
    const viewers = this.getViewersForType(type)

    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.style.transform = `translate(${x * 100}px, ${y * 100}px)`
      }
    })
  }

  getViewersForType(type) {
    const viewers = []

    switch (type) {
      case "avatar":
        const avatarViewer = document.getElementById("avatar-viewer")
        if (avatarViewer) viewers.push(avatarViewer)
        break

      case "garment":
        const garmentViewer = document.getElementById("garment-viewer")
        if (garmentViewer) viewers.push(garmentViewer)
        break

      case "both":
        const avatarV = document.getElementById("avatar-viewer")
        const garmentV = document.getElementById("garment-viewer")
        if (avatarV) viewers.push(avatarV)
        if (garmentV) viewers.push(garmentV)
        break
    }

    return viewers
  }

  cleanup() {
    // Clean up any object URLs
    const utils = window.lucifexApp?.utils

    if (utils) {
      if (this.state.currentAvatarUrl && this.state.currentAvatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(this.state.currentAvatarUrl)
      }

      if (this.state.currentGarmentUrl && this.state.currentGarmentUrl.startsWith("blob:")) {
        URL.revokeObjectURL(this.state.currentGarmentUrl)
      }
    }

    console.log("🎭 ModelManager cleaned up")
  }
}
