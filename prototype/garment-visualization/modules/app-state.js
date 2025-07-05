// Application state management
export class AppState {
  constructor() {
    // Model URLs and status
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null
    this.hasAvatar = false
    this.hasGarment = false

    // UI state
    this.currentTab = "avatar"
    this.currentModelType = "avatar"
    this.currentCombinationMethod = "overlay"
    this.currentEnvironment = "studio"

    // Model viewers
    this.mainViewer = null
    this.avatarViewer = null
    this.garmentViewer = null
    this.combinedGarmentViewer = null
    this.physicsAvatarViewer = null
    this.physicsGarmentViewer = null
    this.environmentViewer = null

    // Physics state
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false
    this.clothSimulation = null
    this.physicsMeshUpdater = null
    this.physicsVisualDebug = null
    this.physicsTest = null
    this.physicsDropTest = null

    // Camera and environment
    this.isAutoRotating = true

    console.log("📊 AppState initialized")
  }

  // Avatar methods
  setAvatarUrl(url) {
    this.currentAvatarUrl = url
    this.hasAvatar = !!url
    console.log("📊 Avatar URL updated:", url)
  }

  // Garment methods
  setGarmentUrl(url) {
    this.currentGarmentUrl = url
    this.hasGarment = !!url
    console.log("📊 Garment URL updated:", url)
  }

  // UI state methods
  setCurrentTab(tab) {
    this.currentTab = tab
    console.log("📊 Current tab updated:", tab)
  }

  setModelType(type) {
    this.currentModelType = type
    console.log("📊 Model type updated:", type)
  }

  setCombinationMethod(method) {
    this.currentCombinationMethod = method
    console.log("📊 Combination method updated:", method)
  }

  setEnvironment(environment) {
    this.currentEnvironment = environment
    console.log("📊 Environment updated:", environment)
  }

  // Viewer methods
  setMainViewer(viewer) {
    this.mainViewer = viewer
  }

  setAvatarViewer(viewer) {
    this.avatarViewer = viewer
  }

  setGarmentViewer(viewer) {
    this.garmentViewer = viewer
  }

  setCombinedGarmentViewer(viewer) {
    this.combinedGarmentViewer = viewer
  }

  setPhysicsAvatarViewer(viewer) {
    this.physicsAvatarViewer = viewer
  }

  setPhysicsGarmentViewer(viewer) {
    this.physicsGarmentViewer = viewer
  }

  setEnvironmentViewer(viewer) {
    this.environmentViewer = viewer
  }

  // Physics methods
  setPhysicsEnabled(enabled) {
    this.isPhysicsEnabled = enabled
    console.log("📊 Physics enabled:", enabled)
  }

  setPhysicsDebugEnabled(enabled) {
    this.isPhysicsDebugEnabled = enabled
    console.log("📊 Physics debug enabled:", enabled)
  }

  setClothSimulation(simulation) {
    this.clothSimulation = simulation
  }

  setPhysicsMeshUpdater(updater) {
    this.physicsMeshUpdater = updater
  }

  setPhysicsVisualDebug(debug) {
    this.physicsVisualDebug = debug
  }

  setPhysicsTest(test) {
    this.physicsTest = test
  }

  setPhysicsDropTest(dropTest) {
    this.physicsDropTest = dropTest
  }

  // Camera methods
  setAutoRotating(rotating) {
    this.isAutoRotating = rotating
    console.log("📊 Auto rotating:", rotating)
  }

  // Computed properties
  get isInCombinedMode() {
    return this.currentModelType === "both"
  }

  get canEnablePhysics() {
    return this.hasAvatar && this.hasGarment && this.isInCombinedMode
  }

  // State validation
  validateState() {
    const issues = []

    if (!this.hasAvatar && !this.hasGarment) {
      issues.push("No models loaded")
    }

    if (this.isInCombinedMode && (!this.hasAvatar || !this.hasGarment)) {
      issues.push("Combined mode requires both avatar and garment")
    }

    if (this.isPhysicsEnabled && !this.canEnablePhysics) {
      issues.push("Physics requires both models in combined mode")
    }

    return issues
  }

  // Debug info
  getDebugInfo() {
    return {
      avatarUrl: this.currentAvatarUrl,
      garmentUrl: this.currentGarmentUrl,
      hasAvatar: this.hasAvatar,
      hasGarment: this.hasGarment,
      currentTab: this.currentTab,
      currentModelType: this.currentModelType,
      isInCombinedMode: this.isInCombinedMode,
      isPhysicsEnabled: this.isPhysicsEnabled,
      canEnablePhysics: this.canEnablePhysics,
      validationIssues: this.validateState(),
    }
  }
}
