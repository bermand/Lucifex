// Environment and lighting management
export class EnvironmentManager {
  constructor(state) {
    this.state = state
    this.environmentUrls = {
      studio: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr",
      apartment: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/apartment_1k.hdr",
      city: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/city_1k.hdr",
      dawn: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dawn_1k.hdr",
      forest: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/forest_1k.hdr",
      lobby: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/lobby_1k.hdr",
      night: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/night_1k.hdr",
      park: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/park_1k.hdr",
      sunset: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/sunset_1k.hdr",
      warehouse: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/warehouse_1k.hdr",
    }

    console.log("🌍 EnvironmentManager initialized")
  }

  async initialize() {
    try {
      console.log("✅ EnvironmentManager initialized")
    } catch (error) {
      console.error("❌ Failed to initialize EnvironmentManager:", error)
    }
  }

  setEnvironment(env) {
    const utils = window.lucifexApp?.utils

    this.state.setEnvironment(env)
    utils?.setButtonsActive(".env-btn", document.querySelector(`[data-environment="${env}"]`))

    const envUrl = this.environmentUrls[env] || this.environmentUrls.studio

    // Update only the avatar viewer (which provides the background)
    const viewers = [this.state.mainViewer, this.state.avatarViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      viewer.setAttribute("environment-image", envUrl)
      viewer.setAttribute("skybox-image", envUrl)
    })

    if (utils) {
      utils.updateStatus(`Environment: ${env}`)
    }
  }

  updateLighting() {
    const exposure = document.getElementById("exposure")?.value || 1
    const shadowIntensity = document.getElementById("shadow-intensity")?.value || 1
    const shadowSoftness = document.getElementById("shadow-softness")?.value || 0.5

    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      viewer.setAttribute("exposure", exposure)
      viewer.setAttribute("shadow-intensity", shadowIntensity)
      viewer.setAttribute("shadow-softness", shadowSoftness)
    })
  }

  setToneMapping(mapping) {
    const utils = window.lucifexApp?.utils

    utils?.setButtonsActive("[data-tone-mapping]", document.querySelector(`[data-tone-mapping="${mapping}"]`))

    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      viewer.setAttribute("tone-mapping", mapping)
    })

    if (utils) {
      utils.updateStatus(`Tone mapping: ${mapping}`)
    }
  }

  toggleAutoRotate() {
    const utils = window.lucifexApp?.utils

    this.state.isAutoRotating = !this.state.isAutoRotating

    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      if (this.state.isAutoRotating) {
        viewer.setAttribute("auto-rotate", "")
      } else {
        viewer.removeAttribute("auto-rotate")
      }
    })

    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.textContent = this.state.isAutoRotating ? "Stop Rotate" : "Auto Rotate"
      button.classList.toggle("active", this.state.isAutoRotating)
    }
  }

  resetCamera() {
    const utils = window.lucifexApp?.utils

    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      if (viewer.resetTurntableRotation) {
        viewer.resetTurntableRotation()
      }
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    if (utils) {
      utils.updateStatus("Camera reset")
    }
  }

  focusOnModel() {
    const utils = window.lucifexApp?.utils

    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    if (utils) {
      utils.updateStatus("Focused on model")
    }
  }
}
