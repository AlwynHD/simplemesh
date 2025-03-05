import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const TestimonialSection = () => {
    const testimonials = [
      {
        quote: "Simplemesh has cut my 3D modeling time by at least 70%. I needed custom 3D elements for a client's e-commerce site, and I was able to generate exactly what I needed in minutes instead of outsourcing. The quality is impressive enough for professional web use.",
        name: "Hamza Jait",
        title: "Frontend Developer",
        avatar: "https://randomuser.me/api/portraits/men/59.jpg"
      },
      {
        quote: "As an indie game developer, budget and time constraints are always an issue. Simplemesh has been a revelation for our small studio. We've used it to create environmental assets and props that would have taken days to model manually. The export options work perfectly with our game engine.",
        name: "Owen Read",
        title: "Lead Developer at Indie Games",
        avatar: "https://randomuser.me/api/portraits/men/68.jpg"
      },
      {
        quote: "I've tried several AI 3D tools and Simplemesh stands out for its clean topology and texturing. The mesh quality requires minimal cleanup, and the materials are production-ready. I use it regularly for concept visualization and prototyping before committing to full production.",
        name: "Vernon Reynolds",
        title: "Technical Artist",
        avatar: "https://randomuser.me/api/portraits/men/76.jpg"
      }
    ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(hsl(28,5%,60%)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-primary font-medium mb-3 uppercase tracking-wider text-sm">Trusted by creators worldwide</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why choose Simplemesh.ai?</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full"></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 15px 30px rgba(0,0,0,0.1), 0 8px 15px rgba(0,0,0,0.05)"
              }}
              className="bg-gradient-to-b from-card to-card/90 rounded-[1rem] p-8 border border-border/50 flex flex-col h-full relative group"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-2 text-primary/20 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.3,6.7H8.7c-1.6,0-2.9,1.3-2.9,2.9v2.9H2.9C1.3,12.4,0,13.7,0,15.3v2.9C0,19.7,1.3,21,2.9,21h5.8c1.6,0,2.9-1.3,2.9-2.9V9.6C11.6,8,10.3,6.7,8.7,6.7h2.6V3C11.3,3,11.3,6.7,11.3,6.7z M21.1,12.4h-2.9V9.6c0-1.6-1.3-2.9-2.9-2.9h-2.9V3h2.9c1.6,0,2.9,1.3,2.9,2.9v6.5h2.9c1.6,0,2.9,1.3,2.9,2.9v2.9c0,1.6-1.3,2.9-2.9,2.9h-5.8c-1.6,0-2.9-1.3-2.9-2.9v-5.8c0-1.6,1.3-2.9,2.9-2.9h5.8V12.4z"/>
                </svg>
              </div>
              
              <div className="flex mb-4 ml-auto">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>

              <blockquote className="flex-grow mb-8 text-foreground/90 leading-relaxed italic text-base">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center pt-4 border-t border-border/30">
                <div className="mr-4 relative">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className="rounded-full border-2 border-primary/20"
                    unoptimized // For external images
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-primary/40 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <a
            href="https://www.trustpilot.com/review/simplemesh.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-full bg-secondary border border-border hover:bg-secondary/80 transition-colors group"
          >
            <span className="mr-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#00b67a]">
                <path d="M12 0l2.44 7.5h7.56l-6.12 4.47 2.44 7.53-6.32-4.6-6.32 4.6 2.44-7.53-6.12-4.47h7.56z"/>
              </svg>
            </span>
            <span className="text-foreground font-medium mr-1">Read all our reviews on</span> 
            <span className="text-primary font-bold">Trustpilot</span>
            <svg className="ml-2 w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </motion.div> */}
      </div>
      

    </section>
  );
};

export default TestimonialSection;