// Centralized application state management
export class AppState {
  constructor() {
    // Model URLs
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null

    // Model viewers
    this.mainViewer = null
    this.avatarViewer = null
    this.garmentViewer = null

    // Current state
    this.currentModelType = "avatar" // 'avatar', 'garment', 'both'
    this.currentTab = "avatar"
    this.currentEnvironment = "studio"
    this.currentCombinationMethod = "overlay"

    // Physics state
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false
    this.clothSimulation = null
    this.physicsVisualDebug = null
    this.physicsTest = null
    this.physicsDropTest = null
    this.physicsMeshUpdater = null

    // UI state
    this.isAutoRotating = true

    console.log("📊 AppState initialized")
  }

  // Getters for computed properties
  get hasAvatar() {
    return !!this.currentAvatarUrl
  }

  get hasGarment() {
    return !!this.currentGarmentUrl
  }

  get canCombine() {
    return this.hasAvatar && this.hasGarment
  }

  get isInCombinedMode() {
    return this.currentModelType === "both" && this.canCombine
  }

  // Setters with logging
  setAvatarUrl(url) {
    this.currentAvatarUrl = url
    console.log("📊 Avatar URL updated:", url)
  }

  setGarmentUrl(url) {
    this.currentGarmentUrl = url
    console.log("📊 Garment URL updated:", url)
  }

  setCurrentTab(tab) {
    this.currentTab = tab
    console.log("📊 Current tab updated:", tab)
  }

  setModelType(type) {
    this.currentModelType = type
    console.log("📊 Model type updated:", type)
  }

  setEnvironment(environment) {
    this.currentEnvironment = environment
    console.log("📊 Environment updated:", environment)
  }

  setCombinationMethod(method) {
    this.currentCombinationMethod = method
    console.log("📊 Combination method updated:", method)
  }

  // Viewer setters
  setMainViewer(viewer) {
    this.mainViewer = viewer
  }

  setAvatarViewer(viewer) {
    this.avatarViewer = viewer
  }

  setGarmentViewer(viewer) {
    this.garmentViewer = viewer
  }

  // Physics setters
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

  setPhysicsTest(test) {
    this.physicsTest = test
  }

  setPhysicsDropTest(dropTest) {
    this.physicsDropTest = dropTest
  }

  setPhysicsMeshUpdater(updater) {
    this.physicsMeshUpdater = updater
  }

  // UI setters
  setAutoRotating(rotating) {
    this.isAutoRotating = rotating
  }

  // Reset methods
  reset() {
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null
    this.avatarViewer = null
    this.garmentViewer = null
    this.currentModelType = "avatar"
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false
    this.clothSimulation = null
    this.physicsVisualDebug = null
    this.physicsTest = null
    this.physicsDropTest = null
    this.physicsMeshUpdater = null
  }

  // Debug method
  getState() {
    return {
      hasAvatar: this.hasAvatar,
      hasGarment: this.hasGarment,
      canCombine: this.canCombine,
      isInCombinedMode: this.isInCombinedMode,
      currentModelType: this.currentModelType,
      currentTab: this.currentTab,
      currentEnvironment: this.currentEnvironment,
      isPhysicsEnabled: this.isPhysicsEnabled,
      isPhysicsDebugEnabled: this.isPhysicsDebugEnabled,
    }
  }
}
