import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ProjectedMaterial from 'three-projected-material';

const ProjectedMaterialDemo = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const projectorCameraRef = useRef(null);
  const materialRef = useRef(null);
  const meshRef = useRef(null);
  const controlsRef = useRef(null);

  // Texture fitting controls
  const [textureScale, setTextureScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [coverMode, setCoverMode] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);

  // Initialize the scene once
  useEffect(() => {
    // Initialize scene
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x222222);

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(2, 2, 2);
    camera.lookAt(0, 0, 0);

    // Create projector camera
    const projectorCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    projectorCameraRef.current = projectorCamera;
    projectorCamera.position.set(5, 2, 0);
    projectorCamera.lookAt(0, 0, 0);
    
    // Add projector camera helper
    const helper = new THREE.CameraHelper(projectorCamera);
    scene.add(helper);

    // Add some light to the scene (important!)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.update();

    // Create geometry for the box
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    
    // Load texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      // Use a placeholder texture URL that's guaranteed to work
      '/DragonInput.png',
      (texture) => {
        console.log("Texture loaded successfully");
        
        // Create the projected material
        const material = new ProjectedMaterial({
          camera: projectorCamera,
          texture: texture,
          textureScale,
          textureOffset: new THREE.Vector2(offsetX, offsetY),
          cover: coverMode,
          backgroundOpacity,
          color: '#ffffff', // White base color
          roughness: 0.3,
        });
        
        materialRef.current = material;
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        scene.add(mesh);
        
        // Project the texture on the mesh
        material.project(mesh);
        
        // Force a render
        renderer.render(scene, camera);
      },
      // onProgress callback
      undefined,
      // onError callback
      (err) => {
        console.error("Error loading texture:", err);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && cameraRef.current && rendererRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []); // Empty dependency array to initialize once

  // Update material when texture fitting controls change
  useEffect(() => {
    if (materialRef.current && meshRef.current) {
      materialRef.current.textureScale = textureScale;
      materialRef.current.textureOffset.set(offsetX, offsetY);
      materialRef.current.cover = coverMode;
      materialRef.current.backgroundOpacity = backgroundOpacity;
      materialRef.current.project(meshRef.current);
    }
  }, [textureScale, offsetX, offsetY, coverMode, backgroundOpacity]);

  // Function to update projector camera position
  const updateProjectorPosition = (x, y, z) => {
    if (projectorCameraRef.current && materialRef.current && meshRef.current) {
      projectorCameraRef.current.position.set(x, y, z);
      projectorCameraRef.current.lookAt(0, 0, 0);
      materialRef.current.project(meshRef.current);
    }
  };

  return (
    <div>
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '400px' }}
      />
      
      <div className="controls" style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Texture Fitting Controls</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Texture Scale: {textureScale.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={textureScale}
            onChange={(e) => setTextureScale(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Offset X: {offsetX.toFixed(2)}
          </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={offsetX}
            onChange={(e) => setOffsetX(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Offset Y: {offsetY.toFixed(2)}
          </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={offsetY}
            onChange={(e) => setOffsetY(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Background Opacity: {backgroundOpacity.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={backgroundOpacity}
            onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px' }}>
            <input
              type="checkbox"
              checked={coverMode}
              onChange={(e) => setCoverMode(e.target.checked)}
            />
            Cover Mode
          </label>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
            When enabled, behaves like CSS background-size: cover
          </div>
        </div>
        
        <div>
          <h4>Projector Camera Position</h4>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={() => updateProjectorPosition(5, 2, 0)}
              style={{ padding: '8px 12px' }}
            >
              Side View
            </button>
            <button 
              onClick={() => updateProjectorPosition(0, 5, 0)}
              style={{ padding: '8px 12px' }}
            >
              Top View
            </button>
            <button 
              onClick={() => updateProjectorPosition(3, 3, 3)}
              style={{ padding: '8px 12px' }}
            >
              Corner View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectedMaterialDemo;