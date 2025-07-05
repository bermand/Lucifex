// UI Controls and event handling
export class UIControls {
  constructor(state, managers) {
    this.state = state
    this.modelManager = managers.modelManager
    this.environmentManager = managers.environmentManager
    this.physicsManager = managers.physicsManager
    this.utils = managers.utils

    console.log("🎮 UIControls initialized")
  }

  async initialize() {
    try {
      this.setupEventListeners()
      this.setupControlListeners()
      console.log("✅ UIControls initialized")
    } catch (error) {
      console.error("❌ Failed to initialize UIControls:", error)
    }
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
        this.setModelType(modelType)
      })
    })

    // Avatar presets
    document.querySelectorAll(".avatar-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        const avatarId = e.target.dataset.avatar || e.target.closest(".avatar-option").dataset.avatar
        this.loadAvatarPreset(avatarId)
      })
    })

    // Sample garments
    document.querySelectorAll(".preset-btn[data-garment]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const garmentId = e.target.dataset.garment
        this.loadSampleGarment(garmentId)
      })
    })

    // Environment presets
    document.querySelectorAll(".env-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const environment = e.target.dataset.environment
        this.environmentManager.setEnvironment(environment)
      })
    })

    // Combination methods
    document.querySelectorAll(".preset-btn[data-combination]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const method = e.target.dataset.combination
        this.setCombinationMethod(method)
      })
    })

    // Tone mapping
    document.querySelectorAll(".preset-btn[data-tone-mapping]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const mapping = e.target.dataset.toneMapping
        this.environmentManager.setToneMapping(mapping)
      })
    })

    // File inputs
    const avatarFile = document.getElementById("avatar-file")
    if (avatarFile) {
      avatarFile.addEventListener("change", (e) => this.loadCustomAvatar(e))
    }

    const garmentFile = document.getElementById("garment-file")
    if (garmentFile) {
      garmentFile.addEventListener("change", (e) => this.loadGarmentFile(e))
    }

    // Action buttons
    const generateCombined = document.getElementById("generate-combined")
    if (generateCombined) {
      generateCombined.addEventListener("click", () => this.modelManager.generateCombinedModel())
    }

    const resetCombination = document.getElementById("reset-combination")
    if (resetCombination) {
      resetCombination.addEventListener("click", () => this.modelManager.resetCombination())
    }

    // Physics controls
    const physicsToggle = document.getElementById("physics-toggle")
    if (physicsToggle) {
      physicsToggle.addEventListener("click", () => this.physicsManager.togglePhysics())
    }

    const physicsReset = document.getElementById("physics-reset")
    if (physicsReset) {
      physicsReset.addEventListener("click", () => this.physicsManager.resetPhysics())
    }

    const debugToggle = document.getElementById("debug-toggle")
    if (debugToggle) {
      debugToggle.addEventListener("click", () => this.physicsManager.togglePhysicsDebug())
    }

    const debugLog = document.getElementById("debug-log")
    if (debugLog) {
      debugLog.addEventListener("click", () => this.physicsManager.logPhysicsStatus())
    }

    const dropTest = document.getElementById("drop-test")
    if (dropTest) {
      dropTest.addEventListener("click", () => this.physicsManager.startDropTest())
    }

    const basicTest = document.getElementById("basic-test")
    if (basicTest) {
      basicTest.addEventListener("click", () => this.physicsManager.startBasicTest())
    }

    const resetCloth = document.getElementById("reset-cloth")
    if (resetCloth) {
      resetCloth.addEventListener("click", () => this.physicsManager.resetClothPosition())
    }

    // Camera controls
    const autoRotateToggle = document.getElementById("auto-rotate-toggle")
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener("click", () => this.environmentManager.toggleAutoRotate())
    }

    const cameraReset = document.getElementById("camera-reset")
    if (cameraReset) {
      cameraReset.addEventListener("click", () => this.environmentManager.resetCamera())
    }

    const resetCamera = document.getElementById("reset-camera")
    if (resetCamera) {
      resetCamera.addEventListener("click", () => this.environmentManager.resetCamera())
    }

    const focusModel = document.getElementById("focus-model")
    if (focusModel) {
      focusModel.addEventListener("click", () => this.environmentManager.focusOnModel())
    }

    // Screenshot and export
    const takeScreenshot = document.getElementById("take-screenshot")
    if (takeScreenshot) {
      takeScreenshot.addEventListener("click", () => this.takeScreenshot())
    }

    const exportScene = document.getElementById("export-scene")
    if (exportScene) {
      exportScene.addEventListener("click", () => this.exportScene())
    }
  }

  setupControlListeners() {
    // Avatar scale
    const avatarScale = document.getElementById("avatar-scale")
    const avatarScaleValue = document.getElementById("avatar-scale-value")
    if (avatarScale && avatarScaleValue) {
      avatarScale.addEventListener("input", (e) => {
        avatarScaleValue.textContent = e.target.value
        this.modelManager.updateModelScale("avatar", Number.parseFloat(e.target.value))
      })
    }

    // Garment scale (individual tab)
    const garmentScale = document.getElementById("garment-scale")
    const garmentScaleValue = document.getElementById("garment-scale-value")
    if (garmentScale && garmentScaleValue) {
      garmentScale.addEventListener("input", (e) => {
        garmentScaleValue.textContent = e.target.value
        this.modelManager.updateModelScale("garment", Number.parseFloat(e.target.value))
      })
    }

    // Garment scale (combined tab)
    const garmentScaleCombined = document.getElementById("garment-scale-combined")
    const garmentScaleCombinedValue = document.getElementById("garment-scale-combined-value")
    if (garmentScaleCombined && garmentScaleCombinedValue) {
      garmentScaleCombined.addEventListener("input", (e) => {
        garmentScaleCombinedValue.textContent = e.target.value
        this.modelManager.updateModelScale("garment", Number.parseFloat(e.target.value))

        // Also update physics mesh updater if available
        if (this.state.physicsMeshUpdater) {
          this.state.physicsMeshUpdater.setGarmentScale(Number.parseFloat(e.target.value))
        }
      })
    }

    // Avatar opacity
    const avatarOpacity = document.getElementById("avatar-opacity")
    const avatarOpacityValue = document.getElementById("avatar-opacity-value")
    if (avatarOpacity && avatarOpacityValue) {
      avatarOpacity.addEventListener("input", (e) => {
        avatarOpacityValue.textContent = e.target.value
        this.modelManager.updateModelOpacity("avatar", Number.parseFloat(e.target.value))
      })
    }

    // Garment opacity
    const garmentOpacity = document.getElementById("garment-opacity")
    const garmentOpacityValue = document.getElementById("garment-opacity-value")
    if (garmentOpacity && garmentOpacityValue) {
      garmentOpacity.addEventListener("input", (e) => {
        garmentOpacityValue.textContent = e.target.value
        this.modelManager.updateModelOpacity("garment", Number.parseFloat(e.target.value))
      })
    }

    // Garment position
    const garmentOffsetY = document.getElementById("garment-offset-y")
    const garmentOffsetYValue = document.getElementById("garment-offset-y-value")
    if (garmentOffsetY && garmentOffsetYValue) {
      garmentOffsetY.addEventListener("input", (e) => {
        garmentOffsetYValue.textContent = e.target.value
        this.modelManager.updateGarmentPosition()
      })
    }

    const garmentOffsetX = document.getElementById("garment-offset-x")
    const garmentOffsetXValue = document.getElementById("garment-offset-x-value")
    if (garmentOffsetX && garmentOffsetXValue) {
      garmentOffsetX.addEventListener("input", (e) => {
        garmentOffsetXValue.textContent = e.target.value
        this.modelManager.updateGarmentPosition()
      })
    }

    // Lighting controls
    const exposure = document.getElementById("exposure")
    const exposureValue = document.getElementById("exposure-value")
    if (exposure && exposureValue) {
      exposure.addEventListener("input", (e) => {
        exposureValue.textContent = e.target.value
        this.environmentManager.updateLighting()
      })
    }

    const shadowIntensity = document.getElementById("shadow-intensity")
    const shadowIntensityValue = document.getElementById("shadow-intensity-value")
    if (shadowIntensity && shadowIntensityValue) {
      shadowIntensity.addEventListener("input", (e) => {
        shadowIntensityValue.textContent = e.target.value
        this.environmentManager.updateLighting()
      })
    }

    const shadowSoftness = document.getElementById("shadow-softness")
    const shadowSoftnessValue = document.getElementById("shadow-softness-value")
    if (shadowSoftness && shadowSoftnessValue) {
      shadowSoftness.addEventListener("input", (e) => {
        shadowSoftnessValue.textContent = e.target.value
        this.environmentManager.updateLighting()
      })
    }

    // Physics controls
    const clothStiffness = document.getElementById("cloth-stiffness")
    const clothStiffnessValue = document.getElementById("cloth-stiffness-value")
    if (clothStiffness && clothStiffnessValue) {
      clothStiffness.addEventListener("input", (e) => {
        clothStiffnessValue.textContent = e.target.value
        this.physicsManager.updatePhysicsSettings()
      })
    }

    const gravityStrength = document.getElementById("gravity-strength")
    const gravityStrengthValue = document.getElementById("gravity-strength-value")
    if (gravityStrength && gravityStrengthValue) {
      gravityStrength.addEventListener("input", (e) => {
        gravityStrengthValue.textContent = e.target.value
        this.physicsManager.updatePhysicsSettings()
      })
    }
  }

  // Tab switching
  switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`)
    const selectedContent = document.getElementById(`${tabName}-tab`)

    if (selectedTab) selectedTab.classList.add("active")
    if (selectedContent) selectedContent.classList.add("active")

    this.state.setCurrentTab(tabName)
  }

  // Model type switching
  setModelType(type) {
    // Update button states
    this.utils.setActiveButtonByData(".model-btn", "data-model-type", type)

    this.state.setModelType(type)

    if (type === "avatar" && this.state.currentAvatarUrl) {
      this.modelManager.loadSingleModel(this.state.currentAvatarUrl, "avatar")
    } else if (type === "garment" && this.state.currentGarmentUrl) {
      this.modelManager.loadSingleModel(this.state.currentGarmentUrl, "garment")
    } else if (type === "both") {
      this.modelManager.generateCombinedView()
    }
  }

  // Avatar preset loading
  loadAvatarPreset(avatarId) {
    // Update button states
    this.utils.setActiveButtonByData(".avatar-option", "data-avatar", avatarId)

    const avatarUrl = `../assets/avatars/${avatarId}.glb`
    this.state.setAvatarUrl(avatarUrl)

    this.utils.updateStatus(`Loading avatar preset: ${avatarId}`)

    // If in combined mode, regenerate
    if (this.state.currentModelType === "both") {
      this.modelManager.generateCombinedView()
    } else if (this.state.currentModelType === "avatar") {
      this.modelManager.loadSingleModel(avatarUrl, "avatar")
    }
  }

  // Custom avatar loading
  loadCustomAvatar(event) {
    const file = event.target.files[0]
    if (!file) return

    const url = this.utils.createObjectURL(file)
    this.state.setAvatarUrl(url)

    this.utils.updateStatus(`Loading custom avatar: ${file.name}`)
    this.utils.updateFileInfo("avatar-file-info", file, "avatar")

    // If in combined mode, regenerate
    if (this.state.currentModelType === "both") {
      this.modelManager.generateCombinedView()
    } else if (this.state.currentModelType === "avatar") {
      this.modelManager.loadSingleModel(url, "avatar")
    }
  }

  // Garment loading
  loadGarmentFile(event) {
    const file = event.target.files[0]
    if (!file) return

    const url = this.utils.createObjectURL(file)
    this.state.setGarmentUrl(url)

    this.utils.updateStatus(`Loading garment: ${file.name}`)
    this.utils.updateFileInfo("garment-file-info", file, "garment")

    // If in combined mode, regenerate
    if (this.state.currentModelType === "both") {
      this.modelManager.generateCombinedView()
    } else if (this.state.currentModelType === "garment") {
      this.modelManager.loadSingleModel(url, "garment")
    }
  }

  // Sample garment loading
  loadSampleGarment(garmentId) {
    // Update button states
    this.utils.setActiveButtonByData(".preset-btn[data-garment]", "data-garment", garmentId)

    const garmentUrl = `../assets/garments/${garmentId}.glb`
    this.state.setGarmentUrl(garmentUrl)

    this.utils.updateStatus(`Loading sample garment: ${garmentId}`)

    // If in combined mode, regenerate
    if (this.state.currentModelType === "both") {
      this.modelManager.generateCombinedView()
    } else if (this.state.currentModelType === "garment") {
      this.modelManager.loadSingleModel(garmentUrl, "garment")
    }
  }

  // Combination methods
  setCombinationMethod(method) {
    this.state.currentCombinationMethod = method

    // Update button states
    this.utils.setActiveButtonByData(".preset-btn[data-combination]", "data-combination", method)

    this.utils.updateStatus(`Combination method: ${method}`)
  }

  // Action functions
  takeScreenshot() {
    // This would need to be implemented with canvas capture
    this.utils.updateStatus("Screenshot feature coming soon")
  }

  exportScene() {
    // This would export the current scene configuration
    this.utils.updateStatus("Export feature coming soon")
  }
}
