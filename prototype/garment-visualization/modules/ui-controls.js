// UI Controls and Event Handling
export class UIControls {
  constructor(state, modelManager, environmentManager, physicsManager, utils) {
    this.state = state
    this.modelManager = modelManager
    this.environmentManager = environmentManager
    this.physicsManager = physicsManager
    this.utils = utils
    console.log("🎮 UIControls initialized")
  }

  initialize() {
    this.setupTabNavigation()
    this.setupModelTypeSelector()
    this.setupAvatarControls()
    this.setupGarmentControls()
    this.setupCombinedControls()
    this.setupPhysicsControls()
    this.setupEnvironmentControls()
    this.setupActionButtons()
    this.setupFileUploads()
    this.setupRangeInputs()
    console.log("✅ UIControls initialized")
  }

  setupTabNavigation() {
    const tabs = document.querySelectorAll(".tab")
    const tabContents = document.querySelectorAll(".tab-content")

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.dataset.tab

        // Update active tab
        tabs.forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")

        // Update active content
        tabContents.forEach((content) => content.classList.remove("active"))
        const activeContent = document.getElementById(`${tabName}-tab`)
        if (activeContent) {
          activeContent.classList.add("active")
        }

        // Update state
        this.state.setCurrentTab(tabName)
      })
    })
  }

  setupModelTypeSelector() {
    const modelButtons = document.querySelectorAll(".model-btn")

    modelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const modelType = button.dataset.modelType

        // Update active button
        modelButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        // Update state and view
        this.state.setCurrentModelType(modelType)
        this.modelManager.updateModelDisplay(modelType)
      })
    })
  }

  setupAvatarControls() {
    // Avatar preset selection
    const avatarOptions = document.querySelectorAll(".avatar-option")
    avatarOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const avatarType = option.dataset.avatar

        // Update active option
        avatarOptions.forEach((opt) => opt.classList.remove("active"))
        option.classList.add("active")

        // Load avatar
        this.modelManager.loadPresetAvatar(avatarType)
      })
    })

    // Avatar scale control
    const avatarScale = document.getElementById("avatar-scale")
    if (avatarScale) {
      avatarScale.addEventListener("input", (e) => {
        const scale = Number.parseFloat(e.target.value)
        this.modelManager.updateAvatarScale(scale)
        this.utils.updateValueDisplay("avatar-scale", "avatar-scale-value")
      })
    }

    // Avatar opacity control
    const avatarOpacity = document.getElementById("avatar-opacity")
    if (avatarOpacity) {
      avatarOpacity.addEventListener("input", (e) => {
        const opacity = Number.parseFloat(e.target.value)
        this.modelManager.updateAvatarOpacity(opacity)
        this.utils.updateValueDisplay("avatar-opacity", "avatar-opacity-value")
      })
    }
  }

  setupGarmentControls() {
    // Garment preset selection
    const garmentPresets = document.querySelectorAll("[data-garment]")
    garmentPresets.forEach((preset) => {
      preset.addEventListener("click", () => {
        const garmentType = preset.dataset.garment

        // Update active preset
        garmentPresets.forEach((p) => p.classList.remove("active"))
        preset.classList.add("active")

        // Load garment
        this.modelManager.loadPresetGarment(garmentType)
      })
    })

    // Garment scale control
    const garmentScale = document.getElementById("garment-scale")
    if (garmentScale) {
      garmentScale.addEventListener("input", (e) => {
        const scale = Number.parseFloat(e.target.value)
        this.modelManager.updateGarmentScale(scale)
        this.utils.updateValueDisplay("garment-scale", "garment-scale-value")
      })
    }

    // Garment opacity control
    const garmentOpacity = document.getElementById("garment-opacity")
    if (garmentOpacity) {
      garmentOpacity.addEventListener("input", (e) => {
        const opacity = Number.parseFloat(e.target.value)
        this.modelManager.updateGarmentOpacity(opacity)
        this.utils.updateValueDisplay("garment-opacity", "garment-opacity-value")
      })
    }
  }

  setupCombinedControls() {
    // Combination method selection
    const combinationMethods = document.querySelectorAll("[data-combination]")
    combinationMethods.forEach((method) => {
      method.addEventListener("click", () => {
        const combinationType = method.dataset.combination

        // Update active method
        combinationMethods.forEach((m) => m.classList.remove("active"))
        method.classList.add("active")

        // Update state
        this.state.setCombinationMethod(combinationType)
        this.utils.updateStatus(`Combination method: ${combinationType}`)
      })
    })

    // Combined garment scale
    const garmentScaleCombined = document.getElementById("garment-scale-combined")
    if (garmentScaleCombined) {
      garmentScaleCombined.addEventListener("input", (e) => {
        const scale = Number.parseFloat(e.target.value)
        this.modelManager.updateGarmentScaleInCombined(scale)
        this.utils.updateValueDisplay("garment-scale-combined", "garment-scale-combined-value")
      })
    }

    // Garment position controls
    const garmentOffsetX = document.getElementById("garment-offset-x")
    if (garmentOffsetX) {
      garmentOffsetX.addEventListener("input", (e) => {
        const offset = Number.parseFloat(e.target.value)
        this.modelManager.updateGarmentPosition("x", offset)
        this.utils.updateValueDisplay("garment-offset-x", "garment-offset-x-value")
      })
    }

    const garmentOffsetY = document.getElementById("garment-offset-y")
    if (garmentOffsetY) {
      garmentOffsetY.addEventListener("input", (e) => {
        const offset = Number.parseFloat(e.target.value)
        this.modelManager.updateGarmentPosition("y", offset)
        this.utils.updateValueDisplay("garment-offset-y", "garment-offset-y-value")
      })
    }

    // Generate combined button
    const generateCombined = document.getElementById("generate-combined")
    if (generateCombined) {
      generateCombined.addEventListener("click", () => {
        this.modelManager.generateCombinedView()
      })
    }

    // Reset combination button
    const resetCombination = document.getElementById("reset-combination")
    if (resetCombination) {
      resetCombination.addEventListener("click", () => {
        this.modelManager.resetCombination()
      })
    }
  }

  setupPhysicsControls() {
    // Physics toggle
    const physicsToggle = document.getElementById("physics-toggle")
    if (physicsToggle) {
      physicsToggle.addEventListener("click", () => {
        this.physicsManager.togglePhysics()
      })
    }

    // Physics reset
    const physicsReset = document.getElementById("physics-reset")
    if (physicsReset) {
      physicsReset.addEventListener("click", () => {
        this.physicsManager.resetPhysics()
      })
    }

    // Reset cloth
    const resetCloth = document.getElementById("reset-cloth")
    if (resetCloth) {
      resetCloth.addEventListener("click", () => {
        this.physicsManager.resetCloth()
      })
    }

    // Debug toggle
    const debugToggle = document.getElementById("debug-toggle")
    if (debugToggle) {
      debugToggle.addEventListener("click", () => {
        this.physicsManager.toggleDebug()
      })
    }

    // Debug log
    const debugLog = document.getElementById("debug-log")
    if (debugLog) {
      debugLog.addEventListener("click", () => {
        this.physicsManager.logStatus()
      })
    }

    // Drop test
    const dropTest = document.getElementById("drop-test")
    if (dropTest) {
      dropTest.addEventListener("click", () => {
        this.physicsManager.runDropTest()
      })
    }

    // Basic test
    const basicTest = document.getElementById("basic-test")
    if (basicTest) {
      basicTest.addEventListener("click", () => {
        this.physicsManager.runBasicTest()
      })
    }

    // Cloth stiffness
    const clothStiffness = document.getElementById("cloth-stiffness")
    if (clothStiffness) {
      clothStiffness.addEventListener("input", (e) => {
        const stiffness = Number.parseFloat(e.target.value)
        this.physicsManager.updatePhysicsSetting("stiffness", stiffness)
        this.utils.updateValueDisplay("cloth-stiffness", "cloth-stiffness-value")
      })
    }

    // Gravity strength
    const gravityStrength = document.getElementById("gravity-strength")
    if (gravityStrength) {
      gravityStrength.addEventListener("input", (e) => {
        const gravity = Number.parseFloat(e.target.value)
        this.physicsManager.updatePhysicsSetting("gravity", gravity)
        this.utils.updateValueDisplay("gravity-strength", "gravity-strength-value")
      })
    }
  }

  setupEnvironmentControls() {
    // Environment selection
    const envButtons = document.querySelectorAll(".env-btn")
    envButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const environment = button.dataset.environment

        // Update active button
        envButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        // Update environment
        this.environmentManager.setEnvironment(environment)
      })
    })

    // Tone mapping selection
    const toneMappingButtons = document.querySelectorAll("[data-tone-mapping]")
    toneMappingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const toneMapping = button.dataset.toneMapping

        // Update active button
        toneMappingButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        // Update tone mapping
        this.environmentManager.setToneMapping(toneMapping)
      })
    })

    // Exposure control
    const exposure = document.getElementById("exposure")
    if (exposure) {
      exposure.addEventListener("input", (e) => {
        const value = Number.parseFloat(e.target.value)
        this.environmentManager.setExposure(value)
        this.utils.updateValueDisplay("exposure", "exposure-value")
      })
    }

    // Shadow intensity control
    const shadowIntensity = document.getElementById("shadow-intensity")
    if (shadowIntensity) {
      shadowIntensity.addEventListener("input", (e) => {
        const value = Number.parseFloat(e.target.value)
        this.environmentManager.setShadowIntensity(value)
        this.utils.updateValueDisplay("shadow-intensity", "shadow-intensity-value")
      })
    }

    // Shadow softness control
    const shadowSoftness = document.getElementById("shadow-softness")
    if (shadowSoftness) {
      shadowSoftness.addEventListener("input", (e) => {
        const value = Number.parseFloat(e.target.value)
        this.environmentManager.setShadowSoftness(value)
        this.utils.updateValueDisplay("shadow-softness", "shadow-softness-value")
      })
    }

    // Auto rotate toggle
    const autoRotateToggle = document.getElementById("auto-rotate-toggle")
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener("click", () => {
        this.environmentManager.toggleAutoRotate()
      })
    }

    // Camera reset
    const cameraReset = document.getElementById("camera-reset")
    if (cameraReset) {
      cameraReset.addEventListener("click", () => {
        this.environmentManager.resetCamera()
      })
    }

    // Focus model
    const focusModel = document.getElementById("focus-model")
    if (focusModel) {
      focusModel.addEventListener("click", () => {
        this.environmentManager.focusModel()
      })
    }
  }

  setupActionButtons() {
    // Screenshot button
    const takeScreenshot = document.getElementById("take-screenshot")
    if (takeScreenshot) {
      takeScreenshot.addEventListener("click", () => {
        this.utils.takeScreenshot()
      })
    }

    // Export scene button
    const exportScene = document.getElementById("export-scene")
    if (exportScene) {
      exportScene.addEventListener("click", () => {
        this.utils.exportScene()
      })
    }
  }

  setupFileUploads() {
    // Avatar file upload
    const avatarFile = document.getElementById("avatar-file")
    if (avatarFile) {
      avatarFile.addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (file && this.utils.isValidModelFile(file)) {
          const url = this.utils.createObjectURL(file)
          this.modelManager.loadCustomAvatar(url, file.name)
          this.utils.updateFileInfo("avatar-file-info", file, "Avatar")
        } else {
          this.utils.updateStatus("❌ Invalid avatar file format")
        }
      })
    }

    // Garment file upload
    const garmentFile = document.getElementById("garment-file")
    if (garmentFile) {
      garmentFile.addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (file && this.utils.isValidModelFile(file)) {
          const url = this.utils.createObjectURL(file)
          this.modelManager.loadCustomGarment(url, file.name)
          this.utils.updateFileInfo("garment-file-info", file, "Garment")
        } else {
          this.utils.updateStatus("❌ Invalid garment file format")
        }
      })
    }
  }

  setupRangeInputs() {
    // Update all range input displays on page load
    const rangeInputs = document.querySelectorAll('input[type="range"]')
    rangeInputs.forEach((input) => {
      const displayId = input.id + "-value"
      this.utils.updateValueDisplay(input.id, displayId)
    })
  }

  // Update UI state based on app state
  updateUI() {
    // Update combination status
    this.utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)

    // Update model info
    const modelName = this.state.hasGarment ? "Garment + Avatar" : this.state.hasAvatar ? "Avatar Only" : "None"
    const modelType = this.state.getCurrentModelType()
    this.utils.updateModelInfo(modelName, modelType)
  }

  // Handle keyboard shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + S for screenshot
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        this.utils.takeScreenshot()
      }

      // Ctrl/Cmd + E for export
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault()
        this.utils.exportScene()
      }

      // Space for physics toggle
      if (e.key === " " && e.target.tagName !== "INPUT") {
        e.preventDefault()
        this.physicsManager.togglePhysics()
      }

      // R for reset
      if (e.key === "r" && !e.ctrlKey && !e.metaKey) {
        this.physicsManager.resetPhysics()
      }
    })
  }

  // Cleanup
  cleanup() {
    // Remove event listeners if needed
    console.log("🎮 UIControls cleaned up")
  }
}
