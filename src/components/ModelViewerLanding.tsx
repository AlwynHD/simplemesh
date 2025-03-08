import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, enhanceContrast = false }: { url: string, enhanceContrast?: boolean }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    if (enhanceContrast) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Increase brightness and contrast
          child.material.toneMapped = false;
          
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.color) mat.color.multiplyScalar(1.2);
            });
          } else if (child.material.color) {
            child.material.color.multiplyScalar(1.2);
          }
        }
      });
    }
  }, [scene, enhanceContrast]);

  return <primitive object={scene} scale={1} />;
}

export default function ModelViewer({ modelPath }: { modelPath: string }) {
  return (
    <div className="w-full h-[50vh]">
      <Canvas 
        camera={{ position: [0, 0, 2], fov: 45 }}
        gl={{ outputColorSpace: THREE.SRGBColorSpace }}
        style={{ background: '#000' }} // Pure white background
      >
        {/* Increased ambient light for overall brightness */}
        <ambientLight intensity={1.5} />
        
        {/* Multiple directional lights from different angles */}
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <directionalLight position={[-10, -10, 5]} intensity={0.8} />
        <directionalLight position={[0, 5, -10]} intensity={0.6} />
        
        {/* Hemisphere light for more natural illumination */}
        <hemisphereLight 
          color="#ffffff" 
          groundColor="#bbbbff" 
          intensity={0.7} 
        />
        
        <Suspense fallback={null}>
          <Model url={modelPath} enhanceContrast={true} />
          <Environment preset="park"  />
          <OrbitControls autoRotate />
        </Suspense>
      </Canvas>
    </div>
  );
}