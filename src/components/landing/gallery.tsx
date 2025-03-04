import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Define interface for gallery items
interface GalleryItem {
  id: number;
  title: string;
  imageUrl: string;
}

// Simplified gallery data - just a few curated models
const galleryItems: GalleryItem[] = [
  { id: 1, title: "Futuristic Robot", imageUrl: "https://source.unsplash.com/random/600x600?3d,robot" },
  { id: 2, title: "Modern Chair", imageUrl: "https://source.unsplash.com/random/600x600?3d,chair" },
  { id: 3, title: "Fantasy Castle", imageUrl: "https://source.unsplash.com/random/600x600?3d,castle" },
  { id: 4, title: "Stylized Vehicle", imageUrl: "https://source.unsplash.com/random/600x600?3d,car" },
  { id: 5, title: "Abstract Sculpture", imageUrl: "https://source.unsplash.com/random/600x600?3d,sculpture" },
  { id: 6, title: "Game Character", imageUrl: "https://source.unsplash.com/random/600x600?3d,character" }
];

const GallerySection: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (item: GalleryItem): void => {
    setSelectedModel(item);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background/60 to-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-3">Featured 3D Models</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of AI-generated 3D models created with a single prompt.
          </p>
        </div>

        {/* Simplified Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-xl overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-square">
                <Image 
                  src={item.imageUrl} 
                  alt={item.title}
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-105"
                />
                
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Card content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-100">
                  <h3 className="text-white font-medium mb-2 group-hover:mb-3 transition-all">{item.title}</h3>
                  
                  {/* More subtle view in 3D button */}
                  <button
                    onClick={() => openModal(item)}
                    className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 w-auto self-start text-sm bg-background/30 backdrop-blur-sm hover:bg-background/50 text-white font-medium py-1.5 px-3 rounded-md flex items-center gap-2"
                    type="button"
                    aria-label={`View ${item.title} in 3D`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor" />
                      <path d="M21.8944 11.5528C19.7362 7.23635 15.9031 5 12 5C8.09687 5 4.26379 7.23635 2.10557 11.5528C1.96481 11.8343 1.96481 12.1657 2.10557 12.4472C4.26379 16.7637 8.09687 19 12 19C15.9031 19 19.7362 16.7637 21.8944 12.4472C22.0352 12.1657 22.0352 11.8343 21.8944 11.5528Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    View in 3D
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Simplified Modal */}
      <AnimatePresence>
        {isModalOpen && selectedModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-card rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Simple close button */}
              <button 
                onClick={closeModal}
                className="absolute top-3 right-3 z-10 bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground transition-all"
                type="button"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Model viewer */}
              <div className="h-[60vh] w-full bg-black/10">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <div className="text-center p-8">
                    <div className="animate-spin mb-4 mx-auto w-12 h-12 border-3 border-primary/80 border-t-transparent rounded-full"></div>
                    <h3 className="text-xl font-medium mb-1">{selectedModel.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Loading 3D model...
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Simplified info panel - no download button */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium">{selectedModel.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Created with SimpleMesh AI
                  </p>
                </div>
                <button 
                  className="bg-secondary/20 hover:bg-secondary/30 text-foreground text-sm font-medium py-2 px-4 rounded-md transition-all flex items-center gap-2"
                  type="button"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.684 13.342C8.886 13.524 9 13.768 9 14.028V15h6v-1c0-.274.114-.526.316-.712l4.684-4.56c.23-.225.352-.522.352-.827C20.352 7.403 19.98 7 19.542 7h-15c-.448 0-.825.403-.825.901 0 .305.122.602.355.83l4.612 4.611z" />
                    <path d="M12 16v4" />
                  </svg>
                  Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;