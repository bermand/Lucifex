// Application state management
export class AppState {
  constructor() {
    this.state = {
      // Model states
      avatarUrl: null,
      garmentUrl: null,
      hasAvatar: false,
      hasGarment: false,

      // UI states
      currentTab: "avatar",
      modelType: "both", // 'avatar', 'garment', 'both'

      // Environment states
      environment: "studio",
      exposure: 1.0,
      shadowIntensity: 1.0,
      shadowSoftness: 0.5,
      toneMapping: "aces",

      // Physics states
      isPhysicsEnabled: false,
      isPhysicsDebugEnabled: false,
      clothSimulation: null,
      physicsTest: null,
      physicsDropTest: null,

      // Viewer states
      mainViewer: null,
      combinedViewerContainer: null,

      // Control states
      avatarScale: 1.0,
      avatarOpacity: 1.0,
      garmentScale: 1.0,
      garmentOpacity: 1.0,
      garmentOffsetX: 0.0,
      garmentOffsetY: 0.0,
    }

    console.log("📊 AppState initialized")
  }

  // Avatar methods
  setAvatarUrl(url) {
    this.state.avatarUrl = url
    this.state.hasAvatar = !!url
    console.log("📊 Avatar URL updated:", url)
  }

  getAvatarUrl() {
    return this.state.avatarUrl
  }

  // Garment methods
  setGarmentUrl(url) {
    this.state.garmentUrl = url
    this.state.hasGarment = !!url
    console.log("📊 Garment URL updated:", url)
  }

  getGarmentUrl() {
    return this.state.garmentUrl
  }

  // UI state methods
  setCurrentTab(tab) {
    this.state.currentTab = tab
    console.log("📊 Current tab updated:", tab)
  }

  getCurrentTab() {
    return this.state.currentTab
  }

  setModelType(type) {
    this.state.modelType = type
    console.log("📊 Model type updated:", type)
  }

  getModelType() {
    return this.state.modelType
  }

  // Environment methods
  setEnvironment(env) {
    this.state.environment = env
    console.log("📊 Environment updated:", env)
  }

  getEnvironment() {
    return this.state.environment
  }

  // Physics methods
  setPhysicsEnabled(enabled) {
    this.state.isPhysicsEnabled = enabled
    console.log("📊 Physics enabled:", enabled)
  }

  get isPhysicsEnabled() {
    return this.state.isPhysicsEnabled
  }

  setPhysicsDebugEnabled(enabled) {
    this.state.isPhysicsDebugEnabled = enabled
    console.log("📊 Physics debug enabled:", enabled)
  }

  get isPhysicsDebugEnabled() {
    return this.state.isPhysicsDebugEnabled
  }

  setClothSimulation(simulation) {
    this.state.clothSimulation = simulation
    console.log("📊 Cloth simulation set")
  }

  get clothSimulation() {
    return this.state.clothSimulation
  }

  setPhysicsTest(test) {
    this.state.physicsTest = test
    console.log("📊 Physics test set")
  }

  get physicsTest() {
    return this.state.physicsTest
  }

  setPhysicsDropTest(test) {
    this.state.physicsDropTest = test
    console.log("📊 Physics drop test set")
  }

  get physicsDropTest() {
    return this.state.physicsDropTest
  }

  // Viewer methods
  setMainViewer(viewer) {
    this.state.mainViewer = viewer
    console.log("📊 Main viewer set")
  }

  get mainViewer() {
    return this.state.mainViewer
  }

  setCombinedViewerContainer(container) {
    this.state.combinedViewerContainer = container
    console.log("📊 Combined viewer container set")
  }

  get combinedViewerContainer() {
    return this.state.combinedViewerContainer
  }

  // Control methods
  setAvatarScale(scale) {
    this.state.avatarScale = scale
  }

  getAvatarScale() {
    return this.state.avatarScale
  }

  setGarmentScale(scale) {
    this.state.garmentScale = scale
  }

  getGarmentScale() {
    return this.state.garmentScale
  }

  // Utility methods
  get hasAvatar() {
    return this.state.hasAvatar
  }

  get hasGarment() {
    return this.state.hasGarment
  }

  get hasBothModels() {
    return this.state.hasAvatar && this.state.hasGarment
  }

  // Get full state
  getState() {
    return { ...this.state }
  }

  // Reset state
  reset() {
    const defaultState = {
      avatarUrl: null,
      garmentUrl: null,
      hasAvatar: false,
      hasGarment: false,
      currentTab: "avatar",
      modelType: "both",
      environment: "studio",
      exposure: 1.0,
      shadowIntensity: 1.0,
      shadowSoftness: 0.5,
      toneMapping: "aces",
      isPhysicsEnabled: false,
      isPhysicsDebugEnabled: false,
      clothSimulation: null,
      physicsTest: null,
      physicsDropTest: null,
      mainViewer: null,
      combinedViewerContainer: null,
      avatarScale: 1.0,
      avatarOpacity: 1.0,
      garmentScale: 1.0,
      garmentOpacity: 1.0,
      garmentOffsetX: 0.0,
      garmentOffsetY: 0.0,
    }

    this.state = { ...defaultState }
    console.log("📊 AppState reset to defaults")
  }
}
