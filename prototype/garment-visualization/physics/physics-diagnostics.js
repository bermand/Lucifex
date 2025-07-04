// Physics Diagnostics
// Tools to diagnose physics simulation issues

class PhysicsDiagnostics {
  constructor() {
    this.diagnosticInterval = null
    this.lastParticlePositions = new Map()
  }

  startDiagnostics(clothSimulation) {
    if (!clothSimulation || !clothSimulation.physicsEngine) {
      console.log("❌ No physics simulation to diagnose")
      return false
    }

    console.log("🔬 === PHYSICS DIAGNOSTICS STARTING ===")

    // Store initial positions
    this.storeInitialPositions(clothSimulation.physicsEngine)

    // Start diagnostic loop
    this.diagnosticInterval = setInterval(() => {
      this.runDiagnostics(clothSimulation.physicsEngine)
    }, 1000) // Every second

    console.log("🔬 Diagnostics running - check console for detailed analysis")
    return true
  }

  storeInitialPositions(physicsEngine) {
    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      const positions = clothData.particles.map((p) => ({
        x: p.position.x,
        y: p.position.y,
        z: p.position.z,
      }))
      this.lastParticlePositions.set(clothId, positions)
    })
  }

  runDiagnostics(physicsEngine) {
    console.log("🔬 === PHYSICS DIAGNOSTIC REPORT ===")
    console.log(`   Time: ${physicsEngine.simulationTime.toFixed(2)}s`)
    console.log(`   Gravity: ${physicsEngine.gravity.y}m/s²`)
    console.log(`   Damping: ${physicsEngine.damping}`)

    physicsEngine.clothMeshes.forEach((clothData, clothId) => {
      this.diagnoseCloth(clothData, clothId)
    })

    console.log("🔬 === END DIAGNOSTIC REPORT ===")
  }

  diagnoseCloth(clothData, clothId) {
    const particles = clothData.particles
    const lastPositions = this.lastParticlePositions.get(clothId)

    console.log(`🔬 Cloth ${clothId} Diagnosis:`)

    // Check if particles are moving
    let totalMovement = 0
    let maxMovement = 0
    let staticParticles = 0
    let pinnedParticles = 0

    particles.forEach((particle, index) => {
      if (particle.pinned) {
        pinnedParticles++
        return
      }

      if (lastPositions && lastPositions[index]) {
        const dx = particle.position.x - lastPositions[index].x
        const dy = particle.position.y - lastPositions[index].y
        const dz = particle.position.z - lastPositions[index].z
        const movement = Math.sqrt(dx * dx + dy * dy + dz * dz)

        totalMovement += movement
        maxMovement = Math.max(maxMovement, movement)

        if (movement < 0.001) {
          staticParticles++
        }

        // Log specific particles
        if (index < 5) {
          console.log(
            `   Particle ${index}: pos(${particle.position.x.toFixed(3)}, ${particle.position.y.toFixed(3)}, ${particle.position.z.toFixed(3)}) movement=${movement.toFixed(6)}`,
          )
        }
      }
    })

    const avgMovement = totalMovement / (particles.length - pinnedParticles)

    console.log(`   • Total particles: ${particles.length}`)
    console.log(`   • Pinned particles: ${pinnedParticles}`)
    console.log(`   • Static particles (<0.001m): ${staticParticles}`)
    console.log(`   • Average movement: ${avgMovement.toFixed(6)}m/s`)
    console.log(`   • Max movement: ${maxMovement.toFixed(6)}m/s`)

    // Check Y positions
    let minY = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    let avgY = 0

    particles.forEach((particle) => {
      minY = Math.min(minY, particle.position.y)
      maxY = Math.max(maxY, particle.position.y)
      avgY += particle.position.y
    })
    avgY /= particles.length

    console.log(`   • Y range: ${minY.toFixed(3)}m to ${maxY.toFixed(3)}m`)
    console.log(`   • Average Y: ${avgY.toFixed(3)}m`)

    // Diagnosis
    if (avgMovement < 0.0001) {
      console.log("❌ DIAGNOSIS: Cloth appears completely static")
      console.log("   Possible causes:")
      console.log("   - Too many pinned particles")
      console.log("   - Constraints too stiff")
      console.log("   - Damping too high")
      console.log("   - Gravity too weak")
    } else if (avgMovement < 0.001) {
      console.log("⚠️ DIAGNOSIS: Cloth moving very slowly")
      console.log("   - Physics is working but movement is minimal")
      console.log("   - Consider reducing stiffness or increasing gravity")
    } else {
      console.log("✅ DIAGNOSIS: Cloth is moving normally")
    }

    // Update stored positions
    const newPositions = particles.map((p) => ({
      x: p.position.x,
      y: p.position.y,
      z: p.position.z,
    }))
    this.lastParticlePositions.set(clothId, newPositions)
  }

  stopDiagnostics() {
    if (this.diagnosticInterval) {
      clearInterval(this.diagnosticInterval)
      this.diagnosticInterval = null
    }
    console.log("🔬 Physics diagnostics stopped")
  }

  // Quick test to verify physics is working at all
  static quickPhysicsTest() {
    console.log("🧪 === QUICK PHYSICS TEST ===")

    // Create a simple falling particle
    const testParticle = {
      position: { x: 0, y: 2, z: 0 },
      oldPosition: { x: 0, y: 2, z: 0 },
      pinned: false,
    }

    const gravity = { x: 0, y: -9.81, z: 0 }
    const damping = 0.98
    const deltaTime = 1 / 60

    console.log("Initial position:", testParticle.position.y)

    // Simulate 60 frames (1 second)
    for (let frame = 0; frame < 60; frame++) {
      // Verlet integration
      const newY =
        testParticle.position.y +
        (testParticle.position.y - testParticle.oldPosition.y) * damping +
        gravity.y * deltaTime * deltaTime

      testParticle.oldPosition.y = testParticle.position.y
      testParticle.position.y = newY

      if (frame % 15 === 0) {
        // Log every 0.25 seconds
        console.log(`Frame ${frame}: Y = ${testParticle.position.y.toFixed(6)}`)
      }
    }

    const finalY = testParticle.position.y
    const drop = 2.0 - finalY

    console.log(`Final position: ${finalY.toFixed(6)}`)
    console.log(`Total drop: ${drop.toFixed(6)}m`)

    if (drop > 0.1) {
      console.log("✅ QUICK TEST PASSED - Basic physics working")
    } else {
      console.log("❌ QUICK TEST FAILED - Physics not working properly")
    }

    console.log("🧪 === QUICK TEST COMPLETE ===")
  }
}

// Export for use in main application
window.PhysicsDiagnostics = PhysicsDiagnostics
