"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import ComparisonTable from "./comparison-table";

import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import WebGLGuard from "@/components/WebGLGuard";

function Model({ url, initialRotationY = 0 }: { url: string; initialRotationY?: number }) {
    const group = useRef<THREE.Group>(null);
    const fbx = useLoader(FBXLoader, url);
    const mixer = useRef<THREE.AnimationMixer | null>(null);

    useEffect(() => {
        if (fbx) {
            const defaultMaterial = new THREE.MeshStandardMaterial({
                color: 0xAEAEAE, metalness: 0.05, roughness: 0.85,
                transparent: true, opacity: 0.98
            });
            fbx.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = defaultMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            fbx.scale.set(0.48, 0.48, 0.48);
            fbx.position.set(0, -1.4, 0);
            fbx.rotation.y = initialRotationY;

            if (fbx.animations && fbx.animations.length > 0) {
                mixer.current = new THREE.AnimationMixer(fbx);
                fbx.animations.forEach((clip) => {
                    try {
                        mixer.current?.clipAction(clip)?.play();
                    } catch (error) { console.error("Error playing animation clip:", clip.name, error); }
                });
            }
        }
        return () => {
            mixer.current?.stopAllAction();
            mixer.current = null;
        };
    }, [fbx, url, initialRotationY]);

    useFrame((_, delta) => { mixer.current?.update(delta); });

    return fbx ? <primitive ref={group} object={fbx} dispose={null} /> : null;
}

const MOBILE_BREAKPOINT = 1024;

export default function PricingComponent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const closeModal = () => setIsModalOpen(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        const checkScreenSize = () => { setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    const handlePurchase = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = '/api/stripe_once';
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'priceID';
        input.value = 'price_1R49jsCcCkxwgwE85NFlzqZJ';
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    return (
        <div className="container relative mx-auto px-4 py-16 lg:py-24 flex flex-col items-center overflow-x-hidden">
            <div className="absolute top-1/4 left-0 w-1/2 h-1/2 lg:w-[40%] lg:h-[60%] bg-primary/5 rounded-full blur-3xl opacity-40 pointer-events-none -translate-x-1/4 z-[-1]"></div>
            <div className="absolute bottom-1/4 right-0 w-1/2 h-1/2 lg:w-[35%] lg:h-[50%] bg-secondary/5 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/4 z-[-1]"></div>

            <div className="text-center mb-12 lg:mb-16 max-w-2xl relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Simple, One-Time Pricing</h2>
                <p className="text-lg md:text-xl text-muted-foreground">
                    Get 30 high-quality 3D model generations for just $9. No subscriptions, just create.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-y-10 gap-x-12 lg:gap-x-16 xl:gap-x-24 items-center w-full max-w-6xl mb-16 lg:mb-24 relative z-10">

                {!isMobile && isMounted && (
                    <div className="w-full h-full min-h-[450px] lg:min-h-[500px] flex items-center justify-center justify-self-center lg:justify-self-start order-1 lg:order-1 pointer-events-none">
                        <WebGLGuard fallback={
                            <div className="w-full h-full flex items-center justify-center text-center p-4 text-muted-foreground bg-muted/20 rounded-lg">
                                <p>Loading 3D Preview...</p>
                            </div>
                        }>
                            <Canvas
                                shadows
                                camera={{ position: [0, 0.5, 5.5], fov: 35 }}
                                style={{ width: '100%', height: '100%' }}
                                dpr={[1, 1.5]}
                                gl={{ antialias: true, alpha: true }}
                            >
                                <Suspense fallback={null}>
                                    <ambientLight intensity={0.9} />
                                    <spotLight
                                        position={[10, 15, 10]} angle={0.4} penumbra={1}
                                        intensity={1.0} castShadow shadow-mapSize-width={1024}
                                        shadow-mapSize-height={1024} shadow-bias={-0.0005}
                                    />
                                    <directionalLight position={[-8, 8, -5]} intensity={0.3} />

                                    <Model url="/Praying.fbx" initialRotationY={-5.5} />

                                    <Environment preset="sunset" blur={0.8} />
                                </Suspense>
                            </Canvas>
                        </WebGLGuard>
                    </div>
                )}


                <div className={`relative w-full max-w-md justify-self-center ${!isMobile ? 'lg:justify-self-end' : ''} order-2`}>
                    <Card className="border border-border/20 shadow-lg rounded-xl overflow-hidden transition-shadow hover:shadow-xl bg-card/90 backdrop-blur-sm">
                        <CardHeader className="pb-2 bg-gradient-to-br from-card/80 to-muted/20">
                            <CardTitle className="text-2xl font-bold text-primary text-center sm:text-left">
                                3D Generation Pack
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row items-baseline justify-center sm:justify-start mb-6">
                                <span className="text-5xl font-extrabold">$9</span>
                                <span className="text-base text-muted-foreground ml-0 sm:ml-2 mt-1 sm:mt-0">one-time payment</span>
                            </div>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "30 AI-powered 3D generations",
                                    "Image to 3D conversion",
                                    "Text to 3D generation",
                                    "High-quality FBX/GLB exports",
                                    "Commercial usage rights"
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="h-5 w-5 text-primary mr-3 shrink-0 mt-0.5" />
                                        <span className="text-foreground/90">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-4 pb-6 px-6 bg-muted/10">
                            <Button
                                className="w-full py-3 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                                onClick={handlePurchase}
                                size="lg"
                            >
                                Get Started Now
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>

            <div className="w-full max-w-6xl relative z-10">
                <ComparisonTable handlePurchase={handlePurchase} />
            </div>

            <p className="mt-12 lg:mt-16 text-sm text-muted-foreground relative z-10">
                Need help or have questions? <a href="mailto:support@simplemesh.com" className="text-primary underline hover:text-primary/80">Contact our support team</a>
            </p>

        </div>
    );
}