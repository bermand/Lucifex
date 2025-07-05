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
      // Set default environment
      this.state.setEnvironment("studio")
      console.log("✅ EnvironmentManager initialized")
    } catch (error) {
      console.error("❌ Failed to initialize EnvironmentManager:", error)
    }
  }

  setEnvironment(environment) {
    this.state.setEnvironment(environment)

    const envUrl = this.environments[environment] || this.environments.studio

    // Apply to all viewers
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      this.applyEnvironmentToViewer(viewer, envUrl)
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Environment: ${environment}`)
    }
  }

  applyEnvironmentToViewer(viewer, envUrl = null) {
    if (!viewer) return

    const url = envUrl || this.environments[this.state.currentEnvironment] || this.environments.studio

    viewer.setAttribute("environment-image", url)

    // Only apply skybox to avatar viewer (background provider)
    if (viewer === this.state.avatarViewer || viewer === this.state.mainViewer) {
      viewer.setAttribute("skybox-image", url)
    }
  }

  updateLighting() {
    const exposure = document.getElementById("exposure")?.value || "1"
    const shadowIntensity = document.getElementById("shadow-intensity")?.value || "1"
    const shadowSoftness = document.getElementById("shadow-softness")?.value || "0.5"

    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      viewer.setAttribute("exposure", exposure)
      viewer.setAttribute("shadow-intensity", shadowIntensity)
      viewer.setAttribute("shadow-softness", shadowSoftness)
    })
  }

  setToneMapping(mapping) {
    const viewers = [this.state.mainViewer, this.state.avatarViewer, this.state.garmentViewer].filter((v) => v)
    viewers.forEach((viewer) => {
      viewer.setAttribute("tone-mapping", mapping)
    })

    const utils = window.lucifexApp?.utils
    if (utils) {
      utils.updateStatus(`Tone mapping: ${mapping}`)
    }
  }
}
