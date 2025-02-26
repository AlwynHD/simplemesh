"use client"

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { uploadThumbnail } from '@/components/actions/featuresActions';

interface ThumbnailOptions {
    width?: number;
    height?: number;
    backgroundColor?: string;
    cameraPosition?: THREE.Vector3;
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

    constructor(options?: ThumbnailOptions) {
        this.width = options?.width || 512;
        this.height = options?.height || 512;
        this.backgroundColor = options?.backgroundColor || '#f0f0f0';
        this.cameraPosition = options?.cameraPosition || new THREE.Vector3(5, 5, 5);

        // Initialize Three.js components
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true // Important for taking screenshots
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(new THREE.Color(this.backgroundColor), 1);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.backgroundColor);

        this.camera = new THREE.PerspectiveCamera(
            75, this.width / this.height, 0.1, 1000
        );
        this.camera.position.copy(this.cameraPosition);
        this.camera.lookAt(0, 0, 0);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 2, 3);
        this.scene.add(directionalLight);

        this.loader = new GLTFLoader();
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

                        // Add the model to the scene
                        this.scene.add(gltf.scene);

                        // Adjust camera to fit the model
                        const maxDim = Math.max(size.x, size.y, size.z);
                        const distance = maxDim * 1.5;
                        this.camera.position.copy(
                            new THREE.Vector3(distance, distance * 0.8, distance)
                        );
                        this.camera.lookAt(0, 0, 0);

                        // Render the scene
                        this.renderer.render(this.scene, this.camera);

                        // Get the image data
                        const dataUrl = this.renderer.domElement.toDataURL('image/jpeg', 0.9);

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