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

  // File operations
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

  // UI helpers
  setActiveButton(selector, activeElement) {
    document.querySelectorAll(selector).forEach((btn) => btn.classList.remove("active"))
    if (activeElement) {
      activeElement.classList.add("active")
    }
  }

  setActiveButtonByData(selector, dataAttribute, value) {
    document.querySelectorAll(selector).forEach((btn) => btn.classList.remove("active"))
    const activeBtn = document.querySelector(`${selector}[${dataAttribute}="${value}"]`)
    if (activeBtn) {
      activeBtn.classList.add("active")
    }
  }

  // Value display updates
  updateValueDisplay(inputId, displayId, suffix = "") {
    const input = document.getElementById(inputId)
    const display = document.getElementById(displayId)
    if (input && display) {
      display.textContent = input.value + suffix
    }
  }

  // File info updates
  updateFileInfo(infoId, file, type) {
    const fileInfo = document.getElementById(infoId)
    if (fileInfo && file) {
      fileInfo.innerHTML = `
        <div class="file-status success">
          ✅ Loaded: ${file.name}<br>
          📊 Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      `
    }
  }

  // Error handling
  showError(message, element = null) {
    console.error("Error:", message)
    if (element) {
      element.innerHTML = `
        <div class="file-status error">
          ❌ Error: ${message}
        </div>
      `
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

  // Animation helpers
  fadeIn(element, duration = 300) {
    element.style.opacity = "0"
    element.style.display = "block"

    let start = null
    const animate = (timestamp) => {
      if (!start) start = timestamp
      const progress = timestamp - start
      const opacity = Math.min(progress / duration, 1)

      element.style.opacity = opacity

      if (progress < duration) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  fadeOut(element, duration = 300) {
    let start = null
    const animate = (timestamp) => {
      if (!start) start = timestamp
      const progress = timestamp - start
      const opacity = Math.max(1 - progress / duration, 0)

      element.style.opacity = opacity

      if (progress < duration) {
        requestAnimationFrame(animate)
      } else {
        element.style.display = "none"
      }
    }

    requestAnimationFrame(animate)
  }
}
