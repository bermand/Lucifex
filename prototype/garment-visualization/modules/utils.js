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
    }
  }

  updatePhysicsStatus(message) {
    console.log("Physics Status:", message)
    const physicsStatusElement = document.getElementById("physics-status")
    if (physicsStatusElement) {
      physicsStatusElement.textContent = `Physics: ${message}`

      // Update class based on status
      if (message.includes("active") || message.includes("enabled")) {
        physicsStatusElement.classList.add("active")
      } else {
        physicsStatusElement.classList.remove("active")
      }
    }
  }

  // Model info updates
  updateModelInfo(url, type) {
    const modelName = document.getElementById("model-name")
    const modelType = document.getElementById("model-type")
    const modelStatus = document.getElementById("model-status")

    if (modelName) {
      const fileName = url ? url.split("/").pop() : "None loaded"
      modelName.textContent = fileName
    }

    if (modelType) {
      modelType.textContent = type || "-"
    }

    if (modelStatus) {
      modelStatus.textContent = url ? "Loaded" : "Ready"
    }
  }

  // Combination status
  updateCombinationStatus(hasAvatar, hasGarment) {
    const statusElement = document.getElementById("combination-status")
    if (!statusElement) return

    const statusDot = statusElement.querySelector(".status-dot")
    const statusText = statusElement.querySelector(".status-text")

    if (hasAvatar && hasGarment) {
      statusElement.className = "status-indicator success"
      if (statusText) statusText.textContent = "Ready for combination"
    } else if (hasAvatar || hasGarment) {
      statusElement.className = "status-indicator warning"
      if (statusText) statusText.textContent = "Need both avatar and garment"
    } else {
      statusElement.className = "status-indicator"
      if (statusText) statusText.textContent = "Load avatar and garment"
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

  revokeObjectURL(url) {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url)
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // File existence check
  async checkFileExists(url) {
    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Button state management
  setActiveButtonByData(selector, dataAttribute, value) {
    const buttons = document.querySelectorAll(selector)
    buttons.forEach((button) => {
      button.classList.remove("active")
      if (button.getAttribute(dataAttribute) === value) {
        button.classList.add("active")
      }
    })
  }

  // Physics effects
  showPhysicsEffect(message) {
    const effectElement = document.getElementById("physics-effect")
    if (!effectElement) return

    effectElement.textContent = message
    effectElement.classList.add("show")

    setTimeout(() => {
      effectElement.classList.remove("show")
    }, 2000)
  }

  // Screenshot functionality
  takeScreenshot() {
    const viewer = this.state.mainViewer || this.state.avatarViewer
    if (!viewer) {
      this.updateStatus("❌ No model viewer available for screenshot")
      return
    }

    try {
      // This would need to be implemented with canvas capture
      this.updateStatus("📸 Screenshot feature coming soon")
    } catch (error) {
      console.error("Screenshot error:", error)
      this.updateStatus("❌ Screenshot failed")
    }
  }

  // Export functionality
  exportScene() {
    try {
      const sceneData = {
        avatar: this.state.currentAvatarUrl,
        garment: this.state.currentGarmentUrl,
        modelType: this.state.currentModelType,
        environment: this.state.currentEnvironment,
        combinationMethod: this.state.currentCombinationMethod,
        timestamp: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(sceneData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `lucifex-scene-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      this.updateStatus("💾 Scene exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      this.updateStatus("❌ Export failed")
    }
  }

  // Cleanup
  cleanup() {
    // Revoke any object URLs
    if (this.state.currentAvatarUrl && this.state.currentAvatarUrl.startsWith("blob:")) {
      this.revokeObjectURL(this.state.currentAvatarUrl)
    }
    if (this.state.currentGarmentUrl && this.state.currentGarmentUrl.startsWith("blob:")) {
      this.revokeObjectURL(this.state.currentGarmentUrl)
    }
  }
}
