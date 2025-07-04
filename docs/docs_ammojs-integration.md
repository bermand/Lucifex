# Detailed Technical Design for Integrating Ammo.js

This document provides a step-by-step outline on how to integrate Ammo.js into an existing web-based 3D prototype that uses <model-viewer> or a similar rendering approach. The goal is to introduce basic or intermediate cloth simulation using Ammo.js while respecting performance considerations on various devices, particularly mobile platforms.

---

## 1. Overview
Ammo.js is a JavaScript/TypeScript port of the Bullet Physics Engine, providing:  
• Collision shapes and broadphase algorithms.  
• Rigid body dynamics.  
• Soft body (cloth and rope) simulation in 3D.

The integration consists of:  
1. A physics world setup running in sync with the main rendering loop.  
2. Soft body creation for cloth objects (garment meshes) requiring simulation.  
3. Collision shapes for the avatar and environment to handle cloth collisions.  
4. An update pipeline to apply solver results back to the rendered 3D objects.

---

## 2. Project Fold Structure (Illustrative)
Below is an example structure for organizing the files related to Ammo.js integration. Adjust to your prototype’s existing layout:

```list type="issue"
data:
- url: "https://github.com/user/prototype/issues/12"
title: "Folder structure improvements for ammo.js"
state: "open"
draft: false
number: 12
created_at: "2025-07-04T16:00:00Z"
closed_at: ""
merged_at: ""
labels:
- "refactor"
author: "developer"
comments: 0
assignees_avatar_urls:
- "https://avatars.githubusercontent.com/u/3369400?v=4"
```

```
├── index.html
├── scripts/
│   ├── main.js               # Main rendering loop & <model-viewer> logic
│   ├── ammoInit.js           # Ammo.js initialization
│   └── clothSimulation.js    # Cloth-specific simulation routines
└── assets/
    ├── avatar.glb
    ├── garmentMesh.glb
    └── ...
```

---

## 3. Initialization Workflow

### 3.1 Load Ammo.js
1. Download Ammo.js: Obtain the compiled Ammo.js (ammo.wasm.js and .wasm) and place them in a subfolder (e.g., libs/) inside your web app directory.  
2. Asynchronous Initialization: Ammo.js loads asynchronously. You will typically wait for the Ammo “ready” event or promise resolution before using any physics functionalities.

```javascript name=ammoInit.js
// Example: ammoInit.js
// This demonstrates the basic pattern for loading Ammo.js
export async function loadAmmo() {
  return new Promise((resolve, reject) => {
    Ammo().then(function(AmmoLib) {
      resolve(AmmoLib);
    }).catch((error) => reject(error));
  });
}
```

---

## 4. Physics World Setup
Create and configure a physics world once Ammo.js is loaded:

```javascript name=clothSimulation.js
import { loadAmmo } from './ammoInit.js';

let AmmoLib;
let physicsWorld; 
let solver;
let dispatcher;
let overlappingPairCache;
let softBodySolver;
let collisionConfiguration;

/**
 * Initialize physics world with soft body support
 */
export async function initPhysicsWorld() {
  AmmoLib = await loadAmmo();

  // Collision configuration
  collisionConfiguration = new AmmoLib.btSoftBodyRigidBodyCollisionConfiguration();
  dispatcher = new AmmoLib.btCollisionDispatcher(collisionConfiguration);
  overlappingPairCache = new AmmoLib.btDbvtBroadphase();
  solver = new AmmoLib.btSequentialImpulseConstraintSolver();
  softBodySolver = new AmmoLib.btDefaultSoftBodySolver();

  physicsWorld = new AmmoLib.btSoftRigidDynamicsWorld(
    dispatcher,
    overlappingPairCache,
    solver,
    collisionConfiguration,
    softBodySolver
  );

  // Set gravity
  physicsWorld.setGravity(new AmmoLib.btVector3(0, -9.81, 0));
  physicsWorld.getWorldInfo().set_m_gravity(new AmmoLib.btVector3(0, -9.81, 0));
}

/**
 * Step the physics world with a fixed or variable timestep
 */
export function updatePhysics(deltaTime) {
  if (!physicsWorld) return;
  // Step simulation (smaller steps => more accuracy but costlier performance)
  physicsWorld.stepSimulation(deltaTime, 10);
}
```

Key Points:  
• Use the built-in rigid & soft body collision configuration to enable cloth simulation.  
• Provide gravity to match your unit scale (e.g., -9.81 for Earth gravity if 1 unit ≈ 1 meter).

---

## 5. Cloth (Soft Body) Creation

### 5.1 Mesh Preparation
• Ensure your garment mesh is triangulated and relatively uniform in polygon density to avoid solver inaccuracies.  
• <model-viewer> can be used to render the garment mesh, but the simulation geometry must be mirrored in Ammo’s soft body structure.

### 5.2 Creating a Soft Body from a Triangulated Mesh
```javascript name=clothSimulation.js
export function createClothSoftBody(positionsArray, indicesArray) {
  // positionsArray: Float32Array of vertex positions [x, y, z]
  // indicesArray: Uint16Array/Uint32Array of face indices

  const ammoPositions = new AmmoLib.btVector3Vector();
  const ammoIndices = new AmmoLib.btIntArray();

  // Fill positions
  for (let i = 0; i < positionsArray.length; i += 3) {
    const v = new AmmoLib.btVector3(positionsArray[i], positionsArray[i+1], positionsArray[i+2]);
    ammoPositions.push_back(v);
  }

  // Fill indices
  for (let i = 0; i < indicesArray.length; i++) {
    ammoIndices.push_back(indicesArray[i]);
  }

  // Create soft body
  const softBody = AmmoLib.btSoftBodyHelpers.CreateFromTriMesh(
    physicsWorld.getWorldInfo(),
    ammoPositions,
    ammoIndices,
    indicesArray.length / 3,
    true
  );

  // Some recommended parameters:
  softBody.get_m_materials().at(0).set_m_kLST(0.9);   // Linear stiffness
  softBody.get_m_materials().at(0).set_m_kAST(0.9);   // Area/Angular stiffness
  softBody.setTotalMass(1, false);                    // Adjust mass as needed
  softBody.setFriction(0.5);

  // Add to physics world
  physicsWorld.addSoftBody(softBody, 1, -1);
  return softBody;
}
```

Parameter Tuning:  
• set_m_kLST: Linear stiffness for cloth edges. Lower values => more stretching.  
• setTotalMass: Broad mass assignment across vertices.  
• For advanced behaviors, you can tweak bending constraints, pressure, etc.

---

## 6. Avatar Collision

### 6.1 Rigid Body Colliders
• Convert avatar’s bounding shapes (e.g., capsules, spheres, or simplified convex hulls) into Ammo’s collision shapes.  
• If the avatar is static, you can use a btRigidBody with zero mass so the cloth collides cleanly.

```javascript name=clothSimulation.js
export function createAvatarCollider(avatarBoundingShape) {
  const shape = new AmmoLib.btBoxShape(new AmmoLib.btVector3(
    avatarBoundingShape.halfExtents.x,
    avatarBoundingShape.halfExtents.y,
    avatarBoundingShape.halfExtents.z
  ));

  const transform = new AmmoLib.btTransform();
  transform.setIdentity();
  transform.setOrigin(new AmmoLib.btVector3(
    avatarBoundingShape.position.x,
    avatarBoundingShape.position.y,
    avatarBoundingShape.position.z
  ));

  const motionState = new AmmoLib.btDefaultMotionState(transform);

  // Zero mass => static body
  const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(
    0,
    motionState,
    shape,
    new AmmoLib.btVector3(0, 0, 0)
  );
  const body = new AmmoLib.btRigidBody(rbInfo);
  physicsWorld.addRigidBody(body);
  return body;
}
```

Key Points:  
• For a fully animated avatar, either dynamically update collider transforms each frame or rely on multiple colliders at major bones.  
• Keep shapes simple for performance, especially on mobile.

---

## 7. Simulation Loop Integration
1. Render Loop: In your main.js or equivalent, run a loop that updates both the physics simulation and the <model-viewer> rendering.  
2. Mesh Synchronization: After stepping Ammo.js (stepSimulation), read back updated cloth vertex positions from the btSoftBody and update the corresponding garment mesh in your 3D scene.

```javascript name=main.js
import { updatePhysics } from './clothSimulation.js';

let previousTime = performance.now();

function animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - previousTime) / 1000; // convert ms to s
  previousTime = currentTime;

  // 1. Physics update
  updatePhysics(deltaTime);

  // 2. <model-viewer> automatically updates the 3D rendering.
  //    If you have a custom loop, update garment mesh vertices here

  requestAnimationFrame(animate);
}

animate();
```

Important: Minimally you need to map Ammo’s computed soft body vertex positions back to the rendered garment geometry. The direct approach is typically copying Ammo vertex data into your mesh’s geometry buffer every frame.

---

## 8. Performance Considerations
1. Mobile Devices:  
   • Consider reducing cloth mesh resolution (fewer vertices).  
   • Use lighter collision shapes for the avatar.  
   • Limit the solver substeps (stepSimulation(deltaTime, maxSubSteps)).

2. Shared Buffers or Worker Threads:  
   • Offload simulation to a Web Worker if possible to avoid blocking the main thread, though Ammo.js integration can get more complex in that scenario.

3. Parameter Tuning:  
   • Lower solver iteration counts for performance trading off accuracy.  
   • Adjust cloth stiffness and mass settings to find a stable equilibrium.

---

## 9. Debugging
• Look into debug drawing support or create wireframe overlays to help visualize cloth collisions and pinpoint issues with bounding shapes.  
• Log or print out solver states with minimal overhead in development mode (remove for production).

---

## 10. Roadmap & Future Enhancements
1. Wind & External Forces:  
   • Apply user-defined wind vectors or impulses for dynamic cloth motion.

2. Multiple Garments:  
   • Support layering or multiple cloth objects (e.g., jacket over shirt), though that requires careful collision management to avoid interpenetration.

3. User Interaction:  
   • Enable pinch, grab, or drag gestures to manipulate cloth in real time (tips: anchor colliders or constraints to the cloth during user interactions).

---

## Conclusion
By integrating Ammo.js into the existing prototype, you can achieve real-time cloth simulation with relatively little licensing overhead. The design includes:  
• Initializing the Ammo.js library asynchronously.  
• Creating and stepping a soft-rigid dynamics world with cloth simulation.  
• Dynamically synchronizing the updated cloth mesh data with your rendering environment (<model-viewer> or otherwise).

This foundation can be expanded with additional features such as wind, user interactions, and advanced collision handling for more realistic garment draping experiences on various devices, including phones.