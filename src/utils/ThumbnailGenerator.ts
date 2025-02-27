"use client"

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { uploadThumbnail } from '@/components/actions/featuresActions';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

interface ThumbnailOptions {
    width?: number;
    height?: number;
    backgroundColor?: string;
    cameraPosition?: THREE.Vector3;
    useGradientBackground?: boolean;
    gradientColors?: {top: string, bottom: string};
}

export class ThumbnailGenerator {
    private width: number;
    private height: number;
    private backgroundColor: string;
    private cameraPosition: THREE.Vector3;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private loader: GLTFLoader;
    private composer: EffectComposer;


    constructor(options?: ThumbnailOptions) {
        this.width = options?.width || 512;
        this.height = options?.height || 512;
        this.backgroundColor = options?.backgroundColor || '#171717';
        this.cameraPosition = options?.cameraPosition || new THREE.Vector3(5, 5, 5);
        // Enable gradient by default
    
        // Initialize Three.js components
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(new THREE.Color(this.backgroundColor), 1);
        
        // Enable shadow maps with higher quality settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set tone mapping - should work in most Three.js versions
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Try to set color space or encoding based on what's available
        if ('outputColorSpace' in this.renderer) {
            // Modern Three.js
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        }
    
        this.scene = new THREE.Scene();
        

        this.scene.background = new THREE.Color(this.backgroundColor);
        
    
        // Create a more natural camera with narrower FOV
        this.camera = new THREE.PerspectiveCamera(
            45, this.width / this.height, 0.1, 1000
        );
        this.camera.position.copy(this.cameraPosition);
        this.camera.lookAt(0, 0, 0);
    
        // Create enhanced lighting setup for better definition
        // Softer ambient light with slight blue tint for better shadows
        const ambientLight = new THREE.AmbientLight(0xc4cfff, 1.2);
        this.scene.add(ambientLight);
        
        // Key light (main directional light) - warm tone
        const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.5);
        keyLight.position.set(5, 5, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 0.1;
        keyLight.shadow.camera.far = 20;
        keyLight.shadow.bias = -0.0001;
        this.scene.add(keyLight);
        
        // Fill light (opposite the key light) - cool tone
        const fillLight = new THREE.DirectionalLight(0xe6f0ff, 1.5);
        fillLight.position.set(-5, 0, 2);
        this.scene.add(fillLight);
        
        // Rim light (back light for edge definition) - slightly brighter
        const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
        rimLight.position.set(0, 2, -5);
        this.scene.add(rimLight);

        // Bottom light for better ground definition
        const bottomLight = new THREE.DirectionalLight(0xffffeb, 0.8);
        bottomLight.position.set(0, -5, 0);
        this.scene.add(bottomLight);

        // Add a subtle shadow catcher plane
        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.ShadowMaterial({ opacity: 0.2 })
        );
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -0.5;
        shadowPlane.receiveShadow = true;
        this.scene.add(shadowPlane);
    
        this.loader = new GLTFLoader();
        
        // Setup post-processing for enhanced visual quality
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Add subtle bloom for highlights
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            0.15,    // strength
            0.3,     // radius
            0.9      // threshold
        );
        this.composer.addPass(bloomPass);
        
        // Add gamma correction for proper color rendering
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        this.composer.addPass(gammaCorrectionPass);
    }

    /**
     * Creates a gradient texture for the background
     */
    private createGradientTexture(colorTop: string, colorBottom: string): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createLinearGradient(0, 0, 0, 512);
            gradient.addColorStop(0, colorTop);
            gradient.addColorStop(1, colorBottom);
            context.fillStyle = gradient;
            context.fillRect(0, 0, 2, 512);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    /**
     * Generate a thumbnail from a GLB model URL
     */
    async generateThumbnail(modelUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Create a temporary container for the renderer
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            document.body.appendChild(container);
            container.appendChild(this.renderer.domElement);

            // Load the model
            this.loader.load(
                modelUrl,
                (gltf) => {
                    try {
                        // Center and fit the model in view
                        const box = new THREE.Box3().setFromObject(gltf.scene);
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());

                        // Reset model position to center
                        gltf.scene.position.x = -center.x;
                        gltf.scene.position.y = -center.y;
                        gltf.scene.position.z = -center.z;

                        // Enhance materials for better visual quality
                        gltf.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh && child.material) {
                                // Check if material is an array
                                if (Array.isArray(child.material)) {
                                    child.material = child.material.map(mat => {
                                        const newMat = mat.clone();
                                        if ('roughness' in newMat) newMat.roughness = 0.9;
                                        if ('metalness' in newMat) newMat.metalness = 0.6;
                                        return newMat;
                                    });
                                } else {
                                    // Single material
                                    const material = child.material.clone();
                                    if ('roughness' in material) material.roughness = 0.9;
                                    if ('metalness' in material) material.metalness = 0.6;
                                    child.material = material;
                                }
                                
                                // Enable shadows
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });

                        // Add the model to the scene
                        this.scene.add(gltf.scene);

                        // Adjust camera to fit the model
                        const maxDim = Math.max(size.x, size.y, size.z);

                        // Calculate the distance needed to fit the object in view
                        const fov = this.camera.fov * (Math.PI / 180); // Convert FOV to radians
                        const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
                        const aspectRatio = this.renderer.domElement.width / this.renderer.domElement.height;
                        
                        // Adjust for aspect ratio (ensure width fits too)
                        const fitHeightDistance = cameraZ;
                        const fitWidthDistance = cameraZ / aspectRatio;
                        const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.1; // 10% padding
                        
                        // Position the camera at a more interesting angle
                        this.camera.position.copy(
                            new THREE.Vector3(distance * 0.85, distance * 0.7, distance * 0.9)
                        );
                        this.camera.lookAt(0, 0, 0);

                        // Render with the composer for post-processing effects
                        this.composer.render();

                        // Get the image data
                        const dataUrl = this.renderer.domElement.toDataURL('image/jpeg', 0.95);

                        // Clean up
                        this.scene.remove(gltf.scene);
                        document.body.removeChild(container);

                        resolve(dataUrl);
                    } catch (err) {
                        reject(err);
                    }
                },
                undefined,
                (error) => {
                    document.body.removeChild(container);
                    reject(error);
                }
            );
        });
    }

    /**
     * Save the thumbnail as a file
     */
    async saveThumbnail(dataUrl: string, fileName: string): Promise<void> {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Upload the thumbnail to a server
     */
    async uploadThumbnail(dataUrl: string, modelId: string): Promise<boolean> {
        try {
            // Convert data URL to blob
            const blob = await (await fetch(dataUrl)).blob();

            // Create form data
            const formData = new FormData();
            formData.append('thumbnail', blob, `${modelId}.jpg`);
            formData.append('modelId', modelId);

            // Use the server action directly
            const result = await uploadThumbnail(formData);

            return (result.success);
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
            return false;
        }
    }
}

// Helper function to create a thumbnail generator with default options
export function createThumbnailGenerator(options?: ThumbnailOptions): ThumbnailGenerator {
    return new ThumbnailGenerator(options);
}