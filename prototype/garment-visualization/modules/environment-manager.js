// Environment and lighting management
export class EnvironmentManager {
  constructor(state) {
    this.state = state
    this.environments = {
      studio: {
        name: "Studio",
        skybox: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr",
        environment: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr",
      },
      outdoor: {
        name: "Outdoor",
        skybox: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_06_1k.hdr",
        environment: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_06_1k.hdr",
      },
      neutral: {
        name: "Neutral",
        skybox: null,
        environment: "neutral",
      },
    }

    console.log("🌍 EnvironmentManager initialized")
  }

  async initialize() {
    // Set default environment
    await this.setEnvironment("studio")
    console.log("✅ EnvironmentManager initialized")
  }

  async setEnvironment(environmentKey) {
    const utils = window.lucifexApp?.utils
    const environment = this.environments[environmentKey]

    if (!environment) {
      console.error("Unknown environment:", environmentKey)
      return false
    }

    try {
      this.state.setCurrentEnvironment(environmentKey)

      // Apply environment to all model viewers
      this.applyEnvironmentToViewers(environment)

      console.log("Environment set to:", environmentKey)

      if (utils) {
        utils.updateStatus(`Environment: ${environment.name}`)
        utils.setActiveButtonByData(".env-btn", "data-environment", environmentKey)
      }

      return true
    } catch (error) {
      console.error("Error setting environment:", error)
      if (utils) {
        utils.updateStatus("❌ Failed to set environment")
      }
      return false
    }
  }

  applyEnvironmentToViewers(environment) {
    const viewers = [
      document.getElementById("main-viewer"),
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
    ].filter(Boolean)

    viewers.forEach((viewer) => {
      if (environment.skybox) {
        viewer.setAttribute("skybox-image", environment.skybox)
      } else {
        viewer.removeAttribute("skybox-image")
      }

      if (environment.environment && environment.environment !== "neutral") {
        viewer.setAttribute("environment-image", environment.environment)
      } else {
        viewer.removeAttribute("environment-image")
      }
    })
  }

  setExposure(value) {
    const viewers = [
      document.getElementById("main-viewer"),
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
    ].filter(Boolean)

    viewers.forEach((viewer) => {
      viewer.setAttribute("exposure", value)
    })
  }

  setShadowIntensity(value) {
    const viewers = [
      document.getElementById("main-viewer"),
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
    ].filter(Boolean)

    viewers.forEach((viewer) => {
      viewer.setAttribute("shadow-intensity", value)
    })
  }

  setShadowSoftness(value) {
    const viewers = [
      document.getElementById("main-viewer"),
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
    ].filter(Boolean)

    viewers.forEach((viewer) => {
      viewer.setAttribute("shadow-softness", value)
    })
  }

  setToneMapping(value) {
    const viewers = [
      document.getElementById("main-viewer"),
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
    ].filter(Boolean)

    viewers.forEach((viewer) => {
      viewer.setAttribute("tone-mapping", value)
    })
  }

  toggleAutoRotate() {
    const viewers = [
      document.getElementById("main-viewer"),
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
    ].filter(Boolean)

    const isAutoRotating = viewers[0]?.hasAttribute("auto-rotate")

    viewers.forEach((viewer) => {
      if (isAutoRotating) {
        viewer.removeAttribute("auto-rotate")
      } else {
        viewer.setAttribute("auto-rotate", "")
      }
    })

    const button = document.getElementById("auto-rotate-toggle")
    if (button) {
      button.classList.toggle("active", !isAutoRotating)
      button.innerHTML = `<span class="btn-icon">🔄</span> ${!isAutoRotating ? "Stop Rotate" : "Auto Rotate"}`
    }

    return !isAutoRotating
  }

  resetCamera() {
    const viewers = [
      document.getElementById("main-viewer"),
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
    ].filter(Boolean)

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
      utils.updateStatus("📷 Camera reset")
    }
  }

  focusModel() {
    const viewers = [
      document.getElementById("main-viewer"),
      document.getElementById("avatar-viewer"),
      document.getElementById("garment-viewer"),
    ].filter(Boolean)

    viewers.forEach((viewer) => {
      if (viewer.jumpCameraToGoal) {
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
