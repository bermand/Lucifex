// Utility functions and helpers
export class Utils {
  constructor() {
    console.log("🔧 Utils initialized")
  }

  async initialize() {
    console.log("✅ Utils initialized")
  }

  // Status updates
  updateStatus(message) {
    const statusElement = document.getElementById("app-status")
    if (statusElement) {
      statusElement.textContent = message
    }
    console.log("Status:", message)
  }

  updateModelInfo(name, type, status = "Ready") {
    const nameElement = document.getElementById("model-name")
    const typeElement = document.getElementById("model-type")
    const statusElement = document.getElementById("model-status")

    if (nameElement) nameElement.textContent = name
    if (typeElement) typeElement.textContent = type
    if (statusElement) statusElement.textContent = status
  }

  updateCombinationStatus(status) {
    const statusElement = document.getElementById("combination-status")
    if (statusElement) {
      statusElement.textContent = status
    }
  }

  // Physics status updates
  updatePhysicsStatus(message) {
    const indicator = document.getElementById("physics-indicator")
    const statusText = indicator?.querySelector(".status-text")
    if (statusText) {
      statusText.textContent = `Physics: ${message}`
    }
  }

  // Show physics effect
  showPhysicsEffect(message) {
    const effectElement = document.getElementById("physics-effect")
    if (effectElement) {
      effectElement.textContent = message
      effectElement.classList.add("show")

      setTimeout(() => {
        effectElement.classList.remove("show")
      }, 2000)
    }
  }

  // Value display updates
  updateValueDisplay(inputId, valueId) {
    const input = document.getElementById(inputId)
    const valueDisplay = document.getElementById(valueId)

    if (input && valueDisplay) {
      const updateValue = () => {
        valueDisplay.textContent = Number.parseFloat(input.value).toFixed(1)
      }

      updateValue()
      input.addEventListener("input", updateValue)
    }
  }

  // File handling
  handleFileUpload(file, callback) {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target.result
      if (callback) callback(url, file)
    }
    reader.readAsDataURL(file)
  }

  // Screenshot functionality
  async takeScreenshot() {
    try {
      const viewer = document.querySelector("model-viewer")
      if (!viewer) {
        throw new Error("No model viewer found")
      }

      // Use model-viewer's built-in screenshot capability
      const blob = await viewer.toBlob({
        idealAspect: true,
        mimeType: "image/png",
      })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `lucifex-screenshot-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      this.updateStatus("📸 Screenshot saved successfully")
      return true
    } catch (error) {
      console.error("Screenshot failed:", error)
      this.updateStatus("❌ Screenshot failed")
      return false
    }
  }

  // Export scene data
  async exportScene() {
    try {
      const state = window.lucifexApp?.getState()
      if (!state) {
        throw new Error("No application state found")
      }

      const sceneData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        avatar: {
          url: state.avatarUrl,
          scale: state.avatarScale,
          opacity: state.avatarOpacity,
        },
        garment: {
          url: state.garmentUrl,
          scale: state.garmentScale,
          opacity: state.garmentOpacity,
          offsetX: state.garmentOffsetX,
          offsetY: state.garmentOffsetY,
        },
        environment: {
          type: state.environment,
          exposure: state.exposure,
          shadowIntensity: state.shadowIntensity,
          shadowSoftness: state.shadowSoftness,
          toneMapping: state.toneMapping,
        },
        physics: {
          enabled: state.isPhysicsEnabled,
          debugEnabled: state.isPhysicsDebugEnabled,
        },
      }

      const blob = new Blob([JSON.stringify(sceneData, null, 2)], {
        type: "application/json",
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `lucifex-scene-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      this.updateStatus("💾 Scene exported successfully")
      return true
    } catch (error) {
      console.error("Export failed:", error)
      this.updateStatus("❌ Export failed")
      return false
    }
  }

  // Animation helpers
  animateValue(element, startValue, endValue, duration = 300) {
    const startTime = performance.now()
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      const currentValue = startValue + (endValue - startValue) * this.easeOutCubic(progress)
      element.textContent = currentValue.toFixed(1)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
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

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Validate file type
  isValidModelFile(file) {
    const validTypes = [".glb", ".gltf"]
    const fileName = file.name.toLowerCase()
    return validTypes.some((type) => fileName.endsWith(type))
  }

  // Show loading state
  showLoading(element) {
    if (element) {
      element.classList.add("loading")
    }
  }

  hideLoading(element) {
    if (element) {
      element.classList.remove("loading")
    }
  }

  // Cleanup
  cleanup() {
    console.log("🧹 Utils cleaned up")
  }
}
