// Application state management
export class AppState {
  constructor() {
    // Model URLs
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null

    // Model states
    this.hasAvatar = false
    this.hasGarment = false

    // UI states
    this.currentTab = "avatar"
    this.currentModelType = "both"
    this.currentEnvironment = "studio"
    this.currentCombinationMethod = "overlay"

    // Physics states
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false

    // Physics objects
    this.clothSimulation = null
    this.physicsTest = null
    this.physicsDropTest = null

    // Viewer references
    this.mainViewer = null
    this.combinedViewerContainer = null

    console.log("📊 AppState initialized")
  }

  // Avatar methods
  setAvatarUrl(url) {
    this.currentAvatarUrl = url
    this.hasAvatar = !!url
    console.log("📊 Avatar URL updated:", url)
  }

  getAvatarUrl() {
    return this.currentAvatarUrl
  }

  // Garment methods
  setGarmentUrl(url) {
    this.currentGarmentUrl = url
    this.hasGarment = !!url
    console.log("📊 Garment URL updated:", url)
  }

  getGarmentUrl() {
    return this.currentGarmentUrl
  }

  // Tab methods
  setCurrentTab(tab) {
    this.currentTab = tab
    console.log("📊 Current tab updated:", tab)
  }

  getCurrentTab() {
    return this.currentTab
  }

  // Model type methods
  setCurrentModelType(type) {
    this.currentModelType = type
    console.log("📊 Model type updated:", type)
  }

  getCurrentModelType() {
    return this.currentModelType
  }

  // Environment methods
  setCurrentEnvironment(environment) {
    this.currentEnvironment = environment
    console.log("📊 Environment updated:", environment)
  }

  getCurrentEnvironment() {
    return this.currentEnvironment
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
    console.log("📊 Cloth simulation set")
  }

  setPhysicsTest(test) {
    this.physicsTest = test
    console.log("📊 Physics test set")
  }

  setPhysicsDropTest(test) {
    this.physicsDropTest = test
    console.log("📊 Physics drop test set")
  }

  // Viewer methods
  setMainViewer(viewer) {
    this.mainViewer = viewer
    console.log("📊 Main viewer set")
  }

  setCombinedViewerContainer(container) {
    this.combinedViewerContainer = container
    console.log("📊 Combined viewer container set")
  }

  // Combination method
  setCombinationMethod(method) {
    this.currentCombinationMethod = method
    console.log("📊 Combination method updated:", method)
  }

  getCombinationMethod() {
    return this.currentCombinationMethod
  }

  // State getters
  getState() {
    return {
      currentAvatarUrl: this.currentAvatarUrl,
      currentGarmentUrl: this.currentGarmentUrl,
      hasAvatar: this.hasAvatar,
      hasGarment: this.hasGarment,
      currentTab: this.currentTab,
      currentModelType: this.currentModelType,
      currentEnvironment: this.currentEnvironment,
      currentCombinationMethod: this.currentCombinationMethod,
      isPhysicsEnabled: this.isPhysicsEnabled,
      isPhysicsDebugEnabled: this.isPhysicsDebugEnabled,
    }
  }

  // Reset state
  reset() {
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null
    this.hasAvatar = false
    this.hasGarment = false
    this.currentTab = "avatar"
    this.currentModelType = "both"
    this.currentEnvironment = "studio"
    this.currentCombinationMethod = "overlay"
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false
    this.clothSimulation = null
    this.physicsTest = null
    this.physicsDropTest = null
    this.mainViewer = null
    this.combinedViewerContainer = null

    console.log("📊 AppState reset")
  }

  // Validation methods
  canCreateCombinedView() {
    return this.hasAvatar && this.hasGarment
  }

  canEnablePhysics() {
    return this.hasGarment
  }

  // Debug methods
  logState() {
    console.log("📊 Current AppState:", this.getState())
  }
}
