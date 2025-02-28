// components/ModelTopology.tsx
import { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Card } from "@/components/ui/card";
import * as THREE from 'three';

interface ModelTopologyProps {
  url: string;
  visible?: boolean;
}

interface TopologyStats {
  faces: number;
  vertices: number;
  triangles: number;
}

export function ModelTopology({ url, visible = true }: ModelTopologyProps) {
  const [stats, setStats] = useState<TopologyStats>({
    faces: 0,
    vertices: 0,
    triangles: 0
  });
  
  const { scene } = useGLTF(url);
  
  // Extract topology information when the model loads
  useEffect(() => {
    if (!scene) return;
    
    let totalVertices = 0;
    let totalFaces = 0;
    let totalTriangles = 0;
    
    scene.traverse((node: THREE.Object3D) => {
      if ((node as THREE.Mesh).isMesh && (node as THREE.Mesh).geometry) {
        const mesh = node as THREE.Mesh;
        const geometry = mesh.geometry as THREE.BufferGeometry;
        
        // Get vertex count
        if (geometry.attributes.position) {
          totalVertices += geometry.attributes.position.count;
        }
        
        // Get face/triangle count
        if (geometry.index) {
          totalTriangles += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          // For non-indexed geometries
          totalTriangles += geometry.attributes.position.count / 3;
        }
      }
    });
    
    // In Three.js, faces are typically triangles
    totalFaces = totalTriangles;
    
    setStats({
      vertices: totalVertices,
      faces: totalFaces,
      triangles: totalTriangles
    });
  }, [scene]);
  
  if (!visible) return null;
  
  return (
    <Card className="absolute top-4 left-4 w-48 bg-popover text-popover-foreground border-border shadow-xl rounded-[var(--radius)]">
      <div className="p-3 space-y-1">
        <div className="text-sm font-medium text-primary">Topology</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          <span className="text-muted-foreground">Faces</span>
          <span className="text-right">{stats.faces.toLocaleString()}</span>
          <span className="text-muted-foreground">Vertices</span>
          <span className="text-right">{stats.vertices.toLocaleString()}</span>
          <span className="text-muted-foreground">Triangles</span>
          <span className="text-right">{stats.triangles.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
}