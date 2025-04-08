// app/page.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Helper to read File as ArrayBuffer (keep this)
declare global {
    interface File {
        readAsArrayBuffer(): Promise<ArrayBuffer>;
    }
}
if (typeof File !== 'undefined' && !File.prototype.readAsArrayBuffer) {
    File.prototype.readAsArrayBuffer = function(): Promise<ArrayBuffer> {
        // ... (implementation remains the same)
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(this);
        });
    };
}


export default function HomePage() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    // --- NEW STATE ---
    const [capturedMask, setCapturedMask] = useState<string | null>(null);
    const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);

    // Refs for three.js objects
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    const requestRef = useRef<number | null>(null);
    const loaderRef = useRef<GLTFLoader | null>(null);

    // --- File Handling ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                setModelFile(file);
                setError(null);
                setCapturedImage(null);
                // --- CLEAR MASK ---
                setCapturedMask(null);
                clearSceneModel();
            } else {
                setError('Please upload a .glb or .gltf file.');
                setModelFile(null);
                // --- CLEAR MASK ---
                setCapturedMask(null);
                clearSceneModel();
            }
        } else {
             setModelFile(null);
             setError(null);
             setCapturedImage(null);
             // --- CLEAR MASK ---
             setCapturedMask(null);
             clearSceneModel();
        }
    };

    // --- Three.js Initialization and Cleanup ---
    const calculateFrustum = (containerWidth: number, containerHeight: number) => {
        const aspect = containerWidth / containerHeight;
        const frustumSize = 10;
        const halfFrustumSize = frustumSize / 2;

        return {
            left: -halfFrustumSize * aspect,
            right: halfFrustumSize * aspect,
            top: halfFrustumSize,
            bottom: -halfFrustumSize,
        };
    };

    const initThreeScene = useCallback(() => {
        if (!mountRef.current) return;
        // ... (rest of initThreeScene remains largely the same) ...
        const currentMount = mountRef.current;
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;

        loaderRef.current = new GLTFLoader();
        const scene = new THREE.Scene();
        // Store default background color for later restoration
        scene.userData.originalBackground = new THREE.Color(0xdddddd);
        scene.background = scene.userData.originalBackground.clone();
        sceneRef.current = scene;

        const frustum = calculateFrustum(width, height);
        const near = 0.1;
        const far = 1000;
        const camera = new THREE.OrthographicCamera(
            frustum.left, frustum.right, frustum.top, frustum.bottom, near, far
        );
        camera.position.z = 10;
        cameraRef.current = camera;

        // IMPORTANT: Ensure preserveDrawingBuffer is true for multiple captures
        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = true;
        controlsRef.current = controls;

        const handleResize = () => {
             if (cameraRef.current && rendererRef.current && mountRef.current) {
                 const newWidth = mountRef.current.clientWidth;
                 const newHeight = mountRef.current.clientHeight;
                 rendererRef.current.setSize(newWidth, newHeight);
                 const newFrustum = calculateFrustum(newWidth, newHeight);
                 cameraRef.current.left = newFrustum.left;
                 cameraRef.current.right = newFrustum.right;
                 cameraRef.current.top = newFrustum.top;
                 cameraRef.current.bottom = newFrustum.bottom;
                 cameraRef.current.updateProjectionMatrix();
             }
         };
        window.addEventListener('resize', handleResize);

        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            controlsRef.current?.update();
            // Render only if needed (or continuously if you prefer)
             if (rendererRef.current && sceneRef.current && cameraRef.current && controlsRef.current?.enabled) {
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
             }
        };
        // Start animation loop - render will happen inside capture function when needed
        animate();


        return () => {
            // ... (cleanup remains the same) ...
             cancelAnimationFrame(requestRef.current ?? 0);
             window.removeEventListener('resize', handleResize);
             controlsRef.current?.dispose();
             clearSceneModel(); // Also clears mask state now
             if (rendererRef.current) {
                  if (mountRef.current && rendererRef.current.domElement) {
                      mountRef.current.removeChild(rendererRef.current.domElement);
                  }
                  rendererRef.current.dispose();
             }
             sceneRef.current = null;
             cameraRef.current = null;
             rendererRef.current = null;
             controlsRef.current = null;
             loaderRef.current = null;
        };
    }, []); // Dependencies remain empty

    useEffect(() => {
        const cleanup = initThreeScene();
        return cleanup;
    }, [initThreeScene]);

    // --- Clear Scene Model ---
    const clearSceneModel = () => {
        if (modelRef.current && sceneRef.current) {
            sceneRef.current.remove(modelRef.current);
            // Dispose geometry and materials
            modelRef.current.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry?.dispose();
                    // Handle potential array of materials
                    if (Array.isArray(object.material)) {
                        object.material.forEach(mat => mat?.dispose());
                    } else {
                        object.material?.dispose();
                    }
                }
            });
            modelRef.current = null;
        }
         setIsModelLoaded(false);
         setCapturedImage(null);
         // --- CLEAR MASK ---
         setCapturedMask(null);
    };

    // --- Load Model Logic (mostly same) ---
    const handleLoadModel = useCallback(async () => {
        if (!modelFile || !sceneRef.current || !loaderRef.current) {
            setError("No file selected or scene not ready.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCapturedImage(null);
        // --- CLEAR MASK ---
        setCapturedMask(null);
        clearSceneModel(); // Already called above, but good to be explicit

        try {
            const buffer = await modelFile.readAsArrayBuffer();

            loaderRef.current.parse(
                buffer,
                '',
                (gltf) => { // onLoad
                    console.log('Model parsed successfully');
                    modelRef.current = gltf.scene;
                    sceneRef.current?.add(gltf.scene);

                    // Auto-centering
                    try {
                        const box = new THREE.Box3().setFromObject(gltf.scene);
                        const center = box.getCenter(new THREE.Vector3());
                        gltf.scene.position.sub(center);
                    } catch(centerError) {
                         console.warn("Could not auto-center model:", centerError);
                    }

                    setIsModelLoaded(true);
                    setIsLoading(false);
                    setError(null);
                     // --- Force a render after loading ---
                     if (rendererRef.current && sceneRef.current && cameraRef.current) {
                         rendererRef.current.render(sceneRef.current, cameraRef.current);
                     }

                },
                (error) => { // onError
                    console.error('Error parsing model:', error);
                    setError(`Failed to parse model. Error: ${error.message || String(error)}`);
                    setIsModelLoaded(false);
                    setIsLoading(false);
                    modelRef.current = null;
                }
            );

        } catch (readError) {
            console.error('Error reading file:', readError);
            setError('Failed to read the selected file.');
            setIsModelLoaded(false);
            setIsLoading(false);
            modelRef.current = null;
        }
    }, [modelFile]);


    // --- ** NEW: Combined Capture Logic ** ---
    const handleCaptureAndMask = () => {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const model = modelRef.current;

        if (!renderer || !scene || !camera || !model || !isModelLoaded) {
            setError('Renderer, scene, camera, or model not ready for capture.');
            return;
        }

        // --- Store original state ---
        const originalBackground = scene.background?.clone();
        const originalMaterials = new Map<string, THREE.Material | THREE.Material[]>(); // Use UUID for reliable mapping

        model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                 // Ensure UUID exists
                 if (!object.uuid) object.uuid = THREE.MathUtils.generateUUID();
                 originalMaterials.set(object.uuid, object.material);
            }
        });

        // --- 1. Capture Original Image ---
        let imageDataUrl: string | null = null;
        try {
            renderer.render(scene, camera); // Render the current view
            imageDataUrl = renderer.domElement.toDataURL('image/png');
            setCapturedImage(imageDataUrl);
            setError(null);
        } catch (e) {
            console.error("Original canvas capture failed:", e);
            setError("Failed to capture original canvas.");
            setCapturedImage(null);
            setCapturedMask(null); // Don't proceed if original fails
            // Restore any potential partial changes (though unlikely here)
             if (originalBackground) scene.background = originalBackground;
            return;
        }

        // --- 2. Prepare for Mask Rendering ---
        const maskMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const blackBackground = new THREE.Color(0x000000);
        let maskDataUrl: string | null = null;

        try {
            // Apply mask material and background
            scene.background = blackBackground;
            model.traverse((object) => {
                if (object instanceof THREE.Mesh && object.uuid && originalMaterials.has(object.uuid)) {
                    object.material = maskMaterial;
                }
            });

            // --- 3. Capture Mask Image ---
            renderer.render(scene, camera); // Render the mask view
            maskDataUrl = renderer.domElement.toDataURL('image/png');
            setCapturedMask(maskDataUrl);

        } catch (e) {
             console.error("Mask canvas capture failed:", e);
             setError("Failed to capture mask canvas.");
             setCapturedMask(null);
             // Still try to restore below
        } finally {
             // --- 4. Restore Original State ---
             if (originalBackground) {
                 scene.background = originalBackground;
             }
             model.traverse((object) => {
                 if (object instanceof THREE.Mesh && object.uuid && originalMaterials.has(object.uuid)) {
                     object.material = originalMaterials.get(object.uuid)!; // Restore using UUID
                 }
             });
             maskMaterial.dispose(); // Clean up the temporary material

             // --- Force a re-render with original materials ---
             // This ensures the viewport updates back immediately if the animation loop isn't running continuously
              renderer.render(scene, camera);
        }
    };

    // --- Render Component ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Controls Area */}
            <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="file"
                    accept=".glb, .gltf"
                    onChange={handleFileChange}
                />
                <button onClick={handleLoadModel} disabled={!modelFile || isLoading}>
                    {isLoading ? 'Loading...' : 'Load Model'}
                </button>
                {/* --- UPDATED BUTTON --- */}
                <button
                    onClick={handleCaptureAndMask} // Use the new function
                    disabled={!isModelLoaded || isLoading}
                >
                    Capture View & Mask
                </button>

                {error && <p style={{ color: 'red', margin: 0 }}>Error: {error}</p>}
                {isLoading && !error && <p style={{ color: 'blue', margin: 0 }}>Loading...</p>}
            </div>

            {/* Three.js Canvas Area */}
             <div ref={mountRef} style={{ flexGrow: 1, width: '100%', minHeight: '300px', background: '#eee', position: 'relative', overflow: 'hidden' }}>
                 {!isModelLoaded && !isLoading && !error && (
                    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#555'}}>
                        Select a GLB/GLTF file and click "Load Model".
                    </div>
                 )}
                 {/* Canvas mounted here */}
             </div>

            {/* Captured Image Preview Area */}
             {/* --- UPDATED PREVIEW AREA --- */}
             {(capturedImage || capturedMask) && (
                  <div style={{ padding: '10px', borderTop: '1px solid #ccc', textAlign: 'center', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      {capturedImage && (
                          <div>
                              <h3>Captured View:</h3>
                              <img
                                  src={capturedImage}
                                  alt="Captured view"
                                  style={{ maxWidth: '45%', maxHeight: '200px', border: '1px solid black', objectFit: 'contain' }}
                              />
                          </div>
                      )}
                       {capturedMask && (
                           <div>
                               <h3>Generated Mask:</h3>
                               <img
                                   src={capturedMask}
                                   alt="Generated mask"
                                   style={{ maxWidth: '45%', maxHeight: '200px', border: '1px solid black', objectFit: 'contain' }}
                               />
                           </div>
                       )}
                  </div>
             )}
        </div>
    );
}