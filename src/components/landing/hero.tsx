import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion"; // Added for better animations
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-background to-background/60">
      {/* Abstract background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute h-80 w-80 -top-10 -left-10 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute h-80 w-80 -bottom-10 -right-10 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content Column (Text first on mobile for better UX) */}
          <motion.div 
            className="flex-1 space-y-8 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium tracking-wide">
                3D AI Generation
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                Turn Ideas Into 3D <span className="text-primary">Instantly</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Type a prompt or upload an image to create production-ready 3D models in seconds. No waiting, no complexity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Start Creating
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                </svg>
              </button>
              
              <button className="px-6 py-3 rounded-lg border border-border bg-background/80 backdrop-blur-sm hover:bg-secondary/10 text-foreground font-medium transition-all">
                See Examples
              </button>
            </div>

            <div className="pt-6 border-t border-border/30 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                    <Image 
                      src={`https://i.pravatar.cc/100?img=${i+10}`} 
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
                  <span className="text-sm font-medium text-muted-foreground ml-1">4.9/5 (2.3k+ reviews)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image Column */}
          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="relative z-10 aspect-square max-w-md mx-auto">
              <Image
                src="https://placehold.co/800x800/3a8ef7/FFFFFF?text=3D+Model+Preview"
                alt="3D model preview"
                width={800}
                height={800}
                className="rounded-xl shadow-2xl object-cover"
              />
              
              {/* Floating element 1 */}
              <div className="absolute -top-4 -left-4 bg-background rounded-lg p-3 shadow-lg animate-float">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15 12L10 8V16L15 12Z" fill="currentColor"/>
                </svg>
              </div>
              
              {/* Floating element 2 */}
              <div className="absolute -bottom-4 -right-4 bg-background rounded-lg p-3 shadow-lg animate-float-delayed">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 3L21 9V21H3V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-secondary/30 rounded-full blur-2xl -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;