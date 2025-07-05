// Application state management
export class AppState {
  constructor() {
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null
    this.currentModelType = "both" // 'avatar', 'garment', 'both'
    this.currentTab = "avatar"
    this.currentEnvironment = "studio"
    this.currentCombinationMethod = "overlay"

    // Viewer references
    this.mainViewer = null
    this.avatarViewer = null
    this.garmentViewer = null

    // Physics state
    this.clothSimulation = null
    this.physicsVisualDebug = null
    this.physicsMeshUpdater = null
    this.physicsTest = null
    this.physicsDropTest = null
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false

    // UI state
    this.isAutoRotating = true

    console.log("📊 AppState initialized")
  }

  // Avatar methods
  setAvatarUrl(url) {
    this.currentAvatarUrl = url
    console.log("📊 Avatar URL updated:", url)
  }

  // Garment methods
  setGarmentUrl(url) {
    this.currentGarmentUrl = url
    console.log("📊 Garment URL updated:", url)
  }

  // Tab methods
  setCurrentTab(tab) {
    this.currentTab = tab
    console.log("📊 Current tab updated:", tab)
  }

  // Model type methods
  setModelType(type) {
    this.currentModelType = type
    console.log("📊 Model type updated:", type)
  }

  // Environment methods
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

  // Physics methods
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

  setPhysicsEnabled(enabled) {
    this.isPhysicsEnabled = enabled
  }

  setPhysicsDebugEnabled(enabled) {
    this.isPhysicsDebugEnabled = enabled
  }

  // Computed properties
  get hasAvatar() {
    return this.currentAvatarUrl !== null
  }

  get hasGarment() {
    return this.currentGarmentUrl !== null
  }

  get canCombine() {
    return this.hasAvatar && this.hasGarment
  }

  // Reset method
  reset() {
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null
    this.currentModelType = "both"
    this.currentTab = "avatar"
    this.currentEnvironment = "studio"
    this.mainViewer = null
    this.avatarViewer = null
    this.garmentViewer = null
    this.clothSimulation = null
    this.physicsVisualDebug = null
    this.physicsMeshUpdater = null
    this.physicsTest = null
    this.physicsDropTest = null
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false
    this.isAutoRotating = true
  }
}
