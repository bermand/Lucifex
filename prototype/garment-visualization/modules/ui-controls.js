// UI Controls and Event Handling
export class UIControls {
  constructor(state) {
    this.state = state
    console.log("🎮 UIControls initialized")
  }

  async initialize() {
    this.setupEventListeners()
    this.setupValueDisplayUpdates()
    console.log("✅ UIControls initialized")
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const tabName = e.target.dataset.tab
        this.switchTab(tabName)
      })
    })

    // Model type switching
    document.querySelectorAll(".model-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modelType = e.target.dataset.modelType
        this.switchModelType(modelType)
      })
    })

    // Avatar selection
    document.querySelectorAll(".avatar-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const avatarType = e.target.dataset.avatar
        this.selectAvatar(avatarType)
      })
    })

    // Garment selection
    document.querySelectorAll(".preset-btn[data-garment]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const garmentType = e.target.dataset.garment
        this.selectGarment(garmentType)
      })
    })

    // File uploads
    const avatarFileInput = document.getElementById("avatar-file")
    if (avatarFileInput) {
      avatarFileInput.addEventListener("change", (e) => this.handleAvatarFileUpload(e))
    }

    const garmentFileInput = document.getElementById("garment-file")
    if (garmentFileInput) {
      garmentFileInput.addEventListener("change", (e) => this.handleGarmentFileUpload(e))
    }

    // Combined view controls
    const generateCombinedBtn = document.getElementById("generate-combined")
    if (generateCombinedBtn) {
      generateCombinedBtn.addEventListener("click", () => this.handleGenerateCombined())
    }

    const resetCombinationBtn = document.getElementById("reset-combination")
    if (resetCombinationBtn) {
      resetCombinationBtn.addEventListener("click", () => this.handleResetCombination())
    }

    // Physics controls
    const physicsToggleBtn = document.getElementById("physics-toggle")
    if (physicsToggleBtn) {
      physicsToggleBtn.addEventListener("click", () => this.handlePhysicsToggle())
    }

    const physicsResetBtn = document.getElementById("physics-reset")
    if (physicsResetBtn) {
      physicsResetBtn.addEventListener("click", () => this.handlePhysicsReset())
    }

    const resetClothBtn = document.getElementById("reset-cloth")
    if (resetClothBtn) {
      resetClothBtn.addEventListener("click", () => this.handleResetCloth())
    }

    const debugToggleBtn = document.getElementById("debug-toggle")
    if (debugToggleBtn) {
      debugToggleBtn.addEventListener("click", () => this.handleDebugToggle())
    }

    const debugLogBtn = document.getElementById("debug-log")
    if (debugLogBtn) {
      debugLogBtn.addEventListener("click", () => this.handleDebugLog())
    }

    const dropTestBtn = document.getElementById("drop-test")
    if (dropTestBtn) {
      dropTestBtn.addEventListener("click", () => this.handleDropTest())
    }

    const basicTestBtn = document.getElementById("basic-test")
    if (basicTestBtn) {
      basicTestBtn.addEventListener("click", () => this.handleBasicTest())
    }

    // Environment controls
    document.querySelectorAll(".env-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const environment = e.target.dataset.environment
        this.selectEnvironment(environment)
      })
    })

    // Tone mapping controls
    document.querySelectorAll(".preset-btn[data-tone-mapping]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const toneMapping = e.target.dataset.toneMapping
        this.selectToneMapping(toneMapping)
      })
    })

    // Camera controls
    const autoRotateToggleBtn = document.getElementById("auto-rotate-toggle")
    if (autoRotateToggleBtn) {
      autoRotateToggleBtn.addEventListener("click", () => this.handleAutoRotateToggle())
    }

    const cameraResetBtn = document.getElementById("camera-reset")
    if (cameraResetBtn) {
      cameraResetBtn.addEventListener("click", () => this.handleCameraReset())
    }

    const focusModelBtn = document.getElementById("focus-model")
    if (focusModelBtn) {
      focusModelBtn.addEventListener("click", () => this.handleFocusModel())
    }

    // Action bar controls
    const takeScreenshotBtn = document.getElementById("take-screenshot")
    if (takeScreenshotBtn) {
      takeScreenshotBtn.addEventListener("click", () => this.handleTakeScreenshot())
    }

    const exportSceneBtn = document.getElementById("export-scene")
    if (exportSceneBtn) {
      exportSceneBtn.addEventListener("click", () => this.handleExportScene())
    }
  }

  setupValueDisplayUpdates() {
    // Avatar scale
    const avatarScaleInput = document.getElementById("avatar-scale")
    if (avatarScaleInput) {
      avatarScaleInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("avatar-scale", "avatar-scale-value")
        }
        window.lucifexApp?.modelManager?.updateModelScale("avatar", Number.parseFloat(e.target.value))
      })
    }

    // Garment scale
    const garmentScaleInput = document.getElementById("garment-scale")
    if (garmentScaleInput) {
      garmentScaleInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("garment-scale", "garment-scale-value")
        }
        window.lucifexApp?.modelManager?.updateModelScale("garment", Number.parseFloat(e.target.value))
      })
    }

    // Combined garment scale
    const garmentScaleCombinedInput = document.getElementById("garment-scale-combined")
    if (garmentScaleCombinedInput) {
      garmentScaleCombinedInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("garment-scale-combined", "garment-scale-combined-value")
        }
        window.lucifexApp?.modelManager?.updateModelScale("garment", Number.parseFloat(e.target.value))
      })
    }

    // Garment position
    const garmentOffsetXInput = document.getElementById("garment-offset-x")
    if (garmentOffsetXInput) {
      garmentOffsetXInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("garment-offset-x", "garment-offset-x-value")
        }
        window.lucifexApp?.modelManager?.updateGarmentPosition()
      })
    }

    const garmentOffsetYInput = document.getElementById("garment-offset-y")
    if (garmentOffsetYInput) {
      garmentOffsetYInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("garment-offset-y", "garment-offset-y-value")
        }
        window.lucifexApp?.modelManager?.updateGarmentPosition()
      })
    }

    // Avatar opacity
    const avatarOpacityInput = document.getElementById("avatar-opacity")
    if (avatarOpacityInput) {
      avatarOpacityInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("avatar-opacity", "avatar-opacity-value")
        }
        window.lucifexApp?.modelManager?.updateModelOpacity("avatar", Number.parseFloat(e.target.value))
      })
    }

    // Garment opacity
    const garmentOpacityInput = document.getElementById("garment-opacity")
    if (garmentOpacityInput) {
      garmentOpacityInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("garment-opacity", "garment-opacity-value")
        }
        window.lucifexApp?.modelManager?.updateModelOpacity("garment", Number.parseFloat(e.target.value))
      })
    }

    // Lighting controls
    const exposureInput = document.getElementById("exposure")
    if (exposureInput) {
      exposureInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("exposure", "exposure-value")
        }
        window.lucifexApp?.environmentManager?.updateLighting()
      })
    }

    const shadowIntensityInput = document.getElementById("shadow-intensity")
    if (shadowIntensityInput) {
      shadowIntensityInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("shadow-intensity", "shadow-intensity-value")
        }
        window.lucifexApp?.environmentManager?.updateLighting()
      })
    }

    const shadowSoftnessInput = document.getElementById("shadow-softness")
    if (shadowSoftnessInput) {
      shadowSoftnessInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("shadow-softness", "shadow-softness-value")
        }
        window.lucifexApp?.environmentManager?.updateLighting()
      })
    }

    // Physics controls
    const clothStiffnessInput = document.getElementById("cloth-stiffness")
    if (clothStiffnessInput) {
      clothStiffnessInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("cloth-stiffness", "cloth-stiffness-value")
        }
        window.lucifexApp?.physicsManager?.updatePhysicsSettings()
      })
    }

    const gravityStrengthInput = document.getElementById("gravity-strength")
    if (gravityStrengthInput) {
      gravityStrengthInput.addEventListener("input", (e) => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateValueDisplay("gravity-strength", "gravity-strength-value")
        }
        window.lucifexApp?.physicsManager?.updatePhysicsSettings()
      })
    }
  }

  // Tab switching
  switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("active")
    })
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })

    // Add active class to selected tab
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`)
    const selectedContent = document.getElementById(`${tabName}-tab`)

    if (selectedTab) selectedTab.classList.add("active")
    if (selectedContent) selectedContent.classList.add("active")

    this.state.setCurrentTab(tabName)
  }

  // Model type switching
  switchModelType(modelType) {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.setActiveButtonByData(".model-btn", "data-model-type", modelType)
    }

    this.state.setModelType(modelType)

    const modelManager = window.lucifexApp?.modelManager
    if (modelManager) {
      if (modelType === "avatar" && this.state.hasAvatar) {
        modelManager.loadSingleModel(this.state.currentAvatarUrl, "avatar")
      } else if (modelType === "garment" && this.state.hasGarment) {
        modelManager.loadSingleModel(this.state.currentGarmentUrl, "garment")
      } else if (modelType === "both") {
        modelManager.generateCombinedView()
      }
    }
  }

  // Avatar selection
  selectAvatar(avatarType) {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.setActiveButtonByData(".avatar-option", "data-avatar", avatarType)
    }

    const avatarUrl = `../assets/avatars/${avatarType}.glb`
    this.state.setAvatarUrl(avatarUrl)

    const modelManager = window.lucifexApp?.modelManager
    if (modelManager && this.state.currentModelType === "avatar") {
      modelManager.loadSingleModel(avatarUrl, "avatar")
    } else if (modelManager && this.state.currentModelType === "both") {
      modelManager.generateCombinedView()
    }
  }

  // Garment selection
  selectGarment(garmentType) {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.setActiveButtonByData(".preset-btn[data-garment]", "data-garment", garmentType)
    }

    const garmentUrl = `../assets/garments/${garmentType}.glb`
    this.state.setGarmentUrl(garmentUrl)

    const modelManager = window.lucifexApp?.modelManager
    if (modelManager && this.state.currentModelType === "garment") {
      modelManager.loadSingleModel(garmentUrl, "garment")
    } else if (modelManager && this.state.currentModelType === "both") {
      modelManager.generateCombinedView()
    }
  }

  // File upload handlers
  handleAvatarFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    this.state.setAvatarUrl(url)

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Loading custom avatar: ${file.name}`)
    }

    const modelManager = window.lucifexApp?.modelManager
    if (modelManager && this.state.currentModelType === "avatar") {
      modelManager.loadSingleModel(url, "avatar")
    } else if (modelManager && this.state.currentModelType === "both") {
      modelManager.generateCombinedView()
    }
  }

  handleGarmentFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    this.state.setGarmentUrl(url)

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Loading garment: ${file.name}`)
    }

    const modelManager = window.lucifexApp?.modelManager
    if (modelManager && this.state.currentModelType === "garment") {
      modelManager.loadSingleModel(url, "garment")
    } else if (modelManager && this.state.currentModelType === "both") {
      modelManager.generateCombinedView()
    }
  }

  // Combined view handlers
  handleGenerateCombined() {
    const modelManager = window.lucifexApp?.modelManager
    if (modelManager) {
      modelManager.generateCombinedModel()
    }
  }

  handleResetCombination() {
    const modelManager = window.lucifexApp?.modelManager
    if (modelManager) {
      modelManager.resetCombination()
    }
  }

  // Physics handlers
  async handlePhysicsToggle() {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      await physicsManager.togglePhysics()
    }
  }

  handlePhysicsReset() {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      physicsManager.resetPhysics()
    }
  }

  handleResetCloth() {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      physicsManager.resetClothPosition()
    }
  }

  handleDebugToggle() {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      physicsManager.togglePhysicsDebug()
    }
  }

  handleDebugLog() {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      physicsManager.logPhysicsStatus()
    }
  }

  handleDropTest() {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      physicsManager.startDropTest()
    }
  }

  handleBasicTest() {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      physicsManager.startBasicTest()
    }
  }

  // Environment handlers
  selectEnvironment(environment) {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.setActiveButtonByData(".env-btn", "data-environment", environment)
    }

    this.state.setEnvironment(environment)

    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.setEnvironment(environment)
    }
  }

  selectToneMapping(toneMapping) {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.setActiveButtonByData(".preset-btn[data-tone-mapping]", "data-tone-mapping", toneMapping)
    }

    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.setToneMapping(toneMapping)
    }
  }

  // Camera handlers
  handleAutoRotateToggle() {
    this.state.isAutoRotating = !this.state.isAutoRotating

    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.toggleAutoRotate()
    }

    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.textContent = this.state.isAutoRotating ? "⏸️ Stop Rotate" : "🔄 Auto Rotate"
      button.classList.toggle("active", this.state.isAutoRotating)
    }
  }

  handleCameraReset() {
    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.resetCamera()
    }
  }

  handleFocusModel() {
    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.focusOnModel()
    }
  }

  // Action handlers
  handleTakeScreenshot() {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("📸 Screenshot feature coming soon")
    }
  }

  handleExportScene() {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("💾 Export feature coming soon")
    }
  }

  cleanup() {
    // Remove event listeners if needed
    // This is handled automatically when elements are removed from DOM
  }
}
