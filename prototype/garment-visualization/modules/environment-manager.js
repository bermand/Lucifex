// Environment and lighting management
export class EnvironmentManager {
  constructor(state) {
    this.state = state
    this.environments = {
      studio: {
        name: "Studio",
        skybox: null,
        exposure: 1.0,
        shadowIntensity: 1.0,
      },
      outdoor: {
        name: "Outdoor",
        skybox: null,
        exposure: 1.2,
        shadowIntensity: 0.8,
      },
      neutral: {
        name: "Neutral",
        skybox: null,
        exposure: 0.8,
        shadowIntensity: 0.6,
      },
    }
    console.log("🌍 EnvironmentManager initialized")
  }

  async initialize() {
    // Set default environment
    this.setEnvironment("studio")
    console.log("✅ EnvironmentManager initialized")
  }

  setEnvironment(environmentName) {
    const environment = this.environments[environmentName]
    if (!environment) {
      console.warn("Unknown environment:", environmentName)
      return
    }

    this.state.setEnvironment(environmentName)

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Environment: ${environment.name}`)
    }

    // Update all viewers
    this.updateAllViewers(environment)

    // Update button states
    if (utils) {
      utils.setActiveButtonByData(".env-btn", "data-environment", environmentName)
    }
  }

  updateAllViewers(environment) {
    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ].filter((viewer) => viewer)

    viewers.forEach((viewer) => {
      if (viewer.setAttribute) {
        viewer.setAttribute("exposure", environment.exposure)
        viewer.setAttribute("shadow-intensity", environment.shadowIntensity)

        if (environment.skybox) {
          viewer.setAttribute("skybox-image", environment.skybox)
        }
      }
    })
  }

  setToneMapping(mapping) {
    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ].filter((viewer) => viewer)

    viewers.forEach((viewer) => {
      if (viewer.setAttribute) {
        viewer.setAttribute("tone-mapping", mapping)
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Tone mapping: ${mapping}`)
      utils.setActiveButtonByData(".preset-btn[data-tone-mapping]", "data-tone-mapping", mapping)
    }
  }

  updateLighting() {
    const exposure = Number.parseFloat(document.getElementById("exposure")?.value || 1.0)
    const shadowIntensity = Number.parseFloat(document.getElementById("shadow-intensity")?.value || 1.0)
    const shadowSoftness = Number.parseFloat(document.getElementById("shadow-softness")?.value || 1.0)

    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ].filter((viewer) => viewer)

    viewers.forEach((viewer) => {
      if (viewer.setAttribute) {
        viewer.setAttribute("exposure", exposure)
        viewer.setAttribute("shadow-intensity", shadowIntensity)
        viewer.setAttribute("shadow-softness", shadowSoftness)
      }
    })
  }

  toggleAutoRotate() {
    this.state.setAutoRotating(!this.state.isAutoRotating)

    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ].filter((viewer) => viewer)

    viewers.forEach((viewer) => {
      if (this.state.isAutoRotating) {
        viewer.setAttribute("auto-rotate", "")
      } else {
        viewer.removeAttribute("auto-rotate")
      }
    })

    // Update button
    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.classList.toggle("active", this.state.isAutoRotating)
      button.textContent = this.state.isAutoRotating ? "⏸️ Stop Rotate" : "🔄 Auto Rotate"
    }

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Auto rotate ${this.state.isAutoRotating ? "enabled" : "disabled"}`)
    }
  }

  resetCamera() {
    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ].filter((viewer) => viewer)

    viewers.forEach((viewer) => {
      if (viewer.resetTurntableRotation) {
        viewer.resetTurntableRotation()
      }
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("Camera reset")
    }
  }

  focusOnModel() {
    const viewers = [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ].filter((viewer) => viewer)

    viewers.forEach((viewer) => {
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("Focused on model")
    }
  }

  cleanup() {
    // Clean up any environment-specific resources
  }
}
