// app/page.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import cv from '@techstark/opencv-js'; // Import the installed package

// Helper to read File as ArrayBuffer
declare global {
    interface File {
        readAsArrayBuffer(): Promise<ArrayBuffer>;
    }
    // Add cv to window type for easier access/checking if needed, although direct import is preferred
    interface Window { cv: any; }
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
    const [captureError, setCaptureError] = useState<string | null>(null); // Capture/Canny error
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [capturedMask, setCapturedMask] = useState<string | null>(null);
    const [capturedCannyMap, setCapturedCannyMap] = useState<string | null>(null); // State for Canny map URL
    const [isCvReady, setIsCvReady] = useState<boolean>(false); // OpenCV ready state
    const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);

    // Refs for three.js objects
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    const requestRef = useRef<number | null>(null);
    const loaderRef = useRef<GLTFLoader | null>(null);

    // <<< REFINED: OpenCV Initialization using onRuntimeInitialized ---
    useEffect(() => {
        // Prevent setup if already ready or during SSR
        if (typeof window === 'undefined') {
             console.log("OpenCV Init: Skipping on server.");
             return;
        }
        if (isCvReady) {
            console.log("OpenCV Init: Already marked as ready.");
            return;
        }
        // Check if OpenCV might have initialized *before* this effect ran
        // (e.g., due to fast loading or HMR/Fast Refresh)
        // We check for a known function that appears after init. 'imread' is a good candidate.
        // Use window.cv as 'cv' import might not be fully populated yet? Check both.
        const cvLoaded = typeof cv?.imread === 'function' || typeof window?.cv?.imread === 'function';
        if (cvLoaded) {
            console.log("OpenCV Init: Detected already initialized (imread exists). Setting ready state.");
            setIsCvReady(true);
            return;
        }


        console.log('OpenCV Init: Setting up onRuntimeInitialized callback...');
        let timeoutId: NodeJS.Timeout | null = null;

        const handleCvInit = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null; // Clear timeout ref
            }
             // Double-check state to prevent setting it multiple times if callback fires unexpectedly often
            if (!isCvReady) {
                const cvFuncCheck = typeof cv?.imread === 'function' || typeof window?.cv?.imread === 'function';
                if (cvFuncCheck) {
                    console.log('>>> OpenCV.js Initialized via onRuntimeInitialized Callback! <<<');
                    console.log("OpenCV Init Callback: imread is now available.");
                    setIsCvReady(true);
                } else {
                     console.error("OpenCV Init Callback: Fired, but imread is still missing! Initialization incomplete?");
                     setError("OpenCV reported ready, but functions seem missing.");
                     // Leave isCvReady as false
                }
            } else {
                 console.log('OpenCV Init Callback: Already marked as ready, callback fired again? Ignoring.');
            }
        };

        // Assign the callback (prefer direct import if reliably populated)
        if (cv) {
            cv.onRuntimeInitialized = handleCvInit;
        } else if (window.cv) {
            // Fallback if direct import isn't setup yet? Less common.
            console.warn("OpenCV Init: Direct 'cv' import not ready, assigning callback to window.cv");
            window.cv.onRuntimeInitialized = handleCvInit;
        } else {
            console.error("OpenCV Init: 'cv' object (from import or window) not found. Cannot set initializer.");
            setError("OpenCV library script not loaded correctly.");
            return; // Cannot proceed
        }


        // Safety timeout
        timeoutId = setTimeout(() => {
            // Check if initialization succeeded *just before* the timeout fired
            const cvStillNotReady = !isCvReady && !(typeof cv?.imread === 'function' || typeof window?.cv?.imread === 'function');
            if (cvStillNotReady ) {
                console.error("OpenCV.js initialization timed out after 15 seconds.");
                setError("OpenCV failed to initialize (Timeout). Canny generation disabled.");
                // Ensure the callback won't do anything if it fires *after* the timeout
                if(cv) cv.onRuntimeInitialized = () => {}; // Use empty function instead of null
                if(window.cv) window.cv.onRuntimeInitialized = () => {}; // Use empty function instead of null
            } else if (!isCvReady) {
                 // It might have initialized right before timeout, set state if handleCvInit hasn't run yet
                 console.warn("OpenCV Init: Initialized very close to timeout or detected late.");
                 setIsCvReady(true); // Assume ready if functions exist
            }
             timeoutId = null; // Clear timeout ref
        }, 15000); // 15 seconds timeout

        // Cleanup function
        return () => {
            console.log("OpenCV Init: Cleanup effect.");
            if (timeoutId) {
                clearTimeout(timeoutId);
                console.log("OpenCV Init: Cleared pending timeout.");
            }
            // Typically avoid nullifying the callback here in case other components need it,
            // unless you are certain this is the only component managing it.
            // If needed:
            // if(cv) cv.onRuntimeInitialized = null;
            // if(window.cv) window.cv.onRuntimeInitialized = null;
        };
    // Run this effect only once on mount
    }, []); // <<< ENSURE DEPENDENCY ARRAY IS EMPTY


    // --- File Handling ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                setModelFile(file);
                setError(null);
                setCaptureError(null); // Clear capture error
                setCapturedImage(null);
                setCapturedMask(null);
                setCapturedCannyMap(null); // Clear canny preview
                clearSceneModel();
            } else {
                setError('Please upload a .glb or .gltf file.');
                setModelFile(null);
                setCaptureError(null); // Clear capture error
                setCapturedImage(null); // Clear previews on error
                setCapturedMask(null);
                setCapturedCannyMap(null);
                clearSceneModel();
            }
        } else {
             setModelFile(null);
             setError(null);
             setCaptureError(null); // Clear capture error
             setCapturedImage(null);
             setCapturedMask(null);
             setCapturedCannyMap(null); // Clear canny preview
             clearSceneModel();
        }
    };

    // --- Three.js Scene Setup Utilities ---
    const calculateFrustum = (containerWidth: number, containerHeight: number) => {
        const aspect = containerWidth / containerHeight;
        const frustumSize = 10; // Adjust base size if needed
        const halfFrustumSize = frustumSize / 2;
        return {
            left: -halfFrustumSize * aspect,
            right: halfFrustumSize * aspect,
            top: halfFrustumSize,
            bottom: -halfFrustumSize,
        };
    };

    // --- Three.js Initialization ---
    const initThreeScene = useCallback(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;

        // Avoid re-initializing if already set up
        if (rendererRef.current) {
             console.warn("Attempted to re-initialize Three.js scene.");
             return () => {}; // Return empty cleanup function
        }

        console.log("Initializing Three.js scene...");

        loaderRef.current = new GLTFLoader();
        const scene = new THREE.Scene();
        scene.userData.originalBackground = new THREE.Color(0xdddddd); // Default background
        scene.background = scene.userData.originalBackground.clone();
        sceneRef.current = scene;

        const frustum = calculateFrustum(width, height);
        const camera = new THREE.OrthographicCamera(
            frustum.left, frustum.right, frustum.top, frustum.bottom, 0.1, 1000
        );
        camera.position.z = 15; // Move camera slightly further back initially
        cameraRef.current = camera;

        // Ensure preserveDrawingBuffer is true for canvas.toDataURL()
        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;
        // Check if mountRef.current exists before appending
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        } else {
             console.error("Mount ref became null before appending renderer");
             // Cleanup potentially created objects
             renderer.dispose();
             return () => {};
        }


        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Slightly brighter ambient
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Slightly stronger directional
        directionalLight.position.set(5, 10, 7.5).normalize();
        scene.add(directionalLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = true;
        controlsRef.current = controls;

        // Resize Handling
        const handleResize = () => {
             if (cameraRef.current && rendererRef.current && mountRef.current) {
                 const newWidth = mountRef.current.clientWidth;
                 const newHeight = mountRef.current.clientHeight;
                 if (newWidth > 0 && newHeight > 0) { // Avoid size 0 errors
                     rendererRef.current.setSize(newWidth, newHeight);
                     const newFrustum = calculateFrustum(newWidth, newHeight);
                     cameraRef.current.left = newFrustum.left;
                     cameraRef.current.right = newFrustum.right;
                     cameraRef.current.top = newFrustum.top;
                     cameraRef.current.bottom = newFrustum.bottom;
                     cameraRef.current.updateProjectionMatrix();
                     console.log("Resized canvas and updated camera.");
                      // Trigger a render after resize
                      if (sceneRef.current) {
                           rendererRef.current.render(sceneRef.current, cameraRef.current);
                      }
                 }
             }
         };
        window.addEventListener('resize', handleResize);

        // Animation Loop
        let animationRunning = true; // Flag to control the loop
        const animate = () => {
            if (!animationRunning) return; // Stop loop if flag is false
            requestRef.current = requestAnimationFrame(animate);
            const controlsUpdated = controlsRef.current?.update(); // update() returns true if controls changed
             // Only render if needed (controls changed or model is animating)
            if (controlsUpdated && rendererRef.current && sceneRef.current && cameraRef.current) {
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate(); // Start animation loop

        // Initial render after setup
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            console.log("Initial render complete.");
        }

        // Cleanup function
        return () => {
             console.log("Cleaning up Three.js scene...");
             animationRunning = false; // Stop the animation loop
             if (requestRef.current) cancelAnimationFrame(requestRef.current);
             window.removeEventListener('resize', handleResize);
             controlsRef.current?.dispose();
             clearSceneModel(); // Ensure model resources are released
             if (rendererRef.current) {
                  // Check if the domElement is still a child before removing
                  if (mountRef.current && rendererRef.current.domElement.parentNode === mountRef.current) {
                      mountRef.current.removeChild(rendererRef.current.domElement);
                  }
                  rendererRef.current.dispose(); // Release WebGL resources
                  console.log("Renderer disposed.");
             }
             // Nullify refs
             sceneRef.current = null;
             cameraRef.current = null;
             rendererRef.current = null;
             controlsRef.current = null;
             loaderRef.current = null;
             modelRef.current = null;
             requestRef.current = null;
             console.log("Three.js cleanup finished.");
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Effect to run the init function and store its cleanup
    useEffect(() => {
        const cleanup = initThreeScene();
        return cleanup; // Return the cleanup function from initThreeScene
    }, [initThreeScene]); // Dependency on the memoized init function


    // --- Clear Scene Model ---
    const clearSceneModel = useCallback(() => {
        if (modelRef.current && sceneRef.current) {
            console.log("Clearing existing model from scene...");
            sceneRef.current.remove(modelRef.current);
            // Dispose geometries and materials to free GPU memory
            modelRef.current.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(mat => mat?.dispose());
                    } else if (object.material) {
                        object.material.dispose();
                    }
                }
            });
            modelRef.current = null;
            console.log("Model resources disposed.");

             // Trigger a render to show the empty scene
             if (rendererRef.current && sceneRef.current && cameraRef.current) {
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
             }
        }
         setIsModelLoaded(false);
         // Clear previews associated with the model
         setCapturedImage(null);
         setCapturedMask(null);
         setCapturedCannyMap(null); // Clear canny state
    }, []); // No dependencies needed if it only interacts with refs and state setters

   // --- Load Model Logic ---
    const handleLoadModel = useCallback(async () => {
        console.log("handleLoadModel: Triggered.");
        if (!modelFile) {
             console.warn("handleLoadModel: No model file selected.");
             setError("Please select a model file first.");
             return;
        }
        // Ensure refs needed for loading are ready
        const currentScene = sceneRef.current;
        const currentCamera = cameraRef.current;
        const currentControls = controlsRef.current;
        const currentRenderer = rendererRef.current;
        const currentLoader = loaderRef.current;

        if (!currentScene || !currentLoader || !currentCamera || !currentRenderer) {
            console.error("handleLoadModel: Scene or essential refs are not initialized.");
            setError("Scene initialization failed or refs missing. Cannot load model.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCaptureError(null); // Clear previous capture errors too
        console.log("handleLoadModel: Clearing previous model...");
        clearSceneModel(); // Clear previous model and its previews first

        try {
            console.log("handleLoadModel: Reading file buffer...");
            const buffer = await modelFile.readAsArrayBuffer();
            console.log(`handleLoadModel: Buffer length: ${buffer.byteLength} bytes.`);

            console.log("handleLoadModel: Calling loader.parse...");
            currentLoader.parse( buffer, '',
                (gltf) => { // onLoad Callback
                    console.log('>>> loader.parse -> onLoad: Success!');
                    const loadedModel = gltf.scene;

                    // Check refs again inside async callback
                    if (!loadedModel || !sceneRef.current || !cameraRef.current || !rendererRef.current) {
                         console.error(">>> loader.parse -> onLoad: Refs became null during load. Aborting.");
                         setError("Scene setup was lost during model loading.");
                         setIsModelLoaded(false); setIsLoading(false);
                         return;
                    }

                    console.log(">>> loader.parse -> onLoad: Storing modelRef and adding to scene...");
                    modelRef.current = loadedModel; // Store ref
                    sceneRef.current.add(loadedModel);
                    console.log(">>> loader.parse -> onLoad: Model added. Scene children count:", sceneRef.current.children.length);

                    // --- Auto-fit Logic ---
                    try {
                        console.log(">>> loader.parse -> onLoad: Calculating bounding box...");
                        const box = new THREE.Box3().setFromObject(loadedModel);
                        const size = box.getSize(new THREE.Vector3());
                        const center = box.getCenter(new THREE.Vector3());

                        if (!isFinite(size.length()) || size.x <= 0 || size.y <= 0 || size.z <= 0) {
                             console.warn(">>> loader.parse -> onLoad: Invalid model bounding box size:", size);
                             throw new Error("Model has invalid dimensions (possibly empty or infinite).");
                        }
                        console.log(`>>> loader.parse -> onLoad: BBox Size: x=${size.x.toFixed(2)}, y=${size.y.toFixed(2)}, z=${size.z.toFixed(2)}`);

                        const cameraHeight = cameraRef.current.top - cameraRef.current.bottom;
                        const desiredHeight = cameraHeight * 0.8; // Fit to 80% of view height
                        let scaleFactor = desiredHeight / size.y;

                        if (!isFinite(scaleFactor) || scaleFactor <= 1e-5) { // Add lower bound check
                             console.warn(`>>> loader.parse -> onLoad: Invalid or extremely small scale factor calculated (${scaleFactor}). Using default scale 1.`);
                             scaleFactor = 1;
                        } else if (scaleFactor > 1000) { // Add upper bound check
                              console.warn(`>>> loader.parse -> onLoad: Calculated scale factor (${scaleFactor}) is very large. Clamping to 1000.`);
                              scaleFactor = 1000;
                        }

                        console.log(`>>> loader.parse -> onLoad: Applying scale ${scaleFactor.toFixed(3)}`);
                        loadedModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

                        const scaledBox = new THREE.Box3().setFromObject(loadedModel);
                        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
                        if (!isFinite(scaledCenter.length())) {
                              console.warn(">>> loader.parse -> onLoad: Scaled center is invalid. Skipping repositioning.");
                         } else {
                              console.log(`>>> loader.parse -> onLoad: Repositioning model by (${-scaledCenter.x.toFixed(2)}, ${-scaledCenter.y.toFixed(2)}, ${-scaledCenter.z.toFixed(2)})`);
                              loadedModel.position.sub(scaledCenter); // Center the model at (0,0,0)
                         }

                        console.log(">>> loader.parse -> onLoad: Resetting controls target and camera position...");
                        if (controlsRef.current) {
                             controlsRef.current.target.set(0, 0, 0);
                             controlsRef.current.reset();
                             controlsRef.current.update();
                         }
                        cameraRef.current.zoom = 1;
                        cameraRef.current.updateProjectionMatrix();
                        console.log(">>> loader.parse -> onLoad: Auto-fit complete.");

                    } catch (fitError: any) {
                        console.error(">>> loader.parse -> onLoad: Could not auto-fit model:", fitError);
                         setError(`Model loaded, but auto-fit failed: ${fitError.message}`);
                    }
                    // --- End Auto-fit Logic ---

                    console.log(">>> loader.parse -> onLoad: Setting model loaded state & forcing render...");
                    setIsModelLoaded(true);
                    setIsLoading(false);
                    setError(null);

                    if (rendererRef.current && sceneRef.current && cameraRef.current) {
                        rendererRef.current.render(sceneRef.current, cameraRef.current);
                        console.log(">>> loader.parse -> onLoad: Final render successful.");
                    } else {
                        console.warn(">>> loader.parse -> onLoad: Could not perform final render as refs became null.");
                    }
                }, // End onLoad

                (error: any) => { // onError Callback
                    console.error('>>> loader.parse -> onError:', error);
                    let msg = "Failed to parse GLTF model.";
                    if (error instanceof ErrorEvent) msg += ` Network/parsing error: ${error.message}`;
                    else if (error instanceof Error) msg += ` ${error.message}`;
                    else msg += ` Unknown error during parsing. Check console for details.`;
                    setError(msg);
                    setIsModelLoaded(false); setIsLoading(false); modelRef.current = null;
                } // End onError
            ); // End parse call

        } catch (readError: any) {
            console.error('handleLoadModel: Error reading file or during parse setup:', readError);
            setError(`Failed to load model: ${readError.message}`);
            setIsModelLoaded(false); setIsLoading(false); modelRef.current = null;
        }
    }, [modelFile, clearSceneModel]); // Dependencies: file and clear function


    // <<< Generate Canny Map Helper Function ---
    const generateCannyMap = useCallback(async (imageDataUrl: string): Promise<string | null> => {
        // Use state setter directly from hook scope
        const currentSetCaptureError = setCaptureError;

        if (!isCvReady) {
            console.error("generateCannyMap: OpenCV is not ready.");
            currentSetCaptureError("OpenCV library not available for Canny generation.");
            return null;
        }
        // Check for existence of cv and necessary function
        if (!cv || typeof cv.imread !== 'function') {
             console.error("generateCannyMap: cv.imread is not available. OpenCV might be corrupted or not fully initialized.");
             currentSetCaptureError("OpenCV seems loaded but core functions are missing.");
             return null;
        }

        console.log("generateCannyMap: Starting Canny processing...");
        return new Promise((resolve, reject) => {
            const imgElement = new Image();
            imgElement.onload = () => {
                console.log("generateCannyMap: Image loaded for OpenCV.");
                let src: any = null; let gray: any = null; let blurred: any = null; let edges: any = null;
                const tempCanvas = document.createElement('canvas');

                try {
                    console.time("OpenCV Canny Processing");
                    src = cv.imread(imgElement);
                    if (!src || src.empty()) {
                         throw new Error("cv.imread failed to load the image data.");
                    }
                    console.log("generateCannyMap: imread successful.");

                    gray = new cv.Mat(); cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
                    console.log("generateCannyMap: cvtColor successful.");

                    blurred = new cv.Mat(); cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
                    console.log("generateCannyMap: GaussianBlur successful.");

                    edges = new cv.Mat(); cv.Canny(blurred, edges, 50, 150, 3, false); // Adjust thresholds 50, 150 as needed
                    console.log("generateCannyMap: Canny successful.");

                    cv.imshow(tempCanvas, edges);
                    console.log("generateCannyMap: imshow successful.");

                    const cannyDataUrl = tempCanvas.toDataURL('image/png');
                    console.timeEnd("OpenCV Canny Processing");
                    console.log("generateCannyMap: Canny map generated and converted to Data URL.");
                    resolve(cannyDataUrl);

                } catch (err: any) {
                    console.error("OpenCV Canny Error:", err);
                    const errorMsg = err instanceof Error ? err.message : String(err);
                    currentSetCaptureError(`Canny processing failed: ${errorMsg}`);
                    reject(new Error(`Canny processing failed: ${errorMsg}`)); // Reject promise
                } finally {
                    console.log("generateCannyMap: Cleaning up OpenCV Mats...");
                    src?.delete(); gray?.delete(); blurred?.delete(); edges?.delete();
                    console.log("generateCannyMap: OpenCV Mats deleted.");
                }
            };
            imgElement.onerror = (err) => {
                 console.error("generateCannyMap: Could not load image data URL into Image element.", err);
                 currentSetCaptureError("Failed to load image data for Canny processing.");
                 reject(new Error("Could not load image data for Canny.")); // Reject promise
             };
            // Ensure the data URL is valid before setting src
            if (imageDataUrl && imageDataUrl.startsWith('data:image/')) {
                imgElement.src = imageDataUrl;
            } else {
                 console.error("generateCannyMap: Invalid imageDataUrl provided.");
                 currentSetCaptureError("Invalid image data received for Canny processing.");
                 reject(new Error("Invalid image data URL for Canny.")); // Reject promise
            }
        });
    }, [isCvReady]); // Dependency: isCvReady


    // <<< Combined Capture Logic ---
    const handleCaptureAll = useCallback(async () => {
        console.log("handleCaptureAll: Triggered.");
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const model = modelRef.current;

        if (!renderer || !scene || !camera || !model || !isModelLoaded) {
            console.error('handleCaptureAll: Renderer, scene, camera, or model not ready.');
            setCaptureError('Scene/model not fully loaded or initialized. Cannot capture.');
            return;
        }

        if (isCapturing) {
            console.warn("handleCaptureAll: Capture already in progress.");
            return;
        }

        setIsCapturing(true);
        setCaptureError(null); // Clear previous capture errors
        // Clear previous results immediately
        setCapturedImage(null);
        setCapturedMask(null);
        setCapturedCannyMap(null);

        // Store original state carefully
        const originalBackground = scene.background ? scene.background.clone() : null;
        const originalMaterials = new Map<string, THREE.Material | THREE.Material[]>();
        model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (!object.uuid) object.uuid = THREE.MathUtils.generateUUID();
                originalMaterials.set(object.uuid, object.material);
            }
        });

        let capturedOriginalUrl: string | null = null;
        const maskMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const blackBackground = new THREE.Color(0x000000);

        try {
            // --- Step 0: Ensure scene is rendered with current view ---
            console.log("handleCaptureAll: Forcing initial render...");
            renderer.render(scene, camera);

            // --- Step 1. Capture Original Image ---
            console.log("handleCaptureAll: Capturing original view...");
            capturedOriginalUrl = renderer.domElement.toDataURL('image/png');
            setCapturedImage(capturedOriginalUrl);
            console.log("handleCaptureAll: Original view captured.");

            // --- Step 2. Prepare and Capture Mask Image ---
            console.log("handleCaptureAll: Preparing scene for mask capture...");
            scene.background = blackBackground;
            model.traverse((object) => {
                if (object instanceof THREE.Mesh && object.uuid && originalMaterials.has(object.uuid)) {
                    object.material = maskMaterial;
                }
            });
            console.log("handleCaptureAll: Rendering mask view...");
            renderer.render(scene, camera);

            console.log("handleCaptureAll: Capturing mask view...");
            const capturedMaskUrl = renderer.domElement.toDataURL('image/png');
            setCapturedMask(capturedMaskUrl);
            console.log("handleCaptureAll: Mask view captured.");

            // --- Step 3. Generate Canny Map ---
            if (!isCvReady) {
                 console.warn("handleCaptureAll: OpenCV not ready, Canny map will be skipped.");
                 setCaptureError("Warning: OpenCV not ready, Canny map skipped."); // Set non-blocking warning
            } else if (!capturedOriginalUrl) {
                 console.warn("handleCaptureAll: Original image missing, cannot generate Canny map.");
                 setCaptureError("Original image capture failed, Canny map skipped.");
            } else {
                console.log("handleCaptureAll: Generating Canny map...");
                 try {
                     const capturedCannyUrl = await generateCannyMap(capturedOriginalUrl); // Use the useCallback version
                     if (capturedCannyUrl) {
                        setCapturedCannyMap(capturedCannyUrl);
                        console.log("handleCaptureAll: Canny map generated successfully.");
                     } else {
                         console.warn("handleCaptureAll: Canny map generation returned null.");
                         // captureError should have been set within generateCannyMap
                     }
                 } catch (cannyError: any) {
                      console.error("handleCaptureAll: Error during Canny map generation promise:", cannyError);
                      setCaptureError(`Canny map failed: ${cannyError.message || String(cannyError)}`);
                 }
            }

            console.log("handleCaptureAll: Capture sequence completed.");

        } catch (e: any) {
            console.error("handleCaptureAll: Capture process failed:", e);
            setCaptureError(`Capture failed: ${e.message || String(e)}`);
            // Clear partial results on error
             setCapturedImage(null);
             setCapturedMask(null);
             setCapturedCannyMap(null);
        } finally {
            // --- Step 4. ALWAYS Restore Original State ---
            console.log("handleCaptureAll: Restoring original scene state...");
             // Check refs again before restoring
            const finalScene = sceneRef.current;
            const finalModel = modelRef.current;
            const finalRenderer = rendererRef.current;
            const finalCamera = cameraRef.current;

            if (finalScene) {
                 finalScene.background = originalBackground;
             }
            if (finalModel) {
                finalModel.traverse((object) => {
                    if (object instanceof THREE.Mesh && object.uuid && originalMaterials.has(object.uuid)) {
                        object.material = originalMaterials.get(object.uuid)!;
                    }
                });
            }
            maskMaterial.dispose(); // Dispose temporary material
            console.log("handleCaptureAll: Temporary mask material disposed.");

            // Force a final re-render with the original state if possible
            if (finalRenderer && finalScene && finalCamera) {
                 finalRenderer.render(finalScene, finalCamera);
                 console.log("handleCaptureAll: Scene restored and final render performed.");
            } else {
                 console.warn("handleCaptureAll: Could not perform final restore render as refs became null.");
            }

            setIsCapturing(false); // Re-enable button
            console.log("handleCaptureAll: Finished.");
        }
    }, [isModelLoaded, isCapturing, isCvReady, generateCannyMap]); // Dependencies


    // --- Render Component ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f0f0' }}>
            {/* Controls Area */}
             <div style={{ padding: '12px', borderBottom: '1px solid #ccc', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <input
                    type="file"
                    accept=".glb, .gltf"
                    onChange={handleFileChange}
                    style={{ flexShrink: 0 }}
                    aria-label="Upload GLB or GLTF model"
                />
                <button
                    onClick={handleLoadModel}
                    disabled={!modelFile || isLoading}
                    style={{ padding: '8px 12px', cursor: !modelFile || isLoading ? 'not-allowed': 'pointer', opacity: !modelFile || isLoading ? 0.6 : 1 }}
                    aria-live="polite"
                 >
                    {isLoading ? 'Loading Model...' : 'Load Model'}
                </button>
                <button
                    onClick={handleCaptureAll}
                    disabled={!isModelLoaded || isLoading || isCapturing || !isCvReady}
                    title={
                        !isModelLoaded ? "Load a model first" :
                        isLoading ? "Model is loading" :
                        isCapturing ? "Capture in progress" :
                        !isCvReady ? "OpenCV library initializing..." :
                        "Capture view, mask, and Canny map"
                    }
                    style={{
                         padding: '8px 12px',
                         cursor: (!isModelLoaded || isLoading || isCapturing || !isCvReady) ? 'not-allowed' : 'pointer',
                         background: isCapturing ? '#ccc' : (!isModelLoaded || isLoading || !isCvReady) ? '#aaa' : '#007bff', // Grey out when disabled
                         color: 'white',
                         border: 'none',
                         opacity: (!isModelLoaded || isLoading || isCapturing || !isCvReady) ? 0.6 : 1,
                     }}
                     aria-live="polite"
                >
                    {isCapturing ? 'Processing...' : 'Capture All'}
                </button>

                 {/* Status/Error Area */}
                 <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', fontSize: '0.9em', textAlign: 'right' }}>
                     {error && <p style={{ color: 'red', margin: 0 }} role="alert">Load Error: {error}</p>}
                     {captureError && <p style={{ color: 'orange', margin: 0 }} role="alert">Capture/Canny Error: {captureError}</p>}
                     {isLoading && !error && <p style={{ color: 'blue', margin: 0 }} aria-label="Loading model">Loading model...</p>}
                     {!isCvReady && !error && !captureError && <p style={{ color: 'purple', margin: 0 }} aria-label="Initializing OpenCV">Initializing OpenCV...</p>}
                 </div>
            </div>

            {/* Three.js Canvas Area */}
             <div ref={mountRef} style={{ flexGrow: 1, width: '100%', minHeight: '300px', background: '#ddd', position: 'relative', overflow: 'hidden' }} aria-label="3D Model Viewer">
                 {/* Placeholder Text */}
                 {!modelFile && !isLoading && !error && (
                    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#555', textAlign: 'center', pointerEvents: 'none'}}>
                        Select a GLB/GLTF file and click "Load Model".
                    </div>
                 )}
                 {/* Canvas gets appended here by initThreeScene */}
             </div>

            {/* Captured Image Preview Area */}
             {(capturedImage || capturedMask || capturedCannyMap) && (
                  <div style={{ padding: '15px', borderTop: '1px solid #ccc', background: '#f8f8f8', textAlign: 'center', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', overflowY: 'auto', maxHeight: '250px' /* Limit height */ }} aria-label="Captured results preview area">
                      {capturedImage && (
                          <div style={{flex: '1 1 30%', minWidth: '180px'}}>
                              <h3 style={{margin: '0 0 5px 0', fontSize: '1em', fontWeight: 'normal'}}>Captured View:</h3>
                              <img src={capturedImage} alt="Captured view of the 3D model" style={{ width: '100%', maxWidth: '200px', height: 'auto', border: '1px solid #aaa', objectFit: 'contain', background: 'white' }} />
                          </div>
                      )}
                       {capturedMask && (
                           <div style={{flex: '1 1 30%', minWidth: '180px'}}>
                               <h3 style={{margin: '0 0 5px 0', fontSize: '1em', fontWeight: 'normal'}}>Generated Mask:</h3>
                               <img src={capturedMask} alt="Generated black and white mask of the model" style={{ width: '100%', maxWidth: '200px', height: 'auto', border: '1px solid #aaa', objectFit: 'contain', background: 'grey' /* Show contrast */ }} />
                           </div>
                       )}
                        {capturedCannyMap && (
                            <div style={{flex: '1 1 30%', minWidth: '180px'}}>
                                <h3 style={{margin: '0 0 5px 0', fontSize: '1em', fontWeight: 'normal'}}>Generated Canny Map:</h3>
                                <img src={capturedCannyMap} alt="Generated Canny edge map from the captured view" style={{ width: '100%', maxWidth: '200px', height: 'auto', border: '1px solid #aaa', objectFit: 'contain', background: 'black' /* Canny often white on black */ }} />
                            </div>
                        )}
                  </div>
             )}
        </div>
    );
}