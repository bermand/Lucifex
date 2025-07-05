// Enhanced Mesh Updater System
// Creates dramatic visual feedback for physics simulation

class PhysicsMeshUpdater {
  constructor() {
    this.isActive = false
    this.clothSimulation = null
    this.modelViewer = null
    this.updateInterval = null
    this.meshUpdateCount = 0
    this.visualFeedbackOverlay = null
    this.lastClothStats = null
  }

  initialize(clothSimulation, modelViewer) {
    try {
      console.log("🎨 Initializing Enhanced Physics Mesh Updater...")

      this.clothSimulation = clothSimulation
      this.modelViewer = modelViewer

      // Create visual feedback overlay
      this.createVisualFeedbackOverlay()

      console.log("✅ Enhanced physics mesh updater initialized")
      return true
    } catch (error) {
      console.error("❌ Failed to initialize mesh updater:", error)
      return false
    }
  }

  createVisualFeedbackOverlay() {
    // Create overlay div for visual feedback
    this.visualFeedbackOverlay = document.createElement("div")
    this.visualFeedbackOverlay.id = "physics-feedback-overlay"
    this.visualFeedbackOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    // Create cloth visualization element
    const clothViz = document.createElement("div")
    clothViz.id = "cloth-visualization"
    clothViz.style.cssText = `
      width: 200px;
      height: 250px;
      background: linear-gradient(45deg, rgba(255,255,255,0.8), rgba(200,200,255,0.6));
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transform-origin: top center;
      transition: all 0.1s ease-out;
      border: 2px solid rgba(255,255,255,0.5);
      position: relative;
      overflow: hidden;
    `

    // Add fabric texture effect
    const textureOverlay = document.createElement("div")
    textureOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 2px,
        rgba(255,255,255,0.1) 2px,
        rgba(255,255,255,0.1) 4px
      );
      pointer-events: none;
    `

    clothViz.appendChild(textureOverlay)
    this.visualFeedbackOverlay.appendChild(clothViz)
    document.body.appendChild(this.visualFeedbackOverlay)

    console.log("🎨 Visual feedback overlay created")
  }

  startUpdating() {
    if (this.isActive) {
      console.log("⚠️ Mesh updater already active")
      return
    }

    this.isActive = true
    console.log("▶️ Starting enhanced mesh updates with dramatic visual feedback...")

    // Update at 30fps for smooth visual feedback
    this.updateInterval = setInterval(() => {
      this.updateVisualFeedback()
    }, 1000 / 30)
  }

  stopUpdating() {
    if (!this.isActive) {
      return
    }

    this.isActive = false

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    console.log("⏹️ Stopped enhanced mesh updates")
  }

  updateVisualFeedback() {
    if (!this.clothSimulation || !this.clothSimulation.physicsEngine) {
      return
    }

    try {
      this.meshUpdateCount++

      // Get physics data and create dramatic visual feedback
      this.clothSimulation.clothMeshes.forEach((clothData, clothName) => {
        const physicsId = clothData.physicsId
        if (!physicsId) return

        // Get updated vertices from physics
        const vertices = this.clothSimulation.physicsEngine.getClothVertices(physicsId)
        if (!vertices) return

        // Calculate cloth statistics
        const clothStats = this.calculateClothStats(vertices)

        // Apply dramatic visual transformations
        this.applyDramaticVisualEffects(clothStats)

        // Update model viewer with physics-based effects
        this.updateModelViewerWithPhysics(clothStats)

        this.lastClothStats = clothStats
      })

      // Log progress occasionally
      if (this.meshUpdateCount % 90 === 0) {
        // Every 3 seconds at 30fps
        console.log(`🎨 Enhanced Mesh Update #${this.meshUpdateCount} - Dramatic visual feedback active`)
        this.logEnhancedStats()
      }
    } catch (error) {
      console.error("❌ Failed to update visual feedback:", error)
    }
  }

  calculateClothStats(vertices) {
    let minY = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    let avgY = 0
    let centerX = 0
    let centerZ = 0
    const totalMovement = 0

    const particleCount = vertices.length / 3

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      const z = vertices[i + 2]

      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
      avgY += y
      centerX += x
      centerZ += z
    }

    avgY /= particleCount
    centerX /= particleCount
    centerZ /= particleCount

    const heightSpan = maxY - minY
    const dropAmount = Math.max(0, 2.2 - avgY) // How much it has dropped from start
    const sagAmount = Math.max(0, dropAmount * 0.3) // Sagging effect

    return {
      minY,
      maxY,
      avgY,
      centerX,
      centerZ,
      heightSpan,
      dropAmount,
      sagAmount,
      particleCount,
      isSettled: dropAmount > 1.5 && heightSpan < 1.0,
    }
  }

  applyDramaticVisualEffects(clothStats) {
    const clothViz = document.getElementById("cloth-visualization")
    if (!clothViz) return

    // Calculate dramatic transformations
    const dropProgress = Math.min(clothStats.dropAmount / 2.0, 1.0) // 0 to 1
    const sagProgress = Math.min(clothStats.sagAmount / 0.5, 1.0) // 0 to 1

    // Dramatic falling animation
    const translateY = dropProgress * 150 // Fall down the screen
    const scaleY = 1 - sagProgress * 0.3 // Compress vertically as it sags
    const scaleX = 1 + sagProgress * 0.2 // Expand horizontally as it spreads
    const rotateX = sagProgress * 15 // Tilt as it drapes
    const skewX = Math.sin(Date.now() * 0.005) * sagProgress * 5 // Subtle wave motion

    // Apply transformations
    clothViz.style.transform = `
      translateY(${translateY}px)
      scaleY(${scaleY})
      scaleX(${scaleX})
      rotateX(${rotateX}deg)
      skewX(${skewX}deg)
    `

    // Change opacity and color based on physics state
    const opacity = 0.7 + dropProgress * 0.3
    const hue = 200 + sagProgress * 60 // Blue to purple as it settles

    clothViz.style.background = `
      linear-gradient(45deg, 
        hsla(${hue}, 70%, 85%, ${opacity}), 
        hsla(${hue + 20}, 60%, 75%, ${opacity * 0.8})
      )
    `

    // Add settling effect
    if (clothStats.isSettled) {
      clothViz.style.boxShadow = `
        0 20px 40px rgba(0,0,0,0.4),
        inset 0 5px 15px rgba(255,255,255,0.3)
      `
    }

    // Add physics status text
    this.updatePhysicsStatusText(clothStats)
  }

  updatePhysicsStatusText(clothStats) {
    let statusText = document.getElementById("physics-status-text")
    if (!statusText) {
      statusText = document.createElement("div")
      statusText.id = "physics-status-text"
      statusText.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-family: monospace;
        font-size: 12px;
        text-align: center;
        backdrop-filter: blur(10px);
      `
      this.visualFeedbackOverlay.appendChild(statusText)
    }

    const dropPercent = Math.round((clothStats.dropAmount / 2.0) * 100)
    const sagPercent = Math.round((clothStats.sagAmount / 0.5) * 100)

    statusText.innerHTML = `
      🧬 Physics Active: Cloth Draping Simulation<br>
      📉 Drop: ${dropPercent}% | 🌊 Sag: ${sagPercent}% | 📏 Height: ${clothStats.heightSpan.toFixed(2)}m<br>
      ${clothStats.isSettled ? "✅ Cloth Settled on Avatar" : "⏳ Cloth Falling..."}
    `
  }

  updateModelViewerWithPhysics(clothStats) {
    // Apply subtle physics effects to the actual model viewer
    const combinedViewer = document.getElementById("combined-viewer")
    const mainViewer = document.getElementById("main-viewer")

    const activeViewer = combinedViewer || mainViewer
    if (!activeViewer) return

    try {
      // Create subtle model viewer effects
      const dropEffect = Math.min(clothStats.dropAmount / 2.0, 1.0)
      const sagEffect = Math.min(clothStats.sagAmount / 0.5, 1.0)

      // Subtle camera shake during falling
      const shakeX = clothStats.isSettled ? 0 : Math.sin(Date.now() * 0.01) * dropEffect * 2
      const shakeY = clothStats.isSettled ? 0 : Math.cos(Date.now() * 0.013) * dropEffect * 1

      // Apply to model viewer container
      const container = document.getElementById("combined-container")
      if (container) {
        container.style.transform = `translate(${shakeX}px, ${shakeY}px)`
      }

      // Adjust lighting based on physics state
      if (activeViewer.setAttribute) {
        const exposure = 1.0 + sagEffect * 0.3 // Brighter as cloth settles
        const shadowIntensity = 1.0 + dropEffect * 0.5 // More shadows as it falls

        activeViewer.setAttribute("exposure", exposure.toString())
        activeViewer.setAttribute("shadow-intensity", shadowIntensity.toString())
      }
    } catch (error) {
      console.error("❌ Failed to update model viewer with physics:", error)
    }
  }

  logEnhancedStats() {
    if (!this.lastClothStats) return

    console.log(`🎨 Enhanced Visual Feedback Stats:`)
    console.log(`   • Drop Amount: ${this.lastClothStats.dropAmount.toFixed(3)}m`)
    console.log(`   • Sag Amount: ${this.lastClothStats.sagAmount.toFixed(3)}m`)
    console.log(`   • Height Span: ${this.lastClothStats.heightSpan.toFixed(3)}m`)
    console.log(`   • Average Y: ${this.lastClothStats.avgY.toFixed(3)}m`)
    console.log(`   • Is Settled: ${this.lastClothStats.isSettled}`)
    console.log(`   • Update Count: ${this.meshUpdateCount}`)
  }

  cleanup() {
    this.stopUpdating()

    if (this.visualFeedbackOverlay) {
      document.body.removeChild(this.visualFeedbackOverlay)
      this.visualFeedbackOverlay = null
    }

    this.clothSimulation = null
    this.modelViewer = null
    this.meshUpdateCount = 0
    this.lastClothStats = null

    console.log("✅ Enhanced physics mesh updater cleanup complete")
  }
}

// Export for use in main application
window.PhysicsMeshUpdater = PhysicsMeshUpdater
