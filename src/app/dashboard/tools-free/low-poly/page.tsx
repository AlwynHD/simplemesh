"use client";

import React, { useState, useCallback, Suspense, useMemo, useRef, useEffect } from 'react';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import * as st from 'simplify-triangles';
import * as THREE from 'three';

import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, Html, Center, Grid } from '@react-three/drei';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  FileUp, FileDown, Eye, Download, Info, CheckCircle, AlertTriangle,
  Loader, Maximize, X, Square, Layers3, Settings, Rabbit, ShieldCheck, Trash2, RotateCcw
} from "lucide-react";


type Vertex = [number, number, number];
type Triangle = [Vertex, Vertex, Vertex];

function geometryToTriangles(geometry: THREE.BufferGeometry): Triangle[] {
  const positionAttribute = geometry.getAttribute('position');
  if (!positionAttribute) return [];

  const positions = positionAttribute.array;
  const triangles: Triangle[] = [];
  const index = geometry.getIndex();

  if (index) {
    const indices = index.array;
    for (let i = 0; i < indices.length; i += 3) {
      if (indices[i] === undefined || indices[i + 1] === undefined || indices[i + 2] === undefined) break;

      const i1 = indices[i] * 3;
      const i2 = indices[i + 1] * 3;
      const i3 = indices[i + 2] * 3;

      if (positions[i1+2] === undefined || positions[i2+2] === undefined || positions[i3+2] === undefined) break;

      const v1: Vertex = [positions[i1], positions[i1 + 1], positions[i1 + 2]];
      const v2: Vertex = [positions[i2], positions[i2 + 1], positions[i2 + 2]];
      const v3: Vertex = [positions[i3], positions[i3 + 1], positions[i3 + 2]];

      if (v1.some(isNaN) || v2.some(isNaN) || v3.some(isNaN)) {
        console.warn("Skipping triangle with NaN vertices:", [v1, v2, v3]);
        continue;
      }

      triangles.push([v1, v2, v3]);
    }
  } else {
    for (let i = 0; i < positions.length; i += 9) {
      if (positions[i + 8] === undefined) break;

      const v1: Vertex = [positions[i], positions[i + 1], positions[i + 2]];
      const v2: Vertex = [positions[i + 3], positions[i + 4], positions[i + 5]];
      const v3: Vertex = [positions[i + 6], positions[i + 7], positions[i + 8]];

      if (v1.some(isNaN) || v2.some(isNaN) || v3.some(isNaN)) {
        console.warn("Skipping triangle with NaN vertices (non-indexed):", [v1, v2, v3]);
        continue;
      }

      triangles.push([v1, v2, v3]);
    }
  }

  return triangles;
}

function trianglesToGeometry(triangles: Triangle[]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  if (!triangles || triangles.length === 0) {
    return geometry;
  }

  const vertexCount = triangles.length * 3;
  const positions = new Float32Array(vertexCount * 3);
  let posIdx = 0;

  for (const triangle of triangles) {
    if (!triangle || triangle.length !== 3) {
      console.warn("Skipping invalid triangle structure:", triangle);
      continue;
    }

    const v1 = triangle[0];
    const v2 = triangle[1];
    const v3 = triangle[2];

    if (!v1 || v1.length !== 3 || v1.some(isNaN) ||
        !v2 || v2.length !== 3 || v2.some(isNaN) ||
        !v3 || v3.length !== 3 || v3.some(isNaN)) {
      console.warn("Skipping triangle with invalid or NaN vertices:", triangle);
      continue;
    }

    positions[posIdx++] = v1[0]; positions[posIdx++] = v1[1]; positions[posIdx++] = v1[2];
    positions[posIdx++] = v2[0]; positions[posIdx++] = v2[1]; positions[posIdx++] = v2[2];
    positions[posIdx++] = v3[0]; positions[posIdx++] = v3[1]; positions[posIdx++] = v3[2];
  }

  const finalPositions = (posIdx === positions.length) ? positions : positions.slice(0, posIdx);

  if (finalPositions.length === 0) {
    console.warn("No valid positions found after processing triangles.");
    return geometry;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(finalPositions, 3));
  geometry.computeVertexNormals();

  return geometry;
}

function calculateBounds(triangles: Triangle[]): {
  min: THREE.Vector3;
  max: THREE.Vector3;
  center: THREE.Vector3;
} {
  if (!triangles || triangles.length === 0) {
    return {
      min: new THREE.Vector3(),
      max: new THREE.Vector3(),
      center: new THREE.Vector3()
    };
  }

  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

  for (const triangle of triangles) {
    if (!triangle || triangle.length !== 3) continue;
    for (const vertex of triangle) {
      if (!vertex || vertex.length !== 3 || vertex.some(isNaN)) continue;

      const [x, y, z] = vertex;
      min.x = Math.min(min.x, x);
      min.y = Math.min(min.y, y);
      min.z = Math.min(min.z, z);

      max.x = Math.max(max.x, x);
      max.y = Math.max(max.y, y);
      max.z = Math.max(max.z, z);
    }
  }

  if (!isFinite(min.x) || !isFinite(max.x)) {
      return {
          min: new THREE.Vector3(),
          max: new THREE.Vector3(),
          center: new THREE.Vector3()
      };
  }

  const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);

  return { min, max, center };
}


const GridFloor = () => {
  return (
    <Grid
      position={[0, -0.01, 0]}
      args={[100, 100]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#6f6f6f"
      sectionSize={10}
      sectionThickness={1}
      sectionColor="#f59e0b"
      fadeDistance={100}
      infiniteGrid
    />
  );
};

interface ModelProps {
  triangles: Triangle[] | null;
  showWireframe: boolean;
}

const Model = React.forwardRef<THREE.Mesh, ModelProps>(({ triangles, showWireframe }, ref) => {
    const normalizeGeometry = useCallback((geo: THREE.BufferGeometry) => {
        geo.computeBoundingBox();
        if (!geo.boundingBox) return geo;
        const box = geo.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim === 0 || !isFinite(maxDim)) return geo;
        const scale = 2 / maxDim;
        geo.scale(scale, scale, scale);
        geo.center();
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
        return geo;
    }, []);

    const geometry = useMemo(() => {
        if (!triangles) return null;
        const geo = trianglesToGeometry(triangles);
        if (geo.attributes.position?.count > 0) {
            return normalizeGeometry(geo);
        }
        console.warn("Created geometry has no valid positions.");
        return null;
    }, [triangles, normalizeGeometry]);

    const solidMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: "#e2e8f0",
            wireframe: false,
            side: THREE.DoubleSide,
            flatShading: false,
            metalness: 0.2,
            roughness: 0.7,
        });
    }, []);

    const wireframeMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            color: "#0f172a",
            wireframe: true,
            depthTest: true,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
            side: THREE.DoubleSide,
        });
    }, []);

    const zUpToYUpRotation = useMemo(() => new THREE.Euler(-Math.PI / 2, 0, 0), []);

    if (!geometry) return null;

    return (
        <Center top>
            <mesh
                ref={ref}
                geometry={geometry}
                material={solidMaterial}
                rotation={zUpToYUpRotation}
                castShadow
                receiveShadow
            />
            {showWireframe && (
                <mesh
                    geometry={geometry}
                    material={wireframeMaterial}
                    rotation={zUpToYUpRotation}
                />
            )}
        </Center>
    );
});
Model.displayName = 'Model';

interface CameraProps {
  modelRef: React.RefObject<THREE.Mesh>;
  autoFit: boolean;
  originalTriangles: Triangle[] | null;
}

const CameraControl: React.FC<CameraProps> = ({ modelRef, autoFit, originalTriangles }) => {
  const controlsRef = useRef<CameraControls | null>(null);
  const initialFitRef = useRef<boolean>(false);

  useEffect(() => {
    if (autoFit && originalTriangles) {
      initialFitRef.current = false;
    }
  }, [originalTriangles, autoFit]);

  useFrame((state, delta) => {
    if (!controlsRef.current || !modelRef.current || initialFitRef.current || !autoFit) {
        return;
    }

    const mesh = modelRef.current;
    if (mesh && mesh.geometry && mesh.geometry.boundingSphere) {
        const radius = mesh.geometry.boundingSphere.radius;
        if (radius > 0 && isFinite(radius)) {
            try {
                controlsRef.current.fitToBox(mesh, true, {
                    paddingTop: 0.2, paddingBottom: 0.2, paddingLeft: 0.2, paddingRight: 0.2,
                });

                 const distance = radius * 2.5;
                 const target = new THREE.Vector3();
                 mesh.getWorldPosition(target);

                 controlsRef.current.setPosition(
                    target.x, target.y + distance * 0.3, target.z + distance, true
                 );
                 controlsRef.current.setTarget(target.x, target.y, target.z, true);

                initialFitRef.current = true;
            } catch (error) {
                console.error("Error during camera fit:", error);
                initialFitRef.current = true;
            }
        }
    }
  });

  return <CameraControls ref={controlsRef} makeDefault />;
};


interface SceneProps {
  triangles: Triangle[] | null;
  originalTriangles: Triangle[] | null;
  isProcessing: boolean;
  showWireframe: boolean;
}

const Scene: React.FC<SceneProps> = ({ triangles, originalTriangles, isProcessing, showWireframe }) => {
  const [autoFit] = useState<boolean>(true);
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Canvas
      shadows
      camera={{ position: [3, 3, 3], fov: 60 }}
      style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <CameraControl
        modelRef={meshRef}
        autoFit={autoFit}
        originalTriangles={originalTriangles}
      />
      <ambientLight intensity={0.7} color="#ffffff" />
      <directionalLight
          position={[5, 10, 7]}
          intensity={1.2}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0005}
      />
       <pointLight position={[-5, -3, -6]} intensity={0.4} color="#a5f3fc" />
      <GridFloor />
      <Suspense fallback={
        <Html center>
            <div className="px-4 py-2 bg-background/90 text-foreground rounded-md border border-border flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" /> Loading Preview...
            </div>
        </Html>
      }>
        <Model
          triangles={triangles}
          ref={meshRef}
          showWireframe={showWireframe}
        />
      </Suspense>
      {isProcessing && (
        <Html center>
          <div className="px-4 py-2 bg-background/90 text-foreground rounded-md border border-border flex items-center gap-2">
             <Rabbit className="h-4 w-4 animate-pulse text-primary" /> Simplifying...
          </div>
        </Html>
      )}
    </Canvas>
  );
};

const FileDropZone = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  disabled,
  fileName
}: {
  isDragging: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  disabled: boolean;
  fileName: string;
}) => (
  <div
    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 ease-in-out
      ${isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-secondary/50'}
      ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={disabled ? undefined : onDrop}
    onClick={disabled ? undefined : onClick}
  >
    <FileUp className={`h-8 w-8 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground/70'}`} />
    <p className="text-sm font-medium">
        {fileName ? 'Drop another STL or' : 'Drag & drop your STL model'}
    </p>
     <p className="text-xs text-muted-foreground">
        {fileName ? '' : 'or '}
        <button type="button" disabled={disabled} onClick={disabled ? undefined : onClick} className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed">
         {fileName ? 'click to replace' : 'click to browse'}
        </button>
    </p>
    {fileName && (
        <Badge variant="secondary" className="mt-2 max-w-full truncate flex items-center gap-1.5 text-xs px-2 py-0.5" title={fileName}>
            <Layers3 className="h-3 w-3 flex-shrink-0" />
            {fileName}
        </Badge>
    )}
     <p className="text-xs text-muted-foreground mt-3">Only .stl files accepted</p>
  </div>
);

const StatsDisplay = ({ originalCount, currentCount, reductionPercent }: {
  originalCount: number;
  currentCount: number;
  reductionPercent: string
}) => (
  <div className="space-y-2 text-xs mt-3 pt-3 border-t border-border">
     <h4 className="font-medium text-xs mb-2 text-center text-muted-foreground uppercase tracking-wider">Statistics</h4>
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">Original Polygons:</span>
      <Badge variant="outline" className="font-mono text-xs px-1.5 py-0.5">{originalCount.toLocaleString()}</Badge>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">Optimized Polygons:</span>
      <Badge variant="outline" className="font-mono text-xs px-1.5 py-0.5">{currentCount.toLocaleString()}</Badge>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">Reduction:</span>
       <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
               <Badge
                  variant={parseFloat(reductionPercent) >= 90 ? "destructive" : parseFloat(reductionPercent) > 50 ? "default" : "secondary"}
                  className={`font-mono text-xs px-1.5 py-0.5 ${parseFloat(reductionPercent) > 50 && parseFloat(reductionPercent) < 90 ? 'bg-primary/90 text-primary-foreground' : ''} ${parseFloat(reductionPercent) <= 50 && parseFloat(reductionPercent) > 0 ? 'bg-green-600 text-white' : ''}`}
               >
                  {reductionPercent}%
               </Badge>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{reductionPercent}% fewer polygons</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
);

export default function SimplifierPage(): JSX.Element {
  const [originalTriangles, setOriginalTriangles] = useState<Triangle[] | null>(null);
  const [currentTriangles, setCurrentTriangles] = useState<Triangle[] | null>(null);
  const [simplificationLevel, setSimplificationLevel] = useState<number>(0.5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<THREE.Mesh>(null);

  const originalCount = originalTriangles?.length || 0;
  const currentCount = currentTriangles?.length || 0;
  const reductionPercent = useMemo(() => {
    if (originalCount === 0) return '0.0';
    const reduction = 1 - (currentCount / originalCount);
    return (reduction * 100).toFixed(1);
  }, [originalCount, currentCount]);
  const isModelLoaded = !!originalTriangles && !!currentTriangles;
  const isBusy = isLoading || isProcessing;

  const loadFile = useCallback((file: File) => {
    if (!file) {
        setError('No file selected.');
        return;
    }
    if (!file.name.toLowerCase().endsWith('.stl')) {
      setError('Please select an STL file.');
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setCurrentTriangles(null);
    setOriginalTriangles(null);
    setError(null);
    setShowWireframe(false);

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const contents = event.target?.result;
        if (!contents) throw new Error("Failed to read file contents.");
        const loader = new STLLoader();
        const geometry = loader.parse(contents as ArrayBuffer);
        if (!geometry.hasAttribute('position') || geometry.attributes.position.count === 0) {
          throw new Error('STL file contains no vertex data or failed to parse.');
        }
        geometry.computeVertexNormals();
        const triangles = geometryToTriangles(geometry);
        if (triangles.length === 0) {
          throw new Error("Could not extract valid triangles from the file.");
        }
        setOriginalTriangles(triangles);
        setCurrentTriangles(triangles);
        setSimplificationLevel(0.5);
      } catch (err: any) {
        console.error("Error processing STL:", err);
        setError(`Error loading STL: ${err.message || 'Unknown error'}`);
        setFileName('');
        setCurrentTriangles(null);
        setOriginalTriangles(null);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      setError("Failed to read the file.");
      setIsLoading(false);
      setFileName('');
      setCurrentTriangles(null);
      setOriginalTriangles(null);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadFile(file);
    }
    if (event.target) event.target.value = '';
  }, [loadFile]);

  const handleSimplify = useCallback(() => {
    if (!originalTriangles || originalTriangles.length === 0) {
      setError("Load a model before simplifying.");
      return;
    }
    const targetRatioToKeep = Math.max(0.0001, 1.0 - simplificationLevel);
    if (targetRatioToKeep <= 0 || targetRatioToKeep > 1) {
      setError("Internal error: Invalid simplification ratio.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const simplified = st.simplify(originalTriangles, targetRatioToKeep);
        if (simplified.length === 0 && originalTriangles.length > 0 && targetRatioToKeep > 0) {
            console.warn("Simplification resulted in 0 triangles.");
        }
        setCurrentTriangles(simplified);
      } catch (err: any) {
        setError(`Simplification error: ${err.message || 'Unknown error'}.`);
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  }, [originalTriangles, simplificationLevel]);

  const resetModel = useCallback(() => {
    if (!originalTriangles) return;
    setCurrentTriangles(originalTriangles);
    setSimplificationLevel(0.5);
    setError(null);
  }, [originalTriangles]);

  const handleDownload = useCallback(() => {
    if (!currentTriangles || currentTriangles.length === 0) {
      setError("No model data to download.");
      return;
    }
    try {
      const geometryToExport = trianglesToGeometry(currentTriangles);
      if (geometryToExport.attributes.position.count === 0) {
        throw new Error("Cannot export empty geometry.");
      }
      const meshToExport = new THREE.Mesh(geometryToExport);
      const exporter = new STLExporter();
      const result = exporter.parse(meshToExport, { binary: true });
      const blob = new Blob([result], { type: 'application/sla' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      let downloadFilename = `simplified_${currentCount}_polys.stl`;
      if (fileName) {
        const baseName = fileName.replace(/\.stl$/i, '');
        const suffix = (currentTriangles !== originalTriangles) ? '_simplified' : '_original';
        downloadFilename = `${baseName}${suffix}_${currentCount}_polys.stl`;
      }
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setError(null);
    } catch (err: any) {
      setError(`Download error: ${err.message || 'Unknown error'}.`);
    }
  }, [currentTriangles, originalTriangles, fileName, currentCount]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); event.stopPropagation();
    if (!isBusy) setIsDragging(true);
  }, [isBusy]);
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); event.stopPropagation();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); event.stopPropagation();
    setIsDragging(false);
    if (isBusy) return;
    const file = event.dataTransfer.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      loadFile(file);
    } else if (file) {
      setError("Please drop an STL file.");
    }
  }, [loadFile, isBusy]);

   const triggerFileInput = useCallback(() => {
    if (!isBusy && fileInputRef.current) fileInputRef.current.click();
  }, [isBusy]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background p-4 sm:p-6">
      <div className="mb-4 text-center flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Low Poly Mesh Simplifier</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm mt-1">
          Optimize 3D models for game development. Reduce polygons in your browser.
        </p>
         <p className="text-xs text-muted-foreground/80 mt-1 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-green-500" /> All processing is done locally. Your files stay private.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-grow min-h-0">

        <div className="lg:col-span-1 space-y-4 flex flex-col min-h-0">
          <Card className="shadow-sm border-border flex-shrink-0">
            <CardHeader className="py-3 px-4 bg-secondary/30 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileUp className="h-4 w-4 text-primary" /> Load Model
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <input
                ref={fileInputRef} type="file" accept=".stl" onChange={handleFileChange}
                disabled={isBusy} className="hidden" aria-label="File input"
              />
              <FileDropZone
                isDragging={isDragging} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                onDrop={handleDrop} onClick={triggerFileInput} disabled={isBusy} fileName={fileName}
              />
            </CardContent>
          </Card>

          <div className="flex-grow flex flex-col min-h-0">
              {isModelLoaded ? (
                <Card className="flex-grow flex flex-col shadow-sm border-border min-h-0">
                  <CardHeader className="py-3 px-4 bg-secondary/30 border-b border-border flex-shrink-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-4 w-4 text-primary" /> Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between overflow-y-auto">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="simplification" className="font-medium text-xs flex items-center gap-1">
                                Strength
                                <TooltipProvider delayDuration={100}><Tooltip>
                                    <TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>Higher value = fewer polygons.</p></TooltipContent>
                                </Tooltip></TooltipProvider>
                            </Label>
                            <span className="text-xs font-mono text-muted-foreground">{simplificationLevel.toFixed(2)}</span>
                          </div>
                          <Slider id="simplification" min={0.01} max={1.0} step={0.01} value={[simplificationLevel]}
                            onValueChange={(value) => setSimplificationLevel(value[0])} disabled={isBusy} aria-label="Simplification level" />
                      </div>

                      <div className="flex items-center space-x-2 pt-2 border-t border-border">
                        <Switch id="wireframe-toggle" checked={showWireframe} onCheckedChange={setShowWireframe} disabled={!isModelLoaded || isBusy} aria-label="Toggle wireframe" />
                        <Label htmlFor="wireframe-toggle" className="text-xs cursor-pointer select-none">Show Wireframe</Label>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                          <Button size="sm" variant="default" onClick={handleSimplify} disabled={isBusy || !isModelLoaded} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          {isProcessing ? (<> <Loader className="mr-1 h-3.5 w-3.5 animate-spin" /> Simplifying... </>) : (<> <Rabbit className="mr-1 h-3.5 w-3.5" /> Simplify </>)}
                          </Button>
                          <Button size="sm" variant="outline" onClick={resetModel} disabled={isBusy || !isModelLoaded || currentTriangles === originalTriangles} className="w-full">
                           <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
                          </Button>
                      </div>
                      <div className="pt-2 border-t border-border">
                           <Button size="sm" variant="secondary" onClick={handleDownload} disabled={isBusy || !isModelLoaded} className="w-full">
                              <Download className="mr-1 h-3.5 w-3.5" /> Download Model
                           </Button>
                      </div>
                    </div>

                    <StatsDisplay originalCount={originalCount} currentCount={currentCount} reductionPercent={reductionPercent} />
                  </CardContent>
                </Card>
              ) : isLoading ? (
                  <Card className="flex-grow flex items-center justify-center border-dashed border-border bg-secondary/30">
                    <CardContent className="text-center text-muted-foreground p-4">
                        <Loader className="h-6 w-6 mx-auto mb-2 text-primary animate-spin" />
                        <p className="text-xs font-medium">Loading model...</p>
                    </CardContent>
                  </Card>
              ) : (
                <Card className="flex-grow flex items-center justify-center border-dashed border-border bg-secondary/30">
                    <CardContent className="text-center text-muted-foreground p-4">
                        <Settings className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-xs font-medium">Load an STL model</p>
                        <p className="text-xs">Optimization controls will appear.</p>
                    </CardContent>
                </Card>
              )}
          </div>

          {error && (
            <Alert variant="destructive" className="flex-shrink-0">
                <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <Card className="lg:col-span-3 overflow-hidden flex flex-col shadow-inner border-border bg-card h-full">
             <CardHeader className="py-3 px-4 bg-secondary/30 border-b border-border flex-shrink-0">
                 <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-4 w-4 text-primary" /> Model Preview
                 </CardTitle>
             </CardHeader>
            <CardContent className="p-0 relative flex-grow min-h-0 bg-gradient-to-br from-muted/10 via-card to-muted/20">
                {isModelLoaded && currentTriangles ? (
                <Scene
                    triangles={currentTriangles}
                    originalTriangles={originalTriangles}
                    isProcessing={isProcessing || isLoading}
                    showWireframe={showWireframe}
                />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center p-4">
                    <Layers3 className="w-16 h-16 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground font-medium text-sm">Upload an STL file to preview</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">3D model will be displayed here</p>
                    </div>
                )}
                {isLoading && !isModelLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-20 text-center p-4">
                    <Loader className="h-8 w-8 text-primary animate-spin mb-3" />
                    <p className="text-base font-medium text-foreground">Loading 3D Model...</p>
                </div>
                )}
            </CardContent>
            {isModelLoaded && (
                <div className="py-1.5 px-4 text-xs text-center text-muted-foreground border-t border-border bg-secondary/30 flex-shrink-0">
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                    <span>Drag: Rotate</span>
                    <span>Scroll: Zoom</span>
                    <span>RMB/Shift+Drag: Pan</span>
                </div>
                </div>
            )}
        </Card>

      </div>
    </div>
  );
}