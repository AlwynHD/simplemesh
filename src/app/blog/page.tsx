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

    return (
        <div className='relative min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]'>
            {/* Header */}
            <Header openModal={openModal} />

            {/* Blog Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Blog</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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