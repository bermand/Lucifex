// UI Controls and Event Handling
export class UIControls {
  constructor(state) {
    this.state = state
    this.boundHandlers = new Map()
    console.log("🎮 UIControls initialized")
  }

  async initialize() {
    try {
      this.setupEventListeners()
      this.setupRangeInputs()
      console.log("✅ UIControls initialized")
    } catch (error) {
      console.error("❌ Failed to initialize UIControls:", error)
    }
  }

  setupEventListeners() {
    // Tab switching
    this.addEventListeners(".tab", "click", this.handleTabSwitch.bind(this))

    // Model type switching
    this.addEventListeners(".model-btn", "click", this.handleModelTypeSwitch.bind(this))

    // Avatar selection
    this.addEventListeners(".avatar-option", "click", this.handleAvatarSelection.bind(this))

    // Garment selection
    this.addEventListeners(".preset-btn[data-garment]", "click", this.handleGarmentSelection.bind(this))

    // Environment selection
    this.addEventListeners(".env-btn", "click", this.handleEnvironmentSelection.bind(this))

    // Combination method selection
    this.addEventListeners(".preset-btn[data-combination]", "click", this.handleCombinationMethodSelection.bind(this))

    // Tone mapping selection
    this.addEventListeners(".preset-btn[data-tone-mapping]", "click", this.handleToneMappingSelection.bind(this))

    // File inputs
    this.addEventListeners("#avatar-file", "change", this.handleAvatarFileUpload.bind(this))
    this.addEventListeners("#garment-file", "change", this.handleGarmentFileUpload.bind(this))

    // Action buttons
    this.addEventListeners("#generate-combined", "click", this.handleGenerateCombined.bind(this))
    this.addEventListeners("#reset-combination", "click", this.handleResetCombination.bind(this))
    this.addEventListeners("#physics-toggle", "click", this.handlePhysicsToggle.bind(this))
    this.addEventListeners("#physics-reset", "click", this.handlePhysicsReset.bind(this))
    this.addEventListeners("#reset-cloth", "click", this.handleResetCloth.bind(this))
    this.addEventListeners("#debug-toggle", "click", this.handleDebugToggle.bind(this))
    this.addEventListeners("#debug-log", "click", this.handleDebugLog.bind(this))
    this.addEventListeners("#drop-test", "click", this.handleDropTest.bind(this))
    this.addEventListeners("#basic-test", "click", this.handleBasicTest.bind(this))
    this.addEventListeners("#auto-rotate-toggle", "click", this.handleAutoRotateToggle.bind(this))
    this.addEventListeners("#camera-reset", "click", this.handleCameraReset.bind(this))
    this.addEventListeners("#focus-model", "click", this.handleFocusModel.bind(this))
    this.addEventListeners("#take-screenshot", "click", this.handleTakeScreenshot.bind(this))
    this.addEventListeners("#export-scene", "click", this.handleExportScene.bind(this))
  }

  setupRangeInputs() {
    const rangeInputs = [
      { id: "avatar-scale", valueId: "avatar-scale-value", handler: this.handleAvatarScale.bind(this) },
      { id: "garment-scale", valueId: "garment-scale-value", handler: this.handleGarmentScale.bind(this) },
      {
        id: "garment-scale-combined",
        valueId: "garment-scale-combined-value",
        handler: this.handleGarmentScaleCombined.bind(this),
      },
      { id: "garment-offset-x", valueId: "garment-offset-x-value", handler: this.handleGarmentPosition.bind(this) },
      { id: "garment-offset-y", valueId: "garment-offset-y-value", handler: this.handleGarmentPosition.bind(this) },
      { id: "avatar-opacity", valueId: "avatar-opacity-value", handler: this.handleAvatarOpacity.bind(this) },
      { id: "garment-opacity", valueId: "garment-opacity-value", handler: this.handleGarmentOpacity.bind(this) },
      { id: "exposure", valueId: "exposure-value", handler: this.handleExposure.bind(this) },
      { id: "shadow-intensity", valueId: "shadow-intensity-value", handler: this.handleShadowIntensity.bind(this) },
      { id: "shadow-softness", valueId: "shadow-softness-value", handler: this.handleShadowSoftness.bind(this) },
      { id: "cloth-stiffness", valueId: "cloth-stiffness-value", handler: this.handleClothStiffness.bind(this) },
      { id: "gravity-strength", valueId: "gravity-strength-value", handler: this.handleGravityStrength.bind(this) },
    ]

    rangeInputs.forEach(({ id, valueId, handler }) => {
      const input = document.getElementById(id)
      const valueDisplay = document.getElementById(valueId)

      if (input && valueDisplay) {
        input.addEventListener("input", (e) => {
          valueDisplay.textContent = e.target.value
          handler(e.target.value)
        })
      }
    })
  }

  addEventListeners(selector, event, handler) {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => {
      element.addEventListener(event, handler)

      // Store bound handlers for cleanup
      if (!this.boundHandlers.has(element)) {
        this.boundHandlers.set(element, [])
      }
      this.boundHandlers.get(element).push({ event, handler })
    })
  }

  // Event Handlers
  handleTabSwitch(e) {
    const tabName = e.target.getAttribute("data-tab")
    if (!tabName) return

    // Update tab buttons
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"))
    e.target.classList.add("active")

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))
    const targetContent = document.getElementById(`${tabName}-tab`)
    if (targetContent) {
      targetContent.classList.add("active")
    }

    this.state.setCurrentTab(tabName)
  }

  handleModelTypeSwitch(e) {
    const modelType = e.target.getAttribute("data-model-type")
    if (!modelType) return

    // Update button states
    document.querySelectorAll(".model-btn").forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")

    this.state.setModelType(modelType)

    const modelManager = window.lucifexApp?.modelManager
    if (!modelManager) return

    // Switch view based on model type
    if (modelType === "avatar" && this.state.hasAvatar) {
      modelManager.loadSingleModel(this.state.currentAvatarUrl, "avatar")
    } else if (modelType === "garment" && this.state.hasGarment) {
      modelManager.loadSingleModel(this.state.currentGarmentUrl, "garment")
    } else if (modelType === "both") {
      modelManager.generateCombinedView()
    }
  }

  handleAvatarSelection(e) {
    const avatarType = e.target.getAttribute("data-avatar")
    if (!avatarType) return

    // Update button states
    document.querySelectorAll(".avatar-option").forEach((option) => option.classList.remove("active"))
    e.target.classList.add("active")

    const avatarUrl = `../assets/avatars/${avatarType}.glb`
    this.state.setAvatarUrl(avatarUrl)

    const utils = window.lucifexApp?.utils
    const modelManager = window.lucifexApp?.modelManager

    if (utils) {
      utils.updateStatus(`Loading avatar preset: ${avatarType}`)
      utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)
    }

    // Load model based on current mode
    if (modelManager) {
      if (this.state.currentModelType === "both") {
        modelManager.generateCombinedView()
      } else if (this.state.currentModelType === "avatar") {
        modelManager.loadSingleModel(avatarUrl, "avatar")
      }
    }
  }

  handleGarmentSelection(e) {
    const garmentType = e.target.getAttribute("data-garment")
    if (!garmentType) return

    // Update button states
    document.querySelectorAll(".preset-btn[data-garment]").forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")

    const garmentUrl = `../assets/garments/${garmentType}.glb`
    this.state.setGarmentUrl(garmentUrl)

    const utils = window.lucifexApp?.utils
    const modelManager = window.lucifexApp?.modelManager

    if (utils) {
      utils.updateStatus(`Loading sample garment: ${garmentType}`)
      utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)
    }

    // Load model based on current mode
    if (modelManager) {
      if (this.state.currentModelType === "both") {
        modelManager.generateCombinedView()
      } else if (this.state.currentModelType === "garment") {
        modelManager.loadSingleModel(garmentUrl, "garment")
      }
    }
  }

  handleEnvironmentSelection(e) {
    const environment = e.target.getAttribute("data-environment")
    if (!environment) return

    // Update button states
    document.querySelectorAll(".env-btn").forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")

    this.state.setEnvironment(environment)

    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.setEnvironment(environment)
    }
  }

  handleCombinationMethodSelection(e) {
    const method = e.target.getAttribute("data-combination")
    if (!method) return

    // Update button states
    document.querySelectorAll(".preset-btn[data-combination]").forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")

    this.state.setCombinationMethod(method)

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Combination method: ${method}`)
    }
  }

  handleToneMappingSelection(e) {
    const toneMapping = e.target.getAttribute("data-tone-mapping")
    if (!toneMapping) return

    // Update button states
    document.querySelectorAll(".preset-btn[data-tone-mapping]").forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")

    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.setToneMapping(toneMapping)
    }
  }

  handleAvatarFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const utils = window.lucifexApp?.utils
    const modelManager = window.lucifexApp?.modelManager

    if (utils && !utils.isValidModelFile(file)) {
      utils.updateStatus("❌ Invalid file type. Please select a GLB or GLTF file.")
      return
    }

    const url = utils?.createObjectURL(file)
    this.state.setAvatarUrl(url)

    // Update file info
    const fileInfo = document.getElementById("avatar-file-info")
    if (fileInfo && utils) {
      fileInfo.innerHTML = `
        <strong>✅ Loaded:</strong> ${file.name}<br>
        <strong>📊 Size:</strong> ${utils.formatFileSize(file.size)}
      `
      fileInfo.className = "file-info success"
    }

    if (utils) {
      utils.updateStatus(`Loading custom avatar: ${file.name}`)
      utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)
    }

    // Load model based on current mode
    if (modelManager) {
      if (this.state.currentModelType === "both") {
        modelManager.generateCombinedView()
      } else if (this.state.currentModelType === "avatar") {
        modelManager.loadSingleModel(url, "avatar")
      }
    }
  }

  handleGarmentFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const utils = window.lucifexApp?.utils
    const modelManager = window.lucifexApp?.modelManager

    if (utils && !utils.isValidModelFile(file)) {
      utils.updateStatus("❌ Invalid file type. Please select a GLB or GLTF file.")
      return
    }

    const url = utils?.createObjectURL(file)
    this.state.setGarmentUrl(url)

    // Update file info
    const fileInfo = document.getElementById("garment-file-info")
    if (fileInfo && utils) {
      fileInfo.innerHTML = `
        <strong>✅ Loaded:</strong> ${file.name}<br>
        <strong>📊 Size:</strong> ${utils.formatFileSize(file.size)}
      `
      fileInfo.className = "file-info success"
    }

    if (utils) {
      utils.updateStatus(`Loading garment: ${file.name}`)
      utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)
    }

    // Load model based on current mode
    if (modelManager) {
      if (this.state.currentModelType === "both") {
        modelManager.generateCombinedView()
      } else if (this.state.currentModelType === "garment") {
        modelManager.loadSingleModel(url, "garment")
      }
    }
  }

  // Action button handlers
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

  handlePhysicsToggle() {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      physicsManager.togglePhysics()
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

  handleAutoRotateToggle() {
    this.state.setAutoRotating(!this.state.isAutoRotating)

    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      if (this.state.isAutoRotating) {
        viewer.setAttribute("auto-rotate", "")
      } else {
        viewer.removeAttribute("auto-rotate")
      }
    })

    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.classList.toggle("active", this.state.isAutoRotating)
      button.textContent = this.state.isAutoRotating ? "⏸️ Stop Rotate" : "🔄 Auto Rotate"
    }
  }

  handleCameraReset() {
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      if (viewer.resetTurntableRotation) {
        viewer.resetTurntableRotation()
      }
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("Camera reset")
    }
  }

  handleFocusModel() {
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("Focused on model")
    }
  }

  handleTakeScreenshot() {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.takeScreenshot()
    }
  }

  handleExportScene() {
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.exportScene()
    }
  }

  // Range input handlers
  handleAvatarScale(value) {
    const modelManager = window.lucifexApp?.modelManager
    if (modelManager) {
      modelManager.updateModelScale("avatar", Number.parseFloat(value))
    }
  }

  handleGarmentScale(value) {
    const modelManager = window.lucifexApp?.modelManager
    if (modelManager) {
      modelManager.updateModelScale("garment", Number.parseFloat(value))
    }
  }

  handleGarmentScaleCombined(value) {
    const modelManager = window.lucifexApp?.modelManager
    if (modelManager) {
      modelManager.updateModelScale("garment", Number.parseFloat(value))
      modelManager.updateGarmentPosition()
    }
  }

  handleGarmentPosition() {
    const modelManager = window.lucifexApp?.modelManager
    if (modelManager) {
      modelManager.updateGarmentPosition()
    }
  }

  handleAvatarOpacity(value) {
    const modelManager = window.lucifexApp?.modelManager
    if (modelManager) {
      modelManager.updateModelOpacity("avatar", Number.parseFloat(value))
    }
  }

  handleGarmentOpacity(value) {
    const modelManager = window.lucifexApp?.modelManager
    if (modelManager) {
      modelManager.updateModelOpacity("garment", Number.parseFloat(value))
    }
  }

  handleExposure(value) {
    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.updateLighting()
    }
  }

  handleShadowIntensity(value) {
    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.updateLighting()
    }
  }

  handleShadowSoftness(value) {
    const environmentManager = window.lucifexApp?.environmentManager
    if (environmentManager) {
      environmentManager.updateLighting()
    }
  }

  handleClothStiffness(value) {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      physicsManager.updatePhysicsSettings()
    }
  }

  handleGravityStrength(value) {
    const physicsManager = window.lucifexApp?.physicsManager
    if (physicsManager) {
      physicsManager.updatePhysicsSettings()
    }
  }

  // Cleanup
  cleanup() {
    // Remove all event listeners
    this.boundHandlers.forEach((handlers, element) => {
      handlers.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler)
      })
    })
    this.boundHandlers.clear()
  }
}
