"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LoginWithLogo } from '@/components/login-components/login-with-logo'
import Modal from '@/components/modal'
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
            {/* Top notification bar -- I do not have any reviews */}
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

            {/* Hero Section */}
            <section className="relative py-8 sm:py-16 md:py-24 lg:pt-20 lg:pb-14 bg-[hsl(var(--background))]">
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src="/Background.png"
                        alt="Background"
                        fill
                        className="w-full h-full object-cover opacity-10 invert"
                    />
                </div>

                <div className="relative px-4 mx-auto max-w-8xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-y-8 lg:gap-x-16 lg:items-center lg:grid-cols-2">
                        <div className="col-span-1 lg:col-span-1"
                            style={{
                                opacity: animatedItems["hero-image"] ? 1 : 0,
                                transform: animatedItems["hero-image"] ? 'scale(1)' : 'scale(0.8)',
                                transition: 'all 0.8s ease-out'
                            }}
                            id="hero-image"
                            data-animate="true"
                        >
                            <Image
                                src="/Hero13.png"
                                alt="Example Image of 3D AI Generation"
                                width={900}
                                height={900}
                                className="w-full max-w-md mx-auto lg:max-w-full brightness-105 saturate-130 drop-shadow-xl"
                                priority
                            />
                        </div>

                        <div className="col-span-1 lg:col-span-1 text-center lg:text-left">
                            <h1 className="text-4xl font-bold leading-tight text-[hsl(var(--foreground))] sm:text-5xl md:text-6xl lg:text-7xl mb-6">
                                HOLY SH*T THAT WAS FAST!
                            </h1>
                            <p className="text-lg md:text-xl text-[hsl(var(--card-foreground))] mb-8">
                                Type a prompt or upload an image, and get 3D models instantly. It's that fast.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <button onClick={openModal} className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] rounded-md hover:bg-[hsl(var(--primary))]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))] transition duration-200">
                                    Get started - It's magic
                                    <svg className="inline-block ml-2 h-5 w-5" height="1em" width="1em" viewBox="0 0 24 24">
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" fill="currentColor"></path>
                                    </svg>
                                </button>

                                <button className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-[hsl(var(--foreground))] bg-[hsl(var(--secondary))] rounded-md hover:bg-[hsl(var(--secondary))]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))] transition duration-200">
                                    Examples
                                    <svg className="inline-block ml-2 h-5 w-5" height="1em" width="1em" viewBox="0 0 512 512">
                                        <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z" fill="currentColor"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-10">
                                <div className="flex items-center justify-center lg:justify-start">
                                    {[1, 2, 3, 4, 5].map((_, index) => (
                                        <svg key={index} className="w-5 h-5 text-[hsl(var(--primary))]" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                    ))}
                                </div>
                                <blockquote className="mt-4 text-lg font-medium text-[hsl(var(--card-foreground))]">
                                    "It's without a doubt the best Image to 3D model AI out there right now"
                                </blockquote>
                                <div className="mt-4 flex items-center justify-center lg:justify-start">
                                    <Image
                                        className="w-10 h-10 rounded-full"
                                        src="/avatars/noah.jpg"
                                        alt="Noah Böhringer"
                                        width={40}
                                        height={40}
                                    />
                                    <div className="ml-4">
                                        <p className="text-base font-semibold text-[hsl(var(--card-foreground))]">Noah Böhringer</p>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Game Developer</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="relative py-3 bg-[hsl(var(--background))] min-h-full flex flex-col border-t border-[hsl(var(--border))]">
                <div className="container mx-auto px-4 max-w-full flex-grow flex flex-col">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3 auto-rows-fr">
                        {Array.from({ length: 24 }).map((_, index) => (
                            <div
                                key={index}
                                className="relative group"
                                style={{
                                    opacity: animatedItems[`gallery-${index}`] ? 1 : 0,
                                    transform: animatedItems[`gallery-${index}`] ? 'translateY(0)' : 'translateY(20px)',
                                    transition: `all 0.5s ease-out ${index * 0.05}s`
                                }}
                                id={`gallery-${index}`}
                                data-animate="true"
                            >
                                <div className="absolute inset-0 bg-[hsl(var(--secondary))] bg-opacity-30 backdrop-filter backdrop-blur-sm rounded-lg z-10"></div>
                                <div className="relative w-full h-0 pb-[100%] overflow-hidden rounded-lg shadow-lg z-20">
                                    <Image
                                        src={`/ExampleGensV3/${index + 1}.png`}
                                        alt={`Example ${index + 1}`}
                                        fill
                                        className="object-cover p-2"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <button className="px-3 py-2 text-sm font-medium rounded-md text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))] transition-all duration-150">
                                            View 3D
                                            <svg className="ml-1 inline-block h-3 w-3" height="1em" width="1em" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                                                <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Companies Section */}
            <div className="bg-[hsl(var(--background))]">
                <div className="hidden md:flex bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] py-4 xl:py-12">
                    <div className="max-w-8xl mx-auto px-4 sm:px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-6 md:mb-0 md:mr-8">
                            <h2 className="text-base md:text-xl 2xl:text-2xl font-semibold text-[hsl(var(--card-foreground))] mr-12">
                                Chosen by Professionals Working at World-Class Companies
                            </h2>
                        </div>
                        <div className="flex space-x-1 xl:space-x-10 mt-4 md:mt-0">
                            {['unity', 'epic', 'pixion', 'ftura', 'radai'].map((logo, index) => (
                                <div key={index} className="flex justify-center items-center">
                                    <div className="relative w-[100px] h-[50px]">
                                        <Image
                                            src={`/${logo}.png`}
                                            alt={logo}
                                            fill
                                            className="grayscale hover:scale-110 transition duration-300 ease-in-out object-contain scale-75 xl:scale-100 invert"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-8 py-10 px-5 bg-[hsl(var(--background))] border-t border-[hsl(var(--border))]">
                {[
                    {
                        title: "Text to 3D",
                        description: "Generate 3D models from text prompts.",
                        image: "/HeroShowcase/GrookPoster.jpg",
                        text: "\"A humanoid wooden creature with plant-like features, 3D-rendered\""
                    },
                    {
                        title: "Image to 3D",
                        description: "Turn an image into a 3D model in seconds.",
                        image: "/HeroShowcase/ManBustPoster.jpg",
                        type: "PNG"
                    },
                    {
                        title: "AI Texturing",
                        description: "Texture 3D models effortlessly.",
                        image: "/HeroShowcase/WitchPoster.jpg",
                        type: "JPG"
                    },
                    {
                        title: "Remesh",
                        description: "High-Quality assets in seconds.",
                        image: "/HeroShowcase/PikaPoster.jpg",
                        type: "3D"
                    }
                ].map((feature, index) => (
                    <div key={index} className="relative text-center w-full md:max-w-sm h-[650px] md:h-[490px] p-6 bg-[hsl(var(--card))] rounded-lg shadow-lg border border-[hsl(var(--border))] overflow-hidden">
                        <div className="z-30 absolute inset-0 bg-[hsl(var(--primary))]/[0.03] pointer-events-none"></div>
                        <h2 className="text-4xl font-bold mb-2 text-[hsl(var(--card-foreground))]">{feature.title}</h2>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] font-semibold">{feature.description}</p>

                        <div className="mt-10 relative h-64">
                            <Image
                                src={feature.image}
                                alt={feature.title}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        <div className="absolute bottom-6 right-6">
                            <div className="relative">
                                <div className="absolute top-0 right-2 transform -translate-y-1/2 translate-x-1/2 bg-[hsl(var(--secondary))]/70 border border-[hsl(var(--border))]/50 rounded-lg z-30 px-2 py-1 flex items-center justify-center backdrop-filter backdrop-blur-sm">
                                    <span className="text-[hsl(var(--card-foreground))] text-base font-semibold">{feature.type || "Text"}</span>
                                </div>
                                <div className="bg-[hsl(var(--secondary))]/30 border border-[hsl(var(--border))]/50 rounded-lg px-6 py-4 flex items-center space-x-4 backdrop-filter backdrop-blur-md">
                                    {feature.text ? (
                                        <span className="text-sm text-[hsl(var(--foreground))] font-semibold" dangerouslySetInnerHTML={{ __html: feature.text.replace(/\n/g, '<br/>') }}></span>
                                    ) : (
                                        <Image
                                            src={feature.type === "PNG" ? "/IndexMan.png" : feature.type === "JPG" ? "/HeroShowcase/WitchNoTextures.png" : "/Pika.png"}
                                            alt="Image Icon"
                                            width={96}
                                            height={96}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Section */}
            <section className="relative p-5 sm:p-6 md:p-0 overflow-hidden lg:p-12 border-y-2 border-[hsl(var(--border))] bg-[hsl(var(--secondary))] bg-[radial-gradient(hsl(var(--muted))_1px,hsl(var(--card))_1px)] bg-[size:20px_20px]">
                <div className="relative z-10 p-4 sm:p-6 lg:p-8 mx-auto max-w-8xl">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <div className="flex items-center text-center md:text-left flex-col md:flex-row md:items-start md:max-w-md lg:max-w-4xl p-6 rounded-lg">
                            <div className="text-6xl mt-5" style={{ filter: 'brightness(0) invert(1)', WebkitFilter: 'brightness(0) invert(1)' }}>✨</div>
                            <div className="mt-4 md:ml-4 lg:ml-8">
                                <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl lg:text-5xl md:mt-0 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                    Who Said 3D Had to Be Hard?
                                </h2>
                                <p className="mt-4 text-base font-medium text-[hsl(var(--card-foreground))] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                                    So easy, your grandma could make a 3D Model
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center mt-8 space-y-8 md:space-y-12 md:mt-0">
                            <button className="inline-flex items-center justify-center px-6 sm:px-9 py-4 sm:py-6 text-2xl font-bold leading-7 text-[hsl(var(--primary-foreground))] transition-all duration-200 bg-[hsl(var(--primary))] border-2 border-[hsl(var(--foreground))] rounded-xl hover:scale-105 hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))] shadow-lg cursor-pointer">
                                Start Creating Now
                                <svg className="ml-4" height="1em" width="1em" viewBox="0 0 512 512" fill="currentColor">
                                    <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <div className="bg-[hsl(var(--background))]" id="tools">
                <div className="flex flex-col lg:flex-row bg-[hsl(var(--background))] px-4 md:px-8 2xl:px-20 py-20">
                    <section className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 mx-auto gap-x-5 gap-y-6">
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
                                <div
                                    key={index}
                                    className="flex flex-row items-center text-left p-5 transition duration-500 ease-in-out transform bg-[hsl(var(--secondary))] bg-opacity-5 border border-[hsl(var(--border))] rounded-xl hover:-translate-y-1 hover:shadow-md"
                                    style={{
                                        opacity: animatedItems[`feature-${index}`] ? 1 : 0,
                                        transform: animatedItems[`feature-${index}`] ? 'translateY(0)' : 'translateY(10px)',
                                        transition: `all 0.5s ease-out ${index * 0.05}s`
                                    }}
                                    id={`feature-${index}`}
                                    data-animate="true"
                                >
                                    <svg className="text-[hsl(var(--card-foreground))] w-7 h-7 mr-4 flex-shrink-0" height="1em" width="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={feature.icon}></path>
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[hsl(var(--card-foreground))]">{feature.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Main CTA Video Section */}
            <div className="flex flex-col lg:flex-row justify-center items-center px-10 py-20 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
                <div
                    className="flex-1 mb-10 md:mb-0 md:mr-3 text-left pl-3 md:pl-8 2xl:pl-52 ml-4 md:ml-0"
                    style={{
                        opacity: animatedItems[`cta-text`] ? 1 : 0,
                        transform: animatedItems[`cta-text`] ? 'translateY(0)' : 'translateY(-50px)',
                        transition: 'all 0.7s ease-out'
                    }}
                    id="cta-text"
                    data-animate="true"
                >
                    <h2 className="text-3xl font-semibold text-[hsl(var(--foreground))] sm:text-4xl lg:text-5xl xl:text-6xl">
                        Turn any Image into 3D
                    </h2>
                    <p className="mt-3 text-2xl font-medium text-[hsl(var(--foreground))]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--ring))]">
                            And so much more...
                        </span>
                    </p>
                    <p className="hidden lg:block mt-10 text-lg font-normal text-[hsl(var(--card-foreground))] mr-32">
                        Transform <span className="inline font-semibold text-2xl text-[hsl(var(--primary))]">Text</span> or
                        <span className="inline font-semibold text-2xl text-[hsl(var(--primary))]">Images</span> into
                        <span className="inline font-semibold text-2xl text-[hsl(var(--primary))]">3D models </span>
                        in seconds, generate high quality images and create textures with AI, all inside our Studio.
                    </p>
                    <button className="inline-flex items-center px-8 py-4 mt-8 text-lg font-bold text-[hsl(var(--primary-foreground))] transition-all duration-200 bg-[hsl(var(--primary))] border border-transparent rounded sm:mt-10 hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary-foreground))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))]">
                        Launch Studio
                        <svg className="ml-4" height="1em" width="1em" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"></path>
                        </svg>
                    </button>
                </div>
                <div className="flex-1 scale-90 hover:scale-100 transition-transform duration-500 ease-in-out">
                    <video className="rounded-lg border border-[hsl(var(--border))]" width="1000" height="600" loop muted playsInline autoPlay>
                        <source src="/VideoHeader3.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>

            {/* Testimonials Section */}
            <section className="py-12 bg-[hsl(var(--background))] sm:py-16 lg:pt-20">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="text-center">
                            <p className="text-lg font-medium text-[hsl(var(--foreground))]">Happy 3D AI Studio Users</p>
                            <h2 className="mt-4 mb-0 text-3xl font-bold text-[hsl(var(--card-foreground))] sm:text-4xl xl:text-5xl">
                                Why choose 3D AI Studio?
                            </h2>
                        </div>
                        <div className="relative mt-10 md:mt-14 md:order-2">
                            <div className="absolute -inset-x-1 inset-y-16 md:-inset-x-2 md:-inset-y-6">
                                <div className="w-full h-full max-w-5xl mx-auto rounded-3xl opacity-30 blur-lg filter"></div>
                            </div>
                            <div className="relative grid max-w-lg grid-cols-1 gap-6 mx-auto md:max-w-none lg:gap-10 md:grid-cols-3">
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
                                    <div key={index} className="flex flex-col overflow-hidden shadow-xl rounded-lg hover:scale-105 transition-all ease-linear border border-[hsl(var(--border))]">
                                        <div className="flex flex-col justify-between flex-1 p-6 bg-[hsl(var(--card))] lg:py-8 lg:px-7">
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((_, starIndex) => (
                                                        <svg key={starIndex} className="w-5 h-5 text-[hsl(var(--primary))]" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                        </svg>
                                                    ))}
                                                </div>
                                                <blockquote className="flex-1 mt-8">
                                                    <p className="text-lg leading-relaxed font-semibold text-[hsl(var(--card-foreground))]">
                                                        &quot;{testimonial.quote}&quot;
                                                    </p>
                                                </blockquote>
                                            </div>
                                            <div className="flex items-center mt-8">
                                                <Image
                                                    className="flex-shrink-0 object-cover rounded-full w-11 h-11"
                                                    src={testimonial.avatar}
                                                    alt={testimonial.name}
                                                    width={44}
                                                    height={44}
                                                />
                                                <div className="ml-4">
                                                    <p className="text-base font-bold text-[hsl(var(--card-foreground))]">{testimonial.name}</p>
                                                    <p className="mt-0.5 text-sm text-[hsl(var(--card-foreground))]">{testimonial.title}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="relative z-20 text-center mt-12">
                                <a
                                    href="https://www.trustpilot.com/review/3daistudio.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 transition-colors duration-300 inline-flex items-center cursor-pointer underline underline-offset-2"
                                >
                                    Read all our customer reviews on Trustpilot
                                    <svg className="ml-1" height="1em" width="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section id="community" className="relative p-5 sm:p-6 md:p-0 overflow-hidden bg-[hsl(var(--primary))] lg:p-16 border-y-2 border-[hsl(var(--border))]">
                <div className="relative p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <div className="flex items-center text-center md:text-left flex-col md:flex-row md:items-start md:max-w-md lg:max-w-2xl">
                            <div className="text-6xl">👋</div>
                            <div className="mt-4 md:ml-4 lg:ml-8">
                                <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--primary-foreground))] sm:text-4xl lg:text-5xl md:mt-0">
                                    Try it yourself!
                                </h2>
                                <p className="mt-3 text-base font-medium text-[hsl(var(--primary-foreground))]">
                                    It's like Magic, you should try it!
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center mt-8 space-y-8 md:space-y-12 md:mt-0">
                            <button className="inline-flex items-center justify-center px-6 sm:px-9 py-4 sm:py-6 text-2xl font-bold leading-7 text-[hsl(var(--background))] transition-all duration-200 bg-[hsl(var(--foreground))] border-2 border-[hsl(var(--primary-foreground))] rounded-xl hover:scale-105 hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))]">
                                Start generating!
                                <svg className="ml-4" height="1em" width="1em" viewBox="0 0 512 512" fill="currentColor">
                                    <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="questions" className="py-12 bg-[hsl(var(--background))] px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-[hsl(var(--foreground))] mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-4">
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
                            <div key={index} className="border-b border-[hsl(var(--border))]">
                                <button className="flex justify-between items-center w-full py-5 text-left transition-colors duration-300 hover:bg-[hsl(var(--card))] hover:bg-transparent rounded-lg px-4">
                                    <span className="text-lg font-semibold text-[hsl(var(--foreground))]">{faq.question}</span>
                                    <svg className="w-6 h-6 text-[hsl(var(--muted-foreground))] transform transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                <div className="overflow-hidden px-4 transition-all duration-300 ease-in-out max-h-0 opacity-0">
                                    <p className="pb-5 text-[hsl(var(--card-foreground))]">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 text-center">
                        <p className="text-[hsl(var(--muted-foreground))]">
                            Didn't find the answer you're looking for?
                            <a href="mailto:support@3daistudio.com" className="text-[hsl(var(--primary))] hover:underline transition-colors duration-300 ml-1">
                                Contact our support
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div className="bg-[hsl(var(--background))] border-t border-[hsl(var(--border))]">
                <div className="max-w-[1440px] mx-auto pb-14 pt-20 px-4 grid lg:grid-cols-6 gap-6 text-[hsl(var(--card-foreground))] text-sm">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">3D AI Studio</h2>
                        <p className="text-[hsl(var(--muted-foreground))] mb-4">The Ultimate Studio for 3D Assets.</p>
                        <button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 transition-all duration-300 text-[hsl(var(--primary-foreground))] font-bold py-2 px-4 rounded-md inline-flex items-center justify-center cursor-pointer text-base w-48">
                            Start generating
                            <svg className="ml-2" height="1em" width="1em" viewBox="0 0 512 512" fill="currentColor">
                                <path d="M208 512a24.84 24.84 0 0 1-23.34-16l-39.84-103.6a16.06 16.06 0 0 0-9.19-9.19L32 343.34a25 25 0 0 1 0-46.68l103.6-39.84a16.06 16.06 0 0 0 9.19-9.19L184.66 144a25 25 0 0 1 46.68 0l39.84 103.6a16.06 16.06 0 0 0 9.19 9.19l103 39.63a25.49 25.49 0 0 1 16.63 24.1 24.82 24.82 0 0 1-16 22.82l-103.6 39.84a16.06 16.06 0 0 0-9.19 9.19L231.34 496A24.84 24.84 0 0 1 208 512zm66.85-254.84zM88 176a14.67 14.67 0 0 1-13.69-9.4l-16.86-43.84a7.28 7.28 0 0 0-4.21-4.21L9.4 101.69a14.67 14.67 0 0 1 0-27.38l43.84-16.86a7.31 7.31 0 0 0 4.21-4.21L74.16 9.79A15 15 0 0 1 86.23.11a14.67 14.67 0 0 1 15.46 9.29l16.86 43.84a7.31 7.31 0 0 0 4.21 4.21l43.84 16.86a14.67 14.67 0 0 1 0 27.38l-43.84 16.86a7.28 7.28 0 0 0-4.21 4.21l-16.86 43.84A14.67 14.67 0 0 1 88 176zm312 80a16 16 0 0 1-14.93-10.26l-22.84-59.37a8 8 0 0 0-4.6-4.6l-59.37-22.84a16 16 0 0 1 0-29.86l59.37-22.84a8 8 0 0 0 4.6-4.6l22.67-58.95a16.45 16.45 0 0 1 13.17-10.57 16 16 0 0 1 16.86 10.15l22.84 59.37a8 8 0 0 0 4.6 4.6l59.37 22.84a16 16 0 0 1 0 29.86l-59.37 22.84a8 8 0 0 0-4.6 4.6l-22.84 59.37A16 16 0 0 1 400 256z"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Footer columns */}
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
                    ].map((column, columnIndex) => (
                        <div key={columnIndex}>
                            <h6 className="font-medium text-[hsl(var(--foreground))] mb-3">{column.title}</h6>
                            <ul className="space-y-2">
                                {column.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        {link.href ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))] text-opacity-80"
                                            >
                                                {link.text}
                                            </a>
                                        ) : (
                                            <span className="cursor-pointer hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))] text-opacity-80">
                                                {link.text}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Login Popup */}
            <Modal isOpen={isOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal>
        </div>
    );
}