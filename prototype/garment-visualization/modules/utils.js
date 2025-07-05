// Utility functions and helpers
export class Utils {
  constructor(state) {
    this.state = state
    console.log("🔧 Utils initialized")
  }

  async initialize() {
    console.log("✅ Utils initialized")
  }

  // Status updates
  updateStatus(message) {
    const statusElement = document.getElementById("status")
    if (statusElement) {
      statusElement.textContent = message
    }
    console.log("Status:", message)
  }

  updatePhysicsStatus(message) {
    const physicsStatusElement = document.getElementById("physics-status")
    if (physicsStatusElement) {
      physicsStatusElement.textContent = `Physics: ${message}`
    }
    console.log("Physics Status:", message)
  }

  // File handling
  isValidModelFile(file) {
    const validExtensions = [".glb", ".gltf"]
    const fileName = file.name.toLowerCase()
    return validExtensions.some((ext) => fileName.endsWith(ext))
  }

  createObjectURL(file) {
    return URL.createObjectURL(file)
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  updateFileInfo(elementId, file, type) {
    const fileInfo = document.getElementById(elementId)
    if (fileInfo) {
      fileInfo.innerHTML = `
        <strong>✅ Loaded:</strong> ${file.name}<br>
        <strong>📊 Size:</strong> ${this.formatFileSize(file.size)}<br>
        <strong>🏷️ Type:</strong> ${type}
      `
      fileInfo.className = "file-info success"
    }
  }

  // File operations
  async checkFileExists(url) {
    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch (error) {
      return false
    }
  }

  revokeObjectURL(url) {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url)
    }
  }

  // Button state management
  setActiveButtonByData(selector, dataAttribute, value) {
    // Remove active class from all buttons
    document.querySelectorAll(selector).forEach((btn) => {
      btn.classList.remove("active")
    })

    // Add active class to matching button
    const targetButton = document.querySelector(`${selector}[${dataAttribute}="${value}"]`)
    if (targetButton) {
      targetButton.classList.add("active")
    }
  }

  setButtonsActive(selector, activeButton) {
    document.querySelectorAll(selector).forEach((btn) => btn.classList.remove("active"))
    if (activeButton) {
      activeButton.classList.add("active")
    }
  }

  // UI helpers
  updateCombinationStatus(hasAvatar, hasGarment) {
    const statusElement = document.getElementById("combination-status")
    const statusDot = statusElement?.querySelector(".status-dot")
    const statusText = statusElement?.querySelector(".status-text")

    if (!statusElement || !statusDot || !statusText) return

    if (hasAvatar && hasGarment) {
      statusElement.className = "status-indicator success"
      statusText.textContent = "✅ Ready for combined visualization"
    } else if (hasAvatar || hasGarment) {
      statusElement.className = "status-indicator warning"
      statusText.textContent = "⚠️ Load both avatar and garment"
    } else {
      statusElement.className = "status-indicator error"
      statusText.textContent = "❌ Load avatar and garment to combine"
    }
  }

  updateModelInfo(url, type) {
    const modelNameElement = document.getElementById("model-name")
    const modelTypeElement = document.getElementById("model-type")
    const modelStatusElement = document.getElementById("model-status")

    if (modelNameElement) {
      const fileName = url ? url.split("/").pop() : "None loaded"
      modelNameElement.textContent = fileName
    }

    if (modelTypeElement) {
      modelTypeElement.textContent = type || "-"
    }

    if (modelStatusElement) {
      modelStatusElement.textContent = url ? "Loaded" : "Ready"
    }
  }

  // Screenshot functionality
  takeScreenshot() {
    const viewer = this.state.mainViewer || this.state.avatarViewer || this.state.garmentViewer
    if (viewer) {
      try {
        const canvas = viewer.querySelector("canvas")
        if (canvas) {
          const link = document.createElement("a")
          link.download = `lucifex-screenshot-${Date.now()}.png`
          link.href = canvas.toDataURL()
          link.click()
          this.updateStatus("📸 Screenshot saved")
        } else {
          this.updateStatus("❌ No canvas found for screenshot")
        }
      } catch (error) {
        console.error("Screenshot error:", error)
        this.updateStatus("❌ Screenshot failed")
      }
    } else {
      this.updateStatus("❌ No viewer available for screenshot")
    }
  }

  // Export functionality
  exportScene() {
    const sceneData = {
      timestamp: new Date().toISOString(),
      avatarUrl: this.state.currentAvatarUrl,
      garmentUrl: this.state.currentGarmentUrl,
      modelType: this.state.currentModelType,
      environment: this.state.currentEnvironment,
      combinationMethod: this.state.currentCombinationMethod,
      physicsEnabled: this.state.isPhysicsEnabled,
      settings: this.getControlValues(),
    }

    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    link.download = `lucifex-scene-${Date.now()}.json`
    link.href = URL.createObjectURL(blob)
    link.click()

    this.updateStatus("💾 Scene exported")
  }

  getControlValues() {
    const controls = {}
    const inputs = document.querySelectorAll("input[type='range']")
    inputs.forEach((input) => {
      if (input.id) {
        controls[input.id] = input.value
      }
    })
    return controls
  }

  // Value display updates
  updateValueDisplay(inputId, valueId) {
    const input = document.getElementById(inputId)
    const valueDisplay = document.getElementById(valueId)

    if (input && valueDisplay) {
      valueDisplay.textContent = input.value
    }
  }

  // Cleanup
  cleanup() {
    // Clean up any object URLs
    if (this.state.currentAvatarUrl && this.state.currentAvatarUrl.startsWith("blob:")) {
      this.revokeObjectURL(this.state.currentAvatarUrl)
    }
    if (this.state.currentGarmentUrl && this.state.currentGarmentUrl.startsWith("blob:")) {
      this.revokeObjectURL(this.state.currentGarmentUrl)
    }
  }

  // Physics effect display
  showPhysicsEffect(message, duration = 3000) {
    const effectElement = document.getElementById("physics-effect")
    if (effectElement) {
      effectElement.textContent = message
      effectElement.classList.add("visible")

      setTimeout(() => {
        effectElement.classList.remove("visible")
      }, duration)
    }
  }
}
