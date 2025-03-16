import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useGLTF, Environment, PresentationControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import Link from "next/link";
import WebGLGuard from "@/components/WebGLGuard";
import { Hammer, Anvil } from "lucide-react";

// Refined model component with proper lighting and positioning
function Model({ url }: { url: string }) {
  const group = useRef<THREE.Group>();
  const { scene } = useGLTF(url) as any;

  // More subtle rotation for a professional look
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.003;
    }
  });

  return <primitive ref={group} object={scene} scale={2.2} position={[0, -0.1, 0]} />;
}

interface HeroSectionProps {
  openModal: () => void;
}

const HeroSection = ({ openModal }: HeroSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setIsMounted(true);
  }, []);

  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-background to-background/80">
      {/* Refined background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="absolute h-[500px] w-[500px] -top-64 -left-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute h-[400px] w-[400px] -bottom-32 -right-32 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Content column with refined typography */}
          <motion.div
            className="w-full lg:w-1/2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-5 text-center lg:text-left">
              <motion.span 
                className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium tracking-wide"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                3D AI Generation
              </motion.span>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Turn Ideas Into 3D <span className="text-primary">Instantly</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
                Type a prompt or upload an image to create production-ready 3D models in seconds. No waiting, no complexity.
              </p>
            </div>

            {/* Professional CTA section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button 
                onClick={openModal} 
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Creating
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor" />
                </svg>
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link  
                  href='/#examples'
                  className="px-6 py-3 rounded-lg border border-border/60 bg-background/80 backdrop-blur-sm hover:bg-secondary/5 text-foreground font-medium transition-all duration-300 inline-flex items-center justify-center"
                >
                  See Examples
                </Link>
              </motion.div>
            </div>

            {/* Refined testimonials section */}
            <div className="pt-6 border-t border-border/20 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-background shadow-sm overflow-hidden">
                    <Image
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt={`User ${i}`}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                  <span className="text-sm font-medium text-muted-foreground ml-1">4.7/5 (2.3k+ reviews)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3D Model Display - Professional refinement */}
          <motion.div
            className="w-full lg:w-1/2 mt-8 lg:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {/* Model container with proper stacking context */}
            <div className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px] 
                           min-h-[300px] rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] 
                           bg-gradient-to-b from-background/90 to-background/40 backdrop-blur-sm">
              
              {/* Subtle glow effects */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-secondary/10 rounded-full blur-2xl"></div>
              </div>
              
              {/* Properly positioned 3D model */}
              {isMounted && (
                <WebGLGuard fallback={
                  <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                    <p>3D model loading requires WebGL support</p>
                  </div>
                }>
                  <div className="w-full h-full absolute inset-0 z-10">
                    <Canvas 
                      camera={{ position: [0, 0, 4.2], fov: 42 }}
                      style={{ width: '100%', height: '100%' }}
                      dpr={[1, 2]}
                      gl={{ antialias: true }}
                    >
                      <Suspense fallback={null}>
                        <ambientLight intensity={0.6} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.9} />
                        <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.2} />
                        <PresentationControls
                          global
                          enabled={true}
                          zoom={1}
                          rotation={[0, -Math.PI / 5, 0]}
                          polar={[-Math.PI / 4, Math.PI / 4]}
                          azimuth={[-Math.PI / 4, Math.PI / 4]}
                        >
                          <Model url="/LandingDemo.glb" />
                        </PresentationControls>
                        <Environment preset="city" />
                      </Suspense>
                    </Canvas>
                  </div>
                </WebGLGuard>
              )}

              {/* Floating elements on top - Fixed positioning */}
              <div 
                className="absolute -top-4 -left-4 z-30 bg-background rounded-lg p-3 shadow-md"
                style={{
                  animation: "float 6s ease-in-out infinite",
                  transformStyle: "preserve-3d",
                }}
              >
                <Hammer className="w-6 h-6 text-primary" />
              </div>

              <div 
                className="absolute -bottom-4 -right-4 z-30 bg-background rounded-lg p-3 shadow-md"
                style={{
                  animation: "float 6s ease-in-out infinite 2s",
                  transformStyle: "preserve-3d",
                }}
              >
                <Anvil className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* CSS for the float animation */}
            <style jsx global>{`
              @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
              }
            `}</style>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;