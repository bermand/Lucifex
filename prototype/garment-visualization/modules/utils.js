// Utility functions
export class Utils {
  constructor(state) {
    this.state = state
    console.log("🔧 Utils initialized")
  }

  // Status updates
  updateStatus(message) {
    const statusContent = document.getElementById("status-content")
    if (statusContent) {
      statusContent.textContent = message
    }
    console.log("Status:", message)
  }

  updatePhysicsStatus(message) {
    const physicsStatus = document.getElementById("physics-status")
    if (physicsStatus) {
      physicsStatus.innerHTML = `<strong>Physics Engine:</strong> ${message}`
    }
    console.log("Physics Status:", message)
  }

  updateCombinationStatus(hasAvatar, hasGarment) {
    const status = document.getElementById("combination-status")
    if (!status) return

    if (hasAvatar && hasGarment) {
      status.className = "combination-status ready"
      status.innerHTML = "<strong>Status:</strong> ✅ Ready for combined visualization"
    } else if (hasAvatar || hasGarment) {
      status.className = "combination-status partial"
      status.innerHTML = "<strong>Status:</strong> ⚠️ Load both avatar and garment"
    } else {
      status.className = "combination-status empty"
      status.innerHTML = "<strong>Status:</strong> ❌ Load avatar and garment to combine"
    }
  }

  updateModelInfo(url, type) {
    const modelInfo = document.getElementById("model-info")
    if (!modelInfo) return

    if (!url || !type) {
      modelInfo.textContent = "No model loaded"
      return
    }

    const fileName = url.split("/").pop()
    modelInfo.innerHTML = `
      <strong>Type:</strong> ${type}<br>
      <strong>File:</strong> ${fileName}<br>
      <strong>Status:</strong> Loaded
    `
  }

  // Physics effect indicator
  showPhysicsEffect(message) {
    const indicator = document.getElementById("physics-effect-indicator")
    const textElement = document.getElementById("physics-effect-text")

    if (indicator && textElement) {
      textElement.textContent = message
      indicator.classList.add("visible")

      setTimeout(() => {
        indicator.classList.remove("visible")
      }, 3000)
    }
  }

  // File utilities
  async checkFileExists(url) {
    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch (error) {
      return false
    }
  }

  createObjectURL(file) {
    return URL.createObjectURL(file)
  }

  revokeObjectURL(url) {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url)
    }
  }

  // UI utilities
  setActiveButton(selector, activeElement) {
    const buttons = document.querySelectorAll(selector)
    buttons.forEach((btn) => btn.classList.remove("active"))
    if (activeElement) {
      activeElement.classList.add("active")
    }
  }

  setActiveButtonByData(selector, dataAttribute, value) {
    const buttons = document.querySelectorAll(selector)
    buttons.forEach((btn) => {
      btn.classList.remove("active")
      if (btn.getAttribute(dataAttribute) === value) {
        btn.classList.add("active")
      }
    })
  }

  // Performance monitoring
  updatePerformanceInfo(fps, triangles) {
    const performanceInfo = document.getElementById("performance-info")
    if (performanceInfo) {
      performanceInfo.innerHTML = `
        FPS: ${fps || "--"}<br>
        Triangles: ${triangles || "--"}
      `
    }
  }

  // Screenshot functionality
  async takeScreenshot() {
    const viewer = this.state.mainViewer || this.state.garmentViewer
    if (!viewer) {
      this.updateStatus("❌ No model viewer available for screenshot")
      return
    }

    try {
      const canvas = await viewer.toBlob({ idealAspect: true })
      const url = URL.createObjectURL(canvas)

      const link = document.createElement("a")
      link.href = url
      link.download = `lucifex-screenshot-${Date.now()}.png`
      link.click()

      URL.revokeObjectURL(url)
      this.updateStatus("✅ Screenshot saved")
    } catch (error) {
      console.error("Screenshot error:", error)
      this.updateStatus("❌ Screenshot failed")
    }
  }

  // Export functionality
  exportScene() {
    const sceneData = {
      avatarUrl: this.state.currentAvatarUrl,
      garmentUrl: this.state.currentGarmentUrl,
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
    link.click()

    URL.revokeObjectURL(url)
    this.updateStatus("✅ Scene exported")
  }

  // Validation utilities
  isValidModelFile(file) {
    const validExtensions = [".glb", ".gltf"]
    const fileName = file.name.toLowerCase()
    return validExtensions.some((ext) => fileName.endsWith(ext))
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Error handling
  handleError(error, context = "") {
    console.error(`Error in ${context}:`, error)
    this.updateStatus(`❌ Error: ${error.message || "Unknown error"}`)
  }
}
