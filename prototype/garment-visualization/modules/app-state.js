// Application state management
export class AppState {
  constructor() {
    // Model URLs
    this.currentAvatarUrl = null
    this.currentGarmentUrl = null

    // UI state
    this.currentTab = "avatar"
    this.currentModelType = "avatar"
    this.currentCombinationMethod = "overlay"
    this.currentEnvironment = "studio"
    this.isAutoRotating = true

    // Physics state
    this.isPhysicsEnabled = false
    this.isPhysicsDebugEnabled = false

    // Model viewers
    this.avatarViewer = null
    this.garmentViewer = null
    this.mainViewer = null

    // Physics instances
    this.clothSimulation = null
    this.physicsVisualDebug = null
    this.physicsTest = null
    this.physicsDropTest = null
    this.physicsMeshUpdater = null

    console.log("📊 AppState initialized")
  }

  // Getters for computed state
  get hasAvatar() {
    return this.currentAvatarUrl !== null
  }

  get hasGarment() {
    return this.currentGarmentUrl !== null
  }

  get canCombine() {
    return this.hasAvatar && this.hasGarment
  }

  get isInCombinedMode() {
    return this.currentModelType === "both"
  }

  // State update methods
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

  setPhysicsEnabled(enabled) {
    this.isPhysicsEnabled = enabled
    console.log("📊 Physics enabled:", enabled)
  }

  setPhysicsDebugEnabled(enabled) {
    this.isPhysicsDebugEnabled = enabled
    console.log("📊 Physics debug enabled:", enabled)
  }

  // Viewer management
  setMainViewer(viewer) {
    this.mainViewer = viewer
  }

  setAvatarViewer(viewer) {
    this.avatarViewer = viewer
  }

  setGarmentViewer(viewer) {
    this.garmentViewer = viewer
  }

  // Physics instance management
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

  // Cleanup
  cleanup() {
    // Clean up physics instances
    if (this.clothSimulation) {
      this.clothSimulation.cleanup()
      this.clothSimulation = null
    }

    if (this.physicsVisualDebug) {
      this.physicsVisualDebug.cleanup()
      this.physicsVisualDebug = null
    }

    if (this.physicsTest) {
      this.physicsTest.cleanup()
      this.physicsTest = null
    }

    if (this.physicsDropTest) {
      this.physicsDropTest.cleanup()
      this.physicsDropTest = null
    }

    if (this.physicsMeshUpdater) {
      this.physicsMeshUpdater.cleanup()
      this.physicsMeshUpdater = null
    }

    console.log("📊 AppState cleaned up")
  }
}
