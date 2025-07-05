// Environment and lighting management
export class EnvironmentManager {
  constructor(state, utils) {
    this.state = state
    this.utils = utils
    this.currentEnvironment = "studio"
    this.currentToneMapping = "aces"
    this.isAutoRotating = false
    console.log("🌍 EnvironmentManager initialized")
  }

  async initialize() {
    // Set default environment
    this.setEnvironment("studio")
    console.log("✅ EnvironmentManager initialized")
  }

  // Set environment
  setEnvironment(environment) {
    this.currentEnvironment = environment
    this.state.setCurrentEnvironment(environment)

    // Apply environment to all viewers
    this.applyEnvironmentToViewers(environment)

    // Update UI
    this.utils.setActiveButtonByData(".env-btn", "data-environment", environment)
    this.utils.updateStatus(`Environment: ${this.capitalizeFirst(environment)}`)

    console.log("Environment set to:", environment)
  }

  // Apply environment to viewers
  applyEnvironmentToViewers(environment) {
    const viewers = this.getAllViewers()

    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("environment-image", environment)

        // Set environment-specific settings
        switch (environment) {
          case "studio":
            viewer.setAttribute("exposure", "1.0")
            viewer.setAttribute("shadow-intensity", "1.0")
            break
          case "sunset":
            viewer.setAttribute("exposure", "1.2")
            viewer.setAttribute("shadow-intensity", "0.8")
            break
          case "forest":
            viewer.setAttribute("exposure", "0.8")
            viewer.setAttribute("shadow-intensity", "1.2")
            break
          case "city":
            viewer.setAttribute("exposure", "1.1")
            viewer.setAttribute("shadow-intensity", "0.9")
            break
        }
      }
    })
  }

  // Set tone mapping
  setToneMapping(toneMapping) {
    this.currentToneMapping = toneMapping

    // Apply tone mapping to all viewers
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("tone-mapping", toneMapping)
      }
    })

    // Update UI
    this.utils.setActiveButtonByData("[data-tone-mapping]", "data-tone-mapping", toneMapping)
    this.utils.updateStatus(`Tone mapping: ${this.capitalizeFirst(toneMapping)}`)
  }

  // Set exposure
  setExposure(exposure) {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("exposure", exposure.toString())
      }
    })

    this.utils.updateStatus(`Exposure: ${exposure}`)
  }

  // Set shadow intensity
  setShadowIntensity(intensity) {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("shadow-intensity", intensity.toString())
      }
    })

    this.utils.updateStatus(`Shadow intensity: ${intensity}`)
  }

  // Set shadow softness
  setShadowSoftness(softness) {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("shadow-softness", softness.toString())
      }
    })

    this.utils.updateStatus(`Shadow softness: ${softness}`)
  }

  // Toggle auto rotate
  toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating

    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        if (this.isAutoRotating) {
          viewer.setAttribute("auto-rotate", "")
        } else {
          viewer.removeAttribute("auto-rotate")
        }
      }
    })

    // Update button
    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.innerHTML = `<span class="btn-icon">${this.isAutoRotating ? "⏸️" : "🔄"}</span> ${this.isAutoRotating ? "Stop Rotate" : "Auto Rotate"}`
      button.classList.toggle("active", this.isAutoRotating)
    }

    this.utils.updateStatus(`Auto rotate: ${this.isAutoRotating ? "enabled" : "disabled"}`)
  }

  // Reset camera
  resetCamera() {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer && viewer.resetCamera) {
        viewer.resetCamera()
      }
    })

    this.utils.updateStatus("📷 Camera reset")
    this.utils.showPhysicsEffect("📷 Camera Reset")
  }

  // Focus on model
  focusModel() {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer && viewer.focusModel) {
        viewer.focusModel()
      }
    })

    this.utils.updateStatus("🎯 Model focused")
    this.utils.showPhysicsEffect("🎯 Model Focused")
  }

  // Get all active viewers
  getAllViewers() {
    const viewers = []

    // Main viewer
    const mainViewer = document.getElementById("main-viewer")
    if (mainViewer && mainViewer.style.display !== "none") {
      viewers.push(mainViewer)
    }

    // Combined viewers
    const combinedContainer = document.getElementById("combined-viewer-container")
    if (combinedContainer && combinedContainer.style.display !== "none") {
      const avatarViewer = combinedContainer.querySelector("model-viewer:first-child")
      const garmentViewer = combinedContainer.querySelector("model-viewer:last-child")

      if (avatarViewer) viewers.push(avatarViewer)
      if (garmentViewer) viewers.push(garmentViewer)
    }

    return viewers
  }

  // Update environment setting
  updateEnvironmentSetting(setting, value) {
    switch (setting) {
      case "exposure":
        this.setExposure(value)
        break
      case "shadow-intensity":
        this.setShadowIntensity(value)
        break
      case "shadow-softness":
        this.setShadowSoftness(value)
        break
      default:
        this.utils.updateStatus(`Unknown environment setting: ${setting}`)
    }
  }

  // Capitalize first letter
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Get current environment settings
  getCurrentSettings() {
    return {
      environment: this.currentEnvironment,
      toneMapping: this.currentToneMapping,
      isAutoRotating: this.isAutoRotating,
    }
  }

  // Apply settings to new viewer
  applySettingsToViewer(viewer) {
    if (!viewer) return

    // Apply current environment
    viewer.setAttribute("environment-image", this.currentEnvironment)
    viewer.setAttribute("tone-mapping", this.currentToneMapping)

    // Apply auto rotate
    if (this.isAutoRotating) {
      viewer.setAttribute("auto-rotate", "")
    }

    // Apply current control values
    const exposure = document.getElementById("exposure")?.value || "1.0"
    const shadowIntensity = document.getElementById("shadow-intensity")?.value || "1.0"
    const shadowSoftness = document.getElementById("shadow-softness")?.value || "0.5"

    viewer.setAttribute("exposure", exposure)
    viewer.setAttribute("shadow-intensity", shadowIntensity)
    viewer.setAttribute("shadow-softness", shadowSoftness)
  }

  // Cleanup
  cleanup() {
    // Clean up any resources
    console.log("🌍 EnvironmentManager cleaned up")
  }
}
