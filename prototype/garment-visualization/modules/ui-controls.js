// UI Controls management
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
      this.setupRangeInputs()
      console.log("✅ UI Controls initialized")
    } catch (error) {
      console.error("❌ Failed to initialize UI Controls:", error)
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

    // Avatar selection
    document.querySelectorAll(".avatar-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        const avatarId = e.target.dataset.avatar
        this.loadAvatarPreset(avatarId)
      })
    })

    // Garment selection
    document.querySelectorAll("[data-garment]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const garmentId = e.target.dataset.garment
        this.loadSampleGarment(garmentId)
      })
    })

    // Environment selection
    document.querySelectorAll("[data-environment]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const environment = e.target.dataset.environment
        this.environmentManager.setEnvironment(environment)
      })
    })

    // Combination method
    document.querySelectorAll("[data-combination]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const method = e.target.dataset.combination
        this.setCombinationMethod(method)
      })
    })

    // Tone mapping
    document.querySelectorAll("[data-tone-mapping]").forEach((btn) => {
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

    const focusModel = document.getElementById("focus-model")
    if (focusModel) {
      focusModel.addEventListener("click", () => this.environmentManager.focusOnModel())
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

    const takeScreenshot = document.getElementById("take-screenshot")
    if (takeScreenshot) {
      takeScreenshot.addEventListener("click", () => this.takeScreenshot())
    }

    const exportScene = document.getElementById("export-scene")
    if (exportScene) {
      exportScene.addEventListener("click", () => this.exportScene())
    }
  }

  setupRangeInputs() {
    // Avatar scale
    this.setupRangeInput("avatar-scale", "avatar-scale-value", "x", (value) => {
      this.modelManager.updateModelScale("avatar", Number.parseFloat(value))
    })

    // Garment scale
    this.setupRangeInput("garment-scale", "garment-scale-value", "x", (value) => {
      this.modelManager.updateModelScale("garment", Number.parseFloat(value))
    })

    // Garment scale combined
    this.setupRangeInput("garment-scale-combined", "garment-scale-combined-value", "x", (value) => {
      this.modelManager.updateModelScale("garment", Number.parseFloat(value))
      if (this.state.physicsMeshUpdater) {
        this.state.physicsMeshUpdater.setGarmentScale(Number.parseFloat(value))
      }
    })

    // Avatar opacity
    this.setupRangeInput("avatar-opacity", "avatar-opacity-value", "", (value) => {
      this.modelManager.updateModelOpacity("avatar", Number.parseFloat(value))
    })

    // Garment opacity
    this.setupRangeInput("garment-opacity", "garment-opacity-value", "", (value) => {
      this.modelManager.updateModelOpacity("garment", Number.parseFloat(value))
    })

    // Garment position
    this.setupRangeInput("garment-offset-y", "garment-offset-y-value", "", (value) => {
      this.modelManager.updateGarmentPosition()
    })

    this.setupRangeInput("garment-offset-x", "garment-offset-x-value", "", (value) => {
      this.modelManager.updateGarmentPosition()
    })

    // Lighting controls
    this.setupRangeInput("exposure", "exposure-value", "", (value) => {
      this.environmentManager.updateLighting()
    })

    this.setupRangeInput("shadow-intensity", "shadow-intensity-value", "", (value) => {
      this.environmentManager.updateLighting()
    })

    this.setupRangeInput("shadow-softness", "shadow-softness-value", "", (value) => {
      this.environmentManager.updateLighting()
    })

    // Physics controls
    this.setupRangeInput("cloth-stiffness", "cloth-stiffness-value", "", (value) => {
      this.physicsManager.updatePhysicsSettings()
    })

    this.setupRangeInput("gravity-strength", "gravity-strength-value", "", (value) => {
      this.physicsManager.updatePhysicsSettings()
    })
  }

  setupRangeInput(inputId, valueId, suffix, callback) {
    const input = document.getElementById(inputId)
    const valueDisplay = document.getElementById(valueId)

    if (input && valueDisplay) {
      input.addEventListener("input", () => {
        valueDisplay.textContent = input.value + suffix
        if (callback) callback(input.value)
      })
    }
  }

  // Tab management
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

  // Model type management
  setModelType(type) {
    this.utils.setButtonsActive(".model-btn", document.querySelector(`[data-model-type="${type}"]`))
    this.state.setModelType(type)

    if (type === "avatar" && this.state.hasAvatar) {
      this.modelManager.loadSingleModel(this.state.currentAvatarUrl, "avatar")
    } else if (type === "garment" && this.state.hasGarment) {
      this.modelManager.loadSingleModel(this.state.currentGarmentUrl, "garment")
    } else if (type === "both") {
      this.modelManager.generateCombinedView()
    }
  }

  // Avatar management
  loadAvatarPreset(avatarId) {
    this.utils.setButtonsActive(".avatar-option", document.querySelector(`[data-avatar="${avatarId}"]`))

    const avatarUrl = `../assets/avatars/${avatarId}.glb`
    this.state.setAvatarUrl(avatarUrl)

    this.utils.updateStatus(`Loading avatar preset: ${avatarId}`)

    // Update view based on current mode
    if (this.state.isInCombinedMode) {
      this.modelManager.generateCombinedView()
    } else if (this.state.currentModelType === "avatar") {
      this.modelManager.loadSingleModel(avatarUrl, "avatar")
    }
  }

  loadCustomAvatar(event) {
    const file = event.target.files[0]
    if (!file) return

    if (!this.utils.isValidModelFile(file)) {
      this.utils.updateStatus("❌ Invalid file type. Please select a GLB or GLTF file.")
      return
    }

    const url = this.utils.createObjectURL(file)
    this.state.setAvatarUrl(url)

    this.utils.updateStatus(`Loading custom avatar: ${file.name}`)
    this.utils.updateFileInfo("avatar-file-info", file)

    // Update view based on current mode
    if (this.state.isInCombinedMode) {
      this.modelManager.generateCombinedView()
    } else if (this.state.currentModelType === "avatar") {
      this.modelManager.loadSingleModel(url, "avatar")
    }
  }

  // Garment management
  loadSampleGarment(garmentId) {
    this.utils.setButtonsActive("[data-garment]", document.querySelector(`[data-garment="${garmentId}"]`))

    const garmentUrl = `../assets/garments/${garmentId}.glb`
    this.state.setGarmentUrl(garmentUrl)

    this.utils.updateStatus(`Loading sample garment: ${garmentId}`)

    // Update view based on current mode
    if (this.state.isInCombinedMode) {
      this.modelManager.generateCombinedView()
    } else if (this.state.currentModelType === "garment") {
      this.modelManager.loadSingleModel(garmentUrl, "garment")
    }
  }

  loadGarmentFile(event) {
    const file = event.target.files[0]
    if (!file) return

    if (!this.utils.isValidModelFile(file)) {
      this.utils.updateStatus("❌ Invalid file type. Please select a GLB or GLTF file.")
      return
    }

    const url = this.utils.createObjectURL(file)
    this.state.setGarmentUrl(url)

    this.utils.updateStatus(`Loading garment: ${file.name}`)
    this.utils.updateFileInfo("garment-file-info", file)

    // Update view based on current mode
    if (this.state.isInCombinedMode) {
      this.modelManager.generateCombinedView()
    } else if (this.state.currentModelType === "garment") {
      this.modelManager.loadSingleModel(url, "garment")
    }
  }

  // Combination management
  setCombinationMethod(method) {
    this.utils.setButtonsActive("[data-combination]", document.querySelector(`[data-combination="${method}"]`))
    this.state.currentCombinationMethod = method
    this.utils.updateStatus(`Combination method: ${method}`)
  }

  // Action handlers
  takeScreenshot() {
    this.utils.updateStatus("Screenshot feature coming soon")
  }

  exportScene() {
    this.utils.updateStatus("Export feature coming soon")
  }
}
