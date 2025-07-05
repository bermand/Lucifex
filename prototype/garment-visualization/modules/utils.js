// Utility functions and helpers
export class Utils {
  constructor() {
    console.log("🔧 Utils initialized")
  }

  initialize() {
    console.log("✅ Utils initialized")
  }

  // Status updates
  updateStatus(message) {
    const statusIndicator = document.getElementById("status-indicator")
    const statusText = statusIndicator?.querySelector(".status-text")

    if (statusText) {
      statusText.textContent = message
    }

    // Auto-clear status after 5 seconds for non-error messages
    if (!message.includes("❌")) {
      setTimeout(() => {
        if (statusText && statusText.textContent === message) {
          statusText.textContent = "Ready"
        }
      }, 5000)
    }

    console.log("Status:", message)
  }

  // Physics status updates
  updatePhysicsStatus(message) {
    const physicsIndicator = document.getElementById("physics-indicator")
    const statusText = physicsIndicator?.querySelector(".status-text")

    if (statusText) {
      statusText.textContent = `Physics: ${message}`
    }

    console.log("Physics Status:", message)
  }

  // Model info updates
  updateModelInfo(name, type) {
    const modelNameEl = document.getElementById("model-name")
    const modelTypeEl = document.getElementById("model-type")

    if (modelNameEl) {
      modelNameEl.textContent = name || "None loaded"
    }

    if (modelTypeEl) {
      modelTypeEl.textContent = type || "-"
    }
  }

  // Combination status
  updateCombinationStatus(hasAvatar, hasGarment) {
    const avatarStatus = document.getElementById("avatar-status")
    const garmentStatus = document.getElementById("garment-status")

    if (avatarStatus) {
      avatarStatus.textContent = hasAvatar ? "✅ Loaded" : "❌ Not loaded"
      avatarStatus.className = hasAvatar ? "status-value success" : "status-value error"
    }

    if (garmentStatus) {
      garmentStatus.textContent = hasGarment ? "✅ Loaded" : "❌ Not loaded"
      garmentStatus.className = hasGarment ? "status-value success" : "status-value error"
    }
  }

  // File validation
  isValidModelFile(file) {
    if (!file) return false

    const validExtensions = [".glb", ".gltf"]
    const fileName = file.name.toLowerCase()

    return validExtensions.some((ext) => fileName.endsWith(ext))
  }

  // File size formatting
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Create object URL
  createObjectURL(file) {
    return URL.createObjectURL(file)
  }

  // File info display
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

  // Value display updates
  updateValueDisplay(inputId, displayId) {
    const input = document.getElementById(inputId)
    const display = document.getElementById(displayId)

    if (input && display) {
      display.textContent = input.value
    }
  }

  // Set active button by data attribute
  setActiveButtonByData(selector, dataAttribute, value) {
    const buttons = document.querySelectorAll(selector)

    buttons.forEach((button) => {
      button.classList.remove("active")
      if (button.dataset[dataAttribute.replace("data-", "")] === value) {
        button.classList.add("active")
      }
    })
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

  // Physics effect display
  showPhysicsEffect(message) {
    const effectEl = document.getElementById("physics-effect")
    const textEl = effectEl?.querySelector(".effect-text")

    if (effectEl && textEl) {
      textEl.textContent = message
      effectEl.classList.add("show")

      setTimeout(() => {
        effectEl.classList.remove("show")
      }, 2000)
    }
  }

  // Screenshot functionality
  takeScreenshot() {
    const viewer = document.querySelector("model-viewer")

    if (viewer) {
      try {
        const canvas = viewer.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = `lucifex-screenshot-${Date.now()}.png`
        link.href = canvas
        link.click()

        this.updateStatus("📸 Screenshot saved")
      } catch (error) {
        console.error("Screenshot error:", error)
        this.updateStatus("❌ Screenshot failed")
      }
    } else {
      this.updateStatus("❌ No model loaded for screenshot")
    }
  }

  // Scene export functionality
  exportScene() {
    const state = window.lucifexApp?.state?.getState()

    if (state) {
      const sceneData = {
        timestamp: new Date().toISOString(),
        avatarUrl: window.lucifexApp.state.currentAvatarUrl,
        garmentUrl: window.lucifexApp.state.currentGarmentUrl,
        settings: state,
      }

      const blob = new Blob([JSON.stringify(sceneData, null, 2)], {
        type: "application/json",
      })

      const link = document.createElement("a")
      link.download = `lucifex-scene-${Date.now()}.json`
      link.href = URL.createObjectURL(blob)
      link.click()

      this.updateStatus("💾 Scene exported")
    } else {
      this.updateStatus("❌ No scene data to export")
    }
  }

  // Debounce utility
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

  // Throttle utility
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

  // Animation frame utility
  requestAnimationFrame(callback) {
    return window.requestAnimationFrame(callback)
  }

  cancelAnimationFrame(id) {
    return window.cancelAnimationFrame(id)
  }

  // Local storage utilities
  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
      return false
    }
  }

  loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
      return null
    }
  }

  // Error handling
  handleError(error, context = "Unknown") {
    console.error(`Error in ${context}:`, error)
    this.updateStatus(`❌ Error in ${context}: ${error.message}`)
  }

  // Performance monitoring
  startPerformanceTimer(label) {
    console.time(label)
  }

  endPerformanceTimer(label) {
    console.timeEnd(label)
  }

  // Cleanup
  cleanup() {
    // Clean up any resources if needed
    console.log("🔧 Utils cleaned up")
  }
}
