"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { checkUserAuth } from "@/app/pricing/components/isUser"
import Modal from '@/components/modal'
import { LoginWithLogo } from '@/components/login-components/login-with-logo'

interface PricingOverlayProps {
    isOpen: boolean
    onClose: () => void
    defaultOpen?: boolean
}

export default function PricingOverlay({ isOpen: externalIsOpen, onClose, defaultOpen = false }: PricingOverlayProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
    const closeModal = () => setIsModalOpen(false)
    
    const handleClose = () => {
        if (onClose) {
            onClose()
        } else {
            setInternalIsOpen(false)
        }
    }

    const handlePurchase = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault()
        
        const isAuthenticated = await checkUserAuth()

        if (!isAuthenticated) {
            setIsModalOpen(true)
        } else {
            const form = document.createElement('form')
            form.method = 'GET'
            form.action = '/api/stripe_once'

            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = 'priceID'
            input.value = 'price_1R49jsCcCkxwgwE85NFlzqZJ'

            form.appendChild(input)
            document.body.appendChild(form)
            form.submit()
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-background border border-border rounded-xl shadow-lg max-w-xl w-full relative my-8"
                >
                    {/* Close button */}
                    <button 
                        onClick={handleClose}
                        className="absolute right-4 top-4 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close pricing overlay"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
                        <div className="text-center mb-6 max-w-xl">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">30 Generations for $9</h2>
                            <p className="text-sm md:text-base text-muted-foreground">One-time payment. No subscription.</p>
                        </div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            <Card className="w-full border-2 border-primary shadow-md rounded-xl overflow-hidden">
                                <CardHeader className="pb-2 bg-primary/5">
                                    <CardTitle className="text-xl md:text-2xl font-bold text-primary">
                                        3D Generation Pack
                                    </CardTitle>
                                </CardHeader>
                                
                                <CardContent className="pt-4 md:pt-6">
                                    <div className="flex items-baseline mb-4 md:mb-6">
                                        <span className="text-3xl md:text-4xl font-extrabold text-foreground">$9</span>
                                        <span className="text-xs md:text-sm font-medium text-muted-foreground ml-2">one-time</span>
                                    </div>
                                    
                                    <div className="border-t border-border pt-4 md:pt-5 mb-2">
                                        <h4 className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-2 md:mb-3 font-medium">What's included</h4>
                                        <ul className="space-y-2 md:space-y-3">
                                            {[
                                                "30 AI-powered 3D generations",
                                                "Image to 3D conversion",
                                                "Text to 3D generation",
                                                "High-quality exports",
                                                "Commercial use allowed"
                                            ].map((feature, index) => (
                                                <li key={index} className="flex items-start text-sm md:text-base text-foreground">
                                                    <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2 shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                
                                <CardFooter className="pt-3 md:pt-4 pb-4 md:pb-6">
                                    <Button
                                        className="w-full py-4 md:py-6 text-sm md:text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                                        onClick={handlePurchase}
                                    >
                                        Get Started
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                        
                        <div className="mt-6 text-center text-xs md:text-sm text-muted-foreground">
                            Need help? <a href="mailto:support@simplemesh.com" className="text-primary underline underline-offset-2">Contact our team</a>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal>
        </AnimatePresence>
    )
}