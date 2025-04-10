// app/page.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Removed cv import: import cv from '@techstark/opencv-js';

// Helper to read File as ArrayBuffer
declare global {
    interface File {
        readAsArrayBuffer(): Promise<ArrayBuffer>;
    }
    // Removed Window.cv type
}
if (typeof File !== 'undefined' && !File.prototype.readAsArrayBuffer) {
    File.prototype.readAsArrayBuffer = function(): Promise<ArrayBuffer> {
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
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loading model file
    const [isCapturing, setIsCapturing] = useState<boolean>(false); // Capturing images/map state
    const [error, setError] = useState<string | null>(null); // General/Load error
    const [captureError, setCaptureError] = useState<string | null>(null); // Capture error
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [capturedMask, setCapturedMask] = useState<string | null>(null);
    // Removed capturedCannyMap state
    // Removed isCvReady state
    const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);

    // Refs for three.js objects
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    const requestRef = useRef<number | null>(null);
    const loaderRef = useRef<GLTFLoader | null>(null);

    // --- Removed OpenCV Initialization Effect ---


    // --- File Handling ---
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                setModelFile(file); setError(null); setCaptureError(null);
                setCapturedImage(null); setCapturedMask(null); // Removed setCapturedCannyMap
                clearSceneModel();
            } else {
                setError('Please upload a .glb or .gltf file.'); setModelFile(null);
                setCaptureError(null); setCapturedImage(null); setCapturedMask(null); // Removed setCapturedCannyMap
                clearSceneModel();
            }
        } else {
             setModelFile(null); setError(null); setCaptureError(null);
             setCapturedImage(null); setCapturedMask(null); // Removed setCapturedCannyMap
             clearSceneModel();
        }
        event.target.value = '';
    }, []); // Dependency array empty now, no clearSceneModel needed


    // --- Three.js Utilities ---
    const calculateFrustum = (containerWidth: number, containerHeight: number) => {
        const aspect = containerWidth / containerHeight;
        const frustumSize = 10;
        const halfFrustumSize = frustumSize / 2;
        return { left: -halfFrustumSize * aspect, right: halfFrustumSize * aspect, top: halfFrustumSize, bottom: -halfFrustumSize };
    };

    // --- Clear Scene Model ---
    const clearSceneModel = useCallback(() => {
        if (modelRef.current && sceneRef.current) {
            console.log("Clearing existing model from scene...");
            sceneRef.current.remove(modelRef.current);
            modelRef.current.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) object.material.forEach(mat => mat?.dispose());
                    else if (object.material) object.material.dispose();
                }
            });
            modelRef.current = null;
            console.log("Model resources disposed.");
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        }
         setIsModelLoaded(false);
         setCapturedImage(null); setCapturedMask(null); // Removed setCapturedCannyMap
    }, []);

    // --- Three.js Initialization Effect ---
    useEffect(() => {
        if (!mountRef.current || rendererRef.current) return; // Prevent re-init

        const currentMount = mountRef.current;
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        if (width <= 0 || height <= 0) return;

        console.log("Initializing Three.js scene...");
        let animationRunning = true;

        // Setup
        loaderRef.current = new GLTFLoader();
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xdddddd);
        sceneRef.current = scene;
        const frustum = calculateFrustum(width, height);
        const camera = new THREE.OrthographicCamera(frustum.left, frustum.right, frustum.top, frustum.bottom, 0.1, 1000);
        camera.position.z = 15;
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); directionalLight.position.set(5, 10, 7.5).normalize(); scene.add(directionalLight);
        const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.05; controls.screenSpacePanning = true;
        controlsRef.current = controls;

        // Resize handler
        const handleResize = () => {
             if (cameraRef.current && rendererRef.current && mountRef.current) {
                 const newWidth = mountRef.current.clientWidth; const newHeight = mountRef.current.clientHeight;
                 if (newWidth > 0 && newHeight > 0) {
                     rendererRef.current.setSize(newWidth, newHeight);
                     const newFrustum = calculateFrustum(newWidth, newHeight);
                     cameraRef.current.left = newFrustum.left; cameraRef.current.right = newFrustum.right; cameraRef.current.top = newFrustum.top; cameraRef.current.bottom = newFrustum.bottom;
                     cameraRef.current.updateProjectionMatrix();
                     if (sceneRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current);
                 }
             }
         };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            if (!animationRunning) return;
            requestRef.current = requestAnimationFrame(animate);
            if (controlsRef.current?.update() && rendererRef.current && sceneRef.current && cameraRef.current) {
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();
        if (rendererRef.current && sceneRef.current && cameraRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current); // Initial render
        console.log("Initial render complete.");

        // Cleanup
        return () => {
             console.log("Cleaning up Three.js scene...");
             animationRunning = false;
             if (requestRef.current) cancelAnimationFrame(requestRef.current);
             window.removeEventListener('resize', handleResize);
             controlsRef.current?.dispose();
             clearSceneModel();
             if (rendererRef.current) {
                  if (mountRef.current && rendererRef.current.domElement.parentNode === mountRef.current) {
                      mountRef.current.removeChild(rendererRef.current.domElement);
                  }
                  rendererRef.current.dispose(); console.log("Renderer disposed.");
             }
             sceneRef.current = null; cameraRef.current = null; rendererRef.current = null;
             controlsRef.current = null; loaderRef.current = null; requestRef.current = null;
             console.log("Three.js cleanup finished.");
        };
    }, [clearSceneModel]); // Dependency includes clearSceneModel

   // --- Load Model Logic ---
    const handleLoadModel = useCallback(async () => {
        console.log("handleLoadModel: Triggered.");
        if (!modelFile) { setError("Please select a model file first."); return; }

        const currentScene = sceneRef.current; const currentCamera = cameraRef.current;
        const currentRenderer = rendererRef.current; const currentLoader = loaderRef.current;
        if (!currentScene || !currentLoader || !currentCamera || !currentRenderer) {
            setError("Scene not ready. Cannot load model."); return;
        }

        setIsLoading(true); setError(null); setCaptureError(null);
        clearSceneModel(); // Clear previous first

        try {
            const buffer = await modelFile.readAsArrayBuffer();
            console.log(`handleLoadModel: Buffer length: ${buffer.byteLength} bytes.`);
            currentLoader.parse( buffer, '',
                (gltf) => { // onLoad
                    console.log('>>> loader.parse -> onLoad: Success!');
                    const loadedModel = gltf.scene;
                    if (!loadedModel || !sceneRef.current || !cameraRef.current || !rendererRef.current) {
                         setError("Scene setup was lost during load."); setIsLoading(false); return;
                    }
                    modelRef.current = loadedModel; sceneRef.current.add(loadedModel);
                    console.log(">>> loader.parse -> onLoad: Model added. Child count:", sceneRef.current.children.length);
                    // Auto-fit
                    try {
                        const box = new THREE.Box3().setFromObject(loadedModel); const size = box.getSize(new THREE.Vector3());
                        if (!isFinite(size.length()) || size.y <= 0) throw new Error("Invalid model dimensions.");
                        const camH = cameraRef.current.top - cameraRef.current.bottom; const scale = (camH * 0.8) / size.y;
                        const finalScale = Math.max(1e-5, Math.min(1000, scale)); // Clamp scale
                        loadedModel.scale.setScalar(finalScale);
                        const scaledCenter = new THREE.Box3().setFromObject(loadedModel).getCenter(new THREE.Vector3());
                        if (isFinite(scaledCenter.length())) loadedModel.position.sub(scaledCenter);
                        if (controlsRef.current) { controlsRef.current.target.set(0, 0, 0); controlsRef.current.reset(); controlsRef.current.update(); }
                        cameraRef.current.zoom = 1; cameraRef.current.updateProjectionMatrix();
                        console.log(`>>> loader.parse -> onLoad: Auto-fit complete (Scale: ${finalScale.toFixed(3)})`);
                    } catch (fitError: any) { setError(`Auto-fit failed: ${fitError.message}`); }
                    // End Auto-fit
                    setIsModelLoaded(true); setIsLoading(false); setError(null);
                    if (rendererRef.current && sceneRef.current && cameraRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current); // Final render
                    console.log(">>> loader.parse -> onLoad: Final render triggered.");
                },
                (error: any) => { // onError
                    console.error('>>> loader.parse -> onError:', error); setError(`Failed to parse model: ${error.message || error}`);
                    setIsModelLoaded(false); setIsLoading(false); modelRef.current = null;
                }
            );
        } catch (readError: any) {
            setError(`Failed to load model: ${readError.message}`); setIsLoading(false);
        }
    }, [modelFile, clearSceneModel]);

    // --- Removed Generate Canny Map Helper ---


    // --- Combined Capture Logic ---
    const handleCaptureAll = useCallback(async () => {
        const renderer = rendererRef.current; const scene = sceneRef.current;
        const camera = cameraRef.current; const model = modelRef.current;
        if (!renderer || !scene || !camera || !model || !isModelLoaded) { setCaptureError('Scene/model not ready.'); return; }
        if (isCapturing) return;

        setIsCapturing(true); setCaptureError(null);
        setCapturedImage(null); setCapturedMask(null); // Removed setCapturedCannyMap

        const originalBackground = scene.background ? scene.background.clone() : null;
        const originalMaterials = new Map<string, THREE.Material | THREE.Material[]>();
        model.traverse((o) => { if (o instanceof THREE.Mesh) originalMaterials.set(o.uuid, o.material); });

        // Using INVERSE mask settings (Black model on White background)
        const maskMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const maskBackground = new THREE.Color(0xffffff);
        let capturedOriginalUrl: string | null = null;

        try {
            renderer.render(scene, camera); // Ensure render buffer is up-to-date
            capturedOriginalUrl = renderer.domElement.toDataURL('image/png'); setCapturedImage(capturedOriginalUrl); // Capture Original
            console.log("handleCaptureAll: Original view captured.");

            scene.background = maskBackground; // Set WHITE background
            model.traverse((o) => { if (o instanceof THREE.Mesh && originalMaterials.has(o.uuid)) o.material = maskMaterial; }); // Apply BLACK material
            renderer.render(scene, camera); // Render mask view
            const capturedMaskUrl = renderer.domElement.toDataURL('image/png'); setCapturedMask(capturedMaskUrl); // Capture Mask
            console.log("handleCaptureAll: Mask view captured.");

            // --- Removed Canny Generation Step ---

            console.log("handleCaptureAll: Capture sequence completed (Image & Mask only).");

        } catch (e: any) {
            setCaptureError(`Capture failed: ${e.message || e}`);
            setCapturedImage(null); setCapturedMask(null); // Clear partial results on error
        }
        finally { // Restore Scene
            if (scene) scene.background = originalBackground;
            if (model) model.traverse((o) => { if (o instanceof THREE.Mesh && originalMaterials.has(o.uuid)) o.material = originalMaterials.get(o.uuid)!; });
            maskMaterial.dispose();
            if (renderer && scene && camera) renderer.render(scene, camera); // Final restore render
            setIsCapturing(false);
             console.log("handleCaptureAll: Finished.");
        }
    }, [isModelLoaded, isCapturing]); // Removed isCvReady and generateCannyMap from dependencies

    // --- Render Component ---
    return (
        // Outer container
        <div className="flex flex-col h-screen bg-gray-100">

            {/* Controls Area */}
            <div className="p-3 border-b border-gray-300 bg-white shadow-md flex items-center gap-3 flex-wrap">
                <input
                    type="file"
                    accept=".glb, .gltf"
                    onChange={handleFileChange}
                    className="flex-shrink-0 text-sm border border-gray-300 rounded file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    aria-label="Upload GLB or GLTF model"
                />
                <button
                    onClick={handleLoadModel}
                    disabled={!modelFile || isLoading}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-live="polite"
                 >
                    {isLoading ? 'Loading...' : 'Load Model'}
                </button>
                <button
                    onClick={handleCaptureAll}
                    // Removed !isCvReady from disabled condition
                    disabled={!isModelLoaded || isLoading || isCapturing}
                    title={
                        !isModelLoaded ? "Load model first" : isLoading ? "Loading..." :
                        isCapturing ? "Processing..." :
                        "Capture view and mask" // Updated title
                    }
                    className={`px-3 py-1.5 text-sm text-white rounded shadow-sm transition-colors
                                ${isCapturing ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}
                                disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                     aria-live="polite"
                >
                    {isCapturing ? 'Processing...' : 'Capture View & Mask'} {/* Updated text */}
                </button>

                 {/* Status/Error Area */}
                 <div className="ml-auto flex flex-col items-end gap-0.5 text-sm text-right">
                     {error && <p className="text-red-600 m-0" role="alert">Load Error: {error}</p>}
                     {captureError && <p className="text-orange-500 m-0" role="alert">Capture Error: {captureError}</p>}
                     {isLoading && !error && <p className="text-blue-600 m-0" aria-label="Loading model">Loading model...</p>}
                     {/* Removed OpenCV status message */}
                 </div>
            </div>

            {/* Three.js Canvas Area */}
             <div ref={mountRef} className="flex-grow w-full min-h-[300px] bg-gray-300 relative overflow-hidden" aria-label="3D Model Viewer">
                 {/* Placeholder Text */}
                 {!modelFile && !isLoading && !error && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 text-center pointer-events-none px-4">
                        Select a GLB/GLTF file and click "Load Model".
                    </div>
                 )}
                 {/* Canvas gets appended here */}
             </div>

            {/* Captured Image Preview Area */}
            {/* Removed outer conditional check for capturedCannyMap */}
             {(capturedImage || capturedMask) && (
                  // Adjusted layout slightly since there are only two items now
                  <div className="p-4 border-t border-gray-300 bg-gray-50 flex justify-center items-start flex-wrap gap-6 overflow-y-auto max-h-[250px]" aria-label="Captured results preview area">
                      {capturedImage && (
                           // Adjusted width/flex basis if needed
                          <div className="flex-shrink-0 w-auto min-w-[160px] max-w-[220px]">
                              <h3 className="m-0 mb-1 text-sm font-normal text-center">Captured View:</h3>
                              <img src={capturedImage} alt="Captured view" className="w-full h-auto border border-gray-400 object-contain bg-white rounded" />
                          </div>
                      )}
                       {capturedMask && (
                           // Adjusted width/flex basis if needed
                           <div className="flex-shrink-0 w-auto min-w-[160px] max-w-[220px]">
                               <h3 className="m-0 mb-1 text-sm font-normal text-center">Generated Mask:</h3>
                               <img src={capturedMask} alt="Generated mask" className="w-full h-auto border border-gray-400 object-contain bg-gray-300 rounded" />
                           </div>
                       )}
                        {/* Removed Canny Map Preview Div */}
                  </div>
             )}
        </div>
    );
}