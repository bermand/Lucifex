// Application State Management
export class AppState {
  constructor() {
    // Model URLs
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null

    // Model viewers
    this.mainViewer = null
    this.avatarViewer = null
    this.garmentViewer = null

    // UI state
    this.currentTab = "avatar"
    this.currentModelType = "both"
    this.currentEnvironment = "studio"
    this.currentCombinationMethod = "overlay"
    this.isAutoRotating = false

    // Physics state
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false
    this.clothSimulation = null
    this.physicsVisualDebug = null
    this.physicsMeshUpdater = null
    this.physicsTest = null
    this.physicsDropTest = null

    console.log("📊 AppState initialized")
  }

  // Avatar methods
  setAvatarUrl(url) {
    this.currentAvatarUrl = url
    console.log("📊 Avatar URL updated:", url)
  }

  get hasAvatar() {
    return !!this.currentAvatarUrl
  }

  // Garment methods
  setGarmentUrl(url) {
    this.currentGarmentUrl = url
    console.log("📊 Garment URL updated:", url)
  }

  get hasGarment() {
    return !!this.currentGarmentUrl
  }

  // Current tab
  setCurrentTab(tab) {
    this.currentTab = tab
    console.log("📊 Current tab updated:", tab)
  }

  // Model type
  setModelType(type) {
    this.currentModelType = type
    console.log("📊 Model type updated:", type)
  }

  get isInCombinedMode() {
    return this.currentModelType === "both"
  }

  // Environment
  setEnvironment(environment) {
    this.currentEnvironment = environment
    console.log("📊 Environment updated:", environment)
  }

  // Combination
  setCombinationMethod(method) {
    this.currentCombinationMethod = method
    console.log("📊 Combination method updated:", method)
  }

  get canCombine() {
    return this.hasAvatar && this.hasGarment
  }

  // Viewers
  setMainViewer(viewer) {
    this.mainViewer = viewer
  }

  setAvatarViewer(viewer) {
    this.avatarViewer = viewer
  }

  setGarmentViewer(viewer) {
    this.garmentViewer = viewer
  }

  // Physics
  setPhysicsEnabled(enabled) {
    this.isPhysicsEnabled = enabled
  }

  setPhysicsDebugEnabled(enabled) {
    this.isPhysicsDebugEnabled = enabled
  }

  setClothSimulation(simulation) {
    this.clothSimulation = simulation
  }

  setPhysicsVisualDebug(debug) {
    this.physicsVisualDebug = debug
  }

  setPhysicsMeshUpdater(updater) {
    this.physicsMeshUpdater = updater
  }

  setPhysicsTest(test) {
    this.physicsTest = test
  }

  setPhysicsDropTest(dropTest) {
    this.physicsDropTest = dropTest
  }

  // Auto rotate
  setAutoRotating(rotating) {
    this.isAutoRotating = rotating
  }

  // Get current state summary
  getState() {
    return {
      hasAvatar: this.hasAvatar,
      hasGarment: this.hasGarment,
      canCombine: this.canCombine,
      currentTab: this.currentTab,
      currentModelType: this.currentModelType,
      currentEnvironment: this.currentEnvironment,
      isPhysicsEnabled: this.isPhysicsEnabled,
      isPhysicsDebugEnabled: this.isPhysicsDebugEnabled,
      isAutoRotating: this.isAutoRotating,
    }
  }

  // Reset state
  reset() {
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null
    this.mainViewer = null
    this.avatarViewer = null
    this.garmentViewer = null
    this.currentTab = "avatar"
    this.currentModelType = "both"
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false
    this.clothSimulation = null
    this.physicsVisualDebug = null
    this.physicsMeshUpdater = null
    this.physicsTest = null
    this.physicsDropTest = null

    console.log("📊 AppState reset")
  }
}
