"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
    openModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ openModal }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-[hsl(var(--background))]/90 backdrop-blur-md border-b border-[hsl(var(--border))]/30 py-4">
            <div className="container flex items-center justify-between px-4 mx-auto">
                <div className="flex items-center flex-shrink-0 ml-4 xl:ml-0">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="favicon/Logo-Fox-Light.svg"
                            alt="Logo"
                            width={36}
                            height={36}
                            className="cursor-pointer"
                        />
                    </Link>
                </div>

                <div className="hidden lg:flex lg:items-center lg:justify-between flex-1">
                    <nav className="flex justify-center space-x-8 flex-1">
                        {[
                            { href: "/#examples", label: "Examples" },
                            { href: "/#pricing", label: "Pricing" },
                            { href: "/#questions", label: "Questions" },
                            { href: "https://discord.gg/XzdMYGg5sM", label: "Community" },
                            { href: "/blog", label: "Blog" },
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

                    <Link
                        href=""
                        onClick={openModal}
                        className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium leading-6 text-[hsl(var(--foreground))] transition-all duration-200 ease-in-out bg-[hsl(var(--secondary))]/5 border border-[hsl(var(--border))]/30 rounded-lg hover:bg-[hsl(var(--secondary))]/20 hover:border-[hsl(var(--border))]/50"
                    >
                        <span className="relative z-10">Login</span>
                        <svg
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-2 h-5 w-5 text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors duration-200"
                        >
                            <path d="M5 3v16h16"></path>
                            <path d="m5 19 6-6"></path>
                            <path d="m2 6 3-3 3 3"></path>
                            <path d="m18 16 3 3-3 3"></path>
                        </svg>
                    </Link>
                </div>

                <button
                    className="lg:hidden text-[hsl(var(--foreground))] mr-6 p-1"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-6 h-6"
                        >
                            <line x1="4" y1="8" x2="20" y2="8"></line>
                            <line x1="4" y1="16" x2="20" y2="16"></line>
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            <div
                className={`lg:hidden transition-all duration-300 ease-in-out transform ${
                    mobileMenuOpen
                        ? "max-h-96 opacity-100 translate-y-0"
                        : "max-h-0 opacity-0 -translate-y-4"
                } overflow-hidden`}
            >
                <nav className="px-4 pt-4 pb-5 space-y-2 border-t border-[hsl(var(--border))]/20 mt-2 bg-[hsl(var(--background))]/95">
                    {[
                        { href: "/#examples", label: "Examples" },
                        { href: "/#pricing", label: "Pricing" },
                        { href: "/#questions", label: "Questions" },
                        { href: "https://discord.gg/XzdMYGg5sM", label: "Community" },
                        { href: "/blog", label: "Blog" },
                    ].map((item) => (
                        <Link key={item.label} href={item.href} className="block">
                            <div className="flex items-center text-base font-medium text-[hsl(var(--foreground))] py-2.5 px-4 rounded-lg hover:bg-[hsl(var(--secondary))]/10 transition-colors duration-200">
                                {item.label}
                                <svg
                                    className="ml-auto h-4 w-4 text-[hsl(var(--muted-foreground))]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5l7 7-7 7"
                                    ></path>
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
                            <svg
                                stroke="currentColor"
                                fill="none"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-2 h-5 w-5"
                            >
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
    );
};

export default Header;