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
    this.setupEnvironmentControls()
    this.setupPhysicsControls()
    this.setupHeaderControls()
    this.setupRangeControls()
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
        })

        const targetContent = document.getElementById(`${targetTab}-tab`)
        if (targetContent) {
          targetContent.classList.add("active")
        }

        this.state.setCurrentTab(targetTab)
      })
    })
  }

  setupModelControls() {
    // Model type selector
    const modelButtons = document.querySelectorAll(".model-btn")
    modelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const modelType = button.dataset.modelType

        // Update active button
        modelButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        // Switch model type
        this.modelManager.switchModelType(modelType)
      })
    })

    // Avatar selection
    const avatarOptions = document.querySelectorAll(".avatar-option")
    avatarOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const avatarType = option.dataset.avatar
        const avatarUrl = `../assets/avatars/${avatarType}.glb`

        // Update active option
        avatarOptions.forEach((opt) => opt.classList.remove("active"))
        option.classList.add("active")

        this.modelManager.loadAvatar(avatarUrl)
      })
    })

    // Garment presets
    const presetButtons = document.querySelectorAll(".preset-btn[data-garment]")
    presetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const garmentName = button.dataset.garment
        const garmentUrl = `../assets/garments/${garmentName}.glb`

        // Update active button
        presetButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        this.modelManager.loadGarment(garmentUrl)
      })
    })

    // Combination methods
    const combinationButtons = document.querySelectorAll(".preset-btn[data-combination]")
    combinationButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const combination = button.dataset.combination

        // Update active button
        combinationButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        console.log("Combination method:", combination)
      })
    })

    // Combined view actions
    const generateButton = document.getElementById("generate-combined")
    if (generateButton) {
      generateButton.addEventListener("click", () => {
        this.modelManager.createCombinedView()
      })
    }

    const resetCombinationButton = document.getElementById("reset-combination")
    if (resetCombinationButton) {
      resetCombinationButton.addEventListener("click", () => {
        this.modelManager.createCombinedView()
      })
    }
  }

  setupFileUploads() {
    // Avatar file upload
    const avatarFileInput = document.getElementById("avatar-file")
    const avatarFileInfo = document.getElementById("avatar-file-info")

    if (avatarFileInput) {
      avatarFileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0]
        if (file) {
          try {
            const url = await this.utils.loadFile(file)
            this.modelManager.loadAvatar(url)

            if (avatarFileInfo) {
              avatarFileInfo.textContent = `Loaded: ${file.name}`
            }
          } catch (error) {
            console.error("Error loading avatar file:", error)
            if (avatarFileInfo) {
              avatarFileInfo.textContent = "Error loading file"
            }
          }
        }
      })
    }

    // Garment file upload
    const garmentFileInput = document.getElementById("garment-file")
    const garmentFileInfo = document.getElementById("garment-file-info")

    if (garmentFileInput) {
      garmentFileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0]
        if (file) {
          try {
            const url = await this.utils.loadFile(file)
            this.modelManager.loadGarment(url)

            if (garmentFileInfo) {
              garmentFileInfo.textContent = `Loaded: ${file.name}`
            }
          } catch (error) {
            console.error("Error loading garment file:", error)
            if (garmentFileInfo) {
              garmentFileInfo.textContent = "Error loading file"
            }
          }
        }
      })
    }
  }

  setupEnvironmentControls() {
    // Environment buttons
    const envButtons = document.querySelectorAll(".env-btn")
    envButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const environment = button.dataset.environment

        // Update active button
        envButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        this.environmentManager.setEnvironment(environment)
      })
    })

    // Tone mapping buttons
    const toneMappingButtons = document.querySelectorAll(".preset-btn[data-tone-mapping]")
    toneMappingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const toneMapping = button.dataset.toneMapping

        // Update active button
        toneMappingButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        this.environmentManager.setToneMapping(toneMapping)
      })
    })

    // Camera controls
    const autoRotateButton = document.getElementById("auto-rotate-toggle")
    if (autoRotateButton) {
      autoRotateButton.addEventListener("click", () => {
        this.environmentManager.toggleAutoRotate()
      })
    }

    const cameraResetButton = document.getElementById("camera-reset")
    if (cameraResetButton) {
      cameraResetButton.addEventListener("click", () => {
        this.environmentManager.resetCamera()
      })
    }

    const focusModelButton = document.getElementById("focus-model")
    if (focusModelButton) {
      focusModelButton.addEventListener("click", () => {
        this.environmentManager.focusModel()
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

    // Physics actions
    const dropTestButton = document.getElementById("drop-test")
    if (dropTestButton) {
      dropTestButton.addEventListener("click", () => {
        this.physicsManager.runDropTest()
      })
    }

    const basicTestButton = document.getElementById("basic-test")
    if (basicTestButton) {
      basicTestButton.addEventListener("click", () => {
        this.physicsManager.runBasicTest()
      })
    }

    const physicsResetButton = document.getElementById("physics-reset")
    if (physicsResetButton) {
      physicsResetButton.addEventListener("click", () => {
        this.physicsManager.resetPhysics()
      })
    }

    const resetClothButton = document.getElementById("reset-cloth")
    if (resetClothButton) {
      resetClothButton.addEventListener("click", () => {
        this.physicsManager.resetCloth()
      })
    }

    // Debug controls
    const debugToggle = document.getElementById("debug-toggle")
    if (debugToggle) {
      debugToggle.addEventListener("click", () => {
        this.physicsManager.toggleDebug()
      })
    }

    const debugLogButton = document.getElementById("debug-log")
    if (debugLogButton) {
      debugLogButton.addEventListener("click", () => {
        this.physicsManager.logStatus()
      })
    }
  }

  setupHeaderControls() {
    // Screenshot button
    const screenshotButton = document.getElementById("take-screenshot")
    if (screenshotButton) {
      screenshotButton.addEventListener("click", () => {
        this.modelManager.takeScreenshot()
      })
    }

    // Export button
    const exportButton = document.getElementById("export-scene")
    if (exportButton) {
      exportButton.addEventListener("click", () => {
        this.modelManager.exportScene()
      })
    }
  }

  setupRangeControls() {
    // Avatar controls
    this.setupRangeControl("avatar-scale", (value) => {
      this.modelManager.updateAvatarScale(value)
    })

    this.setupRangeControl("avatar-opacity", (value) => {
      this.modelManager.updateOpacity("avatar", value)
    })

    // Garment controls
    this.setupRangeControl("garment-scale", (value) => {
      this.modelManager.updateGarmentScale(value)
    })

    this.setupRangeControl("garment-opacity", (value) => {
      this.modelManager.updateOpacity("garment", value)
    })

    // Combined controls
    this.setupRangeControl("garment-scale-combined", (value) => {
      this.modelManager.updateGarmentScale(value)
    })

    this.setupRangeControl("garment-offset-x", (value) => {
      const yValue = document.getElementById("garment-offset-y")?.value || 0
      this.modelManager.updateGarmentPosition(value, yValue)
    })

    this.setupRangeControl("garment-offset-y", (value) => {
      const xValue = document.getElementById("garment-offset-x")?.value || 0
      this.modelManager.updateGarmentPosition(xValue, value)
    })

    // Physics controls
    this.setupRangeControl("cloth-stiffness", (value) => {
      this.physicsManager.updatePhysicsSetting("stiffness", value)
    })

    this.setupRangeControl("gravity-strength", (value) => {
      this.physicsManager.updatePhysicsSetting("gravity", value)
    })

    // Environment controls
    this.setupRangeControl("exposure", (value) => {
      this.environmentManager.updateExposure(value)
    })

    this.setupRangeControl("shadow-intensity", (value) => {
      this.environmentManager.updateShadowIntensity(value)
    })

    this.setupRangeControl("shadow-softness", (value) => {
      this.environmentManager.updateShadowSoftness(value)
    })
  }

  setupRangeControl(id, callback) {
    const slider = document.getElementById(id)
    const valueDisplay = document.getElementById(`${id}-value`)

    if (slider) {
      const debouncedCallback = this.utils.debounce(callback, 100)

      slider.addEventListener("input", (e) => {
        const value = Number.parseFloat(e.target.value)

        if (valueDisplay) {
          valueDisplay.textContent = value.toFixed(1)
        }

        debouncedCallback(value)
      })
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return
      }

      switch (e.key.toLowerCase()) {
        case "1":
          this.state.setCurrentTab("avatar")
          this.activateTab("avatar")
          break
        case "2":
          this.state.setCurrentTab("garment")
          this.activateTab("garment")
          break
        case "3":
          this.state.setCurrentTab("combined")
          this.activateTab("combined")
          break
        case "4":
          this.state.setCurrentTab("physics")
          this.activateTab("physics")
          break
        case "5":
          this.state.setCurrentTab("environment")
          this.activateTab("environment")
          break
        case "p":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            this.physicsManager.togglePhysics()
          }
          break
        case "s":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            this.modelManager.takeScreenshot()
          }
          break
        case "r":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            this.environmentManager.resetCamera()
          }
          break
      }
    })
  }

  activateTab(tabName) {
    const tabs = document.querySelectorAll(".tab")
    const tabContents = document.querySelectorAll(".tab-content")

    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabName)
    })

    tabContents.forEach((content) => {
      content.classList.toggle("active", content.id === `${tabName}-tab`)
    })
  }

  cleanup() {
    // Remove event listeners if needed
    console.log("🧹 UIControls cleaned up")
  }
}
