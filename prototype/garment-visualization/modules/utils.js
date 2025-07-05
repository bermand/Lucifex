// Utility functions
export class Utils {
  constructor() {
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
    if (modelInfo) {
      const fileName = url.split("/").pop()
      modelInfo.innerHTML = `📊 ${type}: ${fileName}`
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

  formatFileSize(bytes) {
    return (bytes / 1024 / 1024).toFixed(2)
  }

  // UI helpers
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

  updateFileInfo(elementId, file, status = "success") {
    const fileInfo = document.getElementById(elementId)
    if (fileInfo && file) {
      fileInfo.innerHTML = `
        <div class="file-status ${status}">
          ✅ Loaded: ${file.name}<br>
          📊 Size: ${this.formatFileSize(file.size)} MB
        </div>
      `
    }
  }

  // Button state management
  setButtonActive(buttonId, active = true) {
    const button = document.getElementById(buttonId)
    if (button) {
      if (active) {
        button.classList.add("active")
      } else {
        button.classList.remove("active")
      }
    }
  }

  setButtonsActive(selector, activeElement) {
    // Remove active class from all buttons with selector
    document.querySelectorAll(selector).forEach((btn) => btn.classList.remove("active"))

    // Add active class to specific element
    if (activeElement) {
      activeElement.classList.add("active")
    }
  }

  // Value display updates
  updateValueDisplay(inputId, valueId, suffix = "") {
    const input = document.getElementById(inputId)
    const display = document.getElementById(valueId)

    if (input && display) {
      display.textContent = input.value + suffix
    }
  }

  // DOM helpers
  createElement(tag, className = "", innerHTML = "") {
    const element = document.createElement(tag)
    if (className) element.className = className
    if (innerHTML) element.innerHTML = innerHTML
    return element
  }

  removeElement(elementId) {
    const element = document.getElementById(elementId)
    if (element) {
      element.remove()
    }
  }

  // Animation helpers
  animateElement(element, keyframes, options = {}) {
    if (element && element.animate) {
      return element.animate(keyframes, {
        duration: 300,
        easing: "ease-out",
        ...options,
      })
    }
  }

  // Error handling
  handleError(error, context = "") {
    console.error(`❌ Error in ${context}:`, error)
    this.updateStatus(`❌ Error: ${error.message || "Unknown error"}`)
  }

  // Validation
  isValidModelFile(file) {
    const validExtensions = [".glb", ".gltf"]
    const fileName = file.name.toLowerCase()
    return validExtensions.some((ext) => fileName.endsWith(ext))
  }

  // URL helpers
  createObjectURL(file) {
    return URL.createObjectURL(file)
  }

  revokeObjectURL(url) {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url)
    }
  }
}
