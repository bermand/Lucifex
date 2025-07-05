// Utility functions and helpers
export class Utils {
  constructor(state) {
    this.state = state
    console.log("🔧 Utils initialized")
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

  // File validation
  isValidModelFile(file) {
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

  // Object URL management
  createObjectURL(file) {
    return URL.createObjectURL(file)
  }

  revokeObjectURL(url) {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url)
    }
  }

  // File info display
  updateFileInfo(elementId, file, type) {
    const element = document.getElementById(elementId)
    if (element) {
      element.innerHTML = `
        <strong>✅ Loaded:</strong> ${file.name}<br>
        <strong>📊 Size:</strong> ${this.formatFileSize(file.size)}<br>
        <strong>🏷️ Type:</strong> ${type}
      `
      element.className = "file-info success"
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

  // Model viewer helpers
  async waitForModelLoad(viewer) {
    return new Promise((resolve) => {
      if (viewer.loaded) {
        resolve()
      } else {
        viewer.addEventListener("load", resolve, { once: true })
      }
    })
  }

  // Physics effects
  showPhysicsEffect(message) {
    const effectElement = document.getElementById("physics-effect")
    if (effectElement) {
      effectElement.textContent = message
      effectElement.classList.add("show")

      setTimeout(() => {
        effectElement.classList.remove("show")
      }, 3000)
    }
  }

  // Combination status
  updateCombinationStatus(hasAvatar, hasGarment) {
    if (hasAvatar && hasGarment) {
      this.updateStatus("✅ Both models loaded - ready for combination")
    } else if (hasAvatar) {
      this.updateStatus("✅ Avatar loaded - need garment for combination")
    } else if (hasGarment) {
      this.updateStatus("✅ Garment loaded - need avatar for combination")
    } else {
      this.updateStatus("❌ Need both avatar and garment for combination")
    }
  }

  // Screenshot functionality
  takeScreenshot() {
    const viewer = this.getCurrentViewer()
    if (viewer) {
      try {
        const canvas = viewer.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = `lucifex-screenshot-${Date.now()}.png`
        link.href = canvas
        link.click()
        this.updateStatus("📸 Screenshot saved")
      } catch (error) {
        console.error("Screenshot failed:", error)
        this.updateStatus("❌ Screenshot failed")
      }
    } else {
      this.updateStatus("❌ No model loaded for screenshot")
    }
  }

  // Scene export
  exportScene() {
    const sceneData = {
      timestamp: new Date().toISOString(),
      avatarUrl: this.state.currentAvatarUrl,
      garmentUrl: this.state.currentGarmentUrl,
      modelType: this.state.currentModelType,
      environment: this.state.currentEnvironment,
      combinationMethod: this.state.currentCombinationMethod,
      physicsEnabled: this.state.isPhysicsEnabled,
    }

    const dataStr = JSON.stringify(sceneData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.download = `lucifex-scene-${Date.now()}.json`
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
    this.updateStatus("💾 Scene exported")
  }

  // Get current active viewer
  getCurrentViewer() {
    switch (this.state.currentTab) {
      case "avatar":
        return this.state.currentModelType === "both" ? this.state.avatarViewer : this.state.mainViewer
      case "garment":
        return this.state.currentModelType === "both" ? this.state.garmentViewer : this.state.mainViewer
      case "combined":
        return this.state.avatarViewer
      case "physics":
        return this.state.physicsAvatarViewer
      case "environment":
        return this.state.environmentViewer
      default:
        return this.state.mainViewer
    }
  }

  // Error handling
  handleError(error, context = "Unknown") {
    console.error(`❌ Error in ${context}:`, error)
    this.updateStatus(`❌ Error: ${error.message || "Unknown error"}`)
  }

  // Loading states
  setLoading(element, loading = true) {
    if (element) {
      if (loading) {
        element.classList.add("loading")
      } else {
        element.classList.remove("loading")
      }
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
  animateValue(start, end, duration, callback) {
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const value = start + (end - start) * progress

      callback(value)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
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
