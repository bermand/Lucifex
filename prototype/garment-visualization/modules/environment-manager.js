// Environment and lighting management
export class EnvironmentManager {
  constructor(state) {
    this.state = state
    this.environments = {
      studio: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr",
      outdoor: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_06_1k.hdr",
      neutral: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/neutral_1k.hdr",
    }
    console.log("🌍 EnvironmentManager initialized")
  }

  async initialize() {
    // Set default environment
    this.setEnvironment(this.state.currentEnvironment)
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("Environment: Studio")
    }
    console.log("✅ EnvironmentManager initialized")
  }

  setEnvironment(environmentName) {
    this.state.setEnvironment(environmentName)
    const utils = window.lucifexApp?.utils

    const environmentUrl = this.environments[environmentName]
    if (!environmentUrl) return

    // Update all viewers
    this.updateViewerEnvironment(this.state.mainViewer, environmentUrl)
    this.updateViewerEnvironment(this.state.avatarViewer, environmentUrl)
    this.updateViewerEnvironment(this.state.garmentViewer, environmentUrl)

    // Update combined viewers
    const combinedAvatar = document.getElementById("combined-avatar-viewer")
    const combinedGarment = document.getElementById("combined-garment-viewer")
    this.updateViewerEnvironment(combinedAvatar, environmentUrl)
    this.updateViewerEnvironment(combinedGarment, environmentUrl)

    // Update button states
    if (utils) {
      utils.setActiveButtonByData(".env-btn", "data-environment", environmentName)
    }

    console.log(`Environment set to: ${environmentName}`)
  }

  updateViewerEnvironment(viewer, environmentUrl) {
    if (viewer) {
      viewer.setAttribute("environment-image", environmentUrl)
      viewer.setAttribute("skybox-image", environmentUrl)
    }
  }

  setToneMapping(toneMapping) {
    const utils = window.lucifexApp?.utils

    // Update all viewers
    this.updateViewerToneMapping(this.state.mainViewer, toneMapping)
    this.updateViewerToneMapping(this.state.avatarViewer, toneMapping)
    this.updateViewerToneMapping(this.state.garmentViewer, toneMapping)

    // Update combined viewers
    const combinedAvatar = document.getElementById("combined-avatar-viewer")
    const combinedGarment = document.getElementById("combined-garment-viewer")
    this.updateViewerToneMapping(combinedAvatar, toneMapping)
    this.updateViewerToneMapping(combinedGarment, toneMapping)

    // Update button states
    if (utils) {
      utils.setActiveButtonByData(".preset-btn[data-tone-mapping]", "data-tone-mapping", toneMapping)
    }

    console.log(`Tone mapping set to: ${toneMapping}`)
  }

  updateViewerToneMapping(viewer, toneMapping) {
    if (viewer) {
      viewer.setAttribute("tone-mapping", toneMapping)
    }
  }

  updateEnvironmentSetting(setting, value) {
    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ]

    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute(setting, value)
      }
    })

    console.log(`${setting} set to: ${value}`)
  }

  toggleAutoRotate() {
    this.state.isAutoRotating = !this.state.isAutoRotating
    const utils = window.lucifexApp?.utils

    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ]

    viewers.forEach((viewer) => {
      if (viewer) {
        if (this.state.isAutoRotating) {
          viewer.setAttribute("auto-rotate", "")
        } else {
          viewer.removeAttribute("auto-rotate")
        }
      }
    })

    // Update button state
    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      if (this.state.isAutoRotating) {
        button.classList.add("active")
        button.textContent = "🔄 Auto Rotate"
      } else {
        button.classList.remove("active")
        button.textContent = "⏸️ Auto Rotate"
      }
    }

    if (utils) {
      utils.updateStatus(`Auto rotate: ${this.state.isAutoRotating ? "enabled" : "disabled"}`)
    }
  }

  resetCamera() {
    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ]

    viewers.forEach((viewer) => {
      if (viewer && viewer.resetTurntableRotation) {
        viewer.resetTurntableRotation()
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("📷 Camera reset")
    }
  }

  focusModel() {
    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ]

    viewers.forEach((viewer) => {
      if (viewer && viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("🎯 Model focused")
    }
  }

  cleanup() {
    console.log("🌍 EnvironmentManager cleaned up")
  }
}
