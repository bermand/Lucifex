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
    console.log("Status:", message)
    const statusElement = document.getElementById("status")
    if (statusElement) {
      statusElement.textContent = message
      statusElement.className = message.includes("❌") ? "status error" : "status"
    }
  }

  updatePhysicsStatus(message) {
    console.log("Physics Status:", message)
    const physicsStatusElement = document.getElementById("physics-status")
    if (physicsStatusElement) {
      physicsStatusElement.textContent = message
      physicsStatusElement.className = message.includes("❌") ? "status error" : "status"
    }
  }

  showPhysicsEffect(message) {
    console.log("Physics Effect:", message)
    const effectElement = document.getElementById("physics-effect")
    if (effectElement) {
      effectElement.textContent = message
      effectElement.style.display = "block"
      setTimeout(() => {
        effectElement.style.display = "none"
      }, 3000)
    }
  }

  updateCombinationStatus(hasAvatar, hasGarment) {
    const combinationStatus = document.getElementById("combination-status")
    if (combinationStatus) {
      if (hasAvatar && hasGarment) {
        combinationStatus.textContent = "✅ Ready to combine"
        combinationStatus.className = "status success"
      } else if (hasAvatar || hasGarment) {
        combinationStatus.textContent = "⚠️ Need both models"
        combinationStatus.className = "status warning"
      } else {
        combinationStatus.textContent = "❌ No models loaded"
        combinationStatus.className = "status error"
      }
    }
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

  // Button state management
  setActiveButtonByData(selector, dataAttribute, value) {
    document.querySelectorAll(selector).forEach((btn) => btn.classList.remove("active"))
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

  // Cleanup
  cleanup() {
    // Clean up any created object URLs
    if (this.state.currentAvatarUrl && this.state.currentAvatarUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.currentAvatarUrl)
    }
    if (this.state.currentGarmentUrl && this.state.currentGarmentUrl.startsWith("blob:")) {
      URL.revokeObjectURL(this.state.currentGarmentUrl)
    }
  }
}
