'use client';
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, Grid, useGLTF, Html, useProgress } from '@react-three/drei'
import { Suspense, useRef, useEffect, useReducer, memo, useState } from 'react'
import * as THREE from 'three'
import { ErrorBoundary } from 'react-error-boundary'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ResetIcon, Cross2Icon } from "@radix-ui/react-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
// Import HexColorPicker from react-colorful
import { HexColorPicker, HexColorInput } from "react-colorful"
import { ModelTopology } from "@/components/ModelTopology";
import { Switch } from "@/components/ui/switch"; // Import Switch component

// Valid environment options for Stage
type EnvironmentType = "lobby" | "apartment" | "city" | "dawn" | "forest" | "night" | "park" | "studio" | "sunset" | "warehouse";

// State management
type ModelViewerState = {
  brightness: number;
  contrast: number;
  roughness: number;
  metalness: number;
  scale: number;
  rotation: number;
  color: string;
  ambientIntensity: number;
  stageIntensity: number;
  environment: EnvironmentType;
  showControls: boolean;
  textureEnabled: boolean; // New state for texture toggle
  wireframeEnabled: boolean; // New state for wireframe toggle
}

type ModelViewerAction = 
  | { type: 'SET_BRIGHTNESS', value: number }
  | { type: 'SET_CONTRAST', value: number }
  | { type: 'SET_ROUGHNESS', value: number }
  | { type: 'SET_METALNESS', value: number }
  | { type: 'SET_SCALE', value: number }
  | { type: 'SET_ROTATION', value: number }
  | { type: 'SET_COLOR', value: string }
  | { type: 'SET_AMBIENT_INTENSITY', value: number }
  | { type: 'SET_STAGE_INTENSITY', value: number }
  | { type: 'SET_ENVIRONMENT', value: EnvironmentType }
  | { type: 'TOGGLE_CONTROLS' }
  | { type: 'TOGGLE_TEXTURE', value: boolean } // New action
  | { type: 'TOGGLE_WIREFRAME', value: boolean } // New action
  | { type: 'RESET' };

const initialState: ModelViewerState = {
  brightness: 1,
  contrast: 1,
  roughness: 0.5,
  metalness: 0.5,
  scale: 5,
  rotation: 0,
  color: "#ffffff",
  ambientIntensity: 0.5,  // Reduced default ambient light
  stageIntensity: 0.8,    // Increased default stage intensity
  environment: "apartment",
  showControls: true,
  textureEnabled: true, // Default to showing textures
  wireframeEnabled: false // Default to not showing wireframe
};

// Predefined color palette - useful material colors
const colorPresets = [
  "#ffffff", // White
  "#f5f5f5", // Light gray
  "#e0e0e0", // Silver
  "#9e9e9e", // Gray
  "#616161", // Dark gray
  "#212121", // Nearly black
  "#f44336", // Red
  "#e91e63", // Pink
  "#9c27b0", // Purple
  "#673ab7", // Deep Purple
  "#3f51b5", // Indigo
  "#2196f3", // Blue
  "#03a9f4", // Light Blue
  "#00bcd4", // Cyan
  "#009688", // Teal
  "#4caf50", // Green
  "#8bc34a", // Light Green
  "#cddc39", // Lime
  "#ffeb3b", // Yellow
  "#ffc107", // Amber
  "#ff9800", // Orange
  "#ff5722", // Deep Orange
  "#795548", // Brown
  "#607d8b", // Blue Gray
];

function modelViewerReducer(state: ModelViewerState, action: ModelViewerAction): ModelViewerState {
  switch (action.type) {
    case 'SET_BRIGHTNESS':
      return { ...state, brightness: action.value };
    case 'SET_CONTRAST':
      return { ...state, contrast: action.value };
    case 'SET_ROUGHNESS':
      return { ...state, roughness: action.value };
    case 'SET_METALNESS':
      return { ...state, metalness: action.value };
    case 'SET_SCALE':
      return { ...state, scale: action.value };
    case 'SET_ROTATION':
      return { ...state, rotation: action.value };
    case 'SET_COLOR':
      return { ...state, color: action.value };
    case 'SET_AMBIENT_INTENSITY':
      return { ...state, ambientIntensity: action.value };
    case 'SET_STAGE_INTENSITY':
      return { ...state, stageIntensity: action.value };
    case 'SET_ENVIRONMENT':
      return { ...state, environment: action.value };
    case 'TOGGLE_CONTROLS':
      return { ...state, showControls: !state.showControls };
    case 'TOGGLE_TEXTURE':
      return { ...state, textureEnabled: action.value };
    case 'TOGGLE_WIREFRAME':
      return { ...state, wireframeEnabled: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Color picker component that uses react-colorful
function ColorPickerPopover({ color, onChange }: { color: string, onChange: (color: string) => void }) {
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-8 px-2 flex justify-between items-center border-border"
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-sm border border-border" 
              style={{ backgroundColor: color }}
            />
            <span className="text-xs">{color}</span>
          </div>
          <span className="text-xs text-muted-foreground">▼</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-popover border-border">
        <div className="space-y-3">
          <HexColorPicker 
            color={color} 
            onChange={onChange}
            className="w-full !h-40" 
          />
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground whitespace-nowrap">Hex</div>
            <HexColorInput
              color={color}
              onChange={onChange}
              prefixed
              className="w-full h-7 text-xs px-2 py-1 bg-secondary border border-border rounded-md"
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Presets</Label>
            <div className="grid grid-cols-6 gap-1">
              {colorPresets.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => {
                    onChange(presetColor);
                    setOpen(false);
                  }}
                  className="w-6 h-6 rounded-sm border border-border transition-all hover:scale-110 hover:shadow-md"
                  style={{ 
                    backgroundColor: presetColor,
                    outline: color === presetColor ? '2px solid #3f51b5' : 'none',
                    outlineOffset: '1px'
                  }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ModelProps {
  url: string
  scale?: [number, number, number]
  position?: [number, number, number]
  brightness?: number
  contrast?: number
  roughness?: number
  metalness?: number
  color?: string
  rotation?: number
  textureEnabled?: boolean // New prop
  wireframeEnabled?: boolean // New prop
}

// Loading indicator
function Loader() {
  const { progress } = useProgress()
  return <Html center>
    <div className="flex flex-col items-center">
      <div className="text-primary text-sm mb-2">Loading model...</div>
      <div className="w-40 h-1 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}%</div>
    </div>
  </Html>
}

// Error fallback
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 text-center">
      <h3 className="text-destructive font-medium mb-2">Error loading 3D model</h3>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </div>
  );
}

// Memoized grid to prevent unnecessary rerenders
const ModelGrid = memo(() => (
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
));

// Add display name to satisfy ESLint
ModelGrid.displayName = "ModelGrid";

function Model({ 
  url, 
  scale = [1, 1, 1], 
  position = [0, 0, 0],
  brightness = 1,
  contrast = 1,
  roughness = 0.5,
  metalness = 0.5,
  color = "#ffffff",
  rotation = 0,
  textureEnabled = true,
  wireframeEnabled = false
}: ModelProps) {
  const { scene } = useGLTF(url, true) // Enable draco decompression if available
  const modelRef = useRef<THREE.Object3D>()
  
  // Apply scale, position and rotation
  useEffect(() => {
    if (scene) {
      scene.scale.set(...scale)
      scene.position.set(...position)
      scene.rotation.y = rotation
    }
  }, [scene, scale, position, rotation])

  // Apply material properties and toggle settings
  useEffect(() => {
    if (!scene) return
    
    // Store original materials to restore on unmount
    const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()
    // Store original maps to restore when texture is toggled
    const originalMaps = new Map<THREE.Material, THREE.Texture | null>()
    
    scene.traverse((node: THREE.Object3D) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh
        if (mesh.material) {
          // Store original material
          originalMaterials.set(mesh, mesh.material)
          
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((mat: THREE.Material) => {
              const newMat = mat.clone()
              // Store original maps
              if ((newMat as THREE.MeshStandardMaterial).map) {
                originalMaps.set(newMat, (newMat as THREE.MeshStandardMaterial).map)
              }
              
              applyMaterialProperties(newMat, brightness, contrast, roughness, metalness, color, textureEnabled, wireframeEnabled)
              return newMat
            })
          } else {
            mesh.material = mesh.material.clone()
            // Store original map
            if ((mesh.material as THREE.MeshStandardMaterial).map) {
              originalMaps.set(mesh.material, (mesh.material as THREE.MeshStandardMaterial).map)
            }
            
            applyMaterialProperties(mesh.material, brightness, contrast, roughness, metalness, color, textureEnabled, wireframeEnabled)
          }
        }
      }
    })
    
    // Cleanup function to prevent memory leaks
    return () => {
      originalMaterials.forEach((material, mesh) => {
        mesh.material = material
      })
    }
  }, [scene, brightness, contrast, roughness, metalness, color, textureEnabled, wireframeEnabled])

  return <primitive ref={modelRef} object={scene} />
}

function applyMaterialProperties(
  material: THREE.Material, 
  brightness: number, 
  contrast: number, 
  roughness: number, 
  metalness: number, 
  color: string,
  textureEnabled: boolean,
  wireframeEnabled: boolean
): void {
  // Set wireframe property
  if ('wireframe' in material) {
    (material as THREE.MeshBasicMaterial | THREE.MeshLambertMaterial | 
     THREE.MeshPhongMaterial | THREE.MeshStandardMaterial | 
     THREE.MeshPhysicalMaterial).wireframe = wireframeEnabled;
  }
  
  // Handle textures
  if (!textureEnabled) {
    // Disable all texture maps
    if ('map' in material && material.map) {
      (material as THREE.MeshStandardMaterial).map = null;
    }
    if ('normalMap' in material && (material as THREE.MeshStandardMaterial).normalMap) {
      (material as THREE.MeshStandardMaterial).normalMap = null;
    }
    if ('roughnessMap' in material && (material as THREE.MeshStandardMaterial).roughnessMap) {
      (material as THREE.MeshStandardMaterial).roughnessMap = null;
    }
    if ('metalnessMap' in material && (material as THREE.MeshStandardMaterial).metalnessMap) {
      (material as THREE.MeshStandardMaterial).metalnessMap = null;
    }
    if ('aoMap' in material && (material as THREE.MeshStandardMaterial).aoMap) {
      (material as THREE.MeshStandardMaterial).aoMap = null;
    }
    if ('emissiveMap' in material && (material as THREE.MeshStandardMaterial).emissiveMap) {
      (material as THREE.MeshStandardMaterial).emissiveMap = null;
    }
    if ('bumpMap' in material && (material as THREE.MeshStandardMaterial).bumpMap) {
      (material as THREE.MeshStandardMaterial).bumpMap = null;
    }
    if ('displacementMap' in material && (material as THREE.MeshStandardMaterial).displacementMap) {
      (material as THREE.MeshStandardMaterial).displacementMap = null;
    }
    if ('lightMap' in material && (material as THREE.MeshStandardMaterial).lightMap) {
      (material as THREE.MeshStandardMaterial).lightMap = null;
    }
    // Force material update
    material.needsUpdate = true;
  }

  // Improved brightness handling for better visual appearance
  if ('color' in material && material.color instanceof THREE.Color) {
    // Apply base color with user's color choice
    const baseColor = new THREE.Color(color);
    
    // Apply brightness by scaling RGB values, but clamping to avoid oversaturation
    const brightColor = new THREE.Color();
    brightColor.copy(baseColor);
    if (brightness !== 1) {
      brightColor.r = Math.min(1, baseColor.r * brightness);
      brightColor.g = Math.min(1, baseColor.g * brightness);
      brightColor.b = Math.min(1, baseColor.b * brightness);
    }
    
    // Apply contrast
    if (contrast !== 1) {
      const midpoint = new THREE.Color(0.5, 0.5, 0.5);
      // Interpolate between midpoint and brightColor based on contrast
      brightColor.lerp(midpoint, 1 - contrast);
    }
    
    (material as THREE.MeshStandardMaterial).color.copy(brightColor);
  }
  
  // Handle emissive properties for high brightness
  if ('emissive' in material && material.emissive instanceof THREE.Color) {
    if (brightness > 1.5) {
      // Only add emissive glow at higher brightness levels
      const emissiveColor = new THREE.Color(color);
      (material as THREE.MeshStandardMaterial).emissive.copy(emissiveColor);
      
      // Set emissive intensity if available
      if ('emissiveIntensity' in material) {
        const glowStrength = (brightness - 1.5) * 0.5;
        (material as THREE.MeshStandardMaterial).emissiveIntensity = glowStrength;
      }
    } else {
      // No glow at normal brightness levels
      (material as THREE.MeshStandardMaterial).emissive.set(0, 0, 0);
      if ('emissiveIntensity' in material) {
        (material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
    }
  }
  
  // Set roughness and metalness for PBR materials
  if ('roughness' in material) {
    (material as THREE.MeshStandardMaterial).roughness = roughness;
  }
  if ('metalness' in material) {
    (material as THREE.MeshStandardMaterial).metalness = metalness;
  }
}

interface ModelViewerProps {
  modelUrl?: string
}

export default function ModelViewer({ modelUrl }: ModelViewerProps) {
  const [state, dispatch] = useReducer(modelViewerReducer, initialState);
  const [showTopology] = useState<boolean>(true); // Add this state

  // Define handlers for UI interactions
  const handleReset = () => dispatch({ type: 'RESET' });
  const toggleControls = () => dispatch({ type: 'TOGGLE_CONTROLS' });
  const handleColorChange = (color: string) => dispatch({ type: 'SET_COLOR', value: color });
  const handleTextureToggle = (checked: boolean) => dispatch({ type: 'TOGGLE_TEXTURE', value: checked });
  const handleWireframeToggle = (checked: boolean) => dispatch({ type: 'TOGGLE_WIREFRAME', value: checked });

  return (
    <div className="w-full h-full relative">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="w-full h-full">
          <Canvas 
            shadows 
            camera={{ position: [5, 5, 5], fov: 75 }}
            dpr={[1, 2]} // Adjust based on device
            frameloop="demand" // Only render when needed
            gl={{ 
              antialias: true,
              powerPreference: "high-performance"
            }}
          >
            <Suspense fallback={<Loader />}>
              {/* Improved ambient light setup with color temperature */}
              <ambientLight 
                intensity={state.ambientIntensity} 
                color={new THREE.Color().setHSL(0.1, 0.1, 0.5)} // Slightly warm ambient light
              />
              {/* Add a subtle hemisphere light for better ambient illumination */}
              <hemisphereLight 
                color="#ffffff" 
                groundColor="#303030" 
                intensity={state.ambientIntensity * 0.3} 
              />
              <Stage 
                environment={state.environment} 
                intensity={state.stageIntensity}
                preset="rembrandt" // Adds more dramatic lighting
                adjustCamera={false} // Don't let Stage control the camera
                shadows={{
                  type: 'contact', 
                  opacity: 0.2, 
                  blur: 3
                }}
              >
                <ModelGrid />
                {/* Only render the model if modelUrl is provided */}
                {modelUrl && (
                  <Model 
                    url={modelUrl} 
                    scale={[state.scale, state.scale, state.scale]} 
                    position={[0, 3, 0]}
                    brightness={state.brightness}
                    contrast={state.contrast}
                    roughness={state.roughness}
                    metalness={state.metalness}
                    color={state.color}
                    rotation={state.rotation}
                    textureEnabled={state.textureEnabled}
                    wireframeEnabled={state.wireframeEnabled}
                  />
                )}
              </Stage>
              <OrbitControls 
                makeDefault 
                enableDamping 
                dampingFactor={0.05}
                minDistance={2}
                maxDistance={20}
                touches={{
                  ONE: THREE.TOUCH.ROTATE,
                  TWO: THREE.TOUCH.DOLLY_PAN
                }}
              />
            </Suspense>
          </Canvas>
        </div>
      </ErrorBoundary>


      {modelUrl && <ModelTopology url={modelUrl} visible={showTopology} />} {/* Shows Model Information */}



      {state.showControls && (
        <Card className="absolute top-4 right-4 w-64 bg-popover text-popover-foreground border-border shadow-xl rounded-[var(--radius)]">
          <div className="flex justify-between items-center p-2 border-b border-border">
            <div className="text-sm font-medium text-primary">{state.environment.charAt(0).toUpperCase() + state.environment.slice(1)}</div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-accent"
                onClick={handleReset}
              >
                <ResetIcon className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-accent"
                onClick={toggleControls}
              >
                <Cross2Icon className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <CardContent className="p-3 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">Environment</Label>
              </div>
              <Select 
                value={state.environment} 
                onValueChange={(value: EnvironmentType) => dispatch({ type: 'SET_ENVIRONMENT', value })}
              >
                <SelectTrigger className="h-8 text-xs bg-secondary border-border">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="lobby">Lobby</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="dawn">Dawn</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="park">Park</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="sunset">Sunset</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Tabs defaultValue="lighting" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-7 bg-secondary">
                <TabsTrigger value="lighting" className="text-xs py-0 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Lighting</TabsTrigger>
                <TabsTrigger value="material" className="text-xs py-0 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Material</TabsTrigger>
                <TabsTrigger value="transform" className="text-xs py-0 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Transform</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lighting" className="space-y-3 mt-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Brightness</Label>
                    <span className="text-xs">{state.brightness.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[state.brightness]} 
                    min={0.1} 
                    max={1.5} 
                    step={0.01} 
                    onValueChange={([val]) => dispatch({ type: 'SET_BRIGHTNESS', value: val })}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Contrast</Label>
                    <span className="text-xs">{state.contrast.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[state.contrast]} 
                    min={0.5} 
                    max={2} 
                    step={0.01} 
                    onValueChange={([val]) => dispatch({ type: 'SET_CONTRAST', value: val })}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Ambient Light</Label>
                    <span className="text-xs">{state.ambientIntensity.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[state.ambientIntensity]} 
                    min={0} 
                    max={2} 
                    step={0.01} 
                    onValueChange={([val]) => dispatch({ type: 'SET_AMBIENT_INTENSITY', value: val })}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Stage Light</Label>
                    <span className="text-xs">{state.stageIntensity.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[state.stageIntensity]} 
                    min={0.2} 
                    max={2} 
                    step={0.01} 
                    onValueChange={([val]) => dispatch({ type: 'SET_STAGE_INTENSITY', value: val })}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="material" className="space-y-3 mt-3">
                {/* Added Toggle switches for texture and wireframe */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="texture-toggle" className="text-xs text-muted-foreground">
                      Show Textures
                    </Label>
                    <Switch
                      id="texture-toggle"
                      checked={state.textureEnabled}
                      onCheckedChange={handleTextureToggle}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wireframe-toggle" className="text-xs text-muted-foreground">
                      Show Wireframe
                    </Label>
                    <Switch
                      id="wireframe-toggle"
                      checked={state.wireframeEnabled}
                      onCheckedChange={handleWireframeToggle}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Roughness</Label>
                    <span className="text-xs">{state.roughness.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[state.roughness]} 
                    min={0} 
                    max={1} 
                    step={0.01} 
                    onValueChange={([val]) => dispatch({ type: 'SET_ROUGHNESS', value: val })}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Metalness</Label>
                    <span className="text-xs">{state.metalness.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[state.metalness]} 
                    min={0} 
                    max={1} 
                    step={0.01} 
                    onValueChange={([val]) => dispatch({ type: 'SET_METALNESS', value: val })}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Color Tint</Label>
                    </div>
                  {/* Improved color picker using react-colorful */}
                  <ColorPickerPopover 
                    color={state.color} 
                    onChange={handleColorChange} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="transform" className="space-y-3 mt-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Scale</Label>
                    <span className="text-xs">{state.scale.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[state.scale]} 
                    min={0.1} 
                    max={10} 
                    step={0.1} 
                    onValueChange={([val]) => dispatch({ type: 'SET_SCALE', value: val })}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Rotation</Label>
                    <span className="text-xs">{(state.rotation * 180 / Math.PI).toFixed(0)}°</span>
                  </div>
                  <Slider 
                    value={[state.rotation]} 
                    min={0} 
                    max={2 * Math.PI} 
                    step={0.01} 
                    onValueChange={([val]) => dispatch({ type: 'SET_ROTATION', value: val })}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {!state.showControls && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-popover text-popover-foreground border-border hover:bg-accent hover:text-accent-foreground"
          onClick={toggleControls}
        >
          Show Controls
        </Button>
      )}
    </div>
  )
}