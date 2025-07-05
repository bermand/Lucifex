// Application state management
export class AppState {
  constructor() {
    this.state = {
      // Model states
      avatarUrl: null,
      garmentUrl: null,
      currentModelType: "both", // 'avatar', 'garment', 'both'

      // UI states
      currentTab: "avatar",

      // Physics states
      isPhysicsEnabled: false,
      isPhysicsDebugEnabled: false,
      clothSimulation: null,
      physicsTest: null,
      physicsDropTest: null,

      // Environment states
      currentEnvironment: "studio",

      // Model availability
      hasAvatar: false,
      hasGarment: false,

      // Combined viewer
      combinedViewerContainer: null,
      avatarViewer: null,
      garmentViewer: null,
    }

    console.log("📊 AppState initialized")
  }

  // Getters
  getState() {
    return { ...this.state }
  }

  get avatarUrl() {
    return this.state.avatarUrl
  }
  get garmentUrl() {
    return this.state.garmentUrl
  }
  get currentModelType() {
    return this.state.currentModelType
  }
  get currentTab() {
    return this.state.currentTab
  }
  get isPhysicsEnabled() {
    return this.state.isPhysicsEnabled
  }
  get isPhysicsDebugEnabled() {
    return this.state.isPhysicsDebugEnabled
  }
  get clothSimulation() {
    return this.state.clothSimulation
  }
  get physicsTest() {
    return this.state.physicsTest
  }
  get physicsDropTest() {
    return this.state.physicsDropTest
  }
  get currentEnvironment() {
    return this.state.currentEnvironment
  }
  get hasAvatar() {
    return this.state.hasAvatar
  }
  get hasGarment() {
    return this.state.hasGarment
  }
  get combinedViewerContainer() {
    return this.state.combinedViewerContainer
  }
  get avatarViewer() {
    return this.state.avatarViewer
  }
  get garmentViewer() {
    return this.state.garmentViewer
  }

  // Setters
  setAvatarUrl(url) {
    this.state.avatarUrl = url
    this.state.hasAvatar = !!url
    console.log("📊 Avatar URL updated:", url)
  }

  setGarmentUrl(url) {
    this.state.garmentUrl = url
    this.state.hasGarment = !!url
    console.log("📊 Garment URL updated:", url)
  }

  setCurrentTab(tab) {
    this.state.currentTab = tab
    console.log("📊 Current tab updated:", tab)
  }

  setCurrentModelType(type) {
    this.state.currentModelType = type
    console.log("📊 Model type updated:", type)
  }

  setCurrentEnvironment(environment) {
    this.state.currentEnvironment = environment
    console.log("📊 Environment updated:", environment)
  }

  setPhysicsEnabled(enabled) {
    this.state.isPhysicsEnabled = enabled
    console.log("📊 Physics enabled:", enabled)
  }

  setPhysicsDebugEnabled(enabled) {
    this.state.isPhysicsDebugEnabled = enabled
    console.log("📊 Physics debug enabled:", enabled)
  }

  setClothSimulation(simulation) {
    this.state.clothSimulation = simulation
    console.log("📊 Cloth simulation set")
  }

  setPhysicsTest(test) {
    this.state.physicsTest = test
    console.log("📊 Physics test set")
  }

  setPhysicsDropTest(dropTest) {
    this.state.physicsDropTest = dropTest
    console.log("📊 Physics drop test set")
  }

  setCombinedViewerContainer(container) {
    this.state.combinedViewerContainer = container
    console.log("📊 Combined viewer container set")
  }

  setAvatarViewer(viewer) {
    this.state.avatarViewer = viewer
    console.log("📊 Avatar viewer set")
  }

  setGarmentViewer(viewer) {
    this.state.garmentViewer = viewer
    console.log("📊 Garment viewer set")
  }

  // Utility methods
  reset() {
    this.state = {
      avatarUrl: null,
      garmentUrl: null,
      currentModelType: "both",
      currentTab: "avatar",
      isPhysicsEnabled: false,
      isPhysicsDebugEnabled: false,
      clothSimulation: null,
      physicsTest: null,
      physicsDropTest: null,
      currentEnvironment: "studio",
      hasAvatar: false,
      hasGarment: false,
      combinedViewerContainer: null,
      avatarViewer: null,
      garmentViewer: null,
    }
    console.log("📊 AppState reset")
  }

  canEnablePhysics() {
    return this.state.hasAvatar && this.state.hasGarment
  }

  isReady() {
    return this.state.hasAvatar || this.state.hasGarment
  }
}
