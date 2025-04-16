// "use client"
// import React, {
//     useRef,
//     useState,
//     Suspense,
//     forwardRef,
//     useCallback,
//     MutableRefObject // Added for explicit ref type
// } from 'react';
// import * as THREE from 'three';
// import { Canvas, ThreeEvent, MeshProps } from '@react-three/fiber'; // Import MeshProps
// import { OrbitControls, Decal, useTexture, Text } from '@react-three/drei';
// // --- Constants ---
// const DECAL_PLACE_THROTTLE_MS = 50; // Place decal max every 50ms during drag

// // --- Types ---
// interface DecalData {
//     position: THREE.Vector3;
//     rotation: THREE.Euler;
//     id: number; // Simple ID for React key
// }

// // Type for the props accepted by our Model component
// // Extends MeshProps to include all standard mesh attributes and events
// interface ModelProps extends MeshProps {
//     // Add any custom props specific to your model here if needed
//     // exampleCustomProp?: string;
// }


// // --- Helper Function ---
// // Calculates decal rotation based on surface normal to align it
// const calculateDecalRotation = (position: THREE.Vector3, normal: THREE.Vector3): THREE.Euler => {
//     const up = new THREE.Vector3(0, 1, 0); // World up
//     const rotationMatrix = new THREE.Matrix4();
//     const targetPosition = position.clone().add(normal);

//     // Handle edge case where normal points straight up or down
//     if (Math.abs(normal.y) > 0.999) {
//         // If looking straight up/down, use world X as 'up' vector
//         up.set(1, 0, 0);
//     }

//     rotationMatrix.lookAt(targetPosition, position, up);
//     const euler = new THREE.Euler().setFromRotationMatrix(rotationMatrix);
//     return euler;
// };

// // --- The Model Component ---
// // Represents the 3D model onto which decals will be placed.
// // Uses forwardRef to receive the mesh ref from the parent.
// // Accepts standard MeshProps (including event handlers) via the ModelProps type.
// const ModelWithDecalTarget = forwardRef<THREE.Mesh, ModelProps>(
//     (props, ref) => { // props now includes event handlers etc.
//         return (
//             <mesh
//                 ref={ref} // Assign the forwarded ref
//                 castShadow
//                 receiveShadow
//                 {...props} // Spread all received props (like onPointerDown, material, geometry...)
//             >
//                 {/* Define the specific geometry and base material here */}
//                 <torusKnotGeometry args={[1, 0.4, 128, 16]} />
//                 <meshStandardMaterial
//                     color="#cccccc"
//                     roughness={0.6}
//                     metalness={0.2}
//                     polygonOffset // Helps prevent z-fighting with decals
//                     polygonOffsetFactor={-1} // Push mesh surface back slightly
//                 />
//                 {/* If you needed to pass children TO the model, they'd go here */}
//                 {/* {props.children} */}
//             </mesh>
//         );
//     }
// );
// ModelWithDecalTarget.displayName = 'ModelWithDecalTarget'; // Good practice for debugging


// // --- Scene Content Component ---
// // Manages state, event handling, and renders the scene elements inside the Canvas
// function SceneContent() {
//     const [decals, setDecals] = useState<DecalData[]>([]);
//     const meshRef = useRef<THREE.Mesh>(null!); // Ref for the target mesh
//     const [isPainting, setIsPainting] = useState(false);
//     const lastPlacementTime = useRef<number>(0); // For throttling

//     // Load the decal texture (ensure 'decal.png' is in /public)
//     const decalTexture = useTexture('/decal.png');

//     // --- Decal Placement Logic (Memoized) ---
//     const placeDecal = useCallback((point: THREE.Vector3, normal: THREE.Vector3) => {
//         const now = Date.now();
//         // Throttle placement check
//         if (now - lastPlacementTime.current < DECAL_PLACE_THROTTLE_MS) {
//             return; // Too soon since last placement
//         }
//         lastPlacementTime.current = now;

//         const rotation = calculateDecalRotation(point, normal);
//         setDecals((prevDecals) => [
//             ...prevDecals,
//             {
//                 position: point.clone(), // Clone vectors to prevent mutation issues
//                 rotation: rotation,
//                 id: now + Math.random(), // Simple unique key
//             },
//         ]);
//         // console.log(`Placed decal #${decals.length + 1} at`, point); // Can be noisy
//     }, []); // No dependencies needed as it only uses refs and setDecals

//     // --- Event Handlers for Painting ---
//     const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
//         // Check if the primary interaction is with our target mesh
//         if (event.intersections.length > 0 && event.intersections[0].object === meshRef.current) {
//             event.stopPropagation(); // Prevent OrbitControls from activating camera drag
//             setIsPainting(true);
//             lastPlacementTime.current = 0; // Reset throttle on new stroke start

//             // Place the first decal immediately on click
//             if (event.point && event.face?.normal) {
//                 placeDecal(event.point, event.face.normal);
//             } else {
//                 console.warn("PointerDown event missing point or normal data.");
//             }
//         }
//     };

//     const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
//         // Stop painting regardless of where pointer up happens if we were painting
//         if (isPainting) {
//             event.stopPropagation(); // May not be strictly necessary but can prevent side effects
//             setIsPainting(false);
//         }
//     };

//     const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
//         // Only paint if dragging AND the pointer is currently over the target mesh
//         if (isPainting && event.intersections.length > 0 && event.intersections[0].object === meshRef.current) {
//              event.stopPropagation(); // Prevent OrbitControls camera movement while painting

//             if (event.point && event.face?.normal) {
//                 placeDecal(event.point, event.face.normal); // Place subsequent decals (throttled)
//             } else {
//                  console.warn("PointerMove event missing point or normal data.");
//             }
//         }
//         // If isPainting is true but pointer is NOT over the mesh, do nothing (allow camera control)
//     };

//     // Stop painting if the pointer leaves the *mesh's bounds* while dragging
//     const handlePointerLeave = (_event: ThreeEvent<PointerEvent>) => { // Use _event to denote unused param (fix ESLint warning)
//         if (isPainting) {
//             // We assume leaving the mesh object means stop painting stroke
//             setIsPainting(false);
//             // console.log("Pointer left mesh, stopping paint.");
//         }
//     };

//     // Define the size of the decal projection box
//     const decalSize = new THREE.Vector3(0.2, 0.2, 0.2); // Smaller decals for painting effect

//     return (
//         <>
//             {/* Lighting Setup */}
//             <ambientLight intensity={0.8} />
//             <directionalLight
//                 position={[8, 10, 5]}
//                 intensity={1.5}
//                 castShadow
//                 shadow-mapSize-width={2048} // Higher res shadows
//                 shadow-mapSize-height={2048}
//             />
//             <pointLight position={[-5, -5, -5]} intensity={0.3} />

//             {/* Camera Controls - will be disabled temporarily during paint drag on mesh */}
//             <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

//             {/* Suspense for texture loading */}
//             <Suspense fallback={
//                 <Text position={[0, 0, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
//                     Loading Assets...
//                 </Text>
//             }>
//                 {/* Render the target model - Pass ref and event handlers */}
//                 <ModelWithDecalTarget
//                     ref={meshRef} // Pass the ref
//                     onPointerDown={handlePointerDown}
//                     onPointerUp={handlePointerUp}
//                     onPointerMove={handlePointerMove}
//                     onPointerLeave={handlePointerLeave} // Stop painting if pointer leaves the mesh
//                 />

//                 {/* Render all placed decals */}
//                 {/* Decals depend on meshRef.current being populated.
//                     R3F's Decal component handles the 'mesh' prop dynamically. */}
//                 {decals.map((decal) => (
//                     <Decal
//                         key={decal.id}
//                         mesh={meshRef} // Target the mesh using the ref
//                         position={decal.position} // World space position on mesh surface
//                         rotation={decal.rotation} // Euler rotation to align with surface
//                         scale={decalSize}        // Size of the decal projection
//                         // debug // Uncomment to visualize the decal projection box
//                     >
//                         {/* Material applied to the decal geometry */}
//                         <meshStandardMaterial
//                             map={decalTexture}         // The decal image
//                             polygonOffset             // Help prevent z-fighting
//                             polygonOffsetFactor={-10} // Push decal slightly forward
//                             transparent               // Enable transparency
//                             depthTest={true}          // Decal should be occluded by mesh
//                             depthWrite={false}        // Decal shouldn't write to depth buffer (prevents hiding things behind it)
//                             roughness={0.8}           // Decal surface properties
//                             metalness={0.1}
//                             toneMapped={false}        // Often better for UI/decals to avoid tone mapping
//                             alphaTest={0.5}           // Use alphaTest for sharp cutout edges if texture has alpha
//                             premultipliedAlpha={false} // Ensure correct blending if using alphaTest/transparency
//                         />
//                     </Decal>
//                 ))}
//             </Suspense>

//             {/* Optional: Simple ground plane */}
//             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
//                 <planeGeometry args={[20, 20]} />
//                 <meshStandardMaterial color="#444444" roughness={0.9} metalness={0.1} side={THREE.DoubleSide}/>
//             </mesh>
//         </>
//     );
// }


// // --- Main Application Component ---
// // Sets up the overall page structure and the R3F Canvas
// export default function DecalScene() {
//     return (
//         <div style={{
//             height: '100vh',
//             width: '100vw',
//             background: '#282c34',
//             touchAction: 'none' // Prevent default browser touch actions (like scroll) during interaction
//         }}>
//             {/* Simple instruction overlay */}
//             <div style={{
//                 position: 'absolute',
//                 top: 10,
//                 left: 10,
//                 zIndex: 1,
//                 color: 'white',
//                 background: 'rgba(0,0,0,0.5)',
//                 padding: '8px',
//                 borderRadius: '4px',
//                 pointerEvents: 'none' // Allow clicks to pass through to the canvas
//              }}>
//                 Click and drag on the model to paint decals.
//             </div>

//             {/* React Three Fiber Canvas Setup */}
//             <Canvas
//                 shadows // Enable shadows in the scene
//                 camera={{ position: [0, 1.5, 5], fov: 50 }} // Initial camera setup
//                 // performance={{ min: 0.1, max: 1 }} // Optional: Performance tuning hints
//                 // frameloop="demand" // Optional: Render only on demand (state change, interaction)
//             >
//                 {/* Scene content is rendered here, inheriting the Canvas context */}
//                 <SceneContent />
//             </Canvas>


//         </div>

//     );
// }

// // --- How to Use ---
// // 1. Save this code as a `.tsx` file (e.g., `src/app/dashboard/retexture/page.tsx`).
// // 2. Ensure dependencies are installed: `npm install three @types/three @react-three/fiber @react-three/drei` or `yarn add ...`
// // 3. Place a suitable `decal.png` (preferably with transparency) in your project's `/public` folder.
// // 4. Make sure this component is rendered within your Next.js application structure.


"use client"

import ProjectedMaterialModelDemo from "@/components/retexture-components/retexture.jsx";

export default function DecalScene() {
    return (

        <ProjectedMaterialModelDemo
        />

    )
}