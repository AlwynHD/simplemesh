import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import ProjectedMaterial, { allocateProjectionData } from '@/components/retexture-components/CustomProjectedMaterial';
import { UVUnwrapper } from 'xatlas-three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { imageUpscaler } from '@/components/retexture-components/retextureActions';

// UI Components
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Icons
import { Image, X, RefreshCw, Wand2, Loader, UploadCloud, Hash, Coins, Sparkles, Sliders } from 'lucide-react'

function ProjectedMaterialModelDemo() {
    const mountRef = useRef(null);

    // --- Refs ---
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(); // Main view camera
    const rendererRef = useRef();
    const orbitControlsRef = useRef();
    const meshRef = useRef(); // The single mesh object
    const originalMaterialRef = useRef(); // Holds the original material from GLB
    const requestRef = useRef();

    // Refs for managing multiple projections
    const projectionOverlaysRef = useRef([]); // Array to hold all projection overlays
    const projectedMaterialsRef = useRef([]); // Array to hold all projected materials
    const snapshotCameraStatesRef = useRef([]); // Array to hold camera states for all projections
    const uploadedTexturesRef = useRef([]); // Array to hold all uploaded textures

    // Refs for UV unwrapping and baking
    const unwrapperRef = useRef(null);
    const rtSceneRef = useRef(new THREE.Scene()); // Render-to-texture scene
    const rtCameraRef = useRef(); // Render-to-texture camera
    const rtRendererRef = useRef(); // Render-to-texture renderer
    const bakedTextureRef = useRef(); // The baked texture

    // --- State ---
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Load a GLB Model to start.');
    const [loadedGeometry, setLoadedGeometry] = useState(null);
    const [originalMaterial, setOriginalMaterial] = useState(null);
    const [modelReady, setModelReady] = useState(false);
    const [uvUnwrapped, setUvUnwrapped] = useState(false);
    const [textureSize, setTextureSize] = useState(2048);
    const [isBaked, setIsBaked] = useState(false);

    // State for managing projections
    const [projections, setProjections] = useState([]);
    const [activeProjectionIndex, setActiveProjectionIndex] = useState(-1);
    const [unwrapReady, setUnwrapReady] = useState(false);

    // New state for AI generation parameters
    const [generationParams, setGenerationParams] = useState({
        prompt: "masterpiece, best quality, realistic texture, highly detailed",
        negative_prompt: "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
        seed: Math.floor(Math.random() * 1000000),
        resemblance: 0.6,
        sharpen: 0,
        creativity: 0.35,
        num_inference_steps: 18
    });

    // Function to update generation parameters
    const updateParams = (param, value) => {
        setGenerationParams(prev => ({
            ...prev,
            [param]: value
        }));
    };

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
                    padding: 8, // Increased padding between UV islands to prevent seams
                    resolution: textureSize,
                    rotateCharts: true,
                    rotateChartsToAxis: true,
                    texelsPerUnit: 0
                };

                // Load the xatlas library
                console.log('Starting to load xatlas library...');
                await unwrapperRef.current.loadLibrary(
                    (mode, progress) => {
                        console.log(`Loading xatlas: ${mode} - ${Math.round(progress * 100)}%`);
                        setStatus(`Loading xatlas: ${mode} - ${Math.floor(progress * 100)}%`);
                    },
                    'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.wasm',
                    'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.js'
                );

                console.log('xatlas library loaded');

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

        // Reset ALL relevant states
        setModelReady(false);
        setUvUnwrapped(false);
        setIsBaked(false);
        setProjections([]);
        setActiveProjectionIndex(-1);

        // Clear all projection refs
        projectionOverlaysRef.current.forEach(overlay => {
            if (overlay && meshRef.current) {
                meshRef.current.remove(overlay);
                overlay.geometry?.dispose();
                overlay.material?.dispose();
            }
        });
        projectionOverlaysRef.current = [];

        projectedMaterialsRef.current.forEach(material => material?.dispose());
        projectedMaterialsRef.current = [];

        snapshotCameraStatesRef.current = [];

        uploadedTexturesRef.current.forEach(texture => texture?.dispose());
        uploadedTexturesRef.current = [];

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

                    setStatus('Model loaded with original textures. First unwrap UVs before adding projections.');
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
            rendererRef.current = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
            rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
            rendererRef.current.setPixelRatio(window.devicePixelRatio);
            rendererRef.current.shadowMap.enabled = true;
            currentMount.appendChild(rendererRef.current.domElement);
            console.log("Renderer created and appended.");
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
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
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
                if (ambientLight) sceneRef.current.remove(ambientLight);
                if (directionalLight) sceneRef.current.remove(directionalLight);
                if (cameraRef.current) sceneRef.current.remove(cameraRef.current);
            }
            ambientLight?.dispose();
            directionalLight?.dispose();

            // Cleanup all projection materials and overlays
            projectedMaterialsRef.current.forEach(material => material?.dispose());
            projectionOverlaysRef.current.forEach(overlay => {
                overlay?.geometry?.dispose();
                overlay?.material?.dispose();
            });

            // Cleanup original material
            originalMaterialRef.current?.dispose();

            if (rendererRef.current) rendererRef.current.dispose();
            if (currentMount && rendererRef.current?.domElement) {
                try { currentMount.removeChild(rendererRef.current.domElement); } catch (e) { }
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
            console.log("Mesh Effect: Removing previous mesh.");

            // Cleanup projection overlays
            projectionOverlaysRef.current.forEach(overlay => {
                if (overlay && meshRef.current) {
                    meshRef.current.remove(overlay);
                    overlay.geometry?.dispose();
                    overlay.material?.dispose();
                }
            });
            projectionOverlaysRef.current = [];

            scene.remove(meshRef.current);
            if (meshRef.current.material &&
                meshRef.current.material !== originalMaterialRef.current) {
                console.log("Mesh Effect: Disposing non-preserved material.");
                if (Array.isArray(meshRef.current.material)) {
                    meshRef.current.material.forEach(mat => {
                        if (!projectedMaterialsRef.current.includes(mat)) {
                            mat.dispose();
                        }
                    });
                } else if (!projectedMaterialsRef.current.includes(meshRef.current.material)) {
                    meshRef.current.material.dispose();
                }
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
                setStatus('UVs unwrapped successfully! Now ready to add AI-powered projections.');
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

    // === Take Snapshot ===
    const takeSnapshot = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!modelReady || !cameraRef.current || !rendererRef.current || !sceneRef.current) {
                reject(new Error("Model or renderer not ready"));
                return;
            }

            try {
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

                // Force Render
                rendererRef.current.render(sceneRef.current, cameraRef.current);

                // Get Data URL
                const dataURL = rendererRef.current.domElement.toDataURL('image/png');

                if (!dataURL || dataURL === 'data:,') {
                    reject(new Error('Failed to get valid image data from canvas.'));
                    return;
                }

                resolve({ dataURL, cameraState: stateToSave });
            } catch (error) {
                reject(error);
            }
        });
    }, [modelReady]);

    // === Add New AI Projection ===
    const handleAddAIProjection = useCallback(async () => {
        if (!uvUnwrapped || !modelReady) {
            setStatus('Please unwrap UVs before adding projections.');
            return;
        }

        try {
            setIsLoading(true);
            setStatus('Taking snapshot from current camera position...');

            // Take snapshot from current camera view
            const { dataURL, cameraState } = await takeSnapshot();

            // Create a new projection entry
            const newProjectionIndex = projections.length;
            const projectionId = Date.now();

            // Store the camera state for this projection
            snapshotCameraStatesRef.current[newProjectionIndex] = cameraState;

            setStatus('Processing image with AI upscaler...');

            // Process the image with the AI upscaler
            const result = await imageUpscaler({
                image: dataURL,
                seed: generationParams.seed,
                resemblance: generationParams.resemblance,
                prompt: generationParams.prompt,
                negative_prompt: generationParams.negative_prompt,
                sharpen: generationParams.sharpen,
                creativity: generationParams.creativity,
                num_inference_steps: generationParams.num_inference_steps
            });

            if (result.error) {
                throw new Error(result.error);
            }

            if (!result.image) {
                throw new Error('No image returned from AI upscaler');
            }

            // Load the AI-generated texture
            setStatus('Loading enhanced texture...');

            const loader = new THREE.TextureLoader();
            const texture = await new Promise((resolve, reject) => {
                loader.load(
                    result.image,
                    (texture) => resolve(texture),
                    undefined,
                    (error) => reject(error)
                );
            });

            // Configure texture settings
            texture.needsUpdate = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.generateMipmaps = true;
            texture.anisotropy = 4;

            // Store the texture
            uploadedTexturesRef.current[newProjectionIndex] = texture;

            // Create and add the new projection to state
            const newProjection = {
                id: projectionId,
                name: `Projection ${newProjectionIndex + 1}`,
                prompt: generationParams.prompt,
                snapshotTaken: true,
                textureLoaded: true,
                isApplied: false,
                opacity: 1.0
            };

            setProjections(prev => [...prev, newProjection]);
            setActiveProjectionIndex(newProjectionIndex);

            setStatus('AI-enhanced texture ready. Apply projection to see results.');

            // Auto-apply the projection
            await applyProjection(newProjectionIndex, cameraState, texture);

            // Update the projection to show as applied
            setProjections(prev => {
                const updated = [...prev];
                updated[newProjectionIndex] = {
                    ...updated[newProjectionIndex],
                    isApplied: true
                };
                return updated;
            });

            setStatus(`AI Projection #${newProjectionIndex + 1} created and applied successfully!`);

        } catch (error) {
            console.error("Error creating AI projection:", error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [uvUnwrapped, modelReady, projections, generationParams, takeSnapshot]);

    // === Apply Projection ===
    // === Apply Projection ===
    const applyProjection = useCallback(async (projectionIndex, cameraState, texture) => {
        return new Promise((resolve, reject) => {
            try {
                if (!meshRef.current) {
                    reject(new Error("Mesh not ready"));
                    return;
                }

                // Create temporary camera using stored state
                const tempCamera = new THREE.PerspectiveCamera(
                    cameraState.fov, cameraState.aspect,
                    cameraState.near, cameraState.far
                );
                tempCamera.position.copy(cameraState.position);
                tempCamera.quaternion.copy(cameraState.quaternion);
                tempCamera.updateMatrixWorld();

                // Clean up previous projection overlay for this index if it exists
                if (projectionOverlaysRef.current[projectionIndex]) {
                    meshRef.current.remove(projectionOverlaysRef.current[projectionIndex]);
                    projectionOverlaysRef.current[projectionIndex].geometry?.dispose();
                    projectionOverlaysRef.current[projectionIndex].material?.dispose();
                    projectionOverlaysRef.current[projectionIndex] = null;
                }

                // Clean up previous material if it exists
                if (projectedMaterialsRef.current[projectionIndex]) {
                    projectedMaterialsRef.current[projectionIndex].dispose();
                    projectedMaterialsRef.current[projectionIndex] = null;
                }

                // Create a new projection material with depth testing enabled
                const projectionMaterial = new ProjectedMaterial({
                    camera: tempCamera,
                    texture: texture,
                    color: 0xffffff,
                    roughness: 0.8,
                    metalness: 0.1,
                    backgroundOpacity: 0.0,  // Make non-projected areas transparent
                    cover: false,
                    transparent: true,
                    opacity: 1.0,
                    side: THREE.FrontSide,
                    depthTest: true,
                    depthWrite: true,
                    enableDepthTest: true,  // Enable depth testing
                    depthBias: 0.005,      // Adjust as needed for your model
                });

                // Store the material reference
                projectedMaterialsRef.current[projectionIndex] = projectionMaterial;

                // Create a clone of the mesh geometry for this overlay
                const overlayGeometry = meshRef.current.geometry.clone();
                const overlay = new THREE.Mesh(overlayGeometry, projectionMaterial);
                overlay.name = `projection_overlay_${projectionIndex}`;

                // Scale slightly to avoid z-fighting
                const scaleFactor = 1.0 + (projectionIndex * 0.0001);
                overlay.scale.set(scaleFactor, scaleFactor, scaleFactor);

                // Add the overlay as a child of the original mesh
                meshRef.current.add(overlay);

                // Store the overlay reference
                projectionOverlaysRef.current[projectionIndex] = overlay;

                // Project the material onto the overlay mesh with depth testing
                projectionMaterial.project(overlay, rendererRef.current, sceneRef.current);

                resolve();

            } catch (error) {
                console.error("Error applying projection:", error);
                reject(error);
            }
        });
    }, []);

    // === Handle Apply Projection (User triggered) ===
    const handleApplyProjection = useCallback(async () => {
        if (activeProjectionIndex === -1) {
            setStatus("Please select a projection to apply.");
            return;
        }

        const projectionData = projections[activeProjectionIndex];
        if (!projectionData.textureLoaded) {
            setStatus("This projection doesn't have a texture loaded.");
            return;
        }

        try {
            setIsLoading(true);
            setStatus(`Applying projection #${activeProjectionIndex + 1}...`);

            const cameraState = snapshotCameraStatesRef.current[activeProjectionIndex];
            const texture = uploadedTexturesRef.current[activeProjectionIndex];

            if (!cameraState || !texture) {
                throw new Error("Missing camera state or texture for this projection.");
            }

            await applyProjection(activeProjectionIndex, cameraState, texture);

            // Update projection state
            setProjections(prev => {
                const updated = [...prev];
                updated[activeProjectionIndex] = {
                    ...updated[activeProjectionIndex],
                    isApplied: true
                };
                return updated;
            });

            setStatus(`Projection #${activeProjectionIndex + 1} applied successfully!`);

        } catch (error) {
            setStatus(`Projection failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [activeProjectionIndex, projections, applyProjection]);

    // === Handle Select Projection ===
    const handleSelectProjection = useCallback((index) => {
        setActiveProjectionIndex(index);
        setStatus(`Selected projection #${index + 1}.`);
    }, []);

    // === Handle Delete Projection ===
    const handleDeleteProjection = useCallback((index) => {
        // Clean up resources for this projection
        if (projectionOverlaysRef.current[index]) {
            if (meshRef.current) {
                meshRef.current.remove(projectionOverlaysRef.current[index]);
            }
            projectionOverlaysRef.current[index].geometry?.dispose();
            projectionOverlaysRef.current[index].material?.dispose();
        }

        if (projectedMaterialsRef.current[index]) {
            projectedMaterialsRef.current[index].dispose();
        }

        if (uploadedTexturesRef.current[index]) {
            uploadedTexturesRef.current[index].dispose();
        }

        // Remove from arrays
        projectionOverlaysRef.current = projectionOverlaysRef.current.filter((_, i) => i !== index);
        projectedMaterialsRef.current = projectedMaterialsRef.current.filter((_, i) => i !== index);
        uploadedTexturesRef.current = uploadedTexturesRef.current.filter((_, i) => i !== index);
        snapshotCameraStatesRef.current = snapshotCameraStatesRef.current.filter((_, i) => i !== index);

        // Update state
        setProjections(prev => prev.filter((_, i) => i !== index));

        // If we deleted the active projection, select another one
        if (activeProjectionIndex === index) {
            if (projections.length > 1) {
                setActiveProjectionIndex(index > 0 ? index - 1 : 0);
            } else {
                setActiveProjectionIndex(-1);
            }
        } else if (activeProjectionIndex > index) {
            // Adjust active index if we deleted one before it
            setActiveProjectionIndex(activeProjectionIndex - 1);
        }

        setStatus(`Deleted projection #${index + 1}.`);
    }, [projections, activeProjectionIndex, meshRef]);

    // === Adjust Projection Opacity ===
    const handleAdjustProjectionOpacity = useCallback((opacity) => {
        if (activeProjectionIndex === -1) {
            return;
        }

        if (!projectionOverlaysRef.current[activeProjectionIndex] ||
            !projectionOverlaysRef.current[activeProjectionIndex].material) {
            return;
        }

        // Adjust opacity
        projectionOverlaysRef.current[activeProjectionIndex].material.opacity = opacity;
        projectionOverlaysRef.current[activeProjectionIndex].material.needsUpdate = true;

        // Update state
        setProjections(prev => {
            const updated = [...prev];
            updated[activeProjectionIndex] = {
                ...updated[activeProjectionIndex],
                opacity
            };
            return updated;
        });

        setStatus(`Adjusted opacity of projection #${activeProjectionIndex + 1} to ${opacity.toFixed(2)}`);
    }, [activeProjectionIndex]);

    // === Toggle Projection Visibility ===
    const handleToggleProjectionVisibility = useCallback((index) => {
        if (!projectionOverlaysRef.current[index]) {
            return;
        }

        // Toggle visibility
        projectionOverlaysRef.current[index].visible = !projectionOverlaysRef.current[index].visible;

        // Update state
        setProjections(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                visible: projectionOverlaysRef.current[index].visible
            };
            return updated;
        });

        setStatus(`${projectionOverlaysRef.current[index].visible ? 'Showed' : 'Hid'} projection #${index + 1}.`);
    }, []);

    // Helper function for texture dilation
    const dilatePixels = useCallback(async (pixelBuffer, width, height, iterations = 3) => {
        const result = new Uint8Array(pixelBuffer);
        const temp = new Uint8Array(pixelBuffer.length);

        for (let iteration = 0; iteration < iterations; iteration++) {
            // Copy current result to temp buffer
            for (let i = 0; i < result.length; i++) {
                temp[i] = result[i];
            }

            // Perform dilation
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;

                    // Skip if pixel already has color
                    if (temp[idx + 3] > 128) continue;

                    // Check neighbors (8-connected neighborhood)
                    let hasNeighbor = false;
                    let r = 0, g = 0, b = 0, count = 0;

                    // Check 8 neighbors
                    const neighbors = [
                        { x: x + 1, y: y }, { x: x - 1, y: y },
                        { x: x, y: y + 1 }, { x: x, y: y - 1 },
                        { x: x + 1, y: y + 1 }, { x: x - 1, y: y - 1 },
                        { x: x + 1, y: y - 1 }, { x: x - 1, y: y + 1 }
                    ];

                    for (const n of neighbors) {
                        if (n.x < 0 || n.x >= width || n.y < 0 || n.y >= height) continue;

                        const nIdx = (n.y * width + n.x) * 4;
                        if (temp[nIdx + 3] > 128) {
                            r += temp[nIdx];
                            g += temp[nIdx + 1];
                            b += temp[nIdx + 2];
                            count++;
                            hasNeighbor = true;
                        }
                    }

                    if (hasNeighbor) {
                        result[idx] = Math.round(r / count);
                        result[idx + 1] = Math.round(g / count);
                        result[idx + 2] = Math.round(b / count);
                        result[idx + 3] = 255; // Full alpha
                    }
                }
            }
        }

        return result;
    }, []);

    // === Bake All Projections into a Single Texture ===
    const handleBakeAllProjections = useCallback(async () => {
        if (!meshRef.current) {
            setStatus('Cannot bake: No mesh available.');
            return;
        }

        // Check if we have any applied projections
        const appliedProjections = projections.filter(p => p.isApplied);
        if (appliedProjections.length === 0) {
            setStatus('Cannot bake: No projections have been applied.');
            return;
        }

        try {
            setIsLoading(true);
            setStatus('Baking all projections into a single texture...');

            // Find all valid projections
            const validProjectionIndices = [];
            for (let i = 0; i < projections.length; i++) {
                if (projections[i].isApplied &&
                    projectionOverlaysRef.current[i] &&
                    uploadedTexturesRef.current[i] &&
                    projectionOverlaysRef.current[i].visible !== false) {
                    validProjectionIndices.push(i);
                }
            }

            console.log(`Found ${validProjectionIndices.length} valid projections to bake`);

            if (validProjectionIndices.length === 0) {
                throw new Error('No valid projections found to bake');
            }

            // Create a render target with proper settings
            const renderTarget = new THREE.WebGLRenderTarget(textureSize, textureSize, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.UnsignedByteType,
                anisotropy: 4,
                generateMipmaps: true,
                encoding: THREE.sRGBEncoding // Explicitly set sRGB encoding
            });

            // Get the original material and texture
            const originalMat = originalMaterialRef.current;
            const originalTexture = originalMat && originalMat.map ? originalMat.map : null;

            // Set up uniforms
            const uniforms = {
                originalTexture: { value: originalTexture },
                hasOriginalTexture: { value: originalTexture ? 1.0 : 0.0 },
                numProjections: { value: validProjectionIndices.length },
                samplingBias: { value: 0.003 }
            };

            // Add uniforms for each valid projection
            validProjectionIndices.forEach((projIndex, i) => {
                // Get the required references
                const projMaterial = projectedMaterialsRef.current[projIndex];
                const projTexture = uploadedTexturesRef.current[projIndex];

                if (!projMaterial || !projTexture) {
                    console.warn(`Missing material or texture for projection ${projIndex}`);
                    return;
                }

                console.log(`Adding uniforms for projection ${projIndex} at shader index ${i}`);

                // Add required uniforms
                uniforms[`projTexture${i}`] = { value: projTexture };
                uniforms[`viewMatrix${i}`] = {
                    value: projMaterial.uniforms.viewMatrixCamera?.value || new THREE.Matrix4()
                };
                uniforms[`projMatrix${i}`] = {
                    value: projMaterial.uniforms.projectionMatrixCamera?.value || new THREE.Matrix4()
                };
                uniforms[`modelMatrix${i}`] = {
                    value: projMaterial.uniforms.savedModelMatrix?.value || new THREE.Matrix4()
                };

                // Additional uniforms that might be used in the projected material
                if (projMaterial.uniforms.projPosition) {
                    uniforms[`projPosition${i}`] = { value: projMaterial.uniforms.projPosition.value };
                }

                if (projMaterial.uniforms.projDirection) {
                    uniforms[`projDirection${i}`] = { value: projMaterial.uniforms.projDirection.value };
                }

                if (projMaterial.uniforms.widthScaled) {
                    uniforms[`widthScaled${i}`] = { value: projMaterial.uniforms.widthScaled.value };
                }

                if (projMaterial.uniforms.heightScaled) {
                    uniforms[`heightScaled${i}`] = { value: projMaterial.uniforms.heightScaled.value };
                }

                if (projMaterial.uniforms.textureOffset) {
                    uniforms[`textureOffset${i}`] = { value: projMaterial.uniforms.textureOffset.value };
                }

                // Add opacity uniform
                uniforms[`opacity${i}`] = { value: projections[projIndex].opacity || 1.0 };
            });

            // Create vertex shader
            let vertexShader = `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
            `;

            // Add varying declarations for each projection
            validProjectionIndices.forEach((_, i) => {
                vertexShader += `varying vec4 vTexCoords${i};\n`;
            });

            // Add uniform declarations for matrices
            validProjectionIndices.forEach((_, i) => {
                vertexShader += `
                    uniform mat4 viewMatrix${i};
                    uniform mat4 projMatrix${i};
                    uniform mat4 modelMatrix${i};
                `;
            });

            // Complete the vertex shader with main function
            vertexShader += `
                void main() {
                    vUv = uv;
                    
                    // Calculate normal in world space - needed for front/back face detection
                    vNormal = normalize(normalMatrix * normal);
                    
                    // Calculate world position - needed for projection
                    vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPos.xyz;
            `;

            // Add texture coordinate calculations for each projection
            validProjectionIndices.forEach((_, i) => {
                vertexShader += `
                    // Calculate projection coordinates for projection ${i}
                    vTexCoords${i} = projMatrix${i} * viewMatrix${i} * modelMatrix${i} * vec4(position, 1.0);
                `;
            });

            // Close the main function
            vertexShader += `
                    // Position in UV space for render target
                    gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
                }
            `;

            // Create fragment shader
            let fragmentShader = `
                uniform sampler2D originalTexture;
                uniform float hasOriginalTexture;
                uniform int numProjections;
                uniform float samplingBias;
                
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                
                // Function to map values from one range to another
                float mapRange(float value, float min1, float max1, float min2, float max2) {
                    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
                }
                
                // Edge sampling function to eliminate seams
                vec4 sampleWithBias(sampler2D tex, vec2 uv, float bias) {
                    // Sample center and 4 slightly offset positions
                    vec4 center = texture2D(tex, uv);
                    if (center.a > 0.1) return center; // Use center if it has alpha
                    
                    // Sample neighboring pixels if center has no alpha
                    vec4 colors[4];
                    colors[0] = texture2D(tex, uv + vec2(bias, 0.0));
                    colors[1] = texture2D(tex, uv + vec2(-bias, 0.0));
                    colors[2] = texture2D(tex, uv + vec2(0.0, bias));
                    colors[3] = texture2D(tex, uv + vec2(0.0, -bias));
                    
                    vec4 result = vec4(0.0);
                    float totalWeight = 0.0;
                    
                    for (int i = 0; i < 4; i++) {
                        if (colors[i].a > 0.1) {
                            result += colors[i];
                            totalWeight += 1.0;
                        }
                    }
                    
                    if (totalWeight > 0.0) {
                        return result / totalWeight;
                    }
                    
                    return center;
                }
            `;

            // Add uniforms and varyings for each projection
            validProjectionIndices.forEach((_, i) => {
                fragmentShader += `
                    uniform sampler2D projTexture${i};
                    uniform float opacity${i};
                    varying vec4 vTexCoords${i};
                `;

                // Add optional uniforms
                fragmentShader += `
                    uniform vec3 projPosition${i};
                    uniform vec3 projDirection${i};
                    uniform float widthScaled${i};
                    uniform float heightScaled${i};
                    uniform vec2 textureOffset${i};
                `;
            });

            // Start the main function
            fragmentShader += `
                void main() {
                    // Start with original texture or default color
                    vec4 finalColor = vec4(0.5, 0.5, 0.5, 1.0);  // Default gray
                    
                    if (hasOriginalTexture > 0.5) {
                        finalColor = texture2D(originalTexture, vUv);
                    }
            `;

            // Add processing for each projection
            validProjectionIndices.forEach((_, i) => {
                fragmentShader += `
                    // Process projection ${i}
                    {
                        float w = max(vTexCoords${i}.w, 0.001);
                        vec2 projUv = (vTexCoords${i}.xy / w) * 0.5 + 0.5;
                        
                        // Apply texture offset
                        projUv += textureOffset${i};
                        
                        // Apply scaling
                        projUv.x = mapRange(projUv.x, 0.0, 1.0, 0.5 - widthScaled${i} / 2.0, 0.5 + widthScaled${i} / 2.0);
                        projUv.y = mapRange(projUv.y, 0.0, 1.0, 0.5 - heightScaled${i} / 2.0, 0.5 + heightScaled${i} / 2.0);
                        
                        // Check if projection is valid (in bounds with some margin to avoid artifacts at edges)
                        bool isInBounds = projUv.x >= 0.001 && projUv.x <= 0.999 && 
                                         projUv.y >= 0.001 && projUv.y <= 0.999;
                        
                        // Calculate direction from camera to fragment
                        vec3 projDir = normalize(projPosition${i} - vWorldPosition);
                        
                        // Check if fragment faces camera (within reasonable angle)
                        float dotProduct = dot(vNormal, projDir);
                        bool isFacing = dotProduct > -0.2;  // Generous threshold to catch more faces
                        
                        if (isInBounds && isFacing) {
                            // Use the seam-fixing sampling function
                            vec4 projColor = sampleWithBias(projTexture${i}, projUv, samplingBias);
                            
                            // Only apply where the projection has alpha
                            if (projColor.a > 0.01) {
                                // Calculate effective alpha based on texture alpha and projection opacity
                                float effectiveAlpha = projColor.a * opacity${i};
                                
                                // Blend the projected color with current result
                                finalColor.rgb = mix(finalColor.rgb, projColor.rgb, effectiveAlpha);
                                finalColor.a = max(finalColor.a, projColor.a);
                            }
                        }
                    }
                `;
            });

            // Close the main function with gamma correction
            fragmentShader += `
                    // Ensure output has full alpha
                    finalColor.a = 1.0;
                    
                    // Apply gamma correction to prevent brightness shift
                    finalColor.rgb = pow(finalColor.rgb, vec3(1.0/2.2));
                    
                    gl_FragColor = finalColor;
                }
            `;

            // Create the custom shader material
            const bakingMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: THREE.DoubleSide
            });

            // Create baking mesh
            const bakingGeometry = meshRef.current.geometry.clone();
            const bakingMesh = new THREE.Mesh(bakingGeometry, bakingMaterial);

            // Create a scene for baking
            const bakingScene = new THREE.Scene();
            bakingScene.add(bakingMesh);

            // Setup an orthographic camera for UV rendering
            const bakingCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

            // Render to the texture
            rendererRef.current.setRenderTarget(renderTarget);
            rendererRef.current.setClearColor(0x000000, 0);
            rendererRef.current.clear();
            rendererRef.current.render(bakingScene, bakingCamera);
            rendererRef.current.setRenderTarget(null);

            // Create a texture from the render target
            const pixelBuffer = new Uint8Array(4 * textureSize * textureSize);
            rendererRef.current.readRenderTargetPixels(
                renderTarget, 0, 0, textureSize, textureSize, pixelBuffer
            );

            // Run the dilation process to fix seams
            setStatus('Processing texture to fix seams...');
            const dilatedPixels = await dilatePixels(pixelBuffer, textureSize, textureSize, 3);


            // Create the final baked texture
            const bakedTexture = new THREE.DataTexture(
                dilatedPixels,
                textureSize,
                textureSize,
                THREE.RGBAFormat
            );
            bakedTexture.encoding = THREE.sRGBEncoding;
            bakedTexture.needsUpdate = true;
            bakedTexture.flipY = true;

            // Set explicit color space for newer Three.js versions
            if ('colorSpace' in bakedTexture) {
                bakedTexture.colorSpace = 'srgb';
            }

            // Add proper filtering to baked texture
            bakedTexture.minFilter = THREE.LinearMipmapLinearFilter;
            bakedTexture.magFilter = THREE.LinearFilter;
            bakedTexture.generateMipmaps = true;
            bakedTexture.anisotropy = 4;

            // Store the baked texture
            bakedTextureRef.current = bakedTexture;

            // Create a new material with the baked texture
            const bakedMaterial = new THREE.MeshStandardMaterial({
                map: bakedTexture,
                roughness: (originalMat && originalMat.roughness !== undefined) ? originalMat.roughness : 0.7,
                metalness: (originalMat && originalMat.metalness !== undefined) ? originalMat.metalness : 0.1,
                color: 0xFFFFFF, // Ensure white base color
                envMapIntensity: (originalMat && originalMat.envMapIntensity !== undefined) ? originalMat.envMapIntensity : 1.0,
                normalScale: (originalMat && originalMat.normalScale) ? originalMat.normalScale.clone() : new THREE.Vector2(1, 1)
            });

            // Remove all projection overlays
            projectionOverlaysRef.current.forEach((overlay, i) => {
                if (overlay && meshRef.current) {
                    meshRef.current.remove(overlay);
                }
            });

            // Apply the baked material
            meshRef.current.material = bakedMaterial;

            // Clean up
            renderTarget.dispose();
            bakingGeometry.dispose();
            bakingMaterial.dispose();

            setStatus(`All ${validProjectionIndices.length} projections baked into a single texture! Ready for export.`);
            setIsBaked(true);

        } catch (error) {
            console.error('Error baking projections:', error);
            setStatus(`Failed to bake projections: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [projections, textureSize, dilatePixels]);

    // === Export Model with Baked Texture ===
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

            // Clone the current mesh
            const exportMesh = meshRef.current.clone();

            // Create a separate material instance for export with exact property matching
            exportMesh.material = new THREE.MeshStandardMaterial({
                map: bakedTextureRef.current,
                roughness: meshRef.current.material.roughness,
                metalness: meshRef.current.material.metalness,
                normalScale: meshRef.current.material.normalScale ? meshRef.current.material.normalScale.clone() : new THREE.Vector2(1, 1),
                envMapIntensity: meshRef.current.material.envMapIntensity || 1.0
            });

            // Set correct texture parameters for export
            if (exportMesh.material.map) {
                exportMesh.material.map.encoding = THREE.sRGBEncoding;

                // For newer Three.js versions
                if ('colorSpace' in exportMesh.material.map) {
                    exportMesh.material.map.colorSpace = 'srgb';
                }

                exportMesh.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                exportMesh.material.map.magFilter = THREE.LinearFilter;
                exportMesh.material.map.generateMipmaps = true;
                exportMesh.material.map.anisotropy = 4;
                exportMesh.material.map.needsUpdate = true;
            }

            exportMesh.material.needsUpdate = true;

            // Add to the export scene
            exportScene.add(exportMesh);

            // Export options with explicit color space handling
            const options = {
                binary: true,
                embedImages: true,
                includeCustomExtensions: true,
                forceIndices: true,
                forcePowerOfTwoTextures: false,
                trs: false, // Don't decompose matrices which can affect values
                onlyVisible: true,
                truncateDrawRange: true,
                animations: []
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
                    link.download = 'model_with_baked_textures.glb';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    setStatus('Model exported successfully with baked textures!');
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

    // Generate a new random seed
    const handleRandomizeSeed = useCallback(() => {
        updateParams('seed', Math.floor(Math.random() * 1000000));
    }, []);

    // === JSX Rendering with Sidebar ===
    return (
        <div className="flex h-full relative">
            {/* Sidebar */}
            <Sidebar className="border-r border-border w-80" variant="inset" collapsible="none">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xl font-semibold text-primary px-4 py-3">
                            AI Re-Texture 3D Model
                        </SidebarGroupLabel>
                        <hr className="border-border" />

                        <SidebarGroupContent className="p-4 space-y-4">
                            {/* Step 1: Load GLB */}
                            <div className="space-y-2">
                                <Label htmlFor="glbInput" className="text-sm font-medium flex items-center gap-1.5">
                                    <UploadCloud className="h-4 w-4" />
                                    (1) Load GLB Model
                                </Label>
                                <Input
                                    type="file"
                                    id="glbInput"
                                    accept=".glb,.gltf"
                                    onChange={handleGlbLoad}
                                    disabled={isLoading}
                                    className="cursor-pointer"
                                />
                            </div>

                            {/* Step 2: Unwrap UVs */}
                            <Button
                                onClick={handleUnwrapUVs}
                                disabled={!modelReady || isLoading || !unwrapReady || uvUnwrapped}
                                className="w-full"
                                variant={uvUnwrapped ? "outline" : "default"}
                            >
                                {uvUnwrapped ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        UVs Unwrapped
                                    </>
                                ) : (
                                    <>
                                        <Hash className="h-4 w-4 mr-2" />
                                        (2) Unwrap UV Coordinates
                                    </>
                                )}
                            </Button>

                            {uvUnwrapped && (
                                <>
                                    {/* Step 3: AI Projection Settings */}
                                    <div className="space-y-3 border border-border rounded-md p-3 bg-muted/30">
                                        <div className="text-sm font-medium text-primary flex items-center gap-1.5">
                                            <Sparkles className="h-4 w-4" />
                                            (3) AI Texture Settings
                                        </div>

                                        <Tabs defaultValue="prompt" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="prompt">Prompt</TabsTrigger>
                                                <TabsTrigger value="params">Parameters</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="prompt" className="space-y-3 pt-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="prompt" className="text-xs">Prompt:</Label>
                                                    <Textarea
                                                        id="prompt"
                                                        placeholder="Describe the texture you want..."
                                                        value={generationParams.prompt}
                                                        onChange={(e) => updateParams('prompt', e.target.value)}
                                                        className="min-h-[80px] text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="negativePrompt" className="text-xs">Negative Prompt:</Label>
                                                    <Textarea
                                                        id="negativePrompt"
                                                        placeholder="What to avoid in the texture..."
                                                        value={generationParams.negative_prompt}
                                                        onChange={(e) => updateParams('negative_prompt', e.target.value)}
                                                        className="min-h-[60px] text-xs"
                                                    />
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="params" className="space-y-3 pt-2">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="seed" className="text-xs">Seed:</Label>
                                                        <Button
                                                            onClick={handleRandomizeSeed}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 text-xs"
                                                        >
                                                            Randomize
                                                        </Button>
                                                    </div>
                                                    <Input
                                                        id="seed"
                                                        type="number"
                                                        value={generationParams.seed}
                                                        onChange={(e) => updateParams('seed', parseInt(e.target.value))}
                                                        className="text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="resemblance" className="text-xs">Resemblance: {generationParams.resemblance.toFixed(2)}</Label>
                                                    </div>
                                                    <Slider
                                                        id="resemblance"
                                                        min={0.1}
                                                        max={1.0}
                                                        step={0.05}
                                                        value={[generationParams.resemblance]}
                                                        onValueChange={(value) => updateParams('resemblance', value[0])}
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="creativity" className="text-xs">Creativity: {generationParams.creativity.toFixed(2)}</Label>
                                                    </div>
                                                    <Slider
                                                        id="creativity"
                                                        min={0.1}
                                                        max={1.0}
                                                        step={0.05}
                                                        value={[generationParams.creativity]}
                                                        onValueChange={(value) => updateParams('creativity', value[0])}
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="sharpen" className="text-xs">Sharpen: {generationParams.sharpen.toFixed(2)}</Label>
                                                    </div>
                                                    <Slider
                                                        id="sharpen"
                                                        min={0}
                                                        max={1.0}
                                                        step={0.05}
                                                        value={[generationParams.sharpen]}
                                                        onValueChange={(value) => updateParams('sharpen', value[0])}
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="steps" className="text-xs">Steps: {generationParams.num_inference_steps}</Label>
                                                    </div>
                                                    <Slider
                                                        id="steps"
                                                        min={8}
                                                        max={30}
                                                        step={1}
                                                        value={[generationParams.num_inference_steps]}
                                                        onValueChange={(value) => updateParams('num_inference_steps', value[0])}
                                                    />
                                                </div>
                                            </TabsContent>
                                        </Tabs>

                                        {/* Add Projection Button */}
                                        <Button
                                            onClick={handleAddAIProjection}
                                            disabled={isLoading || isBaked}
                                            className="w-full"
                                        >
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate AI Projection
                                        </Button>
                                    </div>

                                    {/* Projections List */}
                                    {projections.length > 0 && (
                                        <div className="space-y-2 border-t border-border pt-4 mt-4">
                                            <Label className="text-sm font-medium">Projections</Label>

                                            <div className="max-h-40 overflow-y-auto rounded-md border border-border">
                                                <div className="divide-y divide-border">
                                                    {projections.map((proj, index) => (
                                                        <div
                                                            key={proj.id}
                                                            className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 ${index === activeProjectionIndex ? 'bg-primary/10' : ''}`}
                                                            onClick={() => handleSelectProjection(index)}
                                                        >
                                                            <div className="flex flex-1 items-center">
                                                                <span className="mr-2 font-medium">{proj.name}</span>
                                                                {proj.isApplied && (
                                                                    <span className="text-xs text-green-500">✓</span>
                                                                )}
                                                            </div>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteProjection(index);
                                                                }}
                                                                title="Delete projection"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Projection Controls */}
                                    {activeProjectionIndex !== -1 && (
                                        <div className="space-y-3 border border-border rounded-md p-3 bg-muted/30">
                                            <div className="text-sm font-medium text-primary">
                                                {projections[activeProjectionIndex]?.name || `Projection ${activeProjectionIndex + 1}`}
                                            </div>

                                            {/* Apply Projection Button */}
                                            {!projections[activeProjectionIndex]?.isApplied && (
                                                <Button
                                                    onClick={handleApplyProjection}
                                                    disabled={isLoading || isBaked}
                                                    className="w-full"
                                                >
                                                    <Wand2 className="h-4 w-4 mr-2" />
                                                    Apply Projection
                                                </Button>
                                            )}

                                            {/* Projection Details */}
                                            {projections[activeProjectionIndex]?.prompt && (
                                                <div className="text-xs text-muted-foreground border-t border-border pt-2 mt-1">
                                                    <p className="font-medium mb-1">Prompt:</p>
                                                    <p className="line-clamp-3">{projections[activeProjectionIndex].prompt}</p>
                                                </div>
                                            )}

                                            {/* Opacity Control */}
                                            {projections[activeProjectionIndex]?.isApplied && !isBaked && (
                                                <div className="space-y-2 border-t border-border pt-2 mt-1">
                                                    <Label htmlFor="opacitySlider" className="text-xs">Opacity:</Label>
                                                    <Slider
                                                        id="opacitySlider"
                                                        min={0.1}
                                                        max={1}
                                                        step={0.05}
                                                        value={[projections[activeProjectionIndex]?.opacity || 1]}
                                                        onValueChange={(value) => handleAdjustProjectionOpacity(value[0])}
                                                    />

                                                    {/* Visibility Toggle */}
                                                    <Button
                                                        onClick={() => handleToggleProjectionVisibility(activeProjectionIndex)}
                                                        className="w-full mt-2"
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        {projections[activeProjectionIndex]?.visible === false
                                                            ? 'Show Projection'
                                                            : 'Hide Projection'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Bake and Export Buttons */}
                                    {projections.some(p => p.isApplied) && (
                                        <div className="space-y-2 border-t border-border pt-4 mt-4">
                                            <Button
                                                onClick={handleBakeAllProjections}
                                                disabled={isLoading || isBaked}
                                                className="w-full"
                                                variant={isBaked ? "outline" : "default"}
                                            >
                                                {isBaked ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Textures Baked
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 className="h-4 w-4 mr-2" />
                                                        (4) Bake All Projections
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                onClick={handleExportModel}
                                                disabled={!isBaked || isLoading}
                                                className="w-full"
                                                variant="secondary"
                                            >
                                                <UploadCloud className="h-4 w-4 mr-2" />
                                                (5) Export Model
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Texture Size Controls */}
                            <div className="border-t border-border pt-4 mt-4 space-y-2">
                                <Label htmlFor="textureSizeSelect" className="text-sm font-medium">Texture Resolution:</Label>
                                <select
                                    id="textureSizeSelect"
                                    value={textureSize}
                                    onChange={(e) => setTextureSize(Number(e.target.value))}
                                    disabled={isLoading || isBaked}
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                >
                                    <option value={512}>512 x 512</option>
                                    <option value={1024}>1024 x 1024</option>
                                    <option value={2048}>2048 x 2048</option>
                                    <option value={4096}>4096 x 4096</option>
                                </select>
                            </div>

                            {/* Status & Guidance */}
                            <div className="border-t border-border pt-4 mt-4">
                                <div className="text-sm text-muted-foreground italic">{status}</div>
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-primary mt-2">
                                        <Loader className="h-4 w-4 animate-spin" />
                                        <span className="font-medium">Processing...</span>
                                    </div>
                                )}
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            {/* Main Content Area */}
            <main className="flex-1 bg-muted/30 overflow-hidden relative">
                {/* Canvas Container */}
                <div ref={mountRef} className="absolute inset-0 h-full w-full" />

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="bg-card/40 p-8 rounded-xl shadow-lg text-center max-w-sm mx-auto border border-border">
                            <div className="relative">
                                <div className="size-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                                <Loader className="h-8 w-8 absolute inset-0 m-auto text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mt-6 mb-2">Processing</h3>
                            <p className="text-muted-foreground">{status}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ProjectedMaterialModelDemo;