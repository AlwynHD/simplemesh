"use client"
import { useState } from 'react'
import Modal from '@/components/modal'
import { LoginWithLogo } from '@/components/login-components/login-with-logo'

export default function Home() {
    const [isOpen, setIsOpen] = useState(false)

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

    return (
        <div className='min-h-screen px-4 sm:px-6 lg:px-8 relative'>
            <button
                onClick={openModal}
                className='absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
            >
                Login
            </button>

            <Modal isOpen={isOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal>
        </div>
    )
}