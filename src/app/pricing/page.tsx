"use client"
import PricingComponent from '@/components/landing/fixed-price'
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

import { LoginWithLogo } from '@/components/login-components/login-with-logo'
import Modal from '@/components/modal'
export default function Page() {

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
    // <div className='min-h-screen px-4 sm:px-6 lg:px-8 relative bg-background text-foreground'>
    //     <PricingComponent />
    // </div>

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
                { href: "/#pricing", label: "Pricing" },
                { href: "/#questions", label: "Questions" },
                { href: "https://discord.gg/XzdMYGg5sM", label: "Community" }
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
              <span className="relative z-10">Login</span>
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
              { href: "/pricing", label: "Pricing" },
              { href: "/#questions", label: "Questions" },
              { href: "https://discord.gg/XzdMYGg5sM", label: "Community" }
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
                <span>Login</span>
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

      {/* Pricing component */}
      <PricingComponent />

      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className='w-full max-w-[350px] sm:max-w-md'>
          <LoginWithLogo />
        </div>
      </Modal>
    </div>
  )
}
