// Environment and lighting management
export class EnvironmentManager {
  constructor(state, utils) {
    this.state = state
    this.utils = utils
    this.currentExposure = 1.0
    this.currentShadowIntensity = 1.0
    this.currentShadowSoftness = 1.0
    this.currentToneMapping = "neutral"
    this.isAutoRotating = true
    console.log("🌍 EnvironmentManager initialized")
  }

  initialize() {
    // Set default environment
    this.setEnvironment("studio")
    console.log("✅ EnvironmentManager initialized")
  }

  setEnvironment(environment) {
    this.state.setCurrentEnvironment(environment)

    // Apply environment to all model viewers
    this.applyEnvironmentToViewers(environment)

    this.utils.updateStatus(`Environment: ${this.capitalizeFirst(environment)}`)
    console.log("Environment set to:", environment)
  }

  applyEnvironmentToViewers(environment) {
    const viewers = document.querySelectorAll("model-viewer")

    viewers.forEach((viewer) => {
      switch (environment) {
        case "studio":
          viewer.setAttribute("environment-image", "neutral")
          viewer.setAttribute("skybox-image", "")
          break
        case "outdoor":
          viewer.setAttribute("environment-image", "park")
          viewer.setAttribute("skybox-image", "")
          break
        case "neutral":
          viewer.setAttribute("environment-image", "neutral")
          viewer.setAttribute("skybox-image", "")
          break
        default:
          viewer.setAttribute("environment-image", "neutral")
      }
    })
  }

  setToneMapping(toneMapping) {
    this.currentToneMapping = toneMapping

    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      viewer.setAttribute("tone-mapping", toneMapping)
    })

    this.utils.updateStatus(`Tone mapping: ${this.capitalizeFirst(toneMapping)}`)
    console.log("Tone mapping set to:", toneMapping)
  }

  setExposure(exposure) {
    this.currentExposure = exposure

    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      viewer.setAttribute("exposure", exposure.toString())
    })

    this.utils.updateStatus(`Exposure: ${exposure}`)
    console.log("Exposure set to:", exposure)
  }

  setShadowIntensity(intensity) {
    this.currentShadowIntensity = intensity

    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      viewer.setAttribute("shadow-intensity", intensity.toString())
    })

    this.utils.updateStatus(`Shadow intensity: ${intensity}`)
    console.log("Shadow intensity set to:", intensity)
  }

  setShadowSoftness(softness) {
    this.currentShadowSoftness = softness

    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      viewer.setAttribute("shadow-softness", softness.toString())
    })

    this.utils.updateStatus(`Shadow softness: ${softness}`)
    console.log("Shadow softness set to:", softness)
  }

  toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating
    this.state.setAutoRotating(this.isAutoRotating)

    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      if (this.isAutoRotating) {
        viewer.setAttribute("auto-rotate", "")
      } else {
        viewer.removeAttribute("auto-rotate")
      }
    })

    // Update button text
    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.innerHTML = `<span class="btn-icon">🔄</span> ${this.isAutoRotating ? "Stop Rotate" : "Auto Rotate"}`
    }

    this.utils.updateStatus(`Auto rotate: ${this.isAutoRotating ? "enabled" : "disabled"}`)
    console.log("Auto rotate:", this.isAutoRotating ? "enabled" : "disabled")
  }

  resetCamera() {
    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      if (viewer.resetTurntableRotation) {
        viewer.resetTurntableRotation()
      }
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    this.utils.updateStatus("📷 Camera reset to default position")
    console.log("Camera reset")
  }

  focusModel() {
    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    this.utils.updateStatus("🎯 Camera focused on model")
    console.log("Camera focused on model")
  }

  // Apply current settings to a new viewer
  applyCurrentSettingsToViewer(viewer) {
    viewer.setAttribute("environment-image", this.getEnvironmentImage())
    viewer.setAttribute("tone-mapping", this.currentToneMapping)
    viewer.setAttribute("exposure", this.currentExposure.toString())
    viewer.setAttribute("shadow-intensity", this.currentShadowIntensity.toString())
    viewer.setAttribute("shadow-softness", this.currentShadowSoftness.toString())

    if (this.isAutoRotating) {
      viewer.setAttribute("auto-rotate", "")
    }
  }

  getEnvironmentImage() {
    switch (this.state.getCurrentEnvironment()) {
      case "studio":
        return "neutral"
      case "outdoor":
        return "park"
      case "neutral":
        return "neutral"
      default:
        return "neutral"
    }
  }

  // Utility function to capitalize first letter
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Get current environment settings
  getCurrentSettings() {
    return {
      environment: this.state.getCurrentEnvironment(),
      toneMapping: this.currentToneMapping,
      exposure: this.currentExposure,
      shadowIntensity: this.currentShadowIntensity,
      shadowSoftness: this.currentShadowSoftness,
      autoRotate: this.isAutoRotating,
    }
  }

  // Apply settings from saved state
  applySettings(settings) {
    if (settings.environment) {
      this.setEnvironment(settings.environment)
    }
    if (settings.toneMapping) {
      this.setToneMapping(settings.toneMapping)
    }
    if (settings.exposure !== undefined) {
      this.setExposure(settings.exposure)
    }
    if (settings.shadowIntensity !== undefined) {
      this.setShadowIntensity(settings.shadowIntensity)
    }
    if (settings.shadowSoftness !== undefined) {
      this.setShadowSoftness(settings.shadowSoftness)
    }
    if (settings.autoRotate !== undefined) {
      this.isAutoRotating = settings.autoRotate
      this.state.setAutoRotating(this.isAutoRotating)
    }
  }

  cleanup() {
    // Clean up any resources
    console.log("🌍 EnvironmentManager cleaned up")
  }
}
