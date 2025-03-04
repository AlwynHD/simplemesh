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
            <section className="py-16 bg-gradient-to-b from-background to-background/95 border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Text to 3D",
                                description: "Generate detailed 3D models from text descriptions",
                                image: "/HeroShowcase/GrookPoster.jpg",
                                text: "\"A humanoid wooden creature with plant-like features, 3D-rendered\"",
                                type: "Text"
                            },
                            {
                                title: "Image to 3D",
                                description: "Convert any image into a 3D model instantly",
                                image: "/HeroShowcase/ManBustPoster.jpg",
                                type: "PNG"
                            },
                            {
                                title: "AI Texturing",
                                description: "Apply stunning textures to any 3D model",
                                image: "/HeroShowcase/WitchPoster.jpg",
                                type: "JPG"
                            },
                            {
                                title: "Remesh",
                                description: "Create high-quality assets in seconds",
                                image: "/HeroShowcase/PikaPoster.jpg",
                                type: "3D"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative bg-card/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-border/50 group h-full"
                            >
                                <div className="p-6 flex flex-col h-full">
                                    <h3 className="text-2xl font-bold mb-2 text-foreground">{feature.title}</h3>
                                    <p className="text-muted-foreground mb-6">{feature.description}</p>

                                    <div className="relative flex-grow mb-6 mt-2">
                                        <div className="aspect-square relative rounded-lg overflow-hidden">
                                            <Image
                                                src={feature.image}
                                                alt={feature.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute -top-3 right-0 bg-secondary/80 backdrop-blur-sm rounded-full py-1 px-3 shadow-md">
                                            <span className="text-sm font-medium">{feature.type}</span>
                                        </div>
                                        <div className="bg-secondary/20 rounded-lg p-4 border border-border/50 backdrop-blur-sm">
                                            {feature.text ? (
                                                <p className="text-sm">{feature.text}</p>
                                            ) : (
                                                <div className="aspect-square w-full max-w-[80px] mx-auto relative">
                                                    <Image
                                                        src={feature.type === "PNG" ? "/IndexMan.png" : feature.type === "JPG" ? "/HeroShowcase/WitchNoTextures.png" : "/Pika.png"}
                                                        alt={`${feature.type} preview`}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. CTA Section */}
            <section className="py-16 border-y border-border relative overflow-hidden bg-secondary/10">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="container relative z-10 mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center text-center md:text-left gap-6">
                            <div className="hidden md:block text-5xl">✨</div>
                            <div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                                    Who Said 3D Had to Be Hard?
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    So easy, your grandma could make a 3D model
                                </p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            Start Creating Now
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </section>

            {/* 4. Features Grid */}
            <section className="py-20 bg-background" id="tools">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {[
                            { icon: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", title: "3D Assets in Seconds" },
                            { icon: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", title: "HQ Materials" },
                            { icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z", title: "Automatic Remesh" },
                            { icon: "M19.51 3.08 3.08 19.51c.09.34.27.65.51.9.25.24.56.42.9.51L20.93 4.49c-.19-.69-.73-1.23-1.42-1.41z", title: "Re-Texture AI" },
                            { icon: "M5 2.5l.5-.5h2l.5.5v11l-.5.5h-2l-.5-.5v-11z", title: "Big 3D Library" },
                            { icon: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z", title: "All 3D Formats" },
                            { icon: "M208 34H80A14 14 0 0 0 66 48V66H48A14 14 0 0 0 34 80V208a14 14 0 0 0 14 14H176a14 14 0 0 0 14-14V190h18a14 14 0 0 0 14-14V48A14 14 0 0 0 208 34z", title: "AI Image Studio" },
                            { icon: "M8.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5m-2 2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m-6 1.5A.5.5 0 0 1 5 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m-10 1A.5.5 0 0 1 3 7v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5m12 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5", title: "Sound/Speech AI" },
                            { icon: "M224 66H174V56a22 22 0 0 0-22-22H104A22 22 0 0 0 82 56V66H32A14 14 0 0 0 18 80V192a14 14 0 0 0 14 14H224a14 14 0 0 0 14-14V80A14 14 0 0 0 224 66z", title: "3D Tools" },
                            { icon: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z", title: "Automatic LODs" },
                            { icon: "M6 10V20H19V10H6ZM18 8H20C20.5523 8 21 8.44772 21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V9C3 8.44772 3.44772 8 4 8H6V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8Z", title: "Private by Default" },
                            { icon: "M7 20h4c0 1.1-.9 2-2 2s-2-.9-2-2zm-2-1h8v-2H5v2zm11.5-9.5c0 3.82-2.66 5.86-3.77 6.5H5.27c-1.11-.64-3.77-2.68-3.77-6.5C1.5 5.36 4.86 2 9 2s7.5 3.36 7.5 7.5z", title: "Weekly Updates!" }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.04 }}
                                whileHover={{ y: -5, backgroundColor: "hsl(var(--secondary) / 0.15)" }}
                                className="p-4 rounded-xl border border-border bg-secondary/5 flex items-center gap-3 hover:shadow-md transition-all"
                            >
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={feature.icon}></path>
                                    </svg>
                                </div>
                                <span className="font-medium">{feature.title}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Main CTA Video Section */}
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
            </section>

            {/* 6. Testimonials Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="text-primary font-medium mb-2">Happy 3D AI Studio Users</p>
                        <h2 className="text-3xl md:text-4xl font-bold">Why choose 3D AI Studio?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "The speed in which I can generate 3D models is astonishing. Its simplified my workflow and given my applications an aesthetic uplift that impresses clients. I even 3D printed a few of those Models and they came out great",
                                name: "Tim Karlowitz",
                                title: "Website Developer",
                                avatar: "/avatars/tim.jpg"
                            },
                            {
                                quote: "With the 3D AI STUDIO, Ive been able to create complex, high-quality 3D models in seconds, shaving hours off of my usual timescales and allowing me to focus more on getting creative. It has been a game-changer. This is the best AI 3D Model Generator i have ever used!",
                                name: "Noah Böhringer",
                                title: "Game Developer at BHR Studios",
                                avatar: "/avatars/noah.jpg"
                            },
                            {
                                quote: "So cool! I just logged in and was very quickly able to make a 3D model from a prompt. Could see a lot of applications of this in video editing / animation. Cant wait for all the new Features!",
                                name: "Dillion Verma",
                                title: "Developer @Nvidia",
                                avatar: "/avatars/dillion.jpg"
                            }
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-card rounded-xl p-6 shadow-lg border border-border flex flex-col h-full"
                            >
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                    ))}
                                </div>

                                <blockquote className="flex-grow mb-6 text-foreground">
                                &quot;{testimonial.quote}&quot;
                                </blockquote>

                                <div className="flex items-center">
                                    <div className="mr-4">
                                        <Image
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            width={48}
                                            height={48}
                                            className="rounded-full"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{testimonial.name}</h4>
                                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <a
                            href="https://www.trustpilot.com/review/3daistudio.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 inline-flex items-center"
                        >
                            Read all our customer reviews on Trustpilot
                            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </div>
                </div>
            </section>

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