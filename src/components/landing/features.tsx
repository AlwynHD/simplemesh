import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const FeatureShowcase = () => {
  const features = [
    {
      title: "Text to 3D",
      description: "Generate detailed 3D models from text descriptions",
      image: "/treeModel.jpg",
      text: "\"A Stylised Tree Orthographic View, Low Poly\"",
      type: "Text"
    },
    {
      title: "Image to 3D",
      description: "Convert any image into a 3D model instantly",
      image: "/dragonpic.jpg",
      type: "JPG"
    },
    {
      title: "Texture Generation",
      description: "Advanced AI tools to retexture your models",
      image: "",
      type: "AI",
      comingSoon: true
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background/50 to-background border-t border-border/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Powerful 3D Generation Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface Feature {
  title: string;
  description: string;
  image: string;
  text?: string;
  type: string;
  comingSoon?: boolean;
}

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-xl overflow-hidden h-full"
    >
      {feature.comingSoon && (
        <div className="absolute top-4 right-4 z-30 bg-primary/90 text-background px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          Coming Soon
        </div>
      )}
      
      <div className="relative z-10 h-full flex flex-col">
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-card/80 to-card backdrop-blur-sm border border-border/40 rounded-xl transition-all duration-300"
          style={{
            boxShadow: isHovered ? '0 10px 30px -5px rgba(0, 0, 0, 0.2)' : '0 5px 15px -5px rgba(0, 0, 0, 0.1)'
          }}
        />
        
        <div className="p-6 flex flex-col h-full relative z-10">
          <div className="mb-5 flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <span className="text-primary font-semibold text-sm">{feature.type}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
          </div>
          
          <p className="text-muted-foreground mb-6">{feature.description}</p>
          
          {!feature.comingSoon && feature.image && (
            <div className="relative flex-grow mb-6">
              <motion.div
                className="aspect-square relative rounded-lg overflow-hidden"
                animate={{ scale: isHovered ? 1.03 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          )}
          
          {!feature.comingSoon && (
            <div className="bg-secondary/20 rounded-lg p-4 border border-border/50 backdrop-blur-sm">
              {feature.text ? (
                <p className="text-sm italic">{feature.text}</p>
              ) : (
                <div className="aspect-square w-full max-w-[80px] mx-auto relative">
                  <Image
                    src={feature.type === "PNG" ? "/DragonInput.png" : "/DragonInput.png"}
                    alt={`${feature.type} preview`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
export default FeatureShowcase;