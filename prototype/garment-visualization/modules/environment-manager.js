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
    this.state.setEnvironment("studio")
    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("Environment: Studio")
    }
    console.log("✅ EnvironmentManager initialized")
  }

  setEnvironment(environment) {
    this.state.setEnvironment(environment)

    const envUrl = this.environments[environment] || this.environments.studio

    // Apply to all viewers
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("environment-image", envUrl)
        viewer.setAttribute("skybox-image", envUrl)
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Environment: ${environment}`)
    }
  }

  setToneMapping(mapping) {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("tone-mapping", mapping)
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Tone mapping: ${mapping}`)
    }
  }

  updateLighting() {
    const exposure = document.getElementById("exposure")?.value || 1
    const shadowIntensity = document.getElementById("shadow-intensity")?.value || 1
    const shadowSoftness = document.getElementById("shadow-softness")?.value || 0.5

    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer) {
        viewer.setAttribute("exposure", exposure)
        viewer.setAttribute("shadow-intensity", shadowIntensity)
        viewer.setAttribute("shadow-softness", shadowSoftness)
      }
    })
  }

  toggleAutoRotate() {
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
  }

  resetCamera() {
    const viewers = this.getAllViewers()
    viewers.forEach((viewer) => {
      if (viewer && viewer.resetTurntableRotation) {
        viewer.resetTurntableRotation()
      }
      if (viewer && viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus("📷 Camera reset")
    }
  }

  focusOnModel() {
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

  applyEnvironmentToViewer(viewer) {
    if (!viewer) return

    const envUrl = this.environments[this.state.currentEnvironment] || this.environments.studio
    viewer.setAttribute("environment-image", envUrl)
    viewer.setAttribute("skybox-image", envUrl)

    // Apply current lighting settings
    const exposure = document.getElementById("exposure")?.value || 1
    const shadowIntensity = document.getElementById("shadow-intensity")?.value || 1
    const shadowSoftness = document.getElementById("shadow-softness")?.value || 0.5

    viewer.setAttribute("exposure", exposure)
    viewer.setAttribute("shadow-intensity", shadowIntensity)
    viewer.setAttribute("shadow-softness", shadowSoftness)

    if (this.state.isAutoRotating) {
      viewer.setAttribute("auto-rotate", "")
    }
  }

  getAllViewers() {
    return [
      this.state.mainViewer,
      this.state.avatarViewer,
      this.state.garmentViewer,
      document.getElementById("main-viewer"),
      document.getElementById("combined-avatar-viewer"),
      document.getElementById("combined-garment-viewer"),
    ].filter((viewer) => viewer !== null)
  }

  cleanup() {
    // No specific cleanup needed
  }
}
