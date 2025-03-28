"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LoginWithLogo } from '@/components/login-components/login-with-logo'
import Modal from '@/components/modal'
import { motion } from "framer-motion"; // Added for better animations

import HeroSection from '@/components/landing/hero'
import GallerySection from '@/components/landing/gallery'
import FeatureShowcase from '@/components/landing/features'
import FeaturesGrid from '@/components/landing/featuresGrid'
import TestimonialSection from '@/components/landing/testimonials'
import { FAQSection } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'
import YoutubeShowcase from '@/components/landing/youtube-showcase'
import PricingComponent from '@/components/landing/fixed-price'
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
export default function Home() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [animatedItems, setAnimatedItems] = useState<{ [key: string]: boolean }>({});
    const [isOpen, setIsOpen] = useState(false)


    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
    // Animation on scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const elements = document.querySelectorAll('[data-animate="true"]');
            elements.forEach((element) => {
                const rect = element.getBoundingClientRect();
                const id = element.id;

                if (rect.top <= window.innerHeight * 0.8 && !animatedItems[id]) {
                    setAnimatedItems(prev => ({ ...prev, [id]: true }));
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        // Trigger once on load
        setTimeout(handleScroll, 500);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [animatedItems]);

    const router = useRouter();
    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.auth.getUser();

            if (data?.user) {
                router.replace('/dashboard');
            }
        }

        checkUser();
    }, [router]);
    return (
        <div className="relative min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            {/* Top notification bar */}
            {/* <div className="relative backdrop-blur-xl bg-[hsl(var(--background))]/80 border-[hsl(var(--border))] py-2 md:py-4 px-4 md:px-6 border-b overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>

                <div className="hidden md:flex max-w-6xl mx-auto justify-center items-center space-x-8 text-sm relative z-10">
                    
                    <div className="flex items-center" style={{ opacity: animatedItems["early-access"] ? 1 : 0, transform: animatedItems["early-access"] ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease-out' }} id="early-access" data-animate="true">
                        <svg className="text-emerald-500 mr-2 text-base" height="1em" width="1em" viewBox="0 0 512 512">
                            <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z" fill="currentColor" />
                        </svg>
                        <span className="font-bold text-emerald-500">Early Access</span>
                    </div>

                    <span className="text-[hsl(var(--muted-foreground))]">|</span>

                    <div className="flex items-center" style={{ opacity: animatedItems["beta-features"] ? 1 : 0, transform: animatedItems["beta-features"] ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease-out' }} id="beta-features" data-animate="true">
                        <svg className="text-[hsl(var(--muted-foreground))] mr-2 text-base" height="1em" width="1em" viewBox="0 0 384 512">
                            <path d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z" fill="currentColor" />
                        </svg>
                        <span className="font-medium text-[hsl(var(--card-foreground))]">
                            Exclusive Beta Features
                        </span>
                    </div>

                    <span className="text-[hsl(var(--muted-foreground))]">|</span>

                    <div className="flex items-center" style={{ opacity: animatedItems["updates"] ? 1 : 0, transform: animatedItems["updates"] ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease-out' }} id="updates" data-animate="true">
                        <svg className="text-[hsl(var(--muted-foreground))] mr-2 text-base" height="1em" width="1em" viewBox="0 0 512 512">
                            <path d="M440.65 12.57l4 82.77A247.16 247.16 0 0 0 255.83 8C134.73 8 33.91 94.92 12.29 209.82A12 12 0 0 0 24.09 224h49.05a12 12 0 0 0 11.67-9.26 175.91 175.91 0 0 1 317-56.94l-101.46-4.86a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12H500a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12h-47.37a12 12 0 0 0-11.98 12.57zM255.83 432a175.61 175.61 0 0 1-146-77.8l101.8 4.87a12 12 0 0 0 12.57-12v-47.4a12 12 0 0 0-12-12H12a12 12 0 0 0-12 12V500a12 12 0 0 0 12 12h47.35a12 12 0 0 0 12-12.6l-4.15-82.57A247.17 247.17 0 0 0 255.83 504c121.11 0 221.93-86.92 243.55-201.82a12 12 0 0 0-11.8-14.18h-49.05a12 12 0 0 0-11.67 9.26A175.86 175.86 0 0 1 255.83 432z" fill="currentColor" />
                        </svg>
                        <span className="font-medium text-[hsl(var(--card-foreground))]">
                            Weekly Updates
                        </span>
                    </div>
                </div>
            </div> */}

            {/* Header/Navigation */}
            <Header openModal={openModal} />

            <HeroSection openModal={openModal} />
            <YoutubeShowcase />

            <section id='examples'>
                <GallerySection />

            </section>

            {/* 1. Companies Section */}
            {/* <section className="py-10 border-t border-border bg-background/50">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="md:max-w-xs">
                            <h3 className="text-xl font-bold text-foreground mb-2 text-center md:text-left">
                                Seamless Integrations
                            </h3>
                            <p className="text-muted-foreground text-center md:text-left">
                                Export directly to your favorite 3D software and game engines
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-x-10 gap-y-8">
                            {[
                                { name: 'unity.svg', displayName: 'Unity' },
                                { name: 'unreal.svg', displayName: 'Unreal Engine' },
                                { name: 'blender.png', displayName: 'Blender' },
                                { name: 'godot.svg', displayName: 'Godot' },
                                { name: 'maya.png', displayName: 'Maya' }
                            ].map((platform, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0.7 }}
                                    whileHover={{ opacity: 1, scale: 1.05 }}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-card p-2 flex items-center justify-center shadow-sm border border-border/30 group-hover:border-primary/30 transition-all">
                                        <Image
                                            src={`/integrations/${platform.name}`}
                                            alt={`${platform.displayName} integration`}
                                            fill
                                            className="object-contain p-2 filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                        {platform.displayName}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>


                </div>
            </section> */}

            {/* 2. Features Section */}
            <FeatureShowcase />


            {/* 3. CTA Section */}
            <section className="py-16 border-y border-border relative overflow-hidden bg-secondary/10">
                {/* Base background */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

                {/* Theme-appropriate floating elements */}
                <div className="absolute top-8 left-[10%] w-24 h-24 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl -rotate-6 shadow-xl border border-primary/20 hidden md:block" style={{ animation: "float1 6s ease-in-out infinite" }}></div>

                <div className="absolute bottom-12 right-[12%] w-20 h-20 bg-gradient-to-tr from-muted/40 to-accent/20 rounded-full shadow-xl border border-border/30 hidden md:block" style={{ animation: "float2 7s ease-in-out infinite" }}></div>

                <div className="absolute top-[40%] right-[20%] w-16 h-16 bg-gradient-to-br from-secondary/50 to-border/30 rounded transform rotate-45 shadow-xl border border-secondary/40 hidden md:block" style={{ animation: "float3 8s ease-in-out infinite" }}></div>

                <div className="absolute bottom-[40%] left-[15%] w-14 h-14 bg-gradient-to-r from-ring/30 to-primary/20 rounded-md shadow-xl border border-ring/20 hidden md:block" style={{ animation: "float4 5s ease-in-out infinite" }}></div>

                {/* Content container */}
                <div className="container relative z-10 mx-auto px-4">
                    <div className="backdrop-blur-sm bg-background/30 rounded-2xl p-8 border border-border/30 shadow-xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex items-center text-center md:text-left gap-6">
                                {/* 3D Cube icon instead of sparkle emoji */}
                                <div className="hidden md:flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full shadow-inner">
                                    <svg viewBox="0 0 24 24" width="36" height="36" className="text-primary fill-current">
                                        <path d="M12,0.5L3,5.5V15.5L12,20.5L21,15.5V5.5L12,0.5Z M12,2.311L18.25,6L12,9.689L5.75,6L12,2.311Z M4.75,7.25L11,10.939V18.75L4.75,15.061V7.25Z M13,18.75V10.939L19.25,7.25V15.061L13,18.75Z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/90">
                                        3D Creation Made Ridiculously Simple
                                    </h2>
                                    <p className="text-lg text-muted-foreground">
                                        Turn your ideas into stunning 3D models in minutes — no technical skills required
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={openModal}
                                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 group relative overflow-hidden"
                            >
                                <span className="relative z-10">Start Creating Now</span>
                                <svg className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Custom animations for floating elements */}
                <style jsx>{
                    `@keyframes float1 {
                        0%, 100% { transform: translateY(0) rotate(-6deg); }
                        50% { transform: translateY(-20px) rotate(-2deg); }
                    }
                    @keyframes float2 {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(20px); }
                    }
                    @keyframes float3 {
                        0%, 100% { transform: translateY(0) rotate(45deg); }
                        50% { transform: translateY(-15px) rotate(50deg); }
                    }
                    @keyframes float4 {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(12px); }}`
                }</style>
            </section>

            {/* 4. Features Grid */}
            {/* <FeaturesGrid /> */}

            <section id='pricing'>
                <PricingComponent />
            </section>

            {/* 6. Testimonials Section */}
            {/* <TestimonialSection /> */}

            {/* 7. Final CTA Section */}
            <section className="py-20 bg-primary text-white relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M42.8,-68.2C54.9,-61.8,63.7,-48.4,71.1,-33.7C78.5,-19,84.4,-3,81.8,11.4C79.1,25.7,67.9,38.5,55.7,48.5C43.5,58.6,30.3,65.9,15.8,70.2C1.3,74.6,-14.6,76,-28.8,71.3C-43,66.6,-55.6,55.7,-64.3,42.2C-73,28.6,-77.8,12.3,-78.5,-5C-79.2,-22.3,-75.8,-40.5,-65.1,-51.5C-54.4,-62.5,-36.3,-66.2,-20.8,-70.6C-5.3,-74.9,8.6,-79.9,22.9,-78.1C37.2,-76.4,51.9,-67.9,58.3,-57.1C64.7,-46.2,63.2,-33,61.1,-21.4C59,-9.7,56.2,0.4,53.5,10.5" transform="translate(100 100)" />
                    </svg>
                </div>

                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="flex items-center gap-6 max-w-xl">
                            <div className="hidden md:flex h-16 w-16 bg-white/15 rounded-full items-center justify-center shadow-lg backdrop-blur-sm">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 8L19 12L15 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M4 12H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight">
                                    Create without Limits
                                </h2>
                                <p className="text-xl opacity-85 font-light">
                                    Advanced AI generation at your fingertips
                                </p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            onClick={openModal}
                            className="px-8 py-5 bg-white text-primary rounded-xl text-xl font-bold shadow-xl flex items-center group relative overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 to-blue-100/40 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <span className="mr-2 relative z-10">Generate Now</span>
                            <svg className="w-6 h-6 ml-2 relative z-10 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.button>
                    </div>
                </div>

                {/* Bottom decorative dots */}
                <div className="absolute bottom-0 left-0 w-full h-4 flex justify-center gap-2 opacity-30">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-white" style={{ opacity: Math.random() * 0.5 + 0.5 }}></div>
                    ))}
                </div>
            </section>

            {/* 8. FAQ Section */}
            <FAQSection />


            {/* 9. Footer */}
            <Footer openModal={openModal} />

            {/* Login Popup */}
            <Modal isOpen={isOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal>
        </div>
    );
}