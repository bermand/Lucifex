// Environment and lighting management
export class EnvironmentManager {
  constructor(state, utils) {
    this.state = state
    this.utils = utils
    this.environments = {
      studio: "neutral",
      sunset: "sunset",
      forest: "forest",
      city: "city",
    }
    console.log("🌍 EnvironmentManager initialized")
  }

  async initialize() {
    console.log("✅ EnvironmentManager initialized")
    this.setEnvironment("studio")
  }

  setEnvironment(environmentName) {
    this.state.setCurrentEnvironment(environmentName)

    const environmentImage = this.environments[environmentName] || "neutral"

    // Update main viewer
    const mainViewer = document.getElementById("main-viewer")
    if (mainViewer) {
      mainViewer.setAttribute("environment-image", environmentImage)
    }

    // Update combined viewers
    const avatarViewer = this.state.avatarViewer
    const garmentViewer = this.state.garmentViewer

    if (avatarViewer) {
      avatarViewer.setAttribute("environment-image", environmentImage)
    }

    if (garmentViewer) {
      garmentViewer.setAttribute("environment-image", environmentImage)
    }

    this.utils.updateStatus(`Environment: ${environmentName.charAt(0).toUpperCase() + environmentName.slice(1)}`)
    console.log("Environment set to:", environmentName)
  }

  updateExposure(value) {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("exposure", value)
      }
    })
    console.log("Exposure set to:", value)
  }

  updateShadowIntensity(value) {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("shadow-intensity", value)
      }
    })
    console.log("Shadow intensity set to:", value)
  }

  updateShadowSoftness(value) {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("shadow-softness", value)
      }
    })
    console.log("Shadow softness set to:", value)
  }

  setToneMapping(type) {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("tone-mapping", type)
      }
    })
    console.log("Tone mapping set to:", type)
  }

  toggleAutoRotate() {
    const viewers = this.getAllViewers()
    let isEnabled = false

    viewers.forEach((viewer) => {
      if (viewer) {
        const hasAutoRotate = viewer.hasAttribute("auto-rotate")
        if (hasAutoRotate) {
          viewer.removeAttribute("auto-rotate")
        } else {
          viewer.setAttribute("auto-rotate", "")
          isEnabled = true
        }
      }
    })

    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.classList.toggle("active", isEnabled)
      button.innerHTML = `<span class="btn-icon">🔄</span> ${isEnabled ? "Stop Rotation" : "Auto Rotate"}`
    }

    console.log("Auto rotate:", isEnabled ? "enabled" : "disabled")
  }

  resetCamera() {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer && viewer.resetTurntableRotation) {
        viewer.resetTurntableRotation()
      }
    })
    console.log("Camera reset")
  }

  focusModel() {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer && viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })
    console.log("Model focused")
  }

  getAllViewers() {
    const viewers = []

    const mainViewer = document.getElementById("main-viewer")
    if (mainViewer && mainViewer.style.display !== "none") {
      viewers.push(mainViewer)
    }

    if (this.state.avatarViewer) {
      viewers.push(this.state.avatarViewer)
    }

    if (this.state.garmentViewer) {
      viewers.push(this.state.garmentViewer)
    }

    return viewers
  }

  cleanup() {
    console.log("🧹 EnvironmentManager cleaned up")
  }
}
