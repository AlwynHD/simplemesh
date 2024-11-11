// components/ModelViewer.tsx
'use client';
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF, Grid } from '@react-three/drei'
import { Suspense } from 'react'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export default function ModelViewer({ modelUrl }: { modelUrl?: string }) {
  return (
    <div className="w-full h-full overflow-hidden bg-slate-100">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 75 }} >
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            {/* Ground */}
            <Grid
              position={[0, -0.5, 0]}
              args={[10.5, 10.5]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#6f6f6f"
              sectionSize={3}
              sectionThickness={1}
              sectionColor="#9d4b4b"
              fadeDistance={30}
              fadeStrength={1}
              followCamera={false}
            />
            
            {modelUrl ? (
              <Model url={modelUrl} />
            ) : (
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" />
              </mesh>
            )}
          </Stage>
          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>
    </div>
  )
}