import { useState, useEffect, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three"; // <-- Import THREE
import { Environment, PresentationControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import Link from "next/link";
import WebGLGuard from "@/components/WebGLGuard"; // Assuming this path is correct
import { Hammer, Anvil, ShieldCheck } from "lucide-react";

// --- Model Component (No changes needed here for rotation fix) ---
function Model({ url }) {
  const group = useRef();
  const fbx = useLoader(FBXLoader, url);
  const mixer = useRef(); // Initialize mixer ref

  useEffect(() => {
    // Ensure fbx is loaded before proceeding
    if (fbx) {
      // --- Apply Default Material ---
      const defaultMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc, // Light gray - adjust as needed
        metalness: 0.2,  // Slightly metallic
        roughness: 0.8,  // Mostly rough
      });

      fbx.traverse((child) => {
        if (child.isMesh) {
          // Replace original material(s) with the standard one
          child.material = defaultMaterial;
          child.castShadow = true; // Allow mesh to cast shadows
          child.receiveShadow = true; // Allow mesh to receive shadows
        }
      });
      // --- End Apply Default Material ---

      // Set scale and position
      fbx.scale.set(0.4, 0.4, 0.4);
      fbx.position.set(0, -1.2, 0); // Adjust Y position if needed after scaling

      // --- Initialize and Play Animations ---
      mixer.current = new THREE.AnimationMixer(fbx);

      if (fbx.animations && fbx.animations.length) {
        fbx.animations.forEach((clip) => {
          const action = mixer.current.clipAction(clip);
          action.play();
        });
      }
      // --- End Animations ---
    }

    // Cleanup function
    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [fbx]); // Depend on the loaded fbx object

  useFrame((_, delta) => {
    // Update animations if mixer exists
    if (mixer.current) {
      mixer.current.update(delta);
    }

  });

  // Conditionally render the primitive only when fbx is loaded
  return fbx ? <primitive ref={group} object={fbx} dispose={null} /> : null;
}

// --- HeroSection Component ---
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
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="absolute h-[500px] w-[500px] -top-64 -left-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute h-[400px] w-[400px] -bottom-32 -right-32 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Content column */}
          <motion.div
            className="w-full lg:w-1/2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* ... Rest of your content column ... */}
             <div className="space-y-5 text-center lg:text-left">
              <motion.span
                className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium tracking-wide"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                AI 3D Asset Generation
              </motion.span>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Game Ready Assets In <span className="text-primary">Seconds</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
                Create 3D models in seconds from simple text prompts or image uploads. Generate assets optimized for game engines and ready for immediate rigging and animation.
              </p>
            </div>

            {/* CTA section */}
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
                  className="px-6 py-3 rounded-lg border border-border/60 bg-background/80 backdrop-blur-sm hover:bg-secondary/5 text-foreground font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 w-full"
                >
                  See Examples
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* Money-back guarantee */}
            <motion.div
              className="mt-8 pt-6 border-t border-border/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">14-Day Money-Back Guarantee</h3>
                    <p className="text-sm text-muted-foreground">Try with confidence. Full refund if you're not satisfied.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 3D Model Display */}
          <motion.div
            className="w-full lg:w-1/2 mt-8 lg:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px]
                           min-h-[300px] rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]
                           bg-gradient-to-b from-background/90 to-background/40 backdrop-blur-sm">

              <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-secondary/10 rounded-full blur-2xl"></div>
              </div>

              {isMounted && (
                <WebGLGuard fallback={
                  <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                    <p>3D model loading requires WebGL support</p>
                  </div>
                }>
                  <div className="w-full h-full absolute inset-0 z-10">
                    <Canvas
                      shadows // <-- Enable shadows for the scene
                      camera={{ position: [0, 0, 5], fov: 40 }}
                      style={{ width: '100%', height: '100%' }}
                      dpr={[1, 2]} // Adjust pixel ratio for performance vs quality
                      gl={{ antialias: true }}
                    >
                      <Suspense fallback={null}>
                        {/* Adjusted Lighting - Intensity might need tweaking */}
                        <ambientLight intensity={0.7} />
                        <spotLight
                          position={[10, 10, 10]}
                          angle={0.2} // Slightly wider angle
                          penumbra={1}
                          intensity={1.2} // Slightly increased intensity
                          castShadow // Allow this light to cast shadows
                          shadow-mapSize-width={1024} // Shadow map resolution
                          shadow-mapSize-height={1024}
                        />
                        {/* Optional: Add a fill light if needed */}
                        <directionalLight position={[-5, 5, -5]} intensity={0.3} />

                        <PresentationControls
                          global
                          enabled={true} // Enable user interaction
                          zoom={1}
                          // --- MODIFIED ROTATION ---
                          rotation={[0, 3.7, 0]} // Initial rotation (X, Y, Z) - Set Y to 0 to face front
                          // --- END MODIFIED ROTATION ---
                          polar={[-Math.PI / 4, Math.PI / 4]} // Vertical rotation limits
                          azimuth={[-Math.PI / 4, Math.PI / 4]} // Horizontal rotation limits
                          config={{ mass: 2, tension: 500 }} // Spring physics config
                        >
                          {/* Render the model component */}
                          <Model url="/Standing.fbx" />
                        </PresentationControls>
                        {/* Environment lighting */}
                        <Environment preset="city" />
                      </Suspense>
                    </Canvas>
                  </div>
                </WebGLGuard>
              )}

              {/* Floating elements */}
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