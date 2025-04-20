import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import ProjectedMaterial from 'three-projected-material';
import { UVUnwrapper } from 'xatlas-three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function ProjectedMaterialModelDemo() {
    const mountRef = useRef(null);

    // --- Refs ---
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(); // Main view camera
    const rendererRef = useRef();
    const orbitControlsRef = useRef();
    const meshRef = useRef(); // The single mesh object
    const projectedMaterialRef = useRef(); // Holds the final projected material
    const originalMaterialRef = useRef(); // Holds the original material from GLB
    const projectionOverlayRef = useRef(); // Holds the overlay mesh with projection
    const requestRef = useRef();
    
    // New refs for UV unwrapping and baking
    const unwrapperRef = useRef(null);
    const rtSceneRef = useRef(new THREE.Scene()); // Render-to-texture scene
    const rtCameraRef = useRef(); // Render-to-texture camera
    const rtRendererRef = useRef(); // Render-to-texture renderer
    const bakedTextureRef = useRef(); // The baked texture

    // --- State ---
    const [isLoading, setIsLoading] = useState(false); // General loading state
    const [status, setStatus] = useState('Load a GLB Model to start.');
    const [loadedGeometry, setLoadedGeometry] = useState(null);
    const [originalMaterial, setOriginalMaterial] = useState(null); // State for original material
    const [uploadedTexture, setUploadedTexture] = useState(null); // Texture uploaded by user
    const [snapshotCameraState, setSnapshotCameraState] = useState(null); // Store camera state from snapshot
    const [modelReady, setModelReady] = useState(false); // GLB loaded?
    const [snapshotTaken, setSnapshotTaken] = useState(false); // Snapshot downloaded?
    const [textureReady, setTextureReady] = useState(false); // User texture loaded?
    const [isProjected, setIsProjected] = useState(false); // Final projection done?
    
    // New state for unwrap and baking process
    const [unwrapReady, setUnwrapReady] = useState(false);
    const [textureSize, setTextureSize] = useState(1024);
    const [isBaked, setIsBaked] = useState(false);
    const [uvUnwrapped, setUvUnwrapped] = useState(false);

    // === Initialize xatlas unwrapper ===
    useEffect(() => {
        const initUnwrapper = async () => {
            try {
                setStatus('Initializing UV unwrapper...');
                setIsLoading(true);
                
                // Create unwrapper instance
                unwrapperRef.current = new UVUnwrapper({
                    BufferAttribute: THREE.BufferAttribute
                });
                
                // Configure unwrapper options
                unwrapperRef.current.chartOptions = {
                    fixWinding: false,
                    maxBoundaryLength: 0,
                    maxChartArea: 0,
                    maxCost: 2,
                    maxIterations: 1,
                    normalDeviationWeight: 2,
                    normalSeamWeight: 4,
                    roundnessWeight: 0.01,
                    straightnessWeight: 6,
                    textureSeamWeight: 0.5,
                    useInputMeshUvs: true, // Use existing UVs if available
                };
                
                unwrapperRef.current.packOptions = {
                    bilinear: true,
                    blockAlign: false,
                    bruteForce: false,
                    createImage: false,
                    maxChartSize: 0,
                    padding: 2, // Add padding between UV islands
                    resolution: textureSize,
                    rotateCharts: true,
                    rotateChartsToAxis: true,
                    texelsPerUnit: 0
                };
                
                // Load the xatlas library with better logging
                console.log('Starting to load xatlas library...');
                await unwrapperRef.current.loadLibrary(
                    (mode, progress) => {
                        console.log(`Loading xatlas: ${mode} - ${Math.round(progress * 100)}%`);
                        setStatus(`Loading xatlas: ${mode} - ${Math.floor(progress * 100)}%`);
                    },
                    'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.wasm',
                    'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.js'
                );
                
                console.log('xatlas library loaded. Available methods:', 
                    Object.getOwnPropertyNames(Object.getPrototypeOf(unwrapperRef.current)));
                
                setUnwrapReady(true);
                setStatus('UV unwrapper initialized and ready.');
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to initialize unwrapper:', error);
                setStatus(`Failed to initialize unwrapper: ${error.message}`);
                setIsLoading(false);
            }
        };
        
        initUnwrapper();
        
        // Clean up
        return () => {
            unwrapperRef.current = null;
        };
    }, [textureSize]);
    
    // Initialize render-to-texture renderer
    useEffect(() => {
        // Create a renderer for texture baking
        rtRendererRef.current = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true
        });
        rtRendererRef.current.setSize(textureSize, textureSize);
        
        // Create an orthographic camera for texture baking
        rtCameraRef.current = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        rtCameraRef.current.position.set(0, 0, 1);
        rtCameraRef.current.lookAt(0, 0, 0);
        
        // Clean up
        return () => {
            rtRendererRef.current?.dispose();
            rtRendererRef.current = null;
        };
    }, [textureSize]);

    // === File Handling: Load GLB ===
    const handleGlbLoad = useCallback((event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        // --- Reset ALL relevant states ---
        setModelReady(false); 
        setSnapshotTaken(false); 
        setTextureReady(false); 
        setIsProjected(false);
        setUvUnwrapped(false);
        setIsBaked(false);
        setSnapshotCameraState(null);
        setUploadedTexture(prev => { prev?.dispose(); return null; });
        projectedMaterialRef.current?.dispose(); projectedMaterialRef.current = null;
        
        // Cleanup overlay mesh if it exists
        if (projectionOverlayRef.current) {
            if (meshRef.current) {
                meshRef.current.remove(projectionOverlayRef.current);
            }
            projectionOverlayRef.current.geometry?.dispose();
            projectionOverlayRef.current.material?.dispose();
            projectionOverlayRef.current = null;
        }
        
        setLoadedGeometry(prev => { prev?.dispose(); return null; });
        setOriginalMaterial(prev => { prev?.dispose(); return null; });
        originalMaterialRef.current?.dispose(); originalMaterialRef.current = null;

        const reader = new FileReader();
        reader.onload = (e) => {
            setIsLoading(true); setStatus('Loading GLB...');
            const loader = new GLTFLoader();
            loader.parse(e.target.result, '', (gltf) => {
                let foundGeometry = null;
                let foundMaterial = null;
                let foundMesh = null;

                gltf.scene.traverse((child) => {
                    if (child.isMesh && !foundGeometry) {
                        console.log("Found mesh in GLB:", child.name);
                        foundGeometry = child.geometry.clone();
                        
                        // Store the original material (can be a single material or array)
                        if (Array.isArray(child.material)) {
                            // Handle multi-material case
                            foundMaterial = child.material.map(mat => mat.clone());
                        } else if (child.material) {
                            // Handle single material case
                            foundMaterial = child.material.clone();
                        }
                        
                        // Keep reference to the found mesh
                        foundMesh = child;
                        
                        // Apply world transform to geometry
                        child.updateMatrixWorld(true); 
                        foundGeometry.applyMatrix4(child.matrixWorld);
                        
                        // Don't reset transforms here, as we want to preserve original state
                        foundGeometry.computeVertexNormals(); 
                        foundGeometry.center(); 
                        foundGeometry.computeBoundingSphere();
                    }
                });
                
                if (foundGeometry) {
                    console.log("Setting loaded geometry and original material state.");
                    setLoadedGeometry(foundGeometry);
                    
                    if (foundMaterial) {
                        setOriginalMaterial(foundMaterial);
                        originalMaterialRef.current = foundMaterial;
                        console.log("Original material stored:", foundMaterial);
                    }
                    
                    setStatus('Model loaded with original textures. First unwrap UVs before taking snapshot.');
                    setModelReady(true);
                } else {
                    setStatus('Error: No mesh found in GLB.');
                    setLoadedGeometry(null);
                    setOriginalMaterial(null);
                    originalMaterialRef.current = null;
                }
                setIsLoading(false);
            }, (error) => {
                 setStatus('Error loading GLB.'); console.error('Error parsing GLTF:', error);
                 setLoadedGeometry(null);
                 setOriginalMaterial(null);
                 originalMaterialRef.current = null;
                 setIsLoading(false);
            });
        };
        reader.onerror = () => { 
            setStatus('Error reading GLB file.'); 
            setIsLoading(false); 
            setOriginalMaterial(null);
            originalMaterialRef.current = null;
        };
        reader.readAsArrayBuffer(file); event.target.value = '';
    }, []);

    // === Scene Setup Effect ===
    useEffect(() => {
        if (!mountRef.current) {
            console.error("Mount point not found on initial setup.");
            return;
        };
        const currentMount = mountRef.current;
        const scene = sceneRef.current;
        console.log("Setting up Scene...");

        // --- Renderer ---
        try {
            // --- Ensure preserveDrawingBuffer is TRUE ---
            rendererRef.current = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
            rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
            rendererRef.current.setPixelRatio(window.devicePixelRatio);
            rendererRef.current.shadowMap.enabled = true;
            currentMount.appendChild(rendererRef.current.domElement);
            console.log("Renderer created and appended.", currentMount.clientWidth, currentMount.clientHeight);
        } catch (error) {
            console.error("Error creating renderer:", error);
            return;
        }

        // --- Camera ---
        cameraRef.current = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        cameraRef.current.position.set(0, 1.5, 5);
        scene.add(cameraRef.current);

        // --- Controls ---
        orbitControlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        orbitControlsRef.current.enableDamping = true;
        orbitControlsRef.current.target.set(0, 0, 0);

        // --- Lights ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 10, 7.5); directionalLight.castShadow = true; scene.add(directionalLight);

        // --- Resize Handler ---
        const handleResize = () => {
            if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            console.log("Resizing to:", width, height);
            if (width > 0 && height > 0) {
                 rendererRef.current.setSize(width, height);
                 cameraRef.current.aspect = width / height;
                 cameraRef.current.updateProjectionMatrix();
            } else {
                 console.warn("Resize skipped: Invalid dimensions (0).");
            }
        };
        window.addEventListener('resize', handleResize);
        // Call resize once initially after setup
        handleResize();

        // --- Animation Loop ---
        let isActive = true;
        const animate = () => {
            if (!isActive) return;
            requestRef.current = requestAnimationFrame(animate);
            orbitControlsRef.current?.update();
            if(rendererRef.current && sceneRef.current && cameraRef.current) {
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();
        console.log("Scene setup complete, animation loop started.");

        // --- Cleanup ---
        return () => {
            console.log("Cleaning up Scene...");
            isActive = false;
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', handleResize);
            orbitControlsRef.current?.dispose();
            if (sceneRef.current) {
                 if(ambientLight) sceneRef.current.remove(ambientLight);
                 if(directionalLight) sceneRef.current.remove(directionalLight);
                 if(cameraRef.current) sceneRef.current.remove(cameraRef.current);
            }
            ambientLight?.dispose();
            directionalLight?.dispose();
            // Dispose globally managed refs
            projectedMaterialRef.current?.dispose();
            originalMaterialRef.current?.dispose();
            
            // Cleanup overlay mesh if it exists
            if (projectionOverlayRef.current) {
                projectionOverlayRef.current.geometry?.dispose();
                projectionOverlayRef.current.material?.dispose();
                projectionOverlayRef.current = null;
            }

            if (rendererRef.current) rendererRef.current.dispose();
            if (currentMount && rendererRef.current?.domElement) {
                try { currentMount.removeChild(rendererRef.current.domElement); } catch (e) {}
            }
        };
    }, []);

    // === Mesh Creation/Update Effect ===
    useEffect(() => {
        console.log("Mesh Effect: Triggered. loadedGeometry:", loadedGeometry ? "Exists" : "null");
        if (!sceneRef.current) {
            console.error("Mesh Effect: Scene ref not ready.");
            return;
        }
        const scene = sceneRef.current;

        // --- Cleanup Logic ---
        if (meshRef.current && (meshRef.current.geometry !== loadedGeometry || !loadedGeometry)) {
            console.log("Mesh Effect: Removing previous mesh. Reason:", !loadedGeometry ? "Geometry is null" : "Geometry changed");
            
            // Cleanup projection overlay if it exists
            if (projectionOverlayRef.current) {
                meshRef.current.remove(projectionOverlayRef.current);
                projectionOverlayRef.current.geometry?.dispose();
                projectionOverlayRef.current.material?.dispose();
                projectionOverlayRef.current = null;
            }
            
            scene.remove(meshRef.current);
            if (meshRef.current.material && 
                meshRef.current.material !== projectedMaterialRef.current && 
                meshRef.current.material !== originalMaterialRef.current) {
                console.log("Mesh Effect: Disposing non-preserved material.");
                meshRef.current.material.dispose();
            }
            meshRef.current = null;
        }

        // --- Creation Logic ---
        if (loadedGeometry && !meshRef.current) {
            console.log("Mesh Effect: Creating new mesh...");
            try {
                // Use original material if available, otherwise fallback to default
                const initialMaterial = originalMaterial || new THREE.MeshStandardMaterial({ 
                    color: 0xcccccc, 
                    roughness: 0.7, 
                    name: 'InitialMaterial'
                });
                
                meshRef.current = new THREE.Mesh(loadedGeometry, initialMaterial);
                meshRef.current.name = "LoadedMesh";
                meshRef.current.position.set(0, 0, 0); 
                meshRef.current.castShadow = true; 
                meshRef.current.receiveShadow = true;
                scene.add(meshRef.current);
                console.log("Mesh Effect: Mesh created and added to scene with material:", initialMaterial);
            } catch (error) {
                console.error("Mesh Effect: Error creating mesh:", error);
                setStatus(`Error creating mesh: ${error.message}`);
                meshRef.current = null;
            }
        } else if (loadedGeometry && meshRef.current) {
            console.log("Mesh Effect: Mesh exists and geometry is current.");
        } else if (!loadedGeometry) {
            console.log("Mesh Effect: No geometry loaded.");
        }
    }, [loadedGeometry, originalMaterial]);

    // === Handle unwrapping the model's UVs ===
    const handleUnwrapUVs = useCallback(async () => {
        if (!meshRef.current || !unwrapperRef.current || !unwrapReady) {
            setStatus('Unable to unwrap UVs: Mesh or unwrapper not ready.');
            return;
        }
        
        try {
            setIsLoading(true);
            setStatus('Unwrapping UVs...');
            
            // Debug what methods are available
            console.log('Available methods on unwrapper:', 
                Object.getOwnPropertyNames(Object.getPrototypeOf(unwrapperRef.current)));
            
            // Get the geometry of the current mesh
            const geometry = meshRef.current.geometry;
            
            // Make sure the geometry is indexed
            const indexedGeometry = geometry.index ? geometry : mergeVertices(geometry);
            
            // Store original material and UVs
            const originalMaterial = meshRef.current.material;
            const originalUVs = geometry.attributes.uv ? geometry.attributes.uv.clone() : null;
            
            console.log('Unwrapping geometry using packAtlas...');
            // Use packAtlas instead of unwrap - this is the correct API method
            const atlas = await unwrapperRef.current.packAtlas([indexedGeometry]);
            
            if (atlas && atlas.geometries && atlas.geometries[0]) {
                // Apply the unwrapped geometry back to the mesh
                meshRef.current.geometry = atlas.geometries[0];
                meshRef.current.material = originalMaterial;
                
                // Store original UVs in uv2 if they existed
                if (originalUVs) {
                    meshRef.current.geometry.setAttribute('uv2', originalUVs);
                }
                
                console.log('UVs unwrapped successfully!');
                setStatus('UVs unwrapped successfully! Now position view and take snapshot.');
                setUvUnwrapped(true);
            } else {
                throw new Error('Unwrapping did not return valid geometry');
            }
            
        } catch (error) {
            console.error('Error unwrapping UVs:', error);
            setStatus(`Failed to unwrap UVs: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [unwrapReady]);

    // === Take Snapshot & Download ===
    const handleTakeSnapshot = useCallback(() => {
        // Add more detailed prerequisite checks
        if (!modelReady) { console.warn("Snapshot aborted: Model not ready."); return; }
        if (!cameraRef.current) { console.warn("Snapshot aborted: Camera not ready."); return; }
        if (!rendererRef.current) { console.warn("Snapshot aborted: Renderer not ready."); return; }
        if (!sceneRef.current) { console.warn("Snapshot aborted: Scene not ready."); return; }
        if (isLoading) { console.warn("Snapshot aborted: Still loading."); return; }
        if (!uvUnwrapped) { console.warn("Snapshot aborted: Please unwrap UVs first."); 
            setStatus("Please unwrap UVs before taking a snapshot."); return; }
        if (snapshotTaken && !isProjected) { console.warn("Snapshot may be taken again, resetting flags."); }

        // If we're taking a new snapshot, clean up the old projection overlay
        if (projectionOverlayRef.current && meshRef.current) {
            console.log("Cleaning up previous projection overlay for new snapshot");
            meshRef.current.remove(projectionOverlayRef.current);
            projectionOverlayRef.current.geometry?.dispose();
            projectionOverlayRef.current.material?.dispose();
            projectionOverlayRef.current = null;
        }

        setStatus('Capturing snapshot...');
        setIsLoading(true);
        // Reset flags for a new snapshot cycle if needed
        setSnapshotTaken(false);
        setTextureReady(false);
        setIsProjected(false);
        setIsBaked(false);
        setUploadedTexture(prev => { prev?.dispose(); return null; });

        console.log("Attempting to capture snapshot...");

        // 1. Capture Camera State
        const cam = cameraRef.current;
        cam.updateMatrixWorld();
        const stateToSave = {
            position: cam.position.clone(),
            quaternion: cam.quaternion.clone(),
            fov: cam.fov,
            aspect: cam.aspect,
            near: cam.near,
            far: cam.far,
        };
        setSnapshotCameraState(stateToSave);
        console.log("Camera state captured:", stateToSave);

        // Use setTimeout to allow UI update and ensure render cycle completes
        setTimeout(() => {
            if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
                console.error("Snapshot failed: Refs became invalid during timeout.");
                setStatus("Snapshot failed: Internal error.");
                setIsLoading(false);
                setSnapshotCameraState(null);
                return;
            }

            try {
                // 2. Force Render
                console.log("Forcing render before capture...");
                rendererRef.current.render(sceneRef.current, cameraRef.current);
                console.log("Render completed.");

                // 3. Get Data URL
                console.log("Getting Data URL...");
                const dataURL = rendererRef.current.domElement.toDataURL('image/png');

                // --- VERY IMPORTANT CHECK ---
                if (!dataURL || dataURL === 'data:,') {
                     console.error("Failed to get valid Data URL. Canvas might be blank or tainted. DataURL:", dataURL);
                     console.log("Canvas dimensions:", rendererRef.current.domElement.width, rendererRef.current.domElement.height);
                    throw new Error('Failed to get valid image data from canvas.');
                }
                console.log("Data URL obtained (length):", dataURL.length);

                // 4. Create download link
                console.log("Creating download link...");
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = 'model_snapshot.png';
                document.body.appendChild(link);
                console.log("Clicking download link...");
                link.click();
                console.log("Removing download link...");
                document.body.removeChild(link);

                setStatus('Snapshot downloaded. Upload the image for projection.');
                setSnapshotTaken(true); // Mark snapshot as done for this cycle
                // Reset texture/projection state explicitly
                setTextureReady(false);
                setIsProjected(false);
                setIsBaked(false);

            } catch (error) {
                console.error("Error taking snapshot:", error);
                setStatus(`Snapshot failed: ${error.message}. Check console.`);
                setSnapshotCameraState(null);
                setSnapshotTaken(false);
            } finally {
                setIsLoading(false);
            }
        }, 50); // 50ms delay

    }, [modelReady, isLoading, isProjected, snapshotTaken, uvUnwrapped]);

    // === File Handling: Upload Projection Texture ===
    const handleTextureUpload = useCallback((event) => {
        const file = event.target.files?.[0];
        if (!file || !snapshotTaken) { // Require snapshot before upload
            console.warn("Texture upload prevented: Snapshot not taken yet.");
            if(!snapshotTaken) setStatus("Please take a snapshot before uploading.")
            return;
        };

        setTextureReady(false);
        setIsProjected(false);
        setIsBaked(false);

        const reader = new FileReader();
        reader.onload = (e) => {
             setIsLoading(true); setStatus('Loading texture...');
             const loader = new THREE.TextureLoader();
             loader.load(e.target.result, (texture) => {
                 setUploadedTexture(prev => {
                     prev?.dispose();
                     texture.needsUpdate = true; texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter;
                     texture.wrapS = THREE.ClampToEdgeWrapping; texture.wrapT = THREE.ClampToEdgeWrapping; texture.generateMipmaps = false;
                     return texture;
                 });
                 setStatus('Texture uploaded. Click Project.');
                 setTextureReady(true);
                 setIsLoading(false);
             }, undefined, (error) => {
                 setStatus('Error loading texture.'); console.error('Error loading texture:', error);
                 setUploadedTexture(prev => { prev?.dispose(); return null; });
                 setIsLoading(false);
             });
         };
         reader.onerror = () => { setStatus('Error reading image file.'); setIsLoading(false); };
         reader.readAsDataURL(file); event.target.value = '';
    }, [snapshotTaken]);

    // === Project Uploaded Image ===
    const handleProject = useCallback(() => {
        // Check all prerequisites clearly
        if (!meshRef.current) { console.warn("Project aborted: Mesh not ready."); return; }
        if (!snapshotCameraState) { console.warn("Project aborted: Snapshot state missing."); return; }
        if (!uploadedTexture) { console.warn("Project aborted: Texture not uploaded."); return; }
        if (isLoading) { console.warn("Project aborted: Still loading."); return; }
        if (isProjected) { console.warn("Project aborted: Already projected."); return; }

        setIsLoading(true); setStatus('Projecting texture...');
        let tempCamera = null;

        setTimeout(() => {
            try {
                // Create temporary camera using *stored state*
                tempCamera = new THREE.PerspectiveCamera(
                    snapshotCameraState.fov, snapshotCameraState.aspect,
                    snapshotCameraState.near, snapshotCameraState.far
                );
                tempCamera.position.copy(snapshotCameraState.position);
                tempCamera.quaternion.copy(snapshotCameraState.quaternion);
                tempCamera.updateMatrixWorld();
                console.log("Temporary projection camera created from saved state.");

                // Clean up previous projection if exists
                if (projectionOverlayRef.current) {
                    console.log("Removing previous projection overlay");
                    meshRef.current.remove(projectionOverlayRef.current);
                    projectionOverlayRef.current.geometry?.dispose();
                    projectionOverlayRef.current.material?.dispose();
                    projectionOverlayRef.current = null;
                }

                // Create a new projection material
                const projectionMaterial = new ProjectedMaterial({
                    camera: tempCamera,
                    texture: uploadedTexture,
                    color: 0xffffff,
                    roughness: 0.8,
                    metalness: 0.1,
                    textureScale: 1.0,
                    backgroundOpacity: 0.0,  // Make non-projected areas transparent
                    cover: false,             // Cover the entire visible area
                    transparent: true,       // Enable transparency for blending
                    opacity: 1,            // Slightly transparent to see original texture
                    side: THREE.FrontSide,   // Only render front faces
                    depthTest: true,         // Add this to respect occlusion
                    depthWrite: true,        // Add this to ensure proper depth writing
                });
                
                // Store the material reference
                projectedMaterialRef.current = projectionMaterial;

                // Create a clone of the mesh to use as an overlay
                const overlayGeometry = meshRef.current.geometry.clone();
                projectionOverlayRef.current = new THREE.Mesh(overlayGeometry, projectionMaterial);
                projectionOverlayRef.current.name = 'projectionOverlay';
                
                // Scale slightly larger to avoid z-fighting (1.001 = 0.1% larger)
                projectionOverlayRef.current.scale.set(1.00, 1.00, 1.000);
                
                // Add the overlay as a child of the original mesh
                meshRef.current.add(projectionOverlayRef.current);
                
                // Project the material onto the overlay mesh
                projectionMaterial.project(projectionOverlayRef.current);

                setStatus('Projection overlaid on top of original textures! Ready to bake texture.');
                setIsProjected(true);
                console.log("Projection overlay created and applied successfully");

            } catch (error) {
                console.error("Error during projection:", error);
                setStatus(`Projection failed: ${error.message}`);
                
                // Clean up on error
                if (projectionOverlayRef.current) {
                    meshRef.current.remove(projectionOverlayRef.current);
                    projectionOverlayRef.current.geometry?.dispose();
                    projectionOverlayRef.current.material?.dispose();
                    projectionOverlayRef.current = null;
                }
                
                projectedMaterialRef.current?.dispose();
                projectedMaterialRef.current = null;
                setIsProjected(false);
                
            } finally {
                tempCamera?.clear();
                setIsLoading(false);
            }
        }, 10);

    }, [snapshotCameraState, uploadedTexture, isLoading, isProjected]);
    
    // Function to remove the projection overlay
    const handleRevertToOriginal = useCallback(() => {
        if (!meshRef.current || !projectionOverlayRef.current) {
            console.warn("Cannot revert: No projection overlay exists");
            return;
        }
        
        // Remove the projection overlay
        meshRef.current.remove(projectionOverlayRef.current);
        
        // Dispose resources
        projectionOverlayRef.current.geometry?.dispose();
        projectionOverlayRef.current.material?.dispose();
        projectionOverlayRef.current = null;
        
        projectedMaterialRef.current?.dispose();
        projectedMaterialRef.current = null;
        
        setStatus('Removed projection overlay. Original texture visible.');
        setIsProjected(false);
        setIsBaked(false);
    }, []);
    
    // Add a function to adjust the opacity of the projection
    const handleAdjustProjectionOpacity = useCallback((opacity) => {
        if (!projectionOverlayRef.current || !projectionOverlayRef.current.material) {
            return;
        }
        
        // Adjust opacity
        projectionOverlayRef.current.material.opacity = opacity;
        projectionOverlayRef.current.material.needsUpdate = true;
        
        setStatus(`Adjusted projection opacity to ${opacity.toFixed(2)}`);
    }, []);

    // === Function to bake the projected texture to a new UV texture ===
    const handleBakeTexture = useCallback(async () => {
        if (!meshRef.current || !projectionOverlayRef.current || !isProjected) {
            setStatus('Cannot bake: No projection active.');
            return;
        }
        
        try {
            setIsLoading(true);
            setStatus('Baking texture...');
            
            // We'll use a simpler, more direct approach that will actually work
            
            // 1. Create a render target
            const renderTarget = new THREE.WebGLRenderTarget(textureSize, textureSize, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                generateMipmaps: true
            });
            
            // 2. Save the current camera position for restoration later
            const currentCameraPosition = cameraRef.current.position.clone();
            const currentCameraQuaternion = cameraRef.current.quaternion.clone();
            
            // 3. Set camera to match the projection camera exactly
            cameraRef.current.position.copy(snapshotCameraState.position);
            cameraRef.current.quaternion.copy(snapshotCameraState.quaternion);
            cameraRef.current.updateMatrixWorld(true);
            
            // 4. Temporarily hide anything we don't want in the texture
            const sceneBackground = sceneRef.current.background;
            sceneRef.current.background = null;
            
            // 5. Render the scene to the render target
            rendererRef.current.setRenderTarget(renderTarget);
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            rendererRef.current.setRenderTarget(null);
            
            // 6. Restore scene state
            sceneRef.current.background = sceneBackground;
            cameraRef.current.position.copy(currentCameraPosition);
            cameraRef.current.quaternion.copy(currentCameraQuaternion);
            cameraRef.current.updateMatrixWorld(true);
            
            // 7. Create a new Data Texture from the render target
            const pixelBuffer = new Uint8Array(4 * textureSize * textureSize);
            rendererRef.current.readRenderTargetPixels(
                renderTarget, 0, 0, textureSize, textureSize, pixelBuffer
            );
            
            const bakedTexture = new THREE.DataTexture(
                pixelBuffer,
                textureSize,
                textureSize,
                THREE.RGBAFormat
            );
            bakedTexture.needsUpdate = true;
            bakedTexture.flipY = true; // Important!
            
            // Store the baked texture
            bakedTextureRef.current = bakedTexture;
            
            // 8. Create a new material with the baked texture
            const bakedMaterial = new THREE.MeshStandardMaterial({
                map: bakedTexture,
                roughness: 0.8,
                metalness: 0.1
            });
            
            // Remove the projection overlay
            handleRevertToOriginal();
            
            // Apply the baked material
            meshRef.current.material = bakedMaterial;
            
            // Clean up
            renderTarget.dispose();
            
            setStatus('Texture baked successfully! Ready for export.');
            setIsBaked(true);
            
        } catch (error) {
            console.error('Error baking texture:', error);
            setStatus(`Failed to bake texture: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [isProjected, textureSize, handleRevertToOriginal, snapshotCameraState]);

    // === Function to export the model with baked texture ===
    const handleExportModel = useCallback(() => {
        if (!meshRef.current || !bakedTextureRef.current || !isBaked) {
            setStatus('Cannot export: No baked texture available.');
            return;
        }
        
        try {
            setIsLoading(true);
            setStatus('Exporting model...');
            
            // Ensure the texture is set correctly
            console.log('Material before export:', meshRef.current.material);
            
            // Force a material update to ensure texture is applied
            if (meshRef.current.material) {
                meshRef.current.material.needsUpdate = true;
                
                // Ensure the texture is properly attached
                if (bakedTextureRef.current) {
                    meshRef.current.material.map = bakedTextureRef.current;
                    meshRef.current.material.map.needsUpdate = true;
                }
            }
            
            // Create a scene for export with the mesh
            const exportScene = new THREE.Scene();
            
            // Clone the current mesh - IMPORTANT: use deep clone
            const exportMesh = meshRef.current.clone();
            
            // CRITICAL: Create a separate material instance for export
            exportMesh.material = new THREE.MeshStandardMaterial({
                map: bakedTextureRef.current,
                roughness: 0.8,
                metalness: 0.1
            });
            
            // Make sure the texture is applied
            exportMesh.material.map.needsUpdate = true;
            exportMesh.material.needsUpdate = true;
            
            // Add to the export scene
            exportScene.add(exportMesh);
            
            console.log('Export mesh:', exportMesh);
            console.log('Export material:', exportMesh.material);
            console.log('Export texture:', exportMesh.material.map);
            
            // Export options
            const options = {
                binary: true,
                embedImages: true,
                includeCustomExtensions: true,
                forceIndices: true,        // Force indexed geometry
                forcePowerOfTwoTextures: false  // Allow non-power-of-two textures
            };
            
            // Do the export
            const exporter = new GLTFExporter();
            exporter.parse(
                exportScene,
                (result) => {
                    // Create download link
                    const blob = new Blob([result], { type: 'application/octet-stream' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'model_with_baked_texture.glb';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    
                    setStatus('Model exported successfully with baked texture!');
                    setIsLoading(false);
                },
                (error) => {
                    console.error('Error exporting model:', error);
                    setStatus(`Failed to export model: ${error.message}`);
                    setIsLoading(false);
                },
                options
            );
            
        } catch (error) {
            console.error('Error in export process:', error);
            setStatus(`Export process failed: ${error.message}`);
            setIsLoading(false);
        }
    }, [isBaked]);

    // === JSX Rendering ===
    return (
        <div className="relative h-screen w-screen overflow-hidden bg-gray-800 font-sans text-gray-200">
            {/* Controls UI Panel */}
            <div className="absolute left-3 top-3 z-10 flex w-64 flex-col gap-4 rounded-lg bg-black/70 p-4 shadow-lg">
                <h2 className="mb-2 text-center text-lg font-bold">Texture Projection Workflow</h2>
                
                {/* Step 1: Load GLB */}
                <div>
                    <label htmlFor="glbInput" className="mb-1 block text-sm font-medium text-gray-300">(1) Load GLB Model:</label>
                    <input type="file" id="glbInput" accept=".glb,.gltf" onChange={handleGlbLoad} disabled={isLoading} className="block w-full cursor-pointer rounded-md border border-gray-600 bg-gray-700 text-sm text-gray-300 file:mr-4 file:cursor-pointer file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>
                
                {/* Step 2: Unwrap UVs */}
                <button 
                    onClick={handleUnwrapUVs} 
                    disabled={!modelReady || isLoading || !unwrapReady || uvUnwrapped} 
                    className={`mt-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${uvUnwrapped ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'} disabled:cursor-not-allowed disabled:bg-gray-500 disabled:opacity-70`}
                >
                    {uvUnwrapped ? '✔ UVs Unwrapped' : '(2) Unwrap UV Coordinates'}
                </button>

                {/* Step 3: Take Snapshot */}
                <button 
                    onClick={handleTakeSnapshot} 
                    disabled={!modelReady || isLoading || !uvUnwrapped} 
                    className={`mt-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${snapshotTaken ? 'bg-gray-500' : 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500'} disabled:cursor-not-allowed disabled:bg-gray-500 disabled:opacity-70`}
                >
                    {snapshotTaken ? '✔ Snapshot Taken (Upload Image)' : '(3) Take Snapshot & Download'}
                </button>

                {/* Step 4: Upload Texture */}
                <div>
                    <label htmlFor="textureInput" className={`mb-1 block text-sm font-medium ${snapshotTaken ? 'text-gray-300' : 'text-gray-500'}`}>(4) Upload Projection Image:</label>
                    <input 
                        type="file" 
                        id="textureInput" 
                        accept="image/*" 
                        onChange={handleTextureUpload} 
                        disabled={!snapshotTaken || isLoading || isProjected} 
                        className="block w-full cursor-pointer rounded-md border border-gray-600 bg-gray-700 text-sm text-gray-300 file:mr-4 file:cursor-pointer file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                {/* Step 5: Project Button */}
                <button 
                    onClick={handleProject} 
                    disabled={!snapshotTaken || !textureReady || isLoading || isProjected} 
                    className="mt-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:opacity-70"
                >
                    {isProjected ? '✔ Projection Applied' : '(5) Project Uploaded Image'}
                </button>
                
                {/* Step 6: Bake Texture */}
                <button 
                    onClick={handleBakeTexture} 
                    disabled={!isProjected || isLoading || isBaked} 
                    className={`mt-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${isBaked ? 'bg-gray-500' : 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'} disabled:cursor-not-allowed disabled:bg-gray-500 disabled:opacity-70`}
                >
                    {isBaked ? '✔ Texture Baked' : '(6) Bake Projection to Texture'}
                </button>
                
                {/* Step 7: Export Model */}
                <button 
                    onClick={handleExportModel} 
                    disabled={!isBaked || isLoading} 
                    className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:opacity-70"
                >
                    (7) Export Model with Baked Texture
                </button>
                
                {/* Texture Size Controls */}
                <div className="mt-4 space-y-2 border-t border-gray-600 pt-3">
                    <label htmlFor="textureSizeSelect" className="block text-sm font-medium text-gray-300">Texture Resolution:</label>
                    <select 
                        id="textureSizeSelect" 
                        value={textureSize} 
                        onChange={(e) => setTextureSize(Number(e.target.value))}
                        disabled={isLoading || isBaked}
                        className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 pl-3 pr-10 text-base text-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value={512}>512 x 512</option>
                        <option value={1024}>1024 x 1024</option>
                        <option value={2048}>2048 x 2048</option>
                        <option value={4096}>4096 x 4096</option>
                    </select>
                </div>
                
                {/* Projection Controls - Only shown when projection is active */}
                {isProjected && !isBaked && (
                    <div className="mt-2 space-y-3 rounded-md border border-gray-600 bg-gray-800/50 p-3">
                        <h3 className="text-xs font-semibold uppercase text-gray-400">Projection Controls</h3>
                        
                        {/* Opacity Slider */}
                        <div>
                            <label htmlFor="opacitySlider" className="mb-1 block text-xs text-gray-400">Opacity:</label>
                            <input 
                                type="range" 
                                id="opacitySlider" 
                                min="0.1" 
                                max="1" 
                                step="0.05" 
                                defaultValue="0.9"
                                onChange={(e) => handleAdjustProjectionOpacity(parseFloat(e.target.value))}
                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
                            />
                        </div>
                        
                        {/* Remove Projection Button */}
                        <button 
                            onClick={handleRevertToOriginal} 
                            className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            Remove Projection
                        </button>
                    </div>
                )}

                {/* Status & Guidance */}
                <div className="mt-3 space-y-1 border-t border-gray-600 pt-3">
                    <div className="italic text-sm text-gray-400">{status}</div>
                    {isLoading && <div className="font-semibold text-yellow-400">Loading...</div>}
                </div>
            </div>

            {/* Canvas Container */}
            <div ref={mountRef} className="absolute inset-0 h-full w-full" />
        </div>
    );
}

export default ProjectedMaterialModelDemo;