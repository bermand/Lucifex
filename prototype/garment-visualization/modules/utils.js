// Utility functions and helpers
export class Utils {
  constructor() {
    console.log("🔧 Utils initialized")
  }

  async initialize() {
    console.log("✅ Utils initialized")
  }

  // File validation
  isValidModelFile(file) {
    const validExtensions = [".glb", ".gltf"]
    const fileName = file.name.toLowerCase()
    return validExtensions.some((ext) => fileName.endsWith(ext))
  }

  // Create object URL for file
  createObjectURL(file) {
    return URL.createObjectURL(file)
  }

  // Check if file exists
  async checkFileExists(url) {
    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Update status message
  updateStatus(message) {
    const statusElement = document.getElementById("app-status")
    if (statusElement) {
      statusElement.textContent = message
    }
    console.log("Status:", message)
  }

  // Update model info
  updateModelInfo(name, type) {
    const nameElement = document.getElementById("model-name")
    const typeElement = document.getElementById("model-type")

    if (nameElement) nameElement.textContent = name
    if (typeElement) typeElement.textContent = type
  }

  // Update physics status
  updatePhysicsStatus(status) {
    const indicator = document.getElementById("physics-indicator")
    const statusText = indicator?.querySelector(".status-text")

    if (statusText) {
      statusText.textContent = `Physics: ${status}`
    }

    if (indicator) {
      indicator.className = `status-indicator ${status === "Enabled" ? "success" : "error"}`
    }
  }

  // Update combination status
  updateCombinationStatus(hasAvatar, hasGarment) {
    const statusElement = document.getElementById("combination-status")
    if (statusElement) {
      if (hasAvatar && hasGarment) {
        statusElement.textContent = "Ready"
        statusElement.style.color = "#16a34a"
      } else {
        statusElement.textContent = "Not Ready"
        statusElement.style.color = "#dc2626"
      }
    }
  }

  // Update file info display
  updateFileInfo(elementId, file, type) {
    const element = document.getElementById(elementId)
    if (element) {
      element.innerHTML = `
        <div><strong>${type}:</strong> ${file.name}</div>
        <div>Size: ${this.formatFileSize(file.size)}</div>
      `
    }
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Update range input display
  updateValueDisplay(inputId, displayId) {
    const input = document.getElementById(inputId)
    const display = document.getElementById(displayId)

    if (input && display) {
      display.textContent = Number.parseFloat(input.value).toFixed(1)
    }
  }

  // Set active button by data attribute
  setActiveButtonByData(selector, attribute, value) {
    const buttons = document.querySelectorAll(selector)
    buttons.forEach((button) => {
      button.classList.remove("active")
      if (button.dataset[attribute.replace("data-", "")] === value) {
        button.classList.add("active")
      }
    })
  }

  // Show physics effect
  showPhysicsEffect(message) {
    const effect = document.getElementById("physics-effect")
    if (effect) {
      effect.textContent = message
      effect.classList.add("show")

      setTimeout(() => {
        effect.classList.remove("show")
      }, 2000)
    }
  }

  // Take screenshot
  takeScreenshot() {
    const viewer = this.getCurrentViewer()
    if (viewer && viewer.toBlob) {
      viewer.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `lucifex-screenshot-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, "image/png")

      this.updateStatus("📸 Screenshot saved")
      this.showPhysicsEffect("📸 Screenshot Saved!")
    } else {
      this.updateStatus("❌ Screenshot not available")
    }
  }

  // Export scene
  exportScene() {
    const viewer = this.getCurrentViewer()
    if (viewer && viewer.exportScene) {
      const sceneData = viewer.exportScene()
      const blob = new Blob([JSON.stringify(sceneData, null, 2)], {
        type: "application/json",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lucifex-scene-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)

      this.updateStatus("💾 Scene exported")
      this.showPhysicsEffect("💾 Scene Exported!")
    } else {
      this.updateStatus("❌ Scene export not available")
    }
  }

  // Get current active viewer
  getCurrentViewer() {
    const mainViewer = document.getElementById("main-viewer")
    const combinedContainer = document.getElementById("combined-viewer-container")

    if (mainViewer && mainViewer.style.display !== "none") {
      return mainViewer
    } else if (combinedContainer && combinedContainer.style.display !== "none") {
      const garmentViewer = combinedContainer.querySelector("model-viewer:last-child")
      return garmentViewer
    }

    return null
  }

  // Debounce function
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Throttle function
  throttle(func, limit) {
    let inThrottle
    return function () {
      const args = arguments
      
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  // Generate unique ID
  generateId() {
    return Math.random().toString(36).substr(2, 9)
  }

  // Format timestamp
  formatTimestamp(date = new Date()) {
    return date.toISOString().replace(/[:.]/g, "-").slice(0, -5)
  }

  // Log with timestamp
  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = type === "error" ? "❌" : type === "warning" ? "⚠️" : "ℹ️"
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  // Error handling
  handleError(error, context = "Unknown") {
    this.log(`Error in ${context}: ${error.message}`, "error")
    this.updateStatus(`❌ Error: ${error.message}`)
  }

  // Performance monitoring
  startPerformanceTimer(label) {
    console.time(label)
  }

  endPerformanceTimer(label) {
    console.timeEnd(label)
  }

  // Local storage helpers
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      this.handleError(error, "saveToStorage")
      return false
    }
  }

  loadFromStorage(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      this.handleError(error, "loadFromStorage")
      return defaultValue
    }
  }

  // Cleanup
  cleanup() {
    // Clean up any resources
    console.log("🔧 Utils cleaned up")
  }
}
