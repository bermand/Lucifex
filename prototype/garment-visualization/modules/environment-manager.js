// Environment and lighting management
export class EnvironmentManager {
  constructor(state) {
    this.state = state
    this.currentEnvironment = "studio"
    this.currentToneMapping = "neutral"
    console.log("🌍 EnvironmentManager initialized")
  }

  async initialize() {
    // Set default environment
    this.setEnvironment("studio")
    console.log("✅ EnvironmentManager initialized")
  }

  setEnvironment(environment) {
    this.currentEnvironment = environment
    this.state.setEnvironment(environment)

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.setActiveButtonByData(".env-btn", "data-environment", environment)
      utils.updateStatus(`Environment: ${environment}`)
    }

    // Apply environment to all viewers
    this.applyEnvironmentToViewers()

    console.log("Environment set to:", environment)
  }

  setToneMapping(toneMapping) {
    this.currentToneMapping = toneMapping

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.setActiveButtonByData(".preset-btn[data-tone-mapping]", "data-tone-mapping", toneMapping)
      utils.updateStatus(`Tone mapping: ${toneMapping}`)
    }

    // Apply tone mapping to all viewers
    this.applyToneMappingToViewers()

    console.log("Tone mapping set to:", toneMapping)
  }

  applyEnvironmentToViewers() {
    const viewers = this.getAllViewers()

    viewers.forEach((viewer) => {
      if (viewer) {
        switch (this.currentEnvironment) {
          case "studio":
            viewer.setAttribute("environment-image", "")
            viewer.setAttribute("skybox-image", "")
            break
          case "outdoor":
            viewer.setAttribute("environment-image", "")
            viewer.setAttribute("skybox-image", "")
            break
          case "neutral":
            viewer.removeAttribute("environment-image")
            viewer.removeAttribute("skybox-image")
            break
        }
      }
    })
  }

  applyToneMappingToViewers() {
    const viewers = this.getAllViewers()

    viewers.forEach((viewer) => {
      if (viewer) {
        switch (this.currentToneMapping) {
          case "neutral":
            viewer.removeAttribute("tone-mapping")
            break
          case "commerce":
            viewer.setAttribute("tone-mapping", "commerce")
            break
          case "aces":
            viewer.setAttribute("tone-mapping", "aces")
            break
        }
      }
    })
  }

  updateLighting() {
    const exposure = Number.parseFloat(document.getElementById("exposure")?.value || 1.0)
    const shadowIntensity = Number.parseFloat(document.getElementById("shadow-intensity")?.value || 1.0)
    const shadowSoftness = Number.parseFloat(document.getElementById("shadow-softness")?.value || 1.0)

    const viewers = this.getAllViewers()

    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("exposure", exposure.toString())
        viewer.setAttribute("shadow-intensity", shadowIntensity.toString())
        viewer.setAttribute("shadow-softness", shadowSoftness.toString())
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Lighting updated: exposure=${exposure}, shadows=${shadowIntensity}`)
    }
  }

  updateEnvironmentSetting(setting, value) {
    const viewers = this.getAllViewers()

    viewers.forEach((viewer) => {
      if (viewer) {
        switch (setting) {
          case "exposure":
            viewer.setAttribute("exposure", value.toString())
            break
          case "shadow-intensity":
            viewer.setAttribute("shadow-intensity", value.toString())
            break
          case "shadow-softness":
            viewer.setAttribute("shadow-softness", value.toString())
            break
        }
      }
    })
  }

  toggleAutoRotate() {
    this.state.setAutoRotating(!this.state.isAutoRotating)

    const viewers = this.getAllViewers()

    viewers.forEach((viewer) => {
      if (viewer) {
        if (this.state.isAutoRotating) {
          viewer.setAttribute("auto-rotate", "")
        } else {
          viewer.removeAttribute("auto-rotate")
        }
      }
    })

    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.textContent = this.state.isAutoRotating ? "⏸️ Stop Rotate" : "🔄 Auto Rotate"
      button.classList.toggle("active", this.state.isAutoRotating)
    }

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Auto rotate: ${this.state.isAutoRotating ? "enabled" : "disabled"}`)
    }
  }

  resetCamera() {
    const viewers = this.getAllViewers()

    viewers.forEach((viewer) => {
      if (viewer) {
        if (viewer.resetTurntableRotation) {
          viewer.resetTurntableRotation()
        }
        if (viewer.jumpCameraToGoal) {
          viewer.jumpCameraToGoal()
        }
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("📷 Camera reset")
    }
  }

  focusModel() {
    const viewers = this.getAllViewers()

    viewers.forEach((viewer) => {
      if (viewer && viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("🎯 Focused on model")
    }
  }

  getAllViewers() {
    const viewers = []

    if (this.state.mainViewer) viewers.push(this.state.mainViewer)
    if (this.state.avatarViewer) viewers.push(this.state.avatarViewer)
    if (this.state.garmentViewer) viewers.push(this.state.garmentViewer)

    // Also get viewers by ID as fallback
    const mainViewer = document.getElementById("main-viewer")
    const combinedAvatar = document.getElementById("combined-avatar-viewer")
    const combinedGarment = document.getElementById("combined-garment-viewer")

    if (mainViewer && !viewers.includes(mainViewer)) viewers.push(mainViewer)
    if (combinedAvatar && !viewers.includes(combinedAvatar)) viewers.push(combinedAvatar)
    if (combinedGarment && !viewers.includes(combinedGarment)) viewers.push(combinedGarment)

    return viewers.filter((viewer) => viewer !== null)
  }

  cleanup() {
    console.log("🌍 EnvironmentManager cleaned up")
  }
}
