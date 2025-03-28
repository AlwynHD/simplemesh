"use client"
import Header from '@/components/Header';
import { Footer } from '@/components/landing/footer';
import { LoginWithLogo } from '@/components/login-components/login-with-logo';
import Modal from '@/components/modal';
import React, { useState } from 'react';

export default function Blog() {
    const [isOpen, setIsOpen] = useState(false)

    const openModal = () => setIsOpen(true)
    const closeModal: () => void = () => setIsOpen(false)

    // Temp blog data. We would ideally fetch this from the db but for now it's placeholder data
    const blogs = [
        {
            id: 1,
            title: "Understanding React Server Components",
            excerpt: "Learn the basics of React Server Components and how they improve performance.",
            link: "/blog/react-server-components",
        },
        {
            id: 2,
            title: "10 Tips for Writing Clean JavaScript",
            excerpt: "Discover practical tips to write cleaner and more maintainable JavaScript code.",
            link: "/blog/clean-javascript-tips",
        },
        {
            id: 3,
            title: "Exploring CSS Grid Layout",
            excerpt: "A deep dive into CSS Grid and how to use it for modern web layouts.",
            link: "/blog/css-grid-layout",
        },
    ];
    return (
        <div className='relative min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]'>
            {/* Header */}
            <Header openModal={openModal} />

            {/* Blog Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Blog</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <div
                            key={blog.id}
                            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{blog.excerpt}</p>
                            <a
                                href={blog.link}
                                className="text-[hsl(var(--primary))] font-medium hover:underline"
                            >
                                Read More →
                            </a>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <Footer openModal={openModal} />

            {/* Login Popup */}
            <Modal isOpen={isOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal>
        </div>
    );
};