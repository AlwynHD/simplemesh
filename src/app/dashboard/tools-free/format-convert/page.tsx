"use client";
"use client";
import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import JSZip from "jszip";

// Icons
import {
  FileUp, FileDown, Eye, Download, Info, CheckCircle,
  AlertTriangle, Loader, Maximize, X, Globe, Square,
  Package, Box, Layers
} from "lucide-react";

// Three.js types
import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Type definitions for dynamically loaded modules
interface ModulesType {
  GLTFExporter?: any;
  OBJExporter?: any;
  STLExporter?: any;
  GLTFLoader?: any;
  OBJLoader?: any;
  MTLLoader?: any;
  STLLoader?: any;
  FBXLoader?: any;
  loaded: boolean;
}

// Format types
type SourceFormat = "gltf" | "glb" | "obj" | "stl" | "fbx" | "";
type TargetFormat = "gltf" | "glb" | "obj" | "stl" | "";

interface FormatInfo {
  name: string;
  description: string;
  bestFor: string;
  icon: React.ReactNode;
}

// Interface for materials and textures
interface ModelFiles {
  mainFile: File;
  materialFiles?: File[];
  textureFiles?: File[];
}

const formatInfoMap: Record<string, FormatInfo> = {
  gltf: {
    name: "GLTF",
    description: "Graphics Language Transmission Format is a JSON-based file format for 3D scenes and models.",
    bestFor: "Web applications, AR/VR, and cross-platform use with accurate materials and animations.",
    icon: <Globe className="h-5 w-5 text-primary" />
  },
  glb: {
    name: "GLB",
    description: "Binary version of GLTF that packages all assets in a single file.",
    bestFor: "Production-ready 3D content with embedded textures and smaller file size.",
    icon: <Package className="h-5 w-5 text-primary/90" />
  },
  obj: {
    name: "OBJ",
    description: "Wavefront OBJ is a simple geometry definition file format for 3D models with separate material files.",
    bestFor: "Basic geometry exchange between 3D applications with wide compatibility and material support.",
    icon: <Square className="h-5 w-5 text-primary/80" />
  },
  stl: {
    name: "STL",
    description: "STereoLithography format describes only the surface geometry of a 3D object.",
    bestFor: "3D printing and manufacturing processes without color or texture information.",
    icon: <Layers className="h-5 w-5 text-primary/70" />
  },
  fbx: {
    name: "FBX",
    description: "Filmbox is a proprietary file format for 3D animations and models.",
    bestFor: "Animation exchange between 3D applications with complex rigging.",
    icon: <Box className="h-5 w-5 text-primary/60" />
  }
};

// Compatibility matrix
const compatibilityMatrix: Record<SourceFormat, TargetFormat[]> = {
  "gltf": ["glb", "obj", "stl"],
  "glb": ["gltf", "obj", "stl"],
  "obj": ["gltf", "glb", "stl"],
  "stl": ["obj", "gltf", "glb"],
  "fbx": ["gltf", "glb", "obj", "stl"],
  "": []
};

export default function FormatConvertPage() {
  // Core state
  const [sourceFormat, setSourceFormat] = useState<SourceFormat>("");
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("");
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [error, setError] = useState<string>("");
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);

  // Enhanced state
  const [activeStep, setActiveStep] = useState<number>(0);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [includeObjMaterials, setIncludeObjMaterials] = useState<boolean>(true);
  const [modelFiles, setModelFiles] = useState<ModelFiles | null>(null);
  const [hasMultipleFiles, setHasMultipleFiles] = useState<boolean>(false);
  const [materialFilesFound, setMaterialFilesFound] = useState<boolean>(false);
  const [textureFilesFound, setTextureFilesFound] = useState<boolean>(false);
  const [convertedZip, setConvertedZip] = useState<Blob | null>(null);

  // THREE.js objects
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);

  // Modules state
  const [modules, setModules] = useState<ModulesType>({ loaded: false });
  const [librariesLoading, setLibrariesLoading] = useState<boolean>(true);

  // Dropzone for main file
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'model/gltf+json': ['.gltf'],
      'model/gltf-binary': ['.glb'],
      'application/octet-stream': ['.obj', '.stl', '.fbx'],
      'text/plain': ['.mtl'],
      'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tga']
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFilesSelection(acceptedFiles);
      }
    }
  });

  // Load libraries
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        setLibrariesLoading(true);

        // Import all modules
        const [
          { GLTFExporter },
          { OBJExporter },
          { STLExporter },
          { GLTFLoader },
          { OBJLoader },
          mtlModule,
          { STLLoader },
          fbxModule
        ] = await Promise.all([
          import('three/examples/jsm/exporters/GLTFExporter.js'),
          import('three/examples/jsm/exporters/OBJExporter.js'),
          import('three/examples/jsm/exporters/STLExporter.js'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/loaders/OBJLoader.js'),
          import('three/examples/jsm/loaders/MTLLoader.js').catch(() => ({ MTLLoader: null })),
          import('three/examples/jsm/loaders/STLLoader.js'),
          import('three/examples/jsm/loaders/FBXLoader.js').catch(() => ({ FBXLoader: null }))
        ]);

        // Store all modules in state
        setModules({
          GLTFExporter,
          OBJExporter,
          STLExporter,
          GLTFLoader,
          OBJLoader,
          MTLLoader: mtlModule.MTLLoader,
          STLLoader,
          FBXLoader: fbxModule.FBXLoader,
          loaded: true
        });

        setLibrariesLoading(false);
      } catch (error) {
        console.error("Failed to load 3D libraries:", error);
        setError("Failed to load 3D libraries. Please try again later.");
        setLibrariesLoading(false);
      }
    };

    loadLibraries();
  }, []);

  // Canvas ref callback
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    if (node !== null) {
      setupThreeJs(node);
    }
  }, []);

  // ThreeJS setup
  const setupThreeJs = (canvas: HTMLCanvasElement) => {
    // Create scene
    const newScene = new THREE.Scene();
    // Make the background transparent so it matches the card
    newScene.background = null;

    // Create camera
    const newCamera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    newCamera.position.z = 5;

    // Create renderer with transparency enabled
    const newRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    newRenderer.setClearColor(0x000000, 0); // Transparent background
    newRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    newRenderer.setPixelRatio(window.devicePixelRatio);

    // Create controls
    const newControls = new OrbitControls(newCamera, canvas);
    newControls.enableDamping = true;

    // Add lights for better model visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    newScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    newScene.add(directionalLight);

    // Add a soft backlight for better depth
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-1, -1, -1);
    newScene.add(backLight);

    // Setup animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      newControls.update();
      newRenderer.render(newScene, newCamera);
    };
    animate();

    // Save objects
    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    setControls(newControls);

    // Cleanup on unmount
    return () => {
      newControls.dispose();
      newRenderer.dispose();
    };
  };

  // Update model in scene
  useEffect(() => {
    if (scene && model) {
      // Clear existing model
      scene.children = scene.children.filter(child => {
        return ['AmbientLight', 'DirectionalLight'].includes(child.type);
      });

      // Add new model
      scene.add(model);

      // Center camera on model
      if (camera && controls) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraDistance = maxDim / (2 * Math.tan(fov / 2));

        camera.position.copy(center);
        camera.position.z += cameraDistance * 1.5;
        camera.lookAt(center);

        controls.target.copy(center);
        controls.update();
      }
    }
  }, [scene, model, camera, controls]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (camera && renderer) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [camera, renderer]);

  const handleFilesSelection = (selectedFiles: File[]) => {
    if (!modules.loaded) {
      setError("3D libraries are still loading. Please wait a moment and try again.");
      return;
    }

    setError("");
    setConvertedBlob(null);
    setConvertedZip(null);
    setActiveStep(0);
    setHasMultipleFiles(selectedFiles.length > 1);
    setMaterialFilesFound(false);
    setTextureFilesFound(false);

    // Categorize files
    const mainModelFile = selectedFiles.find(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ["gltf", "glb", "obj", "stl", "fbx"].includes(ext || "");
    });

    if (!mainModelFile) {
      setError("No valid 3D model file found. Please upload a GLTF, GLB, OBJ, STL, or FBX file.");
      return;
    }

    // Get file format from extension
    const extension = mainModelFile.name.split('.').pop()?.toLowerCase() as SourceFormat;
    if (!["gltf", "glb", "obj", "stl", "fbx"].includes(extension)) {
      setError("Unsupported file format. Please upload a GLTF, GLB, OBJ, STL, or FBX file.");
      return;
    }

    setFile(mainModelFile);
    setOriginalSize(mainModelFile.size);
    setSourceFormat(extension);

    // Set default target format based on compatibility
    if (compatibilityMatrix[extension].length > 0) {
      setTargetFormat(compatibilityMatrix[extension][0]);
    }

    // Find material and texture files
    const materialFiles = selectedFiles.filter(file => file.name.toLowerCase().endsWith('.mtl'));
    const textureFiles = selectedFiles.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "bmp", "tga"].includes(ext || "");
    });

    setMaterialFilesFound(materialFiles.length > 0);
    setTextureFilesFound(textureFiles.length > 0);

    // Set model files
    setModelFiles({
      mainFile: mainModelFile,
      materialFiles: materialFiles.length > 0 ? materialFiles : undefined,
      textureFiles: textureFiles.length > 0 ? textureFiles : undefined
    });

    // Load the model
    loadModelWithMaterials({
      mainFile: mainModelFile,
      materialFiles: materialFiles.length > 0 ? materialFiles : undefined,
      textureFiles: textureFiles.length > 0 ? textureFiles : undefined
    }, extension).then(() => {
      setActiveStep(1);
    }).catch(err => {
      setError(`Failed to load model: ${err.message}`);
    });
  };
 
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      handleFilesSelection(selectedFiles);
    }
  };
 
  const loadModelWithMaterials = async (files: ModelFiles, format: SourceFormat): Promise<void> => {
    if (!modules.loaded) {
      return Promise.reject(new Error("3D libraries are not loaded yet"));
    }
 
    try {
      const modelObject = await loadModel(files, format);
      if (modelObject) {
        setModel(modelObject);
        return Promise.resolve();
      } else {
        return Promise.reject(new Error("Failed to load model"));
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };
 
  const loadModel = async (files: ModelFiles, format: SourceFormat): Promise<THREE.Object3D | null> => {
    if (!files.mainFile || !format || !modules.loaded) return null;
 
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file"));
          return;
        }
 
        try {
          switch (format) {
            case 'gltf':
            case 'glb': {
              const loader = new modules.GLTFLoader();
              loader.parse(
                arrayBuffer,
                '',
                (gltf: GLTF) => {
                  resolve(gltf.scene);
                },
                (error: ErrorEvent) => {
                  reject(error);
                }
              );
              break;
            }
            case 'obj': {
              // For OBJ files with materials
              if (files.materialFiles && files.materialFiles.length > 0 && modules.MTLLoader) {
                const objText = new TextDecoder().decode(new Uint8Array(arrayBuffer));
                
                // First load the material file
                const mtlReader = new FileReader();
                mtlReader.onload = async (mtlEvent: ProgressEvent<FileReader>) => {
                  const mtlText = mtlEvent.target?.result as string;
                  if (!mtlText) {
                    reject(new Error("Failed to read MTL file"));
                    return;
                  }
 
                  try {
                    // Create material loader
                    const mtlLoader = new modules.MTLLoader();
                    // Set the material file path so textures can be located (dummy path)
                    mtlLoader.setResourcePath('textures/');
                    
                    // Parse material content
                    const materials = mtlLoader.parse(mtlText);
                    materials.preload();
 
                    // Create URL sources for textures if available
                    if (files.textureFiles && files.textureFiles.length > 0) {
                      const textureURLs: Record<string, string> = {};
                      
                      // Create object URLs for each texture
                      for (const textureFile of files.textureFiles) {
                        textureURLs[textureFile.name] = URL.createObjectURL(textureFile);
                      }
 
                      // Replace texture loader to use our blob URLs
                      const originalLoad = materials.loadTexture;
                      materials.loadTexture = function(url: string, mapping: any, onLoad: any, onError: any) {
                        // Extract texture filename from url
                        const filename = url.split('/').pop();
                        if (filename && textureURLs[filename]) {
                          return originalLoad.call(this, textureURLs[filename], mapping, onLoad, onError);
                        }
                        return originalLoad.call(this, url, mapping, onLoad, onError);
                      };
                    }
 
                    // Create and configure object loader with materials
                    const objLoader = new modules.OBJLoader();
                    objLoader.setMaterials(materials);
                    
                    // Parse OBJ content
                    const objModel = objLoader.parse(objText);
                    resolve(objModel);
                  } catch (mtlError) {
                    // If material loading fails, fall back to geometry-only loading
                    console.warn("Failed to load materials, loading geometry only:", mtlError);
                    const objLoader = new modules.OBJLoader();
                    const objModel = objLoader.parse(objText);
                    resolve(objModel);
                  }
                };
                
                mtlReader.onerror = () => {
                  reject(new Error("Error reading MTL file"));
                };
                
                mtlReader.readAsText(files.materialFiles[0]);
              } else {
                // Basic OBJ loading without materials
                const loader = new modules.OBJLoader();
                const objText = new TextDecoder().decode(new Uint8Array(arrayBuffer));
                const objModel = loader.parse(objText);
                resolve(objModel);
              }
              break;
            }
            case 'stl': {
              const loader = new modules.STLLoader();
              const geometry = loader.parse(arrayBuffer);
              // Create a more appealing material for STL preview
              const material = new THREE.MeshStandardMaterial({
                color: 0xd97706, // Using a color that matches our primary amber tone
                metalness: 0.3,
                roughness: 0.6,
              });
              const mesh = new THREE.Mesh(geometry, material);
              resolve(mesh);
              break;
            }
            case 'fbx': {
              if (modules.FBXLoader) {
                const loader = new modules.FBXLoader();
                loader.parse(
                  arrayBuffer,
                  '',
                  (fbx: THREE.Group) => {
                    resolve(fbx);
                  },
                  (error: ErrorEvent) => {
                    reject(error);
                  }
                );
              } else {
                reject(new Error("FBX loader not available"));
              }
              break;
            }
            default:
              reject(new Error(`Unsupported source format: ${format}`));
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsArrayBuffer(files.mainFile);
    });
  };
 
  const convertModel = async (): Promise<void> => {
    if (!file || !sourceFormat || !targetFormat || !modules.loaded) return;
 
    setIsConverting(true);
    setError("");
    setConversionProgress(0);
    setConvertedBlob(null);
    setConvertedZip(null);
 
    const updateProgress = (progress: number) => {
      setConversionProgress(progress);
    };
 
    try {
      updateProgress(10);
 
      // Load the model if not already loaded
      const modelToConvert = model || await loadModel(modelFiles || { mainFile: file }, sourceFormat);
      if (!modelToConvert) {
        throw new Error("Failed to load model");
      }
 
      setModel(modelToConvert);
      updateProgress(30);
 
      let result: ArrayBuffer | object | string;
      let blob: Blob;
      let materialData: string | null = null;
      let textureFiles: { name: string, data: Blob }[] = [];
 
      // Convert to target format
      switch (targetFormat) {
        case 'gltf':
        case 'glb': {
          updateProgress(50);
          const gltfExporter = new modules.GLTFExporter();
          const exportOptions = {
            binary: targetFormat === 'glb',
            embedImages: true,
            forcePowerOfTwoTextures: true,
            truncateDrawRange: true
          };
 
          result = await new Promise<ArrayBuffer | object>((resolve, reject) => {
            gltfExporter.parse(
              modelToConvert,
              (output: ArrayBuffer | object) => resolve(output),
              (error: ErrorEvent) => reject(error),
              exportOptions
            );
          });
 
          updateProgress(80);
 
          if (targetFormat === 'glb') {
            blob = new Blob([result as ArrayBuffer], { type: 'application/octet-stream' });
          } else {
            blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
          }
          break;
        }
 
        case 'obj': {
          updateProgress(40);
          const objExporter = new modules.OBJExporter();
          
          // Extract materials if they exist in the model
          if (includeObjMaterials) {
            // Generate MTL content (simplified example - in a real app would need more complex material extraction)
            // This is a placeholder for material extraction logic
            const extractMaterials = (object: THREE.Object3D) => {
              const materials: THREE.Material[] = [];
              object.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                  if (Array.isArray(child.material)) {
                    materials.push(...child.material);
                  } else {
                    materials.push(child.material);
                  }
                }
              });
              
              // Generate simple MTL content (would be more complex in real implementation)
              let mtlContent = "# Material file generated by 3D Model Converter\n\n";
              
              materials.forEach((material, index) => {
                if (material instanceof THREE.MeshStandardMaterial) {
                  const matName = material.name || `material_${index}`;
                  mtlContent += `newmtl ${matName}\n`;
                  mtlContent += `Ns 225.000000\n`;
                  mtlContent += `Ka 1.000000 1.000000 1.000000\n`;
                  
                  // Get color
                  const color = material.color;
                  mtlContent += `Kd ${color.r} ${color.g} ${color.b}\n`;
                  
                  // Metalness and roughness approximation
                  mtlContent += `Ks ${material.metalness} ${material.metalness} ${material.metalness}\n`;
                  mtlContent += `Ke 0.000000 0.000000 0.000000\n`;
                  mtlContent += `Ni 1.450000\n`;
                  mtlContent += `d 1.000000\n`;
                  mtlContent += `illum 2\n\n`;
                  
                  // Extract textures if available
                  if (material.map) {
                    const textureName = `texture_${index}.png`;
                    mtlContent += `map_Kd ${textureName}\n\n`;
                    
                    // In a real implementation, we would need to extract the texture data
                    // This is simplified and would require actual texture extraction
                    const canvas = document.createElement('canvas');
                    canvas.width = 1024;
                    canvas.height = 1024;
                    const ctx = canvas.getContext('2d');
                    
                    if (ctx) {
                      // Simplified - in reality would need to render the texture properly
                      ctx.fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      
                      canvas.toBlob((textureBlob) => {
                        if (textureBlob) {
                          textureFiles.push({
                            name: textureName,
                            data: textureBlob
                          });
                        }
                      }, 'image/png');
                    }
                  }
                }
              });
              
              return mtlContent;
            };
            
            // Extract materials from the model
            materialData = extractMaterials(modelToConvert);
          }
          
          updateProgress(60);
          
          // Parse to OBJ format
          result = objExporter.parse(modelToConvert);
          updateProgress(80);
          
          // Create the output blob
          blob = new Blob([result as string], { type: 'text/plain' });
          
          // If we have materials and the user wants them, package everything into a ZIP
          if (includeObjMaterials && materialData) {
            const zip = new JSZip();
            const baseName = file.name.split('.')[0];
            
            // Add OBJ file
            zip.file(`${baseName}.obj`, blob);
            
            // Add MTL file
            zip.file(`${baseName}.mtl`, materialData);
            
            // Add any textures
            textureFiles.forEach(texture => {
              zip.file(texture.name, texture.data);
            });
            
            // Generate ZIP blob
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            setConvertedZip(zipBlob);
          }
          
          break;
        }
 
        case 'stl': {
          updateProgress(50);
          const stlExporter = new modules.STLExporter();
          result = stlExporter.parse(modelToConvert, { binary: true });
          updateProgress(80);
          blob = new Blob([result as ArrayBuffer], { type: 'application/octet-stream' });
          break;
        }
 
        default:
          throw new Error(`Unsupported target format: ${targetFormat}`);
      }
 
      updateProgress(90);
 
      // Save converted blob
      setConvertedBlob(blob);
      setConvertedSize(blob.size);
 
      // Update UI state
      setActiveStep(2);
      updateProgress(100);
 
    } catch (error) {
      console.error("Conversion error:", error);
      setError(`Error converting model: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsConverting(false);
    }
  };
 
  const downloadConvertedFile = () => {
    if ((!convertedBlob && !convertedZip) || !file || !targetFormat) return;
 
    // Determine what to download
    const blobToDownload = targetFormat === 'obj' && includeObjMaterials && convertedZip 
      ? convertedZip 
      : convertedBlob;
    
    if (!blobToDownload) return;
 
    const url = URL.createObjectURL(blobToDownload);
    const link = document.createElement('a');
    link.href = url;
    
    // Set appropriate filename
    const baseName = file.name.split('.')[0];
    link.download = targetFormat === 'obj' && includeObjMaterials && convertedZip
      ? `${baseName}.zip`
      : `${baseName}.${targetFormat}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
 
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
 
  const resetConversion = () => {
    setFile(null);
    setModelFiles(null);
    setModel(null);
    setSourceFormat("");
    setTargetFormat("");
    setConvertedBlob(null);
    setConvertedZip(null);
    setActiveStep(0);
    setError("");
    setHasMultipleFiles(false);
    setMaterialFilesFound(false);
    setTextureFilesFound(false);
 
    // Reset scene
    if (scene) {
      scene.children = scene.children.filter(child => {
        return ['AmbientLight', 'DirectionalLight'].includes(child.type);
      });
    }
  };
 
  // Render the compatibility matrix
  const renderCompatibilityMatrix = () => {
    return (
      <div className="p-4 bg-secondary/50 rounded-lg mt-4 border border-border shadow-sm">
        <h3 className="font-medium mb-3 text-sm text-center">Format Compatibility</h3>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="font-medium">From \ To</div>
          <div className="font-medium text-center">GLTF</div>
          <div className="font-medium text-center">GLB</div>
          <div className="font-medium text-center">OBJ</div>
          <div className="font-medium text-center">STL</div>
 
          {Object.entries(compatibilityMatrix).map(([source, targets]) =>
            source !== "" && (
              <React.Fragment key={`row-${source}`}>
                <div className="font-medium">{source.toUpperCase()}</div>
                {["gltf", "glb", "obj", "stl"].map(target => (
                  <div key={`${source}-${target}`} className="text-center">
                    {targets.includes(target as TargetFormat) ?
                      <CheckCircle className="h-4 w-4 mx-auto text-green-500" /> :
                      <X className="h-4 w-4 mx-auto text-red-500" />
                    }
                  </div>
                ))}
              </React.Fragment>
            )
          )}
        </div>
      </div>
    );
  };
 
  return (
    <div className="container py-12 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-primary">3D Model Converter</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Convert between popular 3D model formats with a simple drag and drop interface
        </p>
      </div>
 
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column - Upload & Convert */}
        <div className="space-y-6">
          <Card className="shadow-md border-border overflow-hidden">
            <CardHeader className="bg-secondary/30 border-b border-border">
              <CardTitle>
                <div className="flex items-center">
                  <FileUp className="mr-2 h-5 w-5 text-primary" />
                  Upload & Convert Model
                </div>
              </CardTitle>
              <CardDescription>
                Drag and drop or select a 3D model file to begin
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {librariesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
                    <p className="text-muted-foreground">Loading 3D libraries...</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-10 text-center transition-all ${isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/20 hover:bg-muted hover:border-muted-foreground/30"
                          }`}
                      >
                        <input {...getInputProps({ onChange: handleFileChange })} />
                        <FileUp className="mx-auto h-12 w-12 text-primary/70 mb-3" />
                        <p className="text-sm font-medium">
                          {isDragActive
                            ? "Drop the files here..."
                            : "Drag & drop a 3D model file"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          or click to select from your device
                        </p>
                        <div className="mt-4 flex justify-center gap-1.5 flex-wrap">
                          {["GLTF", "GLB", "OBJ", "STL", "FBX"].map(format => (
                            <span key={format} className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary">
                              {format}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                          For OBJ models with materials, include your .mtl and texture files
                        </p>
                      </div>
 
                      {renderCompatibilityMatrix()}
                    </motion.div>
                  )}
 
                  {activeStep >= 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      {file && (
                        <div className="bg-secondary/40 p-3 rounded-lg flex items-center justify-between border border-border">
                          <div className="flex items-center">
                            {formatInfoMap[sourceFormat]?.icon && (
                              <div className="mr-3">
                                {formatInfoMap[sourceFormat]?.icon}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Format: <span className="uppercase font-medium">{sourceFormat}</span> •
                                Size: {formatFileSize(originalSize)}
                                {hasMultipleFiles && (
                                  <span className="ml-2">
                                    {materialFilesFound && '• MTL files'}
                                    {textureFilesFound && ' • Textures'}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetConversion}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
 
                      <div className="space-y-3">
                        <label className="block text-sm font-medium mb-1">
                          Convert To
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                {targetFormat && formatInfoMap[targetFormat]?.description}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </label>
                        <Select
                          value={targetFormat}
                          onValueChange={(value: string) => setTargetFormat(value as TargetFormat)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select target format" />
                          </SelectTrigger>
                          <SelectContent>
                            {sourceFormat && compatibilityMatrix[sourceFormat].map((format) => (
                              <SelectItem key={format} value={format}>
                                <div className="flex items-center">
                                  {formatInfoMap[format]?.icon}
                                  <span className="ml-2">{formatInfoMap[format]?.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
 
                        {/* OBJ Material options */}
                        {targetFormat === 'obj' && (
                          <div className="flex items-center space-x-2 mt-3">
                            <Checkbox 
                              id="include-materials" 
                              checked={includeObjMaterials}
                              onCheckedChange={(checked) => 
                                setIncludeObjMaterials(checked === true)
                              }
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor="include-materials"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Include materials and textures
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Creates MTL file and packages all files as ZIP
                              </p>
                            </div>
                          </div>
                        )}
 
                        {targetFormat && (
                          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                            <span className="font-medium">Best for:</span> {formatInfoMap[targetFormat]?.bestFor}
                          </div>
                        )}
                      </div>
 
                      {activeStep === 1 && (
                        <Button
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={convertModel}
                          disabled={!file || !sourceFormat || !targetFormat || isConverting}
                        >
                          {isConverting ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Converting... ({conversionProgress}%)
                            </>
                          ) : (
                            <>
                              <FileDown className="mr-2 h-4 w-4" />
                              Convert Model
                            </>
                          )}
                        </Button>
                      )}
 
                      {activeStep === 2 && (convertedBlob || convertedZip) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="bg-secondary/40 border border-border text-foreground rounded-lg p-4 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 text-green-500" />
                            <div>
                              <p className="font-medium">Conversion Complete!</p>
                              <p className="text-xs mt-0.5">
                                {targetFormat === 'obj' && includeObjMaterials && convertedZip ? (
                                  <>ZIP package with {targetFormat.toUpperCase()}, MTL{textureFilesFound ? ' and textures' : ''}</>
                                ) : (
                                  <>Size: {formatFileSize(convertedSize)}
                                  ({convertedSize < originalSize ?
                                    <span className="text-primary">{Math.round((1 - convertedSize / originalSize) * 100)}% smaller</span> :
                                    <span>{Math.round((convertedSize / originalSize - 1) * 100)}% larger</span>})
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
 
                          <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={downloadConvertedFile}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download {targetFormat === 'obj' && includeObjMaterials && convertedZip ? 'ZIP Package' : `${targetFormat.toUpperCase()} File`}
                          </Button>
 
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={resetConversion}
                          >
                            Convert Another File
                          </Button>
                        </motion.div>
                      )}
 
                      {isConverting && (
                        <div className="space-y-1.5">
                          <Progress value={conversionProgress} className="h-2 bg-muted" />
                          <p className="text-xs text-center text-muted-foreground">{conversionProgress}% complete</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
 
              {error && (
                <Alert variant="destructive" className="mt-5">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
 
          {activeStep >= 1 && (
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Conversion Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-muted">
                    <span className="text-muted-foreground">Original Format:</span>
                    <div className="flex items-center">
                      {formatInfoMap[sourceFormat]?.icon}
                      <span className="font-medium uppercase ml-1.5">{sourceFormat}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-muted">
                    <span className="text-muted-foreground">Target Format:</span>
                    <div className="flex items-center">
                      {formatInfoMap[targetFormat]?.icon}
                      <span className="font-medium uppercase ml-1.5">{targetFormat}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Original Size:</span>
                    <span className="font-medium">{formatFileSize(originalSize)}</span>
                  </div>
                  {(convertedBlob || convertedZip) && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Converted Size:</span>
                      <span className={`font-medium ${convertedSize < originalSize ? 'text-primary' : ''}`}>
                        {targetFormat === 'obj' && includeObjMaterials && convertedZip
                          ? formatFileSize(convertedZip.size)
                          : formatFileSize(convertedSize)
                        }
                      </span>
                    </div>
                  )}
                  {materialFilesFound && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Materials:</span>
                      <span className="font-medium text-green-500">Included</span>
                    </div>
                  )}
                  {textureFilesFound && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Textures:</span>
                      <span className="font-medium text-green-500">Included</span>
                    </div>
                  )}
                  </div>
             </CardContent>
           </Card>
         )}
       </div>

       {/* Right column - Preview */}
       <div>
         <Card className="h-full flex flex-col shadow-md border-border">
           <CardHeader className="pb-3 bg-secondary/30 border-b border-border">
             <div className="flex justify-between items-center">
               <CardTitle>
                 <div className="flex items-center">
                   <Eye className="mr-2 h-5 w-5 text-primary" />
                   3D Preview
                 </div>
               </CardTitle>
               {model && (
                 <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                   <Maximize className="h-4 w-4" />
                 </Button>
               )}
             </div>
           </CardHeader>
           <CardContent className="flex-grow p-0">
             <div className="w-full h-[400px] overflow-hidden flex items-center justify-center">
               {model ? (
                 <canvas ref={canvasRef} className="w-full h-full" />
               ) : (
                 <div className="text-center p-4">
                   <Square className="h-16 w-16 text-muted-foreground/40 mx-auto mb-3" />
                   <p className="text-muted-foreground">
                     Upload a 3D model to preview
                   </p>
                   <p className="text-xs text-muted-foreground/70 mt-1">
                     Supported formats: GLTF, GLB, OBJ, STL, FBX
                   </p>
                 </div>
               )}
             </div>
             {model && (
               <div className="py-3 px-4 text-xs text-center text-muted-foreground border-t border-border">
                 <div className="flex justify-center space-x-4">
                   <span>Drag to rotate</span>
                   <span>Scroll to zoom</span>
                   <span>Shift+drag to pan</span>
                 </div>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
     </div>
   </div>
 );
}