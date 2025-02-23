'use client';
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, Grid, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'

interface ModelProps {
  url: string
  scale?: [number, number, number]
  position?: [number, number, number]
}

function Model({ url, scale = [1, 1, 1], position = [0, 0, 0] }: ModelProps) {
  const { scene } = useGLTF(url)
  scene.scale.set(...scale)
  scene.position.set(...position)
  return <primitive object={scene} />
}
export default function ModelViewer({ modelUrl }: { modelUrl?: string }) {
  return (
    <div className="w-full h-full overflow-hidden">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <Stage environment="city" intensity={0.6}>
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
            {/* {modelUrl ? (
              <Model url={modelUrl} scale={[1, 1, 1]} />
            ) : (
              <Model url="/output.glb" scale={[5, 5, 5]} position={[0, 3, 0]} />
            )} */}
            {modelUrl && (
              <Model url={modelUrl} scale={[1, 1, 1]} position={[0, 3, 0]} />
            )}
          </Stage>
          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>
    </div>
  )
}