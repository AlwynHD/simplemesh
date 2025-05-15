import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import ProjectedMaterial from './CustomProjectedMaterial';
import { UVUnwrapper } from 'xatlas-three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function SimpleProjectionTester() {
    // Refs
    const mountRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef();
    const rendererRef = useRef();
    const orbitControlsRef = useRef();
    const meshRef = useRef();
    const unwrapperRef = useRef(null);
    const requestRef = useRef();
    const projectionOverlayRef = useRef(null);
    const projectionMaterialRef = useRef(null);

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Load a GLB model to start.');
    const [modelLoaded, setModelLoaded] = useState(false);
    const [uvUnwrapped, setUvUnwrapped] = useState(false);
    const [textureSize, setTextureSize] = useState(2048);
    const [projectionApplied, setProjectionApplied] = useState(false);
    const [cameraSnapshot, setCameraSnapshot] = useState(null);
    const [unwrapReady, setUnwrapReady] = useState(false);

    // Initialize xatlas unwrapper
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
                    useInputMeshUvs: true,
                };

                unwrapperRef.current.packOptions = {
                    bilinear: true,
                    blockAlign: false,
                    bruteForce: false,
                    createImage: false,
                    maxChartSize: 0,
                    padding: 8,
                    resolution: textureSize,
                    rotateCharts: true,
                    rotateChartsToAxis: true,
                    texelsPerUnit: 0
                };

                // Load the xatlas library
                await unwrapperRef.current.loadLibrary(
                    (mode, progress) => {
                        setStatus(`Loading xatlas: ${mode} - ${Math.floor(progress * 100)}%`);
                    },
                    'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.wasm',
                    'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/xatlas.js'
                );

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

        return () => {
            unwrapperRef.current = null;
        };
    }, [textureSize]);

    // Scene setup effect
    useEffect(() => {
        if (!mountRef.current) return;
        
        const currentMount = mountRef.current;
        const scene = sceneRef.current;
        
        // Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        rendererRef.current.shadowMap.enabled = true;
        currentMount.appendChild(rendererRef.current.domElement);
        
        // Camera
        cameraRef.current = new THREE.PerspectiveCamera(
            50, 
            currentMount.clientWidth / currentMount.clientHeight, 
            0.1, 
            1000
        );
        cameraRef.current.position.set(0, 1.5, 5);
        scene.add(cameraRef.current);
        
        // Controls
        orbitControlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        orbitControlsRef.current.enableDamping = true;
        orbitControlsRef.current.target.set(0, 0, 0);
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Grid
        const grid = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
        scene.add(grid);
        
        // Background
        scene.background = new THREE.Color(0x333333);
        
        // Resize handler
        const handleResize = () => {
            if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
            
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            
            rendererRef.current.setSize(width, height);
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
        };
        
        window.addEventListener('resize', handleResize);
        
        // Animation loop
        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            orbitControlsRef.current.update();
            rendererRef.current.render(scene, cameraRef.current);
        };
        
        animate();
        
        return () => {
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', handleResize);
            
            scene.remove(ambientLight);
            scene.remove(directionalLight);
            scene.remove(grid);
            
            orbitControlsRef.current.dispose();
            rendererRef.current.dispose();
            currentMount.removeChild(rendererRef.current.domElement);
        };
    }, []);

    // Load GLB model
    const handleGlbLoad = useCallback((event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Reset state
        setModelLoaded(false);
        setUvUnwrapped(false);
        setProjectionApplied(false);
        setCameraSnapshot(null);
        
        // Clean up previous model
        if (meshRef.current && sceneRef.current) {
            sceneRef.current.remove(meshRef.current);
            meshRef.current.geometry?.dispose();
            meshRef.current.material?.dispose();
            meshRef.current = null;
        }
        
        // Clean up projection overlay
        if (projectionOverlayRef.current && meshRef.current) {
            meshRef.current.remove(projectionOverlayRef.current);
            projectionOverlayRef.current.geometry?.dispose();
            projectionOverlayRef.current.material?.dispose();
            projectionOverlayRef.current = null;
        }
        
        if (projectionMaterialRef.current) {
            projectionMaterialRef.current.dispose();
            projectionMaterialRef.current = null;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setIsLoading(true);
            setStatus('Loading GLB...');
            
            const loader = new GLTFLoader();
            loader.parse(e.target.result, '', (gltf) => {
                let foundGeometry = null;
                let foundMaterial = null;
                
                gltf.scene.traverse((child) => {
                    if (child.isMesh && !foundGeometry) {
                        foundGeometry = child.geometry.clone();
                        
                        if (Array.isArray(child.material)) {
                            foundMaterial = child.material[0].clone();
                        } else if (child.material) {
                            foundMaterial = child.material.clone();
                        }
                        
                        // Apply world transform to geometry
                        child.updateMatrixWorld(true);
                        foundGeometry.applyMatrix4(child.matrixWorld);
                        
                        foundGeometry.computeVertexNormals();
                        foundGeometry.center();
                        foundGeometry.computeBoundingSphere();
                    }
                });
                
                if (foundGeometry) {
                    // Create mesh with the loaded geometry
                    const material = foundMaterial || new THREE.MeshStandardMaterial({
                        color: 0xcccccc,
                        roughness: 0.7
                    });
                    
                    meshRef.current = new THREE.Mesh(foundGeometry, material);
                    meshRef.current.name = "LoadedMesh";
                    meshRef.current.castShadow = true;
                    meshRef.current.receiveShadow = true;
                    
                    // Add mesh to scene
                    sceneRef.current.add(meshRef.current);
                    
                    setModelLoaded(true);
                    setStatus('Model loaded. Now unwrap UVs before projecting a texture.');
                } else {
                    setStatus('Error: No mesh found in GLB.');
                }
                
                setIsLoading(false);
            }, (error) => {
                console.error('Error parsing GLTF:', error);
                setStatus(`Error loading GLB: ${error.message}`);
                setIsLoading(false);
            });
        };
        
        reader.onerror = () => {
            setStatus('Error reading GLB file.');
            setIsLoading(false);
        };
        
        reader.readAsArrayBuffer(file);
        event.target.value = '';
    }, []);

    // Unwrap UVs
    const handleUnwrapUVs = useCallback(async () => {
        if (!meshRef.current || !unwrapperRef.current || !unwrapReady) {
            setStatus('Unable to unwrap UVs: Mesh or unwrapper not ready.');
            return;
        }
        
        try {
            setIsLoading(true);
            setStatus('Unwrapping UVs...');
            
            const geometry = meshRef.current.geometry;
            const indexedGeometry = geometry.index ? geometry : mergeVertices(geometry);
            const originalMaterial = meshRef.current.material;
            const originalUVs = geometry.attributes.uv ? geometry.attributes.uv.clone() : null;
            
            // Unwrap the geometry
            const atlas = await unwrapperRef.current.packAtlas([indexedGeometry]);
            
            if (atlas && atlas.geometries && atlas.geometries[0]) {
                // Apply the unwrapped geometry back to the mesh
                meshRef.current.geometry = atlas.geometries[0];
                meshRef.current.material = originalMaterial;
                
                // Store original UVs in uv2 if they existed
                if (originalUVs) {
                    meshRef.current.geometry.setAttribute('uv2', originalUVs);
                }
                
                setUvUnwrapped(true);
                setStatus('UVs unwrapped successfully! Now take a snapshot and project a texture.');
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

    // Take snapshot
    const handleTakeSnapshot = useCallback(() => {
        if (!meshRef.current || !cameraRef.current) {
            setStatus('Cannot take snapshot: Mesh or camera not ready.');
            return;
        }
        
        try {
            // Capture camera state
            const cam = cameraRef.current;
            cam.updateMatrixWorld();
            
            const cameraState = {
                position: cam.position.clone(),
                quaternion: cam.quaternion.clone(),
                fov: cam.fov,
                aspect: cam.aspect,
                near: cam.near,
                far: cam.far,
            };
            
            setCameraSnapshot(cameraState);
            setStatus('Camera snapshot taken! Now upload a texture to project.');
            
        } catch (error) {
            console.error('Error taking snapshot:', error);
            setStatus(`Failed to take snapshot: ${error.message}`);
        }
    }, []);

    // Handle texture upload
    const handleTextureUpload = useCallback((event) => {
        const file = event.target.files?.[0];
        if (!file || !cameraSnapshot || !meshRef.current) {
            setStatus('Cannot upload texture: Missing model, camera snapshot, or texture file.');
            return;
        }
        
        // Clean up existing projection
        if (projectionOverlayRef.current && meshRef.current) {
            meshRef.current.remove(projectionOverlayRef.current);
            projectionOverlayRef.current.geometry?.dispose();
            projectionOverlayRef.current.material?.dispose();
            projectionOverlayRef.current = null;
        }
        
        if (projectionMaterialRef.current) {
            projectionMaterialRef.current.dispose();
            projectionMaterialRef.current = null;
        }
        
        setIsLoading(true);
        setStatus('Loading texture...');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                e.target.result,
                (texture) => {
                    applyProjection(texture);
                },
                undefined,
                (error) => {
                    console.error('Error loading texture:', error);
                    setStatus(`Failed to load texture: ${error.message}`);
                    setIsLoading(false);
                }
            );
        };
        
        reader.onerror = () => {
            setStatus('Error reading texture file.');
            setIsLoading(false);
        };
        
        reader.readAsDataURL(file);
        event.target.value = '';
    }, [cameraSnapshot]);

    // Apply projection
    const applyProjection = useCallback((texture) => {
        if (!meshRef.current || !cameraSnapshot) {
            setStatus('Cannot apply projection: Missing model or camera snapshot.');
            setIsLoading(false);
            return;
        }
        
        try {
            // Create temporary camera from snapshot
            const tempCamera = new THREE.PerspectiveCamera(
                cameraSnapshot.fov,
                cameraSnapshot.aspect,
                cameraSnapshot.near,
                cameraSnapshot.far
            );
            tempCamera.position.copy(cameraSnapshot.position);
            tempCamera.quaternion.copy(cameraSnapshot.quaternion);
            tempCamera.updateMatrixWorld();
            
            // Configure texture
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.generateMipmaps = true;
            texture.anisotropy = 4;
            texture.needsUpdate = true;
            
            // Create projection material
            const projectionMaterial = new ProjectedMaterial({
                camera: tempCamera,
                texture: texture,
                color: 0xffffff,
                roughness: 0.8,
                metalness: 0.1,
                backgroundOpacity: 0.0,
                cover: false,
                transparent: true,
                opacity: 1.0,
                side: THREE.FrontSide,
                depthTest: true,
                depthWrite: true,
                enableDepthTest: true,
                depthBias: 0.005,
            });
            
            projectionMaterialRef.current = projectionMaterial;
            
            // Create overlay mesh
            const overlayGeometry = meshRef.current.geometry.clone();
            const overlay = new THREE.Mesh(overlayGeometry, projectionMaterial);
            overlay.name = "projection_overlay";
            
            // Add to original mesh
            meshRef.current.add(overlay);
            projectionOverlayRef.current = overlay;
            
            // Project the material onto the overlay mesh
            projectionMaterial.project(overlay, rendererRef.current, sceneRef.current);
            
            setProjectionApplied(true);
            setStatus('Texture projected successfully!');
            
        } catch (error) {
            console.error('Error applying projection:', error);
            setStatus(`Failed to apply projection: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [cameraSnapshot]);

    // Adjust projection opacity
    const handleOpacityChange = useCallback((event) => {
        const opacity = parseFloat(event.target.value);
        
        if (projectionOverlayRef.current && projectionOverlayRef.current.material) {
            projectionOverlayRef.current.material.opacity = opacity;
            projectionOverlayRef.current.material.needsUpdate = true;
            setStatus(`Projection opacity set to ${opacity.toFixed(2)}`);
        }
    }, []);

    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Controls Panel */}
            <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {/* Step 1: Load Model */}
                <div>
                    <label htmlFor="modelInput" style={{ marginRight: '5px' }}>1. Load Model:</label>
                    <input
                        id="modelInput"
                        type="file"
                        accept=".glb,.gltf"
                        onChange={handleGlbLoad}
                        disabled={isLoading}
                    />
                </div>
                
                {/* Step 2: Unwrap UVs */}
                <div>
                    <button
                        onClick={handleUnwrapUVs}
                        disabled={!modelLoaded || isLoading || !unwrapReady || uvUnwrapped}
                        style={{ padding: '5px 10px' }}
                    >
                        2. Unwrap UVs
                    </button>
                </div>
                
                {/* Step 3: Take Snapshot */}
                <div>
                    <button
                        onClick={handleTakeSnapshot}
                        disabled={!uvUnwrapped || isLoading}
                        style={{ padding: '5px 10px' }}
                    >
                        3. Take Camera Snapshot
                    </button>
                </div>
                
                {/* Step 4: Upload Texture */}
                <div>
                    <label htmlFor="textureInput" style={{ marginRight: '5px' }}>4. Upload Texture:</label>
                    <input
                        id="textureInput"
                        type="file"
                        accept="image/*"
                        onChange={handleTextureUpload}
                        disabled={!cameraSnapshot || isLoading}
                    />
                </div>
                
                {/* Opacity Control */}
                {projectionApplied && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label htmlFor="opacityInput">Opacity:</label>
                        <input
                            id="opacityInput"
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            defaultValue="1"
                            onChange={handleOpacityChange}
                        />
                    </div>
                )}
                
                {/* Texture Size Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label htmlFor="textureSizeSelect">Texture Size:</label>
                    <select
                        id="textureSizeSelect"
                        value={textureSize}
                        onChange={(e) => setTextureSize(Number(e.target.value))}
                        disabled={isLoading}
                        style={{ padding: '5px' }}
                    >
                        <option value={512}>512</option>
                        <option value={1024}>1024</option>
                        <option value={2048}>2048</option>
                        <option value={4096}>4096</option>
                    </select>
                </div>
            </div>
            
            {/* Status Display */}
            <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                <strong>Status:</strong> {status}
                {isLoading && <span style={{ marginLeft: '10px' }}>Loading...</span>}
            </div>
            
            {/* 3D View */}
            <div ref={mountRef} style={{ flex: 1 }}></div>
        </div>
    );
}

export default SimpleProjectionTester;