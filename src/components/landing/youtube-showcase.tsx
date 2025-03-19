// components/landing/youtube-showcase.tsx
import React from 'react';
import { motion } from "framer-motion";

const YoutubeShowcase = () => {
    return (
        <section className="py-10 md:py-12 relative overflow-hidden border-t border-b border-[hsl(var(--border))]/30">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            <div className="container mx-auto px-4">
                <div className="text-center mb-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
                    >
                        See It In Action
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-lg text-muted-foreground max-w-3xl mx-auto"
                    >
                        Watch how our platform transforms ideas into stunning 3D models in minutes
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="relative mx-auto max-w-4xl rounded-2xl overflow-hidden shadow-xl border border-[hsl(var(--border))]/30 bg-[hsl(var(--secondary))]/5 backdrop-blur-sm"
                >
                    {/* Decorative elements */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[hsl(var(--primary))]/20 to-transparent rounded-full blur-xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-[hsl(var(--accent))]/20 to-transparent rounded-full blur-xl"></div>

                    {/* YouTube video container with 16:9 aspect ratio */}
                    <div className="relative pt-[56.25%]">
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src="https://www.youtube.com/embed/dvzkI6ZHAAY" 
                            title="Product Showcase"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* Video controls overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                </motion.div>

                <div className="mt-6 flex justify-center">
                    <motion.a
                        href="https://www.youtube.com/@SimpleMesh"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-[hsl(var(--foreground))] bg-[hsl(var(--secondary))]/10 hover:bg-[hsl(var(--secondary))]/20 border border-[hsl(var(--border))]/30 hover:border-[hsl(var(--border))]/50 rounded-lg transition-all duration-200 relative z-10 cursor-pointer"
                    >
                        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <span>Watch more tutorials</span>
                    </motion.a>
                </div>
            </div>
        </section>
    );
};

export default YoutubeShowcase;