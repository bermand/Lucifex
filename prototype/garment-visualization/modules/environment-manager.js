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
    // Set default environment
    await this.setEnvironment("studio")
    console.log("✅ EnvironmentManager initialized")
  }

  async setEnvironment(envType) {
    const environmentImage = this.environments[envType] || "neutral"
    this.state.setEnvironment(envType)

    // Update all model viewers
    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      viewer.setAttribute("environment-image", environmentImage)
    })

    this.utils.updateStatus(`Environment: ${envType.charAt(0).toUpperCase() + envType.slice(1)}`)
    console.log("Environment set to:", envType)
  }

  setExposure(value) {
    this.state.exposure = value

    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      viewer.setAttribute("exposure", value.toString())
    })

    console.log("Exposure set to:", value)
  }

  setShadowIntensity(value) {
    this.state.shadowIntensity = value

    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      viewer.setAttribute("shadow-intensity", value.toString())
    })

    console.log("Shadow intensity set to:", value)
  }

  setShadowSoftness(value) {
    this.state.shadowSoftness = value

    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      viewer.setAttribute("shadow-softness", value.toString())
    })

    console.log("Shadow softness set to:", value)
  }

  setToneMapping(type) {
    this.state.toneMapping = type

    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      viewer.setAttribute("tone-mapping", type)
    })

    console.log("Tone mapping set to:", type)
  }

  toggleAutoRotate() {
    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      const isRotating = viewer.hasAttribute("auto-rotate")
      if (isRotating) {
        viewer.removeAttribute("auto-rotate")
      } else {
        viewer.setAttribute("auto-rotate", "")
      }
    })

    console.log("Auto rotate toggled")
  }

  resetCamera() {
    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      if (viewer.resetTurntableRotation) {
        viewer.resetTurntableRotation()
      }
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    console.log("Camera reset")
  }

  focusModel() {
    const viewers = document.querySelectorAll("model-viewer")
    viewers.forEach((viewer) => {
      if (viewer.jumpCameraToGoal) {
        viewer.jumpCameraToGoal()
      }
    })

    console.log("Model focused")
  }

  cleanup() {
    console.log("🌍 EnvironmentManager cleaned up")
  }
}
