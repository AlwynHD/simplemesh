import React from 'react';
import { FiBox, FiLayers, FiPackage, FiRefreshCw } from 'react-icons/fi';
import { BiCube, BiPalette, BiMicrophone } from 'react-icons/bi';
import { HiOutlineCube, HiOutlineLockClosed } from 'react-icons/hi';
import { IoImagesOutline, IoSettingsOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

const FeaturesGrid = () => {
  const features = [
    { icon: <FiBox />, title: "3D Assets in Seconds" },
    { icon: <BiPalette />, title: "HQ Materials" },
    { icon: <IoSettingsOutline />, title: "Auto Remesh" },
    { icon: <FiLayers />, title: "Re-Texture AI" },
    { icon: <HiOutlineCube />, title: "3D Library" },
    { icon: <FiPackage />, title: "All 3D Formats" },
    { icon: <IoImagesOutline />, title: "AI Image Studio" },
    { icon: <BiMicrophone />, title: "Sound/Speech AI" },
    { icon: <BiCube />, title: "3D Tools" },
    { icon: <FiLayers />, title: "Auto LODs" },
    { icon: <HiOutlineLockClosed />, title: "Private by Default" },
    { icon: <FiRefreshCw />, title: "Weekly Updates" }
  ];

  return (
    <section className="py-16 bg-[hsl(0,0%,9%)] relative overflow-hidden" id="tools">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(hsl(28,5%,60%)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(28,96.4%,67.5%)]/5 to-[hsl(28,30%,10%)]/5"></div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-[hsl(28,96.4%,67.5%)]/20"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `rise ${Math.random() * 10 + 15}s linear infinite`,
              animationDelay: `-${Math.random() * 15}s`,
              opacity: Math.random() * 0.4 + 0.1
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-10 text-center"
        >
          <span className="bg-clip-text text-white ">
            Features
          </span>
        </motion.h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 8px 20px -5px rgba(0,0,0,0.15), 0 6px 8px -6px rgba(0,0,0,0.1)" 
              }}
              className="relative overflow-hidden p-4 rounded-[1rem] backdrop-blur-md 
                bg-gradient-to-br from-[hsl(28,30%,10%)]/30 to-[hsl(28,30%,10%)]/10 
                border border-[hsl(28,30%,18%)] hover:border-[hsl(28,96.4%,67.5%)]/30
                transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="text-[hsl(28,96.4%,67.5%)] text-xl p-2.5 rounded-full 
                  bg-[hsl(28,96.4%,67.5%)]/10 group-hover:bg-[hsl(28,96.4%,67.5%)]/15 
                  group-hover:text-[hsl(0,0%,98%)]
                  group-hover:scale-110 transition-all duration-300 ease-out">
                  {feature.icon}
                </div>
                <h3 className="text-xs font-medium tracking-tight text-[hsl(0,0%,98%)]/90 group-hover:text-[hsl(0,0%,98%)]">
                  {feature.title}
                </h3>
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-px bg-gradient-to-r from-[hsl(28,96.4%,67.5%)]/60 to-[hsl(28,80%,55%)]/60 opacity-0 
                group-hover:opacity-100 blur-xl transition-all duration-500 -z-10"></div>
                
              {/* Radial gradient on hover */}
              <div className="absolute inset-0 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300 -z-10"
                style={{
                  background: 'radial-gradient(circle at center, hsla(28, 96.4%, 67.5%, 0.15) 0%, transparent 70%)'
                }}></div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes rise {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-500px) translateX(70px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default FeaturesGrid;