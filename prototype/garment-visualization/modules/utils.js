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

  updatePhysicsStatus(status) {
    const indicator = document.getElementById("physics-indicator")
    const statusText = indicator?.querySelector(".status-text")
    if (statusText) {
      statusText.textContent = `Physics: ${status}`
    }

    if (indicator) {
      const isEnabled = status.toLowerCase().includes("enabled") || status.toLowerCase().includes("running")
      indicator.className = `status-indicator ${isEnabled ? "success" : "error"}`
    }
  }

  updateModelStatus(status) {
    const indicator = document.getElementById("model-indicator")
    const statusText = indicator?.querySelector(".status-text")
    if (statusText) {
      statusText.textContent = `Models: ${status}`
    }

    if (indicator) {
      const isReady = status.toLowerCase().includes("ready") || status.toLowerCase().includes("loaded")
      indicator.className = `status-indicator ${isReady ? "success" : "warning"}`
    }
  }

  updateCombinationStatus(status) {
    const statusElement = document.getElementById("combination-status")
    if (statusElement) {
      statusElement.textContent = status
    }
  }

  // Physics effects
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

  // File handling
  async loadFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Model viewer helpers
  createModelViewer(id, options = {}) {
    const viewer = document.createElement("model-viewer")
    viewer.id = id
    viewer.setAttribute("alt", options.alt || "3D Model")
    viewer.setAttribute("camera-controls", "")
    viewer.setAttribute("auto-rotate", "")
    viewer.setAttribute("shadow-intensity", options.shadowIntensity || "1")
    viewer.setAttribute("exposure", options.exposure || "1")
    viewer.setAttribute("environment-image", options.environment || "neutral")

    if (options.src) {
      viewer.setAttribute("src", options.src)
    }

    return viewer
  }

  // Screenshot functionality
  async takeScreenshot(element) {
    try {
      if (element && element.toBlob) {
        return new Promise((resolve) => {
          element.toBlob(resolve, "image/png")
        })
      } else if (element && element.toDataURL) {
        const dataUrl = element.toDataURL("image/png")
        const blob = this.dataURLToBlob(dataUrl)
        return blob
      } else {
        throw new Error("Element does not support screenshot")
      }
    } catch (error) {
      console.error("Screenshot failed:", error)
      return null
    }
  }

  dataURLToBlob(dataURL) {
    const arr = dataURL.split(",")
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  // Download helpers
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Animation helpers
  animateValue(element, property, from, to, duration = 300) {
    const start = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - start
      const progress = Math.min(elapsed / duration, 1)

      const value = from + (to - from) * this.easeOutCubic(progress)
      element.style[property] = value

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
  }

  // Debounce helper
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

  // Throttle helper
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

  // Cleanup
  cleanup() {
    console.log("🧹 Utils cleaned up")
  }
}
