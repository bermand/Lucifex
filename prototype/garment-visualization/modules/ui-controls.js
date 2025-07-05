// UI Controls and Event Handling
export class UIControls {
  constructor(state) {
    this.state = state
    console.log("🎮 UIControls initialized")
  }

  async initialize() {
    this.setupTabControls()
    this.setupModelControls()
    this.setupFileUploads()
    this.setupPresetButtons()
    this.setupRangeInputs()
    this.setupPhysicsControls()
    this.setupEnvironmentControls()
    this.setupActionButtons()

    console.log("✅ UIControls initialized")
  }

  setupTabControls() {
    const tabs = document.querySelectorAll(".tab")
    const tabContents = document.querySelectorAll(".tab-content")

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab

        // Remove active class from all tabs and contents
        tabs.forEach((t) => t.classList.remove("active"))
        tabContents.forEach((content) => content.classList.remove("active"))

        // Add active class to clicked tab and corresponding content
        tab.classList.add("active")
        const targetContent = document.getElementById(`${targetTab}-tab`)
        if (targetContent) {
          targetContent.classList.add("active")
        }

        // Update state
        this.state.setCurrentTab(targetTab)
      })
    })
  }

  setupModelControls() {
    const modelButtons = document.querySelectorAll(".model-btn")

    modelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const modelType = button.dataset.modelType

        // Remove active class from all buttons
        modelButtons.forEach((btn) => btn.classList.remove("active"))

        // Add active class to clicked button
        button.classList.add("active")

        // Switch model type
        const modelManager = window.lucifexApp?.modelManager
        if (modelManager) {
          modelManager.switchModelType(modelType)
        }
      })
    })
  }

  setupFileUploads() {
    // Avatar file upload
    const avatarFileInput = document.getElementById("avatar-file")
    if (avatarFileInput) {
      avatarFileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0]
        const utils = window.lucifexApp?.utils
        const modelManager = window.lucifexApp?.modelManager

        if (file && utils && utils.isValidModelFile(file)) {
          if (modelManager) {
            await modelManager.loadAvatarModel(file, true)
          }
        } else if (utils) {
          utils.updateStatus("❌ Please select a valid model file (.glb or .gltf)")
        }
      })
    }

    // Garment file upload
    const garmentFileInput = document.getElementById("garment-file")
    if (garmentFileInput) {
      garmentFileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0]
        const utils = window.lucifexApp?.utils
        const modelManager = window.lucifexApp?.modelManager

        if (file && utils && utils.isValidModelFile(file)) {
          if (modelManager) {
            await modelManager.loadGarmentModel(file, true)
          }
        } else if (utils) {
          utils.updateStatus("❌ Please select a valid model file (.glb or .gltf)")
        }
      })
    }
  }

  setupPresetButtons() {
    // Avatar presets
    const avatarOptions = document.querySelectorAll(".avatar-option")
    avatarOptions.forEach((option) => {
      option.addEventListener("click", async () => {
        const avatarType = option.dataset.avatar
        const modelManager = window.lucifexApp?.modelManager

        // Remove active class from all options
        avatarOptions.forEach((opt) => opt.classList.remove("active"))

        // Add active class to clicked option
        option.classList.add("active")

        // Load avatar model
        if (modelManager) {
          const avatarUrl = `../assets/avatars/${avatarType}.glb`
          await modelManager.loadAvatarModel(avatarUrl)
        }
      })
    })

    // Garment presets
    const garmentPresets = document.querySelectorAll(".preset-btn[data-garment]")
    garmentPresets.forEach((preset) => {
      preset.addEventListener("click", async () => {
        const garmentType = preset.dataset.garment
        const modelManager = window.lucifexApp?.modelManager

        // Remove active class from all presets
        garmentPresets.forEach((p) => p.classList.remove("active"))

        // Add active class to clicked preset
        preset.classList.add("active")

        // Load garment model
        if (modelManager) {
          const garmentUrl = `../assets/garments/${garmentType}.glb`
          await modelManager.loadGarmentModel(garmentUrl)
        }
      })
    })

    // Combination method presets
    const combinationPresets = document.querySelectorAll(".preset-btn[data-combination]")
    combinationPresets.forEach((preset) => {
      preset.addEventListener("click", () => {
        const combinationMethod = preset.dataset.combination

        // Remove active class from all presets
        combinationPresets.forEach((p) => p.classList.remove("active"))

        // Add active class to clicked preset
        preset.classList.add("active")

        // Update state
        this.state.setCombinationMethod(combinationMethod)

        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.updateStatus(`Combination method: ${combinationMethod}`)
        }
      })
    })
  }

  setupRangeInputs() {
    const utils = window.lucifexApp?.utils
    const modelManager = window.lucifexApp?.modelManager

    // Avatar scale
    const avatarScale = document.getElementById("avatar-scale")
    if (avatarScale) {
      avatarScale.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("avatar-scale", "avatar-scale-value")
        }
        if (modelManager) {
          modelManager.updateModelScale("avatar", value)
        }
      })
    }

    // Avatar opacity
    const avatarOpacity = document.getElementById("avatar-opacity")
    if (avatarOpacity) {
      avatarOpacity.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("avatar-opacity", "avatar-opacity-value")
        }
        if (modelManager) {
          modelManager.updateModelOpacity("avatar", value)
        }
      })
    }

    // Garment scale
    const garmentScale = document.getElementById("garment-scale")
    if (garmentScale) {
      garmentScale.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("garment-scale", "garment-scale-value")
        }
        if (modelManager) {
          modelManager.updateModelScale("garment", value)
        }
      })
    }

    // Garment opacity
    const garmentOpacity = document.getElementById("garment-opacity")
    if (garmentOpacity) {
      garmentOpacity.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("garment-opacity", "garment-opacity-value")
        }
        if (modelManager) {
          modelManager.updateModelOpacity("garment", value)
        }
      })
    }

    // Combined controls
    const garmentScaleCombined = document.getElementById("garment-scale-combined")
    if (garmentScaleCombined) {
      garmentScaleCombined.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("garment-scale-combined", "garment-scale-combined-value")
        }
        if (modelManager) {
          modelManager.updateModelScale("garment", value)
        }
      })
    }

    // Position controls
    const garmentOffsetX = document.getElementById("garment-offset-x")
    if (garmentOffsetX) {
      garmentOffsetX.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("garment-offset-x", "garment-offset-x-value")
        }
        if (modelManager) {
          const yValue = document.getElementById("garment-offset-y")?.value || 0
          modelManager.updateModelPosition("garment", value, yValue)
        }
      })
    }

    const garmentOffsetY = document.getElementById("garment-offset-y")
    if (garmentOffsetY) {
      garmentOffsetY.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("garment-offset-y", "garment-offset-y-value")
        }
        if (modelManager) {
          const xValue = document.getElementById("garment-offset-x")?.value || 0
          modelManager.updateModelPosition("garment", xValue, value)
        }
      })
    }

    // Physics controls
    const clothStiffness = document.getElementById("cloth-stiffness")
    if (clothStiffness) {
      clothStiffness.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("cloth-stiffness", "cloth-stiffness-value")
        }
        const physicsManager = window.lucifexApp?.physicsManager
        if (physicsManager) {
          physicsManager.updatePhysicsSetting("stiffness", value)
        }
      })
    }

    const gravityStrength = document.getElementById("gravity-strength")
    if (gravityStrength) {
      gravityStrength.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("gravity-strength", "gravity-strength-value")
        }
        const physicsManager = window.lucifexApp?.physicsManager
        if (physicsManager) {
          physicsManager.updatePhysicsSetting("gravity", value)
        }
      })
    }

    // Environment controls
    const exposure = document.getElementById("exposure")
    if (exposure) {
      exposure.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("exposure", "exposure-value")
        }
        const environmentManager = window.lucifexApp?.environmentManager
        if (environmentManager) {
          environmentManager.setExposure(value)
        }
      })
    }

    const shadowIntensity = document.getElementById("shadow-intensity")
    if (shadowIntensity) {
      shadowIntensity.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("shadow-intensity", "shadow-intensity-value")
        }
        const environmentManager = window.lucifexApp?.environmentManager
        if (environmentManager) {
          environmentManager.setShadowIntensity(value)
        }
      })
    }

    const shadowSoftness = document.getElementById("shadow-softness")
    if (shadowSoftness) {
      shadowSoftness.addEventListener("input", (event) => {
        const value = event.target.value
        if (utils) {
          utils.updateValueDisplay("shadow-softness", "shadow-softness-value")
        }
        const environmentManager = window.lucifexApp?.environmentManager
        if (environmentManager) {
          environmentManager.setShadowSoftness(value)
        }
      })
    }
  }

  setupPhysicsControls() {
    const physicsManager = window.lucifexApp?.physicsManager

    // Physics toggle
    const physicsToggle = document.getElementById("physics-toggle")
    if (physicsToggle) {
      physicsToggle.addEventListener("click", () => {
        if (physicsManager) {
          physicsManager.togglePhysics()
        }
      })
    }

    // Physics reset
    const physicsReset = document.getElementById("physics-reset")
    if (physicsReset) {
      physicsReset.addEventListener("click", () => {
        if (physicsManager) {
          physicsManager.resetPhysics()
        }
      })
    }

    // Reset cloth
    const resetCloth = document.getElementById("reset-cloth")
    if (resetCloth) {
      resetCloth.addEventListener("click", () => {
        if (physicsManager) {
          physicsManager.resetCloth()
        }
      })
    }

    // Debug toggle
    const debugToggle = document.getElementById("debug-toggle")
    if (debugToggle) {
      debugToggle.addEventListener("click", () => {
        if (physicsManager) {
          physicsManager.toggleDebug()
        }
      })
    }

    // Debug log
    const debugLog = document.getElementById("debug-log")
    if (debugLog) {
      debugLog.addEventListener("click", () => {
        if (physicsManager) {
          physicsManager.logStatus()
        }
      })
    }

    // Drop test
    const dropTest = document.getElementById("drop-test")
    if (dropTest) {
      dropTest.addEventListener("click", () => {
        if (physicsManager) {
          physicsManager.runDropTest()
        }
      })
    }

    // Basic test
    const basicTest = document.getElementById("basic-test")
    if (basicTest) {
      basicTest.addEventListener("click", () => {
        if (physicsManager) {
          physicsManager.runBasicTest()
        }
      })
    }
  }

  setupEnvironmentControls() {
    const environmentManager = window.lucifexApp?.environmentManager

    // Environment buttons
    const envButtons = document.querySelectorAll(".env-btn")
    envButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const environment = button.dataset.environment

        // Remove active class from all buttons
        envButtons.forEach((btn) => btn.classList.remove("active"))

        // Add active class to clicked button
        button.classList.add("active")

        // Set environment
        if (environmentManager) {
          environmentManager.setEnvironment(environment)
        }
      })
    })

    // Tone mapping buttons
    const toneMappingButtons = document.querySelectorAll(".preset-btn[data-tone-mapping]")
    toneMappingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const toneMapping = button.dataset.toneMapping

        // Remove active class from all buttons
        toneMappingButtons.forEach((btn) => btn.classList.remove("active"))

        // Add active class to clicked button
        button.classList.add("active")

        // Set tone mapping
        if (environmentManager) {
          environmentManager.setToneMapping(toneMapping)
        }
      })
    })

    // Auto rotate toggle
    const autoRotateToggle = document.getElementById("auto-rotate-toggle")
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener("click", () => {
        if (environmentManager) {
          environmentManager.toggleAutoRotate()
        }
      })
    }

    // Camera reset
    const cameraReset = document.getElementById("camera-reset")
    if (cameraReset) {
      cameraReset.addEventListener("click", () => {
        if (environmentManager) {
          environmentManager.resetCamera()
        }
      })
    }

    // Focus model
    const focusModel = document.getElementById("focus-model")
    if (focusModel) {
      focusModel.addEventListener("click", () => {
        if (environmentManager) {
          environmentManager.focusModel()
        }
      })
    }
  }

  setupActionButtons() {
    const utils = window.lucifexApp?.utils

    // Screenshot
    const takeScreenshot = document.getElementById("take-screenshot")
    if (takeScreenshot) {
      takeScreenshot.addEventListener("click", () => {
        if (utils) {
          utils.takeScreenshot()
        }
      })
    }

    // Export scene
    const exportScene = document.getElementById("export-scene")
    if (exportScene) {
      exportScene.addEventListener("click", () => {
        if (utils) {
          utils.exportScene()
        }
      })
    }

    // Generate combined
    const generateCombined = document.getElementById("generate-combined")
    if (generateCombined) {
      generateCombined.addEventListener("click", async () => {
        const modelManager = window.lucifexApp?.modelManager
        if (modelManager) {
          await modelManager.createCombinedView()
        }
      })
    }

    // Reset combination
    const resetCombination = document.getElementById("reset-combination")
    if (resetCombination) {
      resetCombination.addEventListener("click", () => {
        // Reset all combination controls to default values
        const controls = ["garment-scale-combined", "garment-offset-x", "garment-offset-y"]

        controls.forEach((controlId) => {
          const control = document.getElementById(controlId)
          if (control) {
            control.value = control.defaultValue || "1.0"
            if (utils) {
              utils.updateValueDisplay(controlId, controlId + "-value")
            }
          }
        })

        if (utils) {
          utils.updateStatus("🔄 Combination settings reset")
        }
      })
    }
  }

  cleanup() {
    // Remove event listeners if needed
    console.log("🎮 UIControls cleaned up")
  }
}
