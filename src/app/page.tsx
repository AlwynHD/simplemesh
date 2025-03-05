"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LoginWithLogo } from '@/components/login-components/login-with-logo'
import Modal from '@/components/modal'
import { motion } from "framer-motion"; // Added for better animations
import { Disclosure } from '@headlessui/react'

import HeroSection from '@/components/landing/hero'
import GallerySection from '@/components/landing/gallery'
import FeatureShowcase from '@/components/landing/features'
import FeaturesGrid from '@/components/landing/featuresGrid'
import TestimonialSection from '@/components/landing/testimonials'
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

    return (
        <div className="relative min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            {/* Top notification bar */}
            <div className="relative backdrop-blur-xl bg-[hsl(var(--background))]/80 border-[hsl(var(--border))] py-2 md:py-4 px-4 md:px-6 border-b overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>

                <div className="hidden md:flex max-w-6xl mx-auto justify-center items-center space-x-8 text-sm relative z-10">
                    {/* Early Access Badge */}
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
            </div>

            {/* Header/Navigation */}
            <header className="sticky top-0 z-50 bg-[hsl(var(--background))]/90 backdrop-blur-md border-b border-[hsl(var(--border))]/30 py-4">
                <div className="container flex items-center justify-between px-4 mx-auto">
                    <div className="flex items-center flex-shrink-0 ml-4 xl:ml-0">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image src="favicon/Logo-Fox-Light.svg" alt="Logo" width={36} height={36} className="cursor-pointer" />
                        </Link>
                    </div>

                    <div className="hidden lg:flex lg:items-center lg:justify-between flex-1">
                        <nav className="flex justify-center space-x-8 flex-1">
                            {[
                                { href: "/#examples", label: "Examples" },
                                { href: "/#tools", label: "Tools" },
                                { href: "/#questions", label: "Questions" },
                                { href: "/#community", label: "Community" }
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="relative text-base font-medium text-[hsl(var(--foreground))] transition-all duration-200 hover:text-opacity-70 group"
                                >
                                    {item.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--primary))] transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            ))}
                        </nav>

                        <Link href="" onClick={openModal} className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium leading-6 text-[hsl(var(--foreground))] transition-all duration-200 ease-in-out bg-[hsl(var(--secondary))]/5 border border-[hsl(var(--border))]/30 rounded-lg hover:bg-[hsl(var(--secondary))]/20 hover:border-[hsl(var(--border))]/50">
                            <span className="relative z-10">Launch</span>
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5 text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors duration-200">
                                <path d="M5 3v16h16"></path>
                                <path d="m5 19 6-6"></path>
                                <path d="m2 6 3-3 3 3"></path>
                                <path d="m18 16 3 3-3 3"></path>
                            </svg>
                            <div className="absolute inset-0 transform transition-transform duration-200 ease-in-out group-hover:scale-100 group-hover:rotate-0">
                                <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary))]/50 to-[hsl(var(--ring))]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
                            </div>
                        </Link>
                    </div>

                    <button
                        className="lg:hidden text-[hsl(var(--foreground))] mr-6 p-1"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        ) : (
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                <line x1="4" y1="8" x2="20" y2="8"></line>
                                <line x1="4" y1="16" x2="20" y2="16"></line>
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile menu */}
                <div
                    className={`lg:hidden transition-all duration-300 ease-in-out transform ${mobileMenuOpen ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'} overflow-hidden`}
                >
                    <nav className="px-4 pt-4 pb-5 space-y-2 border-t border-[hsl(var(--border))]/20 mt-2 bg-[hsl(var(--background))]/95">
                        {[
                            { href: "/#examples", label: "Examples" },
                            { href: "/#tools", label: "Tools" },
                            { href: "/#questions", label: "Questions" },
                            { href: "/#community", label: "Community" }
                        ].map((item) => (
                            <Link key={item.label} href={item.href} className="block">
                                <div className="flex items-center text-base font-medium text-[hsl(var(--foreground))] py-2.5 px-4 rounded-lg hover:bg-[hsl(var(--secondary))]/10 transition-colors duration-200">
                                    {item.label}
                                    <svg className="ml-auto h-4 w-4 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </div>
                            </Link>
                        ))}
                        <div className="pt-2 pb-1">
                            <Link
                                href=""
                                onClick={openModal}
                                className="flex items-center justify-center w-full py-2.5 px-4 bg-[hsl(var(--secondary))]/5 border border-[hsl(var(--border))]/30 rounded-lg text-[hsl(var(--foreground))] font-medium hover:bg-[hsl(var(--secondary))]/20 hover:border-[hsl(var(--border))]/50 transition-all duration-200"
                            >
                                <span>Open Studio</span>
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5">
                                    <path d="M5 3v16h16"></path>
                                    <path d="m5 19 6-6"></path>
                                    <path d="m2 6 3-3 3 3"></path>
                                    <path d="m18 16 3 3-3 3"></path>
                                </svg>
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            <HeroSection />

            <GallerySection />

            {/* 1. Companies Section */}
            <section className="py-10 border-t border-border bg-background/50">
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
            </section>

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
                <style jsx>{`
        @keyframes float1 {
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
            50% { transform: translateY(12px); }
        }
    `}</style>
            </section>

            {/* 4. Features Grid */}
            <FeaturesGrid />

            {/* 5. Main CTA Video Section
            <section className="py-20 bg-gradient-to-b from-background to-background/90 border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex-1 space-y-6 text-center lg:text-left"
                        >
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                                    Turn any Image into 3D
                                </h2>
                                <p className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                    And so much more...
                                </p>
                            </div>

                            <p className="text-lg text-muted-foreground max-w-xl">
                                Transform <span className="text-primary font-medium">Text</span> or
                                <span className="text-primary font-medium"> Images</span> into
                                <span className="text-primary font-medium"> 3D models</span> in
                                seconds, generate high quality images and create textures with AI.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-lg font-medium flex items-center gap-2 shadow-lg shadow-primary/10"
                            >
                                Launch Studio
                                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828z"></path>
                                    <path d="M3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31z"></path>
                                </svg>
                            </motion.button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-border"
                        >
                            <video
                                className="w-full h-auto"
                                autoPlay
                                loop
                                muted
                                playsInline
                            >
                                <source src="/VideoHeader3.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </motion.div>
                    </div>
                </div>
            </section> */}

            {/* 6. Testimonials Section */}

            <TestimonialSection />

            {/* 7. Final CTA Section */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-6">
                            <div className="text-5xl hidden md:block">👋</div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                    Try it yourself!
                                </h2>
                                <p className="text-lg opacity-90">
                                    It&apos;s like Magic, you should try it!
                                </p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-background text-foreground rounded-xl text-xl font-bold flex items-center gap-2 shadow-lg"
                        >
                            Start generating!
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </section>

            {/* 8. FAQ Section */}
            <section className="py-20 bg-background" id="questions">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

                    {[
                        {
                            question: "How long does a Generation take?",
                            answer: "Typically, generating a 3D model takes between 15 to 25 seconds. The exact time can vary based on the complexity of the request and the current load on our servers."
                        },
                        {
                            question: "How can I create a 3D Model?",
                            answer: "To create a 3D model, you have the flexibility to use a text prompt or upload an image for reference. Our platform is designed to be user-friendly and intuitive, ensuring you can easily bring your creative visions to life."
                        },
                        {
                            question: "How many credits does each task cost?",
                            answer: "For Image to 3D and Text to 3D tasks, generation costs 25 credits. Remeshing is free and AI texturing... is also free"
                        },
                        {
                            question: "Do you offer refunds?",
                            answer: "Of course! Your satisfaction is our priority. If you are dissatisfied with our service, please contact us at support@3daistudio.com for a refund."
                        }
                    ].map((faq, index) => (
                        <Disclosure key={index} as="div" className="mt-4">
                            {({ open }) => (
                                <>
                                    <Disclosure.Button className="flex justify-between w-full px-4 py-4 text-left text-lg font-medium bg-card/50 hover:bg-card rounded-lg border border-border focus:outline-none focus-visible:ring focus-visible:ring-primary/50">
                                        <span>{faq.question}</span>
                                        <svg
                                            className={`${open ? 'transform rotate-180' : ''
                                                } w-5 h-5 text-primary`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </Disclosure.Button>
                                    <Disclosure.Panel className="px-4 pt-4 pb-6 text-muted-foreground bg-card/30 rounded-b-lg border-x border-b border-border -mt-0.5">
                                        {faq.answer}
                                    </Disclosure.Panel>
                                </>
                            )}
                        </Disclosure>
                    ))}

                    <div className="mt-10 text-center">
                        <p className="text-muted-foreground">
                            Didn&apos;t find the answer you&apos;re looking for?
                            <a href="mailto:support@3daistudio.com" className="text-primary ml-1 hover:underline">
                                Contact our support
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            {/* 9. Footer */}
            <footer className="bg-background border-t border-border pt-16 pb-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">3D AI Studio</h2>
                                <p className="text-muted-foreground">The Ultimate Studio for 3D Assets.</p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2"
                            >
                                Start generating
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 4v16m8-8H4" />
                                </svg>
                            </motion.button>
                        </div>

                        {[
                            {
                                title: "Features",
                                links: [
                                    { text: "Image to 3D", href: "" },
                                    { text: "Text to 3D", href: "" },
                                    { text: "Image AI Studio", href: "" },
                                    { text: "Texture AI", href: "" },
                                    { text: "Community Creations", href: "" }
                                ]
                            },
                            {
                                title: "Support",
                                links: [
                                    { text: "Feedback", href: "mailto:support@3daistudio.com?subject=Feedback" },
                                    { text: "Contact", href: "mailto:support@3daistudio.com?subject=Contact" },
                                    { text: "Status", href: "https://3daistudio.com/Status" },
                                    { text: "Pricing", href: "https://3daistudio.com/Pricing" },
                                    { text: "Documentation", href: "https://docs.3daistudio.com/" }
                                ]
                            },
                            {
                                title: "Company",
                                links: [
                                    { text: "Affiliate Program", href: "https://3daistudio.lemonsqueezy.com/affiliates" },
                                    { text: "Invest in Us", href: "mailto:jan@3daistudio.com?subject=Investment Inquiry" },
                                    { text: "Discord", href: "https://discord.gg/ENf22XzWgu" },
                                    { text: "Twitter", href: "https://x.com/3DAISTUDIO" },
                                    { text: "Instagram", href: "https://www.instagram.com/3daistudio/" }
                                ]
                            },
                            {
                                title: "Legal",
                                links: [
                                    { text: "Imprint", href: "" },
                                    { text: "Data Protection", href: "" },
                                    { text: "Terms and Conditions", href: "" },
                                    { text: "Cancellation", href: "" }
                                ]
                            }
                        ].map((column, index) => (
                            <div key={index}>
                                <h3 className="font-medium text-foreground mb-4">{column.title}</h3>
                                <ul className="space-y-3">
                                    {column.links.map((link, i) => (
                                        <li key={i}>
                                            <a
                                                href={link.href || "#"}
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {link.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border mt-16 pt-8 text-center text-sm text-muted-foreground">
                        <p>© {new Date().getFullYear()} 3D AI Studio. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Login Popup */}
            <Modal isOpen={isOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal>
        </div>
    );
}