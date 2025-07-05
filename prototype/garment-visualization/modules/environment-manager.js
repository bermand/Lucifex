// Environment and lighting management
export class EnvironmentManager {
  constructor(state) {
    this.state = state
    this.environments = {
      studio: {
        name: "Studio",
        hdri: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr",
        exposure: 1.0,
        shadowIntensity: 1.0,
        shadowSoftness: 0.5,
      },
      outdoor: {
        name: "Outdoor",
        hdri: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_06_1k.hdr",
        exposure: 1.2,
        shadowIntensity: 0.8,
        shadowSoftness: 0.3,
      },
      neutral: {
        name: "Neutral",
        hdri: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr",
        exposure: 0.8,
        shadowIntensity: 0.6,
        shadowSoftness: 0.7,
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
      console.warn(`Environment ${environmentName} not found`)
      return
    }

    this.state.setEnvironment(environmentName)

    // Apply to all active viewers
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(
      (viewer) => viewer,
    )

    viewers.forEach((viewer) => {
      this.applyEnvironmentToViewer(viewer, environment)
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Environment: ${environment.name}`)
    }
  }

  applyEnvironmentToViewer(viewer, environment = null) {
    if (!viewer) return

    const env = environment || this.environments[this.state.currentEnvironment]
    if (!env) return

    viewer.setAttribute("environment-image", env.hdri)
    viewer.setAttribute("skybox-image", env.hdri)
    viewer.setAttribute("exposure", env.exposure)
    viewer.setAttribute("shadow-intensity", env.shadowIntensity)
    viewer.setAttribute("shadow-softness", env.shadowSoftness)
  }

  setToneMapping(toneMapping) {
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(
      (viewer) => viewer,
    )

    viewers.forEach((viewer) => {
      viewer.setAttribute("tone-mapping", toneMapping)
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Tone mapping: ${toneMapping}`)
    }
  }

  updateLighting() {
    const exposure = document.getElementById("exposure")?.value || 1.0
    const shadowIntensity = document.getElementById("shadow-intensity")?.value || 1.0
    const shadowSoftness = document.getElementById("shadow-softness")?.value || 0.5

    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(
      (viewer) => viewer,
    )

    viewers.forEach((viewer) => {
      viewer.setAttribute("exposure", exposure)
      viewer.setAttribute("shadow-intensity", shadowIntensity)
      viewer.setAttribute("shadow-softness", shadowSoftness)
    })
  }

  toggleAutoRotate() {
    this.state.setAutoRotating(!this.state.isAutoRotating)

    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(
      (viewer) => viewer,
    )

    viewers.forEach((viewer) => {
      if (this.state.isAutoRotating) {
        viewer.setAttribute("auto-rotate", "")
      } else {
        viewer.removeAttribute("auto-rotate")
      }
    })

    // Update button state
    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.classList.toggle("active", this.state.isAutoRotating)
      button.textContent = this.state.isAutoRotating ? "⏸️ Stop Rotate" : "🔄 Auto Rotate"
    }

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Auto rotate: ${this.state.isAutoRotating ? "enabled" : "disabled"}`)
    }
  }

  resetCamera() {
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(
      (viewer) => viewer,
    )

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
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter(
      (viewer) => viewer,
    )

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
    // No specific cleanup needed for environment manager
  }
}
