// UI controls and event handling
export class UIControls {
  constructor(state, modelManager, environmentManager, physicsManager, utils) {
    this.state = state
    this.modelManager = modelManager
    this.environmentManager = environmentManager
    this.physicsManager = physicsManager
    this.utils = utils
    console.log("🎮 UIControls initialized")
  }

  async initialize() {
    this.setupTabNavigation()
    this.setupModelControls()
    this.setupFileUploads()
    this.setupRangeControls()
    this.setupPhysicsControls()
    this.setupEnvironmentControls()
    this.setupActionButtons()
    console.log("✅ UIControls initialized")
  }

  setupTabNavigation() {
    const tabs = document.querySelectorAll(".tab")
    const tabContents = document.querySelectorAll(".tab-content")

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab

        // Update active tab
        tabs.forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")

        // Update active content
        tabContents.forEach((content) => {
          content.classList.remove("active")
          if (content.id === `${targetTab}-tab`) {
            content.classList.add("active")
          }
        })

        this.state.setCurrentTab(targetTab)
      })
    })
  }

  setupModelControls() {
    // Avatar selection
    const avatarOptions = document.querySelectorAll(".avatar-option")
    avatarOptions.forEach((option) => {
      option.addEventListener("click", () => {
        avatarOptions.forEach((o) => o.classList.remove("active"))
        option.classList.add("active")

        const avatarType = option.dataset.avatar
        this.modelManager.loadPresetAvatar(avatarType)
      })
    })

    // Garment selection
    const garmentButtons = document.querySelectorAll(".preset-btn[data-garment]")
    garmentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        garmentButtons.forEach((b) => b.classList.remove("active"))
        button.classList.add("active")

        const garmentType = button.dataset.garment
        this.modelManager.loadPresetGarment(garmentType)
      })
    })

    // Model type selector
    const modelButtons = document.querySelectorAll(".model-btn")
    modelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        modelButtons.forEach((b) => b.classList.remove("active"))
        button.classList.add("active")

        const modelType = button.dataset.modelType
        this.modelManager.switchModelType(modelType)
      })
    })
  }

  setupFileUploads() {
    // Avatar file upload
    const avatarFileInput = document.getElementById("avatar-file")
    const avatarFileInfo = document.getElementById("avatar-file-info")

    if (avatarFileInput) {
      avatarFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (file) {
          avatarFileInfo.textContent = `${file.name} (${this.utils.formatFileSize(file.size)})`
          this.modelManager.loadCustomModel(file, "avatar")
        }
      })
    }

    // Garment file upload
    const garmentFileInput = document.getElementById("garment-file")
    const garmentFileInfo = document.getElementById("garment-file-info")

    if (garmentFileInput) {
      garmentFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (file) {
          garmentFileInfo.textContent = `${file.name} (${this.utils.formatFileSize(file.size)})`
          this.modelManager.loadCustomModel(file, "garment")
        }
      })
    }
  }

  setupRangeControls() {
    // Avatar controls
    const avatarScale = document.getElementById("avatar-scale")
    const avatarOpacity = document.getElementById("avatar-opacity")

    if (avatarScale) {
      this.utils.updateValueDisplay("avatar-scale", "avatar-scale-value")
      avatarScale.addEventListener(
        "input",
        this.utils.throttle(() => {
          const scale = Number.parseFloat(avatarScale.value)
          const opacity = Number.parseFloat(avatarOpacity?.value || 1)
          this.modelManager.updateAvatarTransform(scale, opacity)
          this.utils.updateValueDisplay("avatar-scale", "avatar-scale-value")
        }, 16),
      )
    }

    if (avatarOpacity) {
      this.utils.updateValueDisplay("avatar-opacity", "avatar-opacity-value")
      avatarOpacity.addEventListener(
        "input",
        this.utils.throttle(() => {
          const scale = Number.parseFloat(avatarScale?.value || 1)
          const opacity = Number.parseFloat(avatarOpacity.value)
          this.modelManager.updateAvatarTransform(scale, opacity)
          this.utils.updateValueDisplay("avatar-opacity", "avatar-opacity-value")
        }, 16),
      )
    }

    // Garment controls
    const garmentScale = document.getElementById("garment-scale")
    const garmentOpacity = document.getElementById("garment-opacity")
    const garmentScaleCombined = document.getElementById("garment-scale-combined")
    const garmentOffsetX = document.getElementById("garment-offset-x")
    const garmentOffsetY = document.getElementById("garment-offset-y")

    if (garmentScale) {
      this.utils.updateValueDisplay("garment-scale", "garment-scale-value")
      garmentScale.addEventListener(
        "input",
        this.utils.throttle(() => {
          const scale = Number.parseFloat(garmentScale.value)
          const opacity = Number.parseFloat(garmentOpacity?.value || 1)
          this.modelManager.updateGarmentTransform(scale, opacity)
          this.utils.updateValueDisplay("garment-scale", "garment-scale-value")
        }, 16),
      )
    }

    if (garmentOpacity) {
      this.utils.updateValueDisplay("garment-opacity", "garment-opacity-value")
      garmentOpacity.addEventListener(
        "input",
        this.utils.throttle(() => {
          const scale = Number.parseFloat(garmentScale?.value || 1)
          const opacity = Number.parseFloat(garmentOpacity.value)
          this.modelManager.updateGarmentTransform(scale, opacity)
          this.utils.updateValueDisplay("garment-opacity", "garment-opacity-value")
        }, 16),
      )
    }

    if (garmentScaleCombined) {
      this.utils.updateValueDisplay("garment-scale-combined", "garment-scale-combined-value")
      garmentScaleCombined.addEventListener(
        "input",
        this.utils.throttle(() => {
          const scale = Number.parseFloat(garmentScaleCombined.value)
          const opacity = Number.parseFloat(garmentOpacity?.value || 1)
          const offsetX = Number.parseFloat(garmentOffsetX?.value || 0)
          const offsetY = Number.parseFloat(garmentOffsetY?.value || 0)
          this.modelManager.updateGarmentTransform(scale, opacity, offsetX, offsetY)
          this.utils.updateValueDisplay("garment-scale-combined", "garment-scale-combined-value")
        }, 16),
      )
    }

    if (garmentOffsetX) {
      this.utils.updateValueDisplay("garment-offset-x", "garment-offset-x-value")
      garmentOffsetX.addEventListener(
        "input",
        this.utils.throttle(() => {
          const scale = Number.parseFloat(garmentScaleCombined?.value || 1)
          const opacity = Number.parseFloat(garmentOpacity?.value || 1)
          const offsetX = Number.parseFloat(garmentOffsetX.value)
          const offsetY = Number.parseFloat(garmentOffsetY?.value || 0)
          this.modelManager.updateGarmentTransform(scale, opacity, offsetX, offsetY)
          this.utils.updateValueDisplay("garment-offset-x", "garment-offset-x-value")
        }, 16),
      )
    }

    if (garmentOffsetY) {
      this.utils.updateValueDisplay("garment-offset-y", "garment-offset-y-value")
      garmentOffsetY.addEventListener(
        "input",
        this.utils.throttle(() => {
          const scale = Number.parseFloat(garmentScaleCombined?.value || 1)
          const opacity = Number.parseFloat(garmentOpacity?.value || 1)
          const offsetX = Number.parseFloat(garmentOffsetX?.value || 0)
          const offsetY = Number.parseFloat(garmentOffsetY.value)
          this.modelManager.updateGarmentTransform(scale, opacity, offsetX, offsetY)
          this.utils.updateValueDisplay("garment-offset-y", "garment-offset-y-value")
        }, 16),
      )
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

    // Physics actions
    const physicsReset = document.getElementById("physics-reset")
    if (physicsReset) {
      physicsReset.addEventListener("click", () => {
        this.physicsManager.resetPhysics()
      })
    }

    const resetCloth = document.getElementById("reset-cloth")
    if (resetCloth) {
      resetCloth.addEventListener("click", () => {
        this.physicsManager.resetCloth()
      })
    }

    const debugToggle = document.getElementById("debug-toggle")
    if (debugToggle) {
      debugToggle.addEventListener("click", () => {
        this.physicsManager.toggleDebug()
      })
    }

    const debugLog = document.getElementById("debug-log")
    if (debugLog) {
      debugLog.addEventListener("click", () => {
        this.physicsManager.logStatus()
      })
    }

    const dropTest = document.getElementById("drop-test")
    if (dropTest) {
      dropTest.addEventListener("click", () => {
        this.physicsManager.runDropTest()
      })
    }

    const basicTest = document.getElementById("basic-test")
    if (basicTest) {
      basicTest.addEventListener("click", () => {
        this.physicsManager.runBasicTest()
      })
    }

    // Physics settings
    const clothStiffness = document.getElementById("cloth-stiffness")
    if (clothStiffness) {
      this.utils.updateValueDisplay("cloth-stiffness", "cloth-stiffness-value")
      clothStiffness.addEventListener(
        "input",
        this.utils.throttle(() => {
          const value = Number.parseFloat(clothStiffness.value)
          this.physicsManager.updatePhysicsSetting("stiffness", value)
          this.utils.updateValueDisplay("cloth-stiffness", "cloth-stiffness-value")
        }, 100),
      )
    }

    const gravityStrength = document.getElementById("gravity-strength")
    if (gravityStrength) {
      this.utils.updateValueDisplay("gravity-strength", "gravity-strength-value")
      gravityStrength.addEventListener(
        "input",
        this.utils.throttle(() => {
          const value = Number.parseFloat(gravityStrength.value)
          this.physicsManager.updatePhysicsSetting("gravity", value)
          this.utils.updateValueDisplay("gravity-strength", "gravity-strength-value")
        }, 100),
      )
    }
  }

  setupEnvironmentControls() {
    // Environment selection
    const envButtons = document.querySelectorAll(".env-btn")
    envButtons.forEach((button) => {
      button.addEventListener("click", () => {
        envButtons.forEach((b) => b.classList.remove("active"))
        button.classList.add("active")

        const envType = button.dataset.environment
        this.environmentManager.setEnvironment(envType)
      })
    })

    // Lighting controls
    const exposure = document.getElementById("exposure")
    if (exposure) {
      this.utils.updateValueDisplay("exposure", "exposure-value")
      exposure.addEventListener(
        "input",
        this.utils.throttle(() => {
          const value = Number.parseFloat(exposure.value)
          this.environmentManager.setExposure(value)
          this.utils.updateValueDisplay("exposure", "exposure-value")
        }, 50),
      )
    }

    const shadowIntensity = document.getElementById("shadow-intensity")
    if (shadowIntensity) {
      this.utils.updateValueDisplay("shadow-intensity", "shadow-intensity-value")
      shadowIntensity.addEventListener(
        "input",
        this.utils.throttle(() => {
          const value = Number.parseFloat(shadowIntensity.value)
          this.environmentManager.setShadowIntensity(value)
          this.utils.updateValueDisplay("shadow-intensity", "shadow-intensity-value")
        }, 50),
      )
    }

    const shadowSoftness = document.getElementById("shadow-softness")
    if (shadowSoftness) {
      this.utils.updateValueDisplay("shadow-softness", "shadow-softness-value")
      shadowSoftness.addEventListener(
        "input",
        this.utils.throttle(() => {
          const value = Number.parseFloat(shadowSoftness.value)
          this.environmentManager.setShadowSoftness(value)
          this.utils.updateValueDisplay("shadow-softness", "shadow-softness-value")
        }, 50),
      )
    }

    // Tone mapping
    const toneMappingButtons = document.querySelectorAll(".preset-btn[data-tone-mapping]")
    toneMappingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        toneMappingButtons.forEach((b) => b.classList.remove("active"))
        button.classList.add("active")

        const toneMapping = button.dataset.toneMapping
        this.environmentManager.setToneMapping(toneMapping)
      })
    })

    // Camera controls
    const autoRotateToggle = document.getElementById("auto-rotate-toggle")
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener("click", () => {
        this.environmentManager.toggleAutoRotate()
      })
    }

    const cameraReset = document.getElementById("camera-reset")
    if (cameraReset) {
      cameraReset.addEventListener("click", () => {
        this.environmentManager.resetCamera()
      })
    }

    const focusModel = document.getElementById("focus-model")
    if (focusModel) {
      focusModel.addEventListener("click", () => {
        this.environmentManager.focusModel()
      })
    }
  }

  setupActionButtons() {
    // Screenshot
    const takeScreenshot = document.getElementById("take-screenshot")
    if (takeScreenshot) {
      takeScreenshot.addEventListener("click", () => {
        this.utils.takeScreenshot()
      })
    }

    // Export scene
    const exportScene = document.getElementById("export-scene")
    if (exportScene) {
      exportScene.addEventListener("click", () => {
        this.utils.exportScene()
      })
    }

    // Generate combined
    const generateCombined = document.getElementById("generate-combined")
    if (generateCombined) {
      generateCombined.addEventListener("click", () => {
        this.modelManager.createCombinedView()
      })
    }

    // Reset combination
    const resetCombination = document.getElementById("reset-combination")
    if (resetCombination) {
      resetCombination.addEventListener("click", () => {
        this.modelManager.resetCombination()
      })
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return
      }

      switch (e.key) {
        case "1":
          document.querySelector('.tab[data-tab="avatar"]')?.click()
          break
        case "2":
          document.querySelector('.tab[data-tab="garment"]')?.click()
          break
        case "3":
          document.querySelector('.tab[data-tab="combined"]')?.click()
          break
        case "4":
          document.querySelector('.tab[data-tab="physics"]')?.click()
          break
        case "5":
          document.querySelector('.tab[data-tab="environment"]')?.click()
          break
        case " ":
          e.preventDefault()
          this.physicsManager.togglePhysics()
          break
        case "r":
          this.physicsManager.resetPhysics()
          break
        case "s":
          e.preventDefault()
          this.utils.takeScreenshot()
          break
        case "e":
          this.utils.exportScene()
          break
      }
    })
  }

  cleanup() {
    // Remove event listeners if needed
    console.log("🎮 UIControls cleaned up")
  }
}
