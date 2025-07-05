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
    this.setupRangeControls()
    this.setupActionButtons()
    this.setupPhysicsControls()
    this.setupEnvironmentControls()

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

        // Update button states
        modelButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        // Update state and switch view
        this.state.setModelType(modelType)
        this.switchModelView(modelType)
      })
    })
  }

  async switchModelView(modelType) {
    const utils = window.lucifexApp?.utils
    const modelManager = window.lucifexApp?.modelManager

    if (!modelManager) return

    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    // Hide combined container by default
    if (combinedContainer) {
      combinedContainer.style.display = "none"
    }

    switch (modelType) {
      case "avatar":
        if (this.state.currentAvatarUrl) {
          mainViewer.src = this.state.currentAvatarUrl
          mainViewer.style.display = "block"
          this.state.setMainViewer(mainViewer)
          if (utils) {
            utils.updateModelInfo(this.state.currentAvatarUrl, "Avatar")
          }
        }
        break

      case "garment":
        if (this.state.currentGarmentUrl) {
          mainViewer.src = this.state.currentGarmentUrl
          mainViewer.style.display = "block"
          this.state.setMainViewer(mainViewer)
          if (utils) {
            utils.updateModelInfo(this.state.currentGarmentUrl, "Garment")
          }
        }
        break

      case "both":
        if (this.state.canCombine) {
          mainViewer.style.display = "none"
          if (combinedContainer) {
            combinedContainer.style.display = "block"
          }
          await modelManager.generateCombinedView()
          if (utils) {
            utils.updateModelInfo("Combined View", "Avatar + Garment")
          }
        } else {
          if (utils) {
            utils.updateStatus("❌ Need both avatar and garment for combined view")
          }
        }
        break
    }
  }

  setupFileUploads() {
    // Avatar file upload
    const avatarFileInput = document.getElementById("avatar-file")
    if (avatarFileInput) {
      avatarFileInput.addEventListener("change", (e) => {
        this.handleFileUpload(e, "avatar")
      })
    }

    // Garment file upload
    const garmentFileInput = document.getElementById("garment-file")
    if (garmentFileInput) {
      garmentFileInput.addEventListener("change", (e) => {
        this.handleFileUpload(e, "garment")
      })
    }
  }

  async handleFileUpload(event, type) {
    const file = event.target.files[0]
    const utils = window.lucifexApp?.utils
    const modelManager = window.lucifexApp?.modelManager

    if (!file || !utils) return

    if (!utils.isValidModelFile(file)) {
      utils.updateStatus("❌ Please select a valid .glb or .gltf file")
      return
    }

    try {
      const objectURL = utils.createObjectURL(file)

      if (type === "avatar") {
        this.state.setAvatarUrl(objectURL)
        utils.updateFileInfo("avatar-file-info", file, "Avatar")
        utils.updateStatus(`Loading custom avatar: ${file.name}`)
      } else if (type === "garment") {
        this.state.setGarmentUrl(objectURL)
        utils.updateFileInfo("garment-file-info", file, "Garment")
        utils.updateStatus(`Loading custom garment: ${file.name}`)
      }

      // Update combination status
      utils.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)

      // If in combined mode and both models are available, regenerate
      if (this.state.currentModelType === "both" && this.state.canCombine && modelManager) {
        await modelManager.generateCombinedView()
      } else if (this.state.currentModelType === type && modelManager) {
        await modelManager.loadSingleModel(objectURL, type)
      }
    } catch (error) {
      console.error(`Error loading ${type}:`, error)
      utils.updateStatus(`❌ Failed to load ${type}`)
    }
  }

  setupPresetButtons() {
    // Avatar presets
    const avatarOptions = document.querySelectorAll(".avatar-option")
    avatarOptions.forEach((option) => {
      option.addEventListener("click", () => {
        this.handleAvatarPreset(option.dataset.avatar)
      })
    })

    // Garment presets
    const garmentPresets = document.querySelectorAll(".preset-btn[data-garment]")
    garmentPresets.forEach((preset) => {
      preset.addEventListener("click", () => {
        this.handleGarmentPreset(preset.dataset.garment)
      })
    })

    // Combination method presets
    const combinationPresets = document.querySelectorAll(".preset-btn[data-combination]")
    combinationPresets.forEach((preset) => {
      preset.addEventListener("click", () => {
        this.handleCombinationPreset(preset.dataset.combination)
      })
    })
  }

  async handleAvatarPreset(avatarType) {
    const utils = window.lucifexApp?.utils
    const modelManager = window.lucifexApp?.modelManager

    const avatarUrls = {
      male: "../assets/avatars/male.glb",
      female: "../assets/avatars/female.glb",
    }

    const url = avatarUrls[avatarType]
    if (!url) return

    try {
      // Check if file exists
      const exists = await utils?.checkFileExists(url)
      if (!exists) {
        utils?.updateStatus(`❌ Avatar file not found: ${avatarType}`)
        return
      }

      this.state.setAvatarUrl(url)
      utils?.setActiveButtonByData(".avatar-option", "data-avatar", avatarType)
      utils?.updateStatus(`Loading avatar: ${avatarType}`)
      utils?.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)

      // Load model if appropriate
      if (this.state.currentModelType === "avatar" && modelManager) {
        await modelManager.loadSingleModel(url, "avatar")
      } else if (this.state.currentModelType === "both" && this.state.canCombine && modelManager) {
        await modelManager.generateCombinedView()
      }
    } catch (error) {
      console.error("Error loading avatar preset:", error)
      utils?.updateStatus(`❌ Failed to load avatar: ${avatarType}`)
    }
  }

  async handleGarmentPreset(garmentType) {
    const utils = window.lucifexApp?.utils
    const modelManager = window.lucifexApp?.modelManager

    const garmentUrls = {
      tshirt: "../assets/garments/tshirt.glb",
      "tshirt-1": "../assets/garments/tshirt-1.glb",
      thsirt: "../assets/garments/thsirt.gltf",
    }

    const url = garmentUrls[garmentType]
    if (!url) return

    try {
      // Check if file exists
      const exists = await utils?.checkFileExists(url)
      if (!exists) {
        utils?.updateStatus(`❌ Garment file not found: ${garmentType}`)
        return
      }

      this.state.setGarmentUrl(url)
      utils?.setActiveButtonByData(".preset-btn[data-garment]", "data-garment", garmentType)
      utils?.updateStatus(`Loading garment: ${garmentType}`)
      utils?.updateCombinationStatus(this.state.hasAvatar, this.state.hasGarment)

      // Load model if appropriate
      if (this.state.currentModelType === "garment" && modelManager) {
        await modelManager.loadSingleModel(url, "garment")
      } else if (this.state.currentModelType === "both" && this.state.canCombine && modelManager) {
        await modelManager.generateCombinedView()
      }
    } catch (error) {
      console.error("Error loading garment preset:", error)
      utils?.updateStatus(`❌ Failed to load garment: ${garmentType}`)
    }
  }

  handleCombinationPreset(method) {
    const utils = window.lucifexApp?.utils

    this.state.setCombinationMethod(method)
    utils?.setActiveButtonByData(".preset-btn[data-combination]", "data-combination", method)
    utils?.updateStatus(`Combination method: ${method}`)
  }

  setupRangeControls() {
    // Avatar scale
    const avatarScale = document.getElementById("avatar-scale")
    if (avatarScale) {
      avatarScale.addEventListener("input", (e) => {
        const value = e.target.value
        const utils = window.lucifexApp?.utils
        const modelManager = window.lucifexApp?.modelManager

        utils?.updateValueDisplay("avatar-scale", "avatar-scale-value")
        modelManager?.updateModelScale("avatar", Number.parseFloat(value))
      })
    }

    // Garment scale
    const garmentScale = document.getElementById("garment-scale")
    if (garmentScale) {
      garmentScale.addEventListener("input", (e) => {
        const value = e.target.value
        const utils = window.lucifexApp?.utils
        const modelManager = window.lucifexApp?.modelManager

        utils?.updateValueDisplay("garment-scale", "garment-scale-value")
        modelManager?.updateModelScale("garment", Number.parseFloat(value))
      })
    }

    // Combined controls
    const combinedControls = [
      "garment-scale-combined",
      "garment-offset-x",
      "garment-offset-y",
      "avatar-opacity",
      "garment-opacity",
    ]

    combinedControls.forEach((controlId) => {
      const control = document.getElementById(controlId)
      if (control) {
        control.addEventListener("input", (e) => {
          const value = e.target.value
          const utils = window.lucifexApp?.utils
          const modelManager = window.lucifexApp?.modelManager

          utils?.updateValueDisplay(controlId, `${controlId}-value`)

          if (controlId.includes("opacity")) {
            const type = controlId.includes("avatar") ? "avatar" : "garment"
            modelManager?.updateModelOpacity(type, Number.parseFloat(value))
          } else if (controlId.includes("offset")) {
            modelManager?.updateGarmentPosition()
          } else if (controlId.includes("scale")) {
            modelManager?.updateModelScale("garment", Number.parseFloat(value))
          }
        })
      }
    })

    // Environment controls
    const environmentControls = ["exposure", "shadow-intensity", "shadow-softness"]
    environmentControls.forEach((controlId) => {
      const control = document.getElementById(controlId)
      if (control) {
        control.addEventListener("input", (e) => {
          const value = e.target.value
          const utils = window.lucifexApp?.utils
          const environmentManager = window.lucifexApp?.environmentManager

          utils?.updateValueDisplay(controlId, `${controlId}-value`)
          environmentManager?.updateEnvironmentSetting(controlId, Number.parseFloat(value))
        })
      }
    })

    // Physics controls
    const physicsControls = ["cloth-stiffness", "gravity-strength"]
    physicsControls.forEach((controlId) => {
      const control = document.getElementById(controlId)
      if (control) {
        control.addEventListener("input", (e) => {
          const value = e.target.value
          const utils = window.lucifexApp?.utils
          const physicsManager = window.lucifexApp?.physicsManager

          utils?.updateValueDisplay(controlId, `${controlId}-value`)
          physicsManager?.updatePhysicsSetting(controlId, Number.parseFloat(value))
        })
      }
    })
  }

  setupActionButtons() {
    // Combined view actions
    const generateCombined = document.getElementById("generate-combined")
    if (generateCombined) {
      generateCombined.addEventListener("click", async () => {
        const modelManager = window.lucifexApp?.modelManager
        if (modelManager) {
          await modelManager.generateCombinedView()
        }
      })
    }

    const resetCombination = document.getElementById("reset-combination")
    if (resetCombination) {
      resetCombination.addEventListener("click", () => {
        const modelManager = window.lucifexApp?.modelManager
        if (modelManager) {
          modelManager.resetCombination()
        }
      })
    }

    // Screenshot and export
    const takeScreenshot = document.getElementById("take-screenshot")
    if (takeScreenshot) {
      takeScreenshot.addEventListener("click", () => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.takeScreenshot()
        }
      })
    }

    const exportScene = document.getElementById("export-scene")
    if (exportScene) {
      exportScene.addEventListener("click", () => {
        const utils = window.lucifexApp?.utils
        if (utils) {
          utils.exportScene()
        }
      })
    }

    // Environment actions
    const autoRotateToggle = document.getElementById("auto-rotate-toggle")
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener("click", () => {
        const environmentManager = window.lucifexApp?.environmentManager
        if (environmentManager) {
          environmentManager.toggleAutoRotate()
        }
      })
    }

    const cameraReset = document.getElementById("camera-reset")
    if (cameraReset) {
      cameraReset.addEventListener("click", () => {
        const environmentManager = window.lucifexApp?.environmentManager
        if (environmentManager) {
          environmentManager.resetCamera()
        }
      })
    }

    const focusModel = document.getElementById("focus-model")
    if (focusModel) {
      focusModel.addEventListener("click", () => {
        const environmentManager = window.lucifexApp?.environmentManager
        if (environmentManager) {
          environmentManager.focusModel()
        }
      })
    }
  }

  setupPhysicsControls() {
    const physicsToggle = document.getElementById("physics-toggle")
    if (physicsToggle) {
      physicsToggle.addEventListener("click", () => {
        const physicsManager = window.lucifexApp?.physicsManager
        if (physicsManager) {
          physicsManager.togglePhysics()
        }
      })
    }

    const physicsReset = document.getElementById("physics-reset")
    if (physicsReset) {
      physicsReset.addEventListener("click", () => {
        const physicsManager = window.lucifexApp?.physicsManager
        if (physicsManager) {
          physicsManager.resetPhysics()
        }
      })
    }

    const resetCloth = document.getElementById("reset-cloth")
    if (resetCloth) {
      resetCloth.addEventListener("click", () => {
        const physicsManager = window.lucifexApp?.physicsManager
        if (physicsManager) {
          physicsManager.resetCloth()
        }
      })
    }

    const debugToggle = document.getElementById("debug-toggle")
    if (debugToggle) {
      debugToggle.addEventListener("click", () => {
        const physicsManager = window.lucifexApp?.physicsManager
        if (physicsManager) {
          physicsManager.toggleDebug()
        }
      })
    }

    const debugLog = document.getElementById("debug-log")
    if (debugLog) {
      debugLog.addEventListener("click", () => {
        const physicsManager = window.lucifexApp?.physicsManager
        if (physicsManager) {
          physicsManager.logStatus()
        }
      })
    }

    const dropTest = document.getElementById("drop-test")
    if (dropTest) {
      dropTest.addEventListener("click", () => {
        const physicsManager = window.lucifexApp?.physicsManager
        if (physicsManager) {
          physicsManager.runDropTest()
        }
      })
    }

    const basicTest = document.getElementById("basic-test")
    if (basicTest) {
      basicTest.addEventListener("click", () => {
        const physicsManager = window.lucifexApp?.physicsManager
        if (physicsManager) {
          physicsManager.runBasicTest()
        }
      })
    }
  }

  setupEnvironmentControls() {
    // Environment presets
    const envButtons = document.querySelectorAll(".env-btn")
    envButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const environment = button.dataset.environment
        const environmentManager = window.lucifexApp?.environmentManager

        if (environmentManager) {
          environmentManager.setEnvironment(environment)
        }
      })
    })

    // Tone mapping presets
    const toneMappingButtons = document.querySelectorAll(".preset-btn[data-tone-mapping]")
    toneMappingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const toneMapping = button.dataset.toneMapping
        const environmentManager = window.lucifexApp?.environmentManager

        if (environmentManager) {
          environmentManager.setToneMapping(toneMapping)
        }
      })
    })
  }

  cleanup() {
    // Remove event listeners if needed
    console.log("🎮 UIControls cleaned up")
  }
}
