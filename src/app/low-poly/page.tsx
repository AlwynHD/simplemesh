"use client"; // Required for hooks like useEffect, useState, useRef

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';
import * as dat from 'lil-gui';

const MAX_FACE_COUNT_PER_ITERATION = 250;

type ModelInfoState = {
    currentTri: number;
    targetTri: number;
    progress: number;
};

const LowPolyGeneratorPage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const guiMountRef = useRef<HTMLDivElement>(null);

    // --- Refs ---
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const myMeshRef = useRef<THREE.Mesh | null>(null);
    const tempGeometryRef = useRef<THREE.BufferGeometry | null>(null);
    const materialRef = useRef<THREE.MeshNormalMaterial | null>(null);
    const gridHelperRef = useRef<THREE.GridHelper | null>(null);
    const guiRef = useRef<dat.GUI | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const modifierRef = useRef(new SimplifyModifier());
    const stlLoaderRef = useRef(new STLLoader());
    const modifierInProgressRef = useRef(false);

    // --- State ---
    const [modelInfo, setModelInfo] = useState<ModelInfoState>({ currentTri: 0, targetTri: 0, progress: 0 });
    const [decimateAmount, setDecimateAmount] = useState(25);
    const [isMobile, setIsMobile] = useState(false);

    // --- Mobile Detection ---
    useEffect(() => {
        const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(mobileCheck);
    }, []);

    // --- Helper Functions ---
    const renderTimeout = () => new Promise<void>((resolve) => { window.requestAnimationFrame(() => { resolve(); }); });

    const updateModelInfo = useCallback((mesh: THREE.Mesh | null = myMeshRef.current) => {
        if (!mesh?.geometry?.attributes?.position) {
             setModelInfo({ currentTri: 0, targetTri: 0, progress: modifierInProgressRef.current ? modelInfo.progress : 0 });
             return;
        }
        const currentTri = Math.max(0, mesh.geometry.attributes.position.count / 3);
        const targetTri = Math.max(0, Math.floor(currentTri * (1 - (decimateAmount * 0.01))));
        setModelInfo(prev => ({
            currentTri, targetTri,
            progress: modifierInProgressRef.current ? prev.progress : 0,
        }));
    }, [decimateAmount, modelInfo.progress]); // Keep dependencies minimal

    const iterativeModifier = async ({ decimationFaceCount, geometry, updateCallback }: {
        decimationFaceCount: number;
        geometry: THREE.BufferGeometry;
        updateCallback: (geometry: THREE.BufferGeometry) => void;
    }) => {
        if (!geometry.attributes.position || modifierInProgressRef.current) return geometry;
        modifierInProgressRef.current = true;
        setModelInfo(prev => ({ ...prev, progress: 0 }));
        const modifier = modifierRef.current;
        let currentGeometry = geometry.clone(); // Start with a clone of the *original*
        const startingFaceCount = currentGeometry.attributes.position.count / 3;
        const targetFaceCount = Math.max(0, startingFaceCount - decimationFaceCount);
        const totalFacesToDecimate = Math.max(0, startingFaceCount - targetFaceCount);

        if (totalFacesToDecimate <= 0) {
             modifierInProgressRef.current = false;
             setModelInfo(prev => ({ ...prev, progress: 100 }));
             updateModelInfo(); // Update counts even if no change
             console.log("No faces to decimate.");
             return currentGeometry;
        }

        let currentFaceCount = startingFaceCount;
        console.log(`Iterative Modifier - Start: ${startingFaceCount}, Target: ${targetFaceCount}, Decimate: ${totalFacesToDecimate}`);
        try {
            while (currentFaceCount > targetFaceCount) {
                const countToRemove = Math.min(MAX_FACE_COUNT_PER_ITERATION, currentFaceCount - targetFaceCount);
                if (countToRemove <= 0) break;
                currentGeometry = modifier.modify(currentGeometry, countToRemove);
                await renderTimeout();
                updateCallback(currentGeometry.clone()); // Update main mesh with a clone of the current state
                await renderTimeout();
                currentFaceCount = currentGeometry.attributes.position ? currentGeometry.attributes.position.count / 3 : 0;
                const facesDecimated = startingFaceCount - currentFaceCount;
                const progress = totalFacesToDecimate > 0 ? Math.floor((facesDecimated / totalFacesToDecimate) * 100) : 100;
                setModelInfo(prev => ({ ...prev, progress: Math.min(100, Math.max(0, progress)) }));
            }
             console.log("Iterative modification finished loop.");
        } catch (error) {
             console.error("Error during simplification:", error);
             updateCallback(geometry.clone()); // Revert to original clone on error
        } finally {
            modifierInProgressRef.current = false;
            setModelInfo(prev => ({ ...prev, progress: 100 }));
             // Final update of model info based on the final geometry state
             if (myMeshRef.current) updateModelInfo(myMeshRef.current);
             console.log("Iterative modifier finished.");
        }
        return currentGeometry;
    };

    // --- Event Handlers ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (modifierInProgressRef.current) { alert("Processing in progress..."); return; }
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                try {
                    if(!loadEvent.target?.result) throw new Error("File read error");
                    const geometry = stlLoaderRef.current.parse(loadEvent.target.result as ArrayBuffer);
                    geometry.center();
                    geometry.computeVertexNormals();
                    loadGeometry(geometry);
                } catch (error) { console.error("STL Parse Error:", error); alert("Failed to parse STL.");}
            };
            reader.onerror = () => { console.error("File Read Error:", reader.error); alert("Failed to read file."); };
            reader.readAsArrayBuffer(file);
        }
        event.target.value = '';
    };

    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (modifierInProgressRef.current) { alert("Processing in progress..."); return; }
        const modelName = event.target.value;
        if (modelName && modelName !== '-- Select a model --') {
            const modelPath = `/models/${modelName}.stl`;
            loadModel(modelPath);
        }
    };

    // --- Core Logic ---
    const loadGeometry = (geometry: THREE.BufferGeometry) => {
        if (!myMeshRef.current || !materialRef.current) { console.error("Mesh/Material ref missing in loadGeometry"); return; }
        console.log("loadGeometry started");

        // Dispose previous geometries before assigning new ones
        myMeshRef.current.geometry?.dispose();
        tempGeometryRef.current?.dispose();

        // Assign new geometry
        myMeshRef.current.geometry = geometry;
        tempGeometryRef.current = geometry.clone(); // Keep a pristine clone

        // Reset orientation and position
        myMeshRef.current.rotation.set(-Math.PI / 2, 0, 0); // Equivalent to -90 degrees on X
        myMeshRef.current.position.set(0, 0, 0); // Reset position before calculating bounding box based height

        // Center geometry visually by adjusting position based on bounding box
        myMeshRef.current.geometry.computeBoundingBox();
        const bbox = myMeshRef.current.geometry.boundingBox;
        if (bbox) {
            // Adjust Y position to place the bottom of the Z dimension (after rotation) at grid level 0
            myMeshRef.current.position.y = (bbox.max.z - bbox.min.z) / 2;
        }

        if (controlsRef.current) controlsRef.current.reset(); // Reset camera view
        console.log('Loaded new geometry.');
        updateModelInfo(myMeshRef.current); // Update UI info
    };

    const loadModel = (path: string) => {
        console.log(`Loading model: ${path}`);
        stlLoaderRef.current.load(
            path,
            (geometry) => {
                geometry.center(); // Center vertices around (0,0,0)
                geometry.computeVertexNormals(); // Calculate normals for shading
                loadGeometry(geometry); // Load the processed geometry
            },
            undefined, // onProgress callback (optional)
            (error) => { console.error(`Error loading ${path}:`, error); alert(`Failed to load model: ${path}.`); } // onError callback
        );
    };

    // --- Setup and Animation Loop Effect ---
    useEffect(() => {
        console.log('Effect run: Initializing Three.js setup...');
        if (rendererRef.current) { console.warn("Renderer exists, skipping setup."); return; }
        if (!canvasRef.current || !guiMountRef.current) { console.error("Canvas or GUI mount ref missing."); return; }
        const canvas = canvasRef.current;
        const guiMountElement = guiMountRef.current;
        console.log('v1.2.2 - React Init (Simplified)');

        // --- Initialize Three.js ---
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0x1a1a1a);
        cameraRef.current = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
        cameraRef.current.position.set(60, 60, 120);
        try {
            rendererRef.current = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true }); // preserveDrawingBuffer for potential export issues? Test.
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        } catch (error) { console.error("WebGLRenderer init failed:", error); alert("WebGL init failed."); return; }
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true; controlsRef.current.dampingFactor = 0.05;
        gridHelperRef.current = new THREE.GridHelper(1000, 100);
        sceneRef.current.add(gridHelperRef.current);
        materialRef.current = new THREE.MeshNormalMaterial({ flatShading: true, side: THREE.DoubleSide });
        myMeshRef.current = new THREE.Mesh(new THREE.BufferGeometry(), materialRef.current); // Start with empty geometry
        sceneRef.current.add(myMeshRef.current);

        // --- Initialize lil-gui ---
        if (!guiRef.current) {
             console.log("Initializing lil-gui...");
             guiRef.current = new dat.GUI({ autoPlace: false, title: 'Generator Controls' });
             guiMountElement.appendChild(guiRef.current.domElement);
             const rotateControls = guiRef.current.addFolder('Rotation');
             const decimateControls = guiRef.current.addFolder('Decimation');
             const exportControls = guiRef.current.addFolder('Export');

             // Rotation Controls (Restoring Logic)
             const rotate = (axis: 'x' | 'y' | 'z') => {
                 console.log(`Rotate ${axis} button clicked.`);
                 if (!myMeshRef.current || modifierInProgressRef.current) {
                      console.warn("Rotation skipped: No mesh or modifier in progress.");
                      return;
                 }
                 // Apply rotation
                 myMeshRef.current.rotation[axis] += (-90 * Math.PI / 180);
                 // Recalculate bounding box based height adjustment (might not be strictly needed for Y/Z rotation, but good practice)
                 myMeshRef.current.geometry?.computeBoundingBox();
                 const bbox = myMeshRef.current.geometry?.boundingBox;
                 if (bbox) myMeshRef.current.position.y = (bbox.max.z - bbox.min.z) / 2;
                 console.log(`Rotated ${axis}. New rotation:`, myMeshRef.current.rotation);
             };
             rotateControls.add({ RotateX: () => rotate('x') }, 'RotateX');
             rotateControls.add({ RotateY: () => rotate('y') }, 'RotateY');
             rotateControls.add({ RotateZ: () => rotate('z') }, 'RotateZ');

             // Decimation Controls (Restoring Logic)
             const decimateSettings = { amount: decimateAmount };
             decimateControls.add(decimateSettings, 'amount', 1, 99, 1)
                .name('Reduce Tris By %')
                .onChange(setDecimateAmount) // Update state when slider changes
                .listen(); // Reflect state changes back to slider

             decimateControls.add({ Decimate: async () => { // Mark async for await
                 console.log("Decimate button clicked.");
                 if (!myMeshRef.current?.geometry || !tempGeometryRef.current || modifierInProgressRef.current) {
                     console.warn("Decimation requirements not met.");
                     alert("Load a model first or wait for processing to finish.");
                     return;
                 }
                 console.time('decimateTime');
                 const initialFaceCount = tempGeometryRef.current.attributes.position.count / 3; // Use original count
                 const countToRemove = Math.floor(initialFaceCount * (decimateAmount / 100));

                 if (countToRemove <= 0) {
                     console.log("No faces to remove based on percentage.");
                     alert("Percentage results in 0 faces to remove.");
                     console.timeEnd('decimateTime');
                     return;
                 }
                 try {
                      await iterativeModifier({
                          decimationFaceCount: countToRemove,
                          geometry: tempGeometryRef.current, // Start from the stored original geometry
                          updateCallback: (simplifiedGeometry) => {
                              if (myMeshRef.current) {
                                  myMeshRef.current.geometry.dispose(); // Dispose old before assigning new
                                  myMeshRef.current.geometry = simplifiedGeometry;
                                  // Info updated in finally block of iterativeModifier
                              }
                          }
                      });
                      console.log('Decimation process completed.');
                  } catch (error) { console.error("Decimation process failed:", error); alert("Decimation failed."); }
                  finally { console.timeEnd('decimateTime'); }
             }}, 'Decimate').name('Apply Reduction');

             decimateControls.add({ Reset: () => {
                 console.log("Reset button clicked.");
                 if (!myMeshRef.current || !tempGeometryRef.current || modifierInProgressRef.current) {
                     console.warn("Reset requirements not met.");
                     alert("Load a model first or wait for processing to finish.");
                     return;
                 }
                 myMeshRef.current.geometry.dispose(); // Dispose current (potentially modified)
                 myMeshRef.current.geometry = tempGeometryRef.current.clone(); // Restore from stored original clone
                 // Reset rotation/position as well? Optional, but often desired on Reset.
                 myMeshRef.current.rotation.set(-Math.PI / 2, 0, 0);
                 myMeshRef.current.position.set(0,0,0);
                 myMeshRef.current.geometry.computeBoundingBox();
                 const bbox = myMeshRef.current.geometry.boundingBox;
                 if (bbox) myMeshRef.current.position.y = (bbox.max.z - bbox.min.z) / 2;

                 console.log('Model reset to original state.');
                 updateModelInfo(myMeshRef.current); // Update UI
             }}, 'Reset');

             // Export Controls (Restoring Logic)
             const exportFile = (exporter: STLExporter | OBJExporter, ext: string, binary = false) => {
                 console.log(`Export ${ext.toUpperCase()} button clicked.`);
                 if (!myMeshRef.current?.geometry || !myMeshRef.current.geometry.attributes.position || modifierInProgressRef.current) {
                     console.warn("Export requirements not met.");
                     alert("Load a model first or wait for processing to finish.");
                     return;
                 }
                 const meshToExport = myMeshRef.current; // Use the current mesh state
                 console.log(`Attempting to export ${ext.toUpperCase()}...`);
                 try {
                     const options = ext === 'stl' ? { binary: binary } : undefined;
                     // @ts-ignore - Type mismatch possible if library types aren't perfect
                     const result = exporter.parse(meshToExport, options);
                     const mimeType = ext === 'stl' ? 'model/stl' : 'text/plain';
                     const blob = new Blob([result], { type: mimeType });
                     const link = document.createElement('a');
                     link.style.display = 'none'; document.body.appendChild(link);
                     link.href = URL.createObjectURL(blob);
                     link.download = `LowPolyModel.${ext}`; link.click(); // More descriptive name
                     document.body.removeChild(link); URL.revokeObjectURL(link.href);
                     console.log(`Exported ${ext.toUpperCase()} successfully.`);
                 } catch (error) { console.error(`Failed to export ${ext.toUpperCase()}:`, error); alert(`Export failed.`); }
             };
             const stlExporter = new STLExporter();
             const objExporter = new OBJExporter();
             exportControls.add({ ExportSTL: () => exportFile(stlExporter, 'stl', true) }, 'ExportSTL').name('Export STL (Binary)');
             exportControls.add({ ExportOBJ: () => exportFile(objExporter, 'obj') }, 'ExportOBJ').name('Export OBJ');

             // Conditional GUI folders based on mobile
             if (isMobile) { rotateControls.close(); exportControls.close(); }
        }

        // --- Initial Model Load ---
        loadModel('/models/test.stl');

        // --- Resize Listener ---
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current && sceneRef.current) { // Check scene too
                 const width = window.innerWidth;
                 const height = window.innerHeight;
                 cameraRef.current.aspect = width / height;
                 cameraRef.current.updateProjectionMatrix();
                 rendererRef.current.setSize(width, height);
                 // No need to set pixel ratio again on resize, usually only needed once
                 // rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call

        // --- Animation Loop ---
        const animate = () => {
            if (!rendererRef.current) return; // Exit if cleaned up
            animationFrameIdRef.current = requestAnimationFrame(animate);
            controlsRef.current?.update(); // Update orbit controls
            if (sceneRef.current && cameraRef.current) { // Check scene/camera refs
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        // --- Cleanup Function ---
        return () => {
            console.log("Running cleanup...");
            // Stop animation loop FIRST
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
            // Remove listeners
            window.removeEventListener('resize', handleResize);
            // Dispose controls
            controlsRef.current?.dispose();
            // Destroy GUI
            if (guiRef.current) { guiRef.current.destroy(); guiMountRef.current?.replaceChildren(); }
            // Dispose scene contents
            if (sceneRef.current) {
                 // Dispose mesh geometry and material (if unique)
                 if (myMeshRef.current) {
                      myMeshRef.current.geometry?.dispose();
                      // Material is shared, dispose below
                      sceneRef.current.remove(myMeshRef.current); // Remove from scene
                 }
                 // Dispose shared material
                 materialRef.current?.dispose();
                 // Dispose temp geometry
                 tempGeometryRef.current?.dispose();
                 // Dispose grid helper geometry and material
                 if (gridHelperRef.current) {
                      gridHelperRef.current.geometry?.dispose();
                      if (gridHelperRef.current.material) {
                           if (Array.isArray(gridHelperRef.current.material)) {
                                gridHelperRef.current.material.forEach(m => m.dispose());
                           } else { gridHelperRef.current.material.dispose(); }
                      }
                      sceneRef.current.remove(gridHelperRef.current);
                 }
            }
            // Dispose renderer
            rendererRef.current?.dispose();
            // Nullify all refs LAST
            sceneRef.current = null; cameraRef.current = null; rendererRef.current = null;
            controlsRef.current = null; myMeshRef.current = null; tempGeometryRef.current = null;
            materialRef.current = null; gridHelperRef.current = null; guiRef.current = null;
            console.log("Cleanup finished.");
        };
    // Only trigger main setup/cleanup if mobile status changes (for GUI)
    // Other updates are handled by specific handlers or the separate decimateAmount effect
    }, [isMobile]);

    // Separate effect for updating derived UI info when decimateAmount changes
    useEffect(() => {
        if (myMeshRef.current) updateModelInfo(myMeshRef.current);
    }, [decimateAmount, updateModelInfo]); // updateModelInfo is stable due to useCallback

    // --- JSX ---
    return (
        // Styles remain the same
        <div className="w-screen h-screen overflow-hidden bg-black relative font-sans">
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full outline-none z-0" />
            <div ref={guiMountRef} className="absolute top-2 right-2 z-20"></div>
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-y-4 font-mono text-gray-100">
                <div className="mb-2">
                    <label htmlFor="defaults" className="block mb-1.5 text-sm">Default models:</label>
                    <select /* ... dropdown attributes ... */
                         name="defaults" id="defaults" onChange={handleDropdownChange} defaultValue=""
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 disabled:opacity-60"
                        disabled={modifierInProgressRef.current}
                    >
                        <option disabled value=""> -- Select a model -- </option>
                        <option value="bust">Sculpture</option>
                        <option value="test">Bunny</option>
                        <option value="frog">Frog</option>
                        <option value="scan">Scan</option>
                    </select>
                </div>
                {!isMobile && (
                    <div className="mb-2">
                        <label htmlFor="file-selector" className="block mb-1.5 text-sm">Choose .STL file</label>
                        <input /* ... file input attributes ... */
                            type="file" id="file-selector" name="userModel" accept=".stl"
                            onChange={handleFileChange} disabled={modifierInProgressRef.current}
                            className="block w-full text-sm text-gray-300 border border-gray-600 rounded-lg cursor-pointer bg-gray-700 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                    </div>
                 )}
            </div>
            <div className="absolute left-4 bottom-4 z-10 font-mono text-gray-100 bg-black/70 p-3 rounded-md text-xs leading-snug max-w-xs shadow-lg">
                 <p>Current Tris: <span className="font-semibold text-white">{modelInfo.currentTri.toLocaleString()}</span></p>
                 <p>Target Tris: <span className="font-semibold text-white">{modelInfo.targetTri.toLocaleString()}</span></p>
                 <p>Progress:
                    <span className={`font-semibold ml-1 ${modelInfo.progress < 100 && modifierInProgressRef.current ? 'text-yellow-300' : 'text-green-400'}`}>
                        {modelInfo.progress}%
                    </span>
                 </p>
                 <hr className="my-2 border-gray-600"/>
                 <p className="text-gray-400">Low Poly Generator</p>
            </div>
        </div>
    );
};

export default LowPolyGeneratorPage;