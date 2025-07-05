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
    try {
      this.setEnvironment("studio")
      console.log("✅ EnvironmentManager initialized")
    } catch (error) {
      console.error("❌ Failed to initialize EnvironmentManager:", error)
    }
  }

  setEnvironment(environment) {
    const utils = window.lucifexApp?.utils

    this.state.setEnvironment(environment)

    // Update button states
    if (utils) {
      utils.setActiveButtonByData(".env-btn", "data-environment", environment)
    }

    // Apply to all viewers
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(Boolean)

    const environmentUrl = this.environments[environment] || this.environments.studio

    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("environment-image", environmentUrl)
        if (environment === "studio") {
          viewer.setAttribute("skybox-image", environmentUrl)
        } else {
          viewer.removeAttribute("skybox-image")
        }
      }
    })

    if (utils) {
      utils.updateStatus(`Environment set to: ${environment}`)
    }
  }

  setToneMapping(mapping) {
    const utils = window.lucifexApp?.utils

    // Update button states
    if (utils) {
      utils.setActiveButtonByData(".preset-btn[data-tone-mapping]", "data-tone-mapping", mapping)
    }

    // Apply to all viewers
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(Boolean)

    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("tone-mapping", mapping)
      }
    })

    if (utils) {
      utils.updateStatus(`Tone mapping set to: ${mapping}`)
    }
  }

  updateLighting() {
    const exposure = document.getElementById("exposure")?.value || 1
    const shadowIntensity = document.getElementById("shadow-intensity")?.value || 1
    const shadowSoftness = document.getElementById("shadow-softness")?.value || 0.5

    // Apply to all viewers
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(Boolean)

    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("exposure", exposure)
        viewer.setAttribute("shadow-intensity", shadowIntensity)
        viewer.setAttribute("shadow-softness", shadowSoftness)
      }
    })
  }

  toggleAutoRotate() {
    const utils = window.lucifexApp?.utils

    this.state.isAutoRotating = !this.state.isAutoRotating

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

    // Apply to all viewers
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(Boolean)

    viewers.forEach((viewer) => {
      if (viewer) {
        if (this.state.isAutoRotating) {
          viewer.setAttribute("auto-rotate", "")
        } else {
          viewer.removeAttribute("auto-rotate")
        }
      }
    })

    if (utils) {
      utils.updateStatus(`Auto rotate: ${this.state.isAutoRotating ? "enabled" : "disabled"}`)
    }
  }

  resetCamera() {
    const utils = window.lucifexApp?.utils

    // Reset camera for all viewers
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(Boolean)

    viewers.forEach((viewer) => {
      if (viewer && viewer.resetTurntableRotation) {
        viewer.resetTurntableRotation()
      }
      if (viewer && viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    if (utils) {
      utils.updateStatus("Camera reset")
    }
  }

  focusOnModel() {
    const utils = window.lucifexApp?.utils

    // Focus camera on model for all viewers
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(Boolean)

    viewers.forEach((viewer) => {
      if (viewer && viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    if (utils) {
      utils.updateStatus("Camera focused on model")
    }
  }

  // Apply environment settings to a specific viewer
  applyEnvironmentToViewer(viewer) {
    if (!viewer) return

    const environmentUrl = this.environments[this.state.currentEnvironment] || this.environments.studio

    viewer.setAttribute("environment-image", environmentUrl)
    if (this.state.currentEnvironment === "studio") {
      viewer.setAttribute("skybox-image", environmentUrl)
    }

    // Apply current lighting settings
    const exposure = document.getElementById("exposure")?.value || 1
    const shadowIntensity = document.getElementById("shadow-intensity")?.value || 1
    const shadowSoftness = document.getElementById("shadow-softness")?.value || 0.5

    viewer.setAttribute("exposure", exposure)
    viewer.setAttribute("shadow-intensity", shadowIntensity)
    viewer.setAttribute("shadow-softness", shadowSoftness)

    // Apply auto-rotate setting
    if (this.state.isAutoRotating) {
      viewer.setAttribute("auto-rotate", "")
      viewer.setAttribute("auto-rotate-delay", "3000")
      viewer.setAttribute("rotation-per-second", "30deg")
    }
  }
}
